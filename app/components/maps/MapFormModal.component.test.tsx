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
  // Factory function para criar props com mocks frescos
  const createProps = (overrides = {}) => ({
    isOpen: true,
    onClose: vi.fn(),
    onSubmit: vi.fn().mockResolvedValue(undefined),
    mode: 'create' as const,
    ...overrides,
  });

  // Limpa mocks entre testes
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Renderização', () => {
    it('não renderiza quando isOpen é false', () => {
      render(<MapFormModal {...createProps({ isOpen: false })} />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renderiza título "Criar Novo Mapa" no modo create', () => {
      render(<MapFormModal {...createProps()} />);

      expect(screen.getByRole('heading', { name: 'Criar Novo Mapa' })).toBeInTheDocument();
    });

    it('renderiza título "Editar Mapa" no modo edit', () => {
      render(<MapFormModal {...createProps({ mode: 'edit', initialName: 'Mapa' })} />);

      expect(screen.getByRole('heading', { name: 'Editar Mapa' })).toBeInTheDocument();
    });

    it('preenche campos com valores iniciais no modo edit', () => {
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
    it('botão desabilitado quando nome está vazio', () => {
      render(<MapFormModal {...createProps()} />);

      // Nome vazio = botão desabilitado (validação via Zod)
      expect(screen.getByRole('button', { name: 'Criar' })).toBeDisabled();
    });

    it('botão desabilitado quando nome contém apenas espaços', async () => {
      const user = userEvent.setup();
      render(<MapFormModal {...createProps()} />);

      // Espaços são removidos pelo trim na validação
      await user.type(screen.getByPlaceholderText('NOME*'), '   ');

      expect(screen.getByRole('button', { name: 'Criar' })).toBeDisabled();
    });

    it('botão desabilitado quando nome excede 100 caracteres', async () => {
      const user = userEvent.setup();
      render(<MapFormModal {...createProps()} />);

      await user.type(screen.getByPlaceholderText('NOME*'), 'a'.repeat(101));

      expect(screen.getByRole('button', { name: 'Criar' })).toBeDisabled();
    });

    it('botão habilitado quando nome é válido', async () => {
      const user = userEvent.setup();
      render(<MapFormModal {...createProps()} />);

      await user.type(screen.getByPlaceholderText('NOME*'), 'Meu Mapa');

      expect(screen.getByRole('button', { name: 'Criar' })).not.toBeDisabled();
    });

    it('botão exibe "Editar" no modo edit', () => {
      render(<MapFormModal {...createProps({ mode: 'edit', initialName: 'Mapa' })} />);

      expect(screen.getByRole('button', { name: 'Editar' })).toBeInTheDocument();
    });
  });

  describe('Submit do formulário', () => {
    it('submit válido chama onSubmit com nome trimado', async () => {
      const user = userEvent.setup();
      const props = createProps();
      render(<MapFormModal {...props} />);

      // Nome com espaços extras para testar trim
      await user.type(screen.getByPlaceholderText('NOME*'), '  Meu Mapa  ');
      await user.type(screen.getByPlaceholderText('DESCRIÇÃO'), 'Descrição');
      await user.click(screen.getByRole('button', { name: 'Criar' }));

      await waitFor(() => {
        // Nome deve ser trimado antes de enviar
        expect(props.onSubmit).toHaveBeenCalledWith('Meu Mapa', 'Descrição');
      });
    });

    it('submit com sucesso chama onClose', async () => {
      const user = userEvent.setup();
      const props = createProps();
      render(<MapFormModal {...props} />);

      await user.type(screen.getByPlaceholderText('NOME*'), 'Meu Mapa');
      await user.click(screen.getByRole('button', { name: 'Criar' }));

      await waitFor(() => {
        expect(props.onClose).toHaveBeenCalledTimes(1);
      });
    });

    it('exibe estado de loading durante submit', async () => {
      const user = userEvent.setup();
      // Promise controlada que resolve quando quisermos
      let resolveSubmit: () => void;
      const onSubmit = vi.fn().mockImplementation(
        () =>
          new Promise<void>((resolve) => {
            resolveSubmit = resolve;
          })
      );
      render(<MapFormModal {...createProps({ onSubmit })} />);

      await user.type(screen.getByPlaceholderText('NOME*'), 'Meu Mapa');
      await user.click(screen.getByRole('button', { name: 'Criar' }));

      // Durante o submit, mostra "Criando..."
      expect(screen.getByRole('button', { name: 'Criando...' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Criando...' })).toBeDisabled();

      // Resolve a promise para limpar o estado
      resolveSubmit!();
    });
  });

  describe('Tratamento de erros', () => {
    it('erro da API é exibido e modal NÃO fecha', async () => {
      const user = userEvent.setup();
      const props = createProps({
        onSubmit: vi.fn().mockResolvedValue({ error: 'Já existe um mapa com este nome' }),
      });
      render(<MapFormModal {...props} />);

      await user.type(screen.getByPlaceholderText('NOME*'), 'Mapa Duplicado');
      await user.click(screen.getByRole('button', { name: 'Criar' }));

      await waitFor(() => {
        // Erro deve aparecer
        expect(screen.getByText('Já existe um mapa com este nome')).toBeInTheDocument();
      });

      // Modal NÃO deve fechar quando há erro
      expect(props.onClose).not.toHaveBeenCalled();
    });

    it('erro de validação exibido quando descrição excede limite', async () => {
      const user = userEvent.setup();
      const props = createProps();
      render(<MapFormModal {...props} />);

      await user.type(screen.getByPlaceholderText('NOME*'), 'Mapa Válido');
      // Descrição com mais de 40 caracteres
      await user.type(screen.getByPlaceholderText('DESCRIÇÃO'), 'a'.repeat(50));
      await user.click(screen.getByRole('button', { name: 'Criar' }));

      await waitFor(() => {
        expect(screen.getByText(/descrição deve ter no máximo 40 caracteres/i)).toBeInTheDocument();
      });

      // onSubmit NÃO deve ser chamado com dados inválidos
      expect(props.onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Reset de estado', () => {
    it('reseta campos e erros quando modal reabre', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<MapFormModal {...createProps()} />);

      // Preenche o nome
      await user.type(screen.getByPlaceholderText('NOME*'), 'Meu Mapa');

      // Fecha o modal
      rerender(<MapFormModal {...createProps({ isOpen: false })} />);

      // Reabre o modal
      rerender(<MapFormModal {...createProps({ isOpen: true })} />);

      // Campo deve estar vazio (estado resetado pelo useEffect)
      expect(screen.getByPlaceholderText('NOME*')).toHaveValue('');
    });
  });
});
