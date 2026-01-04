import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MapFormModal from './MapFormModal';

/**
 * Testes do componente MapFormModal.
 *
 * Modal unificado para criar e editar mapas.
 * Testes focam em: renderização, validação, submit, erros da API e reset de estado.
 */

describe('MapFormModal', () => {
  const createProps = (overrides = {}) => ({
    isOpen: true,
    onClose: vi.fn(),
    onSubmit: vi.fn().mockResolvedValue(undefined),
    mode: 'create' as const,
    ...overrides,
  });

  /** Cria uma promise controlada para testar estados de loading */
  const createDeferredPromise = <T,>() => {
    let resolve!: (value: T) => void;
    const promise = new Promise<T>((res) => {
      resolve = res;
    });
    return { promise, resolve };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Renderização', () => {
    it('não renderiza quando fechado', () => {
      render(<MapFormModal {...createProps({ isOpen: false })} />);

      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });

    it('exibe título correto no modo criação', () => {
      render(<MapFormModal {...createProps()} />);

      expect(screen.getByRole('heading', { name: 'Criar Novo Mapa' })).toBeInTheDocument();
    });

    it('exibe título correto no modo edição', () => {
      render(<MapFormModal {...createProps({ mode: 'edit', initialName: 'Mapa' })} />);

      expect(screen.getByRole('heading', { name: 'Editar Mapa' })).toBeInTheDocument();
    });

    it('preenche campos com valores iniciais no modo edição', () => {
      render(
        <MapFormModal
          {...createProps({
            mode: 'edit',
            initialName: 'Mapa Existente',
            initialDescription: 'Descrição existente',
          })}
        />
      );

      expect(screen.getByPlaceholderText('NOME*')).toHaveValue('Mapa Existente');
      expect(screen.getByPlaceholderText('DESCRIÇÃO')).toHaveValue('Descrição existente');
    });
  });

  describe('Validação do botão submit', () => {
    it('desabilitado com nome vazio', () => {
      render(<MapFormModal {...createProps()} />);

      expect(screen.getByRole('button', { name: 'Criar' })).toBeDisabled();
    });

    it('desabilitado com nome contendo apenas espaços', async () => {
      // O schema Zod aplica trim() antes de validar,
      // então "   " se transforma em "" e falha na validação
      const user = userEvent.setup();
      render(<MapFormModal {...createProps()} />);

      await user.type(screen.getByPlaceholderText('NOME*'), '   ');

      expect(screen.getByRole('button', { name: 'Criar' })).toBeDisabled();
    });

    it('desabilitado quando nome excede limite de caracteres', async () => {
      const user = userEvent.setup();
      render(<MapFormModal {...createProps()} />);

      await user.type(screen.getByPlaceholderText('NOME*'), 'a'.repeat(101));

      expect(screen.getByRole('button', { name: 'Criar' })).toBeDisabled();
    });

    it('habilitado com nome válido', async () => {
      const user = userEvent.setup();
      render(<MapFormModal {...createProps()} />);

      await user.type(screen.getByPlaceholderText('NOME*'), 'Meu Mapa');

      expect(screen.getByRole('button', { name: 'Criar' })).toBeEnabled();
    });

    it('exibe label correto no modo edição', () => {
      render(<MapFormModal {...createProps({ mode: 'edit', initialName: 'Mapa' })} />);

      expect(screen.getByRole('button', { name: 'Editar' })).toBeInTheDocument();
    });
  });

  describe('Submit do formulário', () => {
    it('chama onSubmit com nome trimado e fecha modal', async () => {
      const user = userEvent.setup();
      const props = createProps();
      render(<MapFormModal {...props} />);

      await user.type(screen.getByPlaceholderText('NOME*'), '  Meu Mapa  ');
      await user.type(screen.getByPlaceholderText('DESCRIÇÃO'), 'Descrição');
      await user.click(screen.getByRole('button', { name: 'Criar' }));

      await waitFor(() => {
        expect(props.onSubmit).toHaveBeenCalledWith('Meu Mapa', 'Descrição');
      });
      expect(props.onClose).toHaveBeenCalledOnce();
    });

    it('exibe loading durante submit e retorna ao normal', async () => {
      const user = userEvent.setup();
      const deferred = createDeferredPromise<void>();
      const props = createProps({ onSubmit: vi.fn(() => deferred.promise) });
      render(<MapFormModal {...props} />);

      await user.type(screen.getByPlaceholderText('NOME*'), 'Meu Mapa');
      await user.click(screen.getByRole('button', { name: 'Criar' }));

      // Durante loading
      expect(screen.getByRole('button', { name: 'Criando...' })).toBeDisabled();

      // Resolve para finalizar
      deferred.resolve();

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: 'Criando...' })).not.toBeInTheDocument();
      });
    });
  });

  describe('Tratamento de erros', () => {
    it('exibe erro da API e não fecha modal', async () => {
      const user = userEvent.setup();
      const props = createProps({
        onSubmit: vi.fn().mockResolvedValue({ error: 'Já existe um mapa com este nome' }),
      });
      render(<MapFormModal {...props} />);

      await user.type(screen.getByPlaceholderText('NOME*'), 'Mapa Duplicado');
      await user.click(screen.getByRole('button', { name: 'Criar' }));

      await waitFor(() => {
        expect(screen.getByText('Já existe um mapa com este nome')).toBeInTheDocument();
      });
      expect(props.onClose).not.toHaveBeenCalled();
    });

    it('erro de validação bloqueia submit', async () => {
      const user = userEvent.setup();
      const props = createProps();
      render(<MapFormModal {...props} />);

      await user.type(screen.getByPlaceholderText('NOME*'), 'Mapa Válido');
      // Descrição excede o limite de 40 caracteres
      await user.type(screen.getByPlaceholderText('DESCRIÇÃO'), 'a'.repeat(50));
      await user.click(screen.getByRole('button', { name: 'Criar' }));

      // Aguarda que a validação seja processada
      await waitFor(() => {
        expect(props.onSubmit).not.toHaveBeenCalled();
      });
      // Modal permanece aberto
      expect(props.onClose).not.toHaveBeenCalled();
    });
  });

  describe('Reset de estado', () => {
    it('limpa campos ao reabrir modal', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<MapFormModal {...createProps()} />);

      await user.type(screen.getByPlaceholderText('NOME*'), 'Meu Mapa');

      // Fecha e reabre
      rerender(<MapFormModal {...createProps({ isOpen: false })} />);
      rerender(<MapFormModal {...createProps({ isOpen: true })} />);

      expect(screen.getByPlaceholderText('NOME*')).toHaveValue('');
    });
  });
});
