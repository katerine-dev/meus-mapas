import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PointModal from './PointModal';

/**
 * Testes do componente PointModal.
 *
 * Modal para criar e editar pontos no mapa.
 * Testes focam em: renderização, validação, submissão e tratamento de erros.
 */

describe('PointModal', () => {
  const createProps = (overrides = {}) => ({
    isOpen: true,
    onClose: vi.fn(),
    mode: 'create' as const,
    initialName: '',
    latitude: -23.5505,
    longitude: -46.6333,
    onSave: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  });

  /** Cria uma promise controlada para testar estados de loading */
  const createDeferredPromise = <T,>() => {
    let resolve!: (value: T) => void;
    let reject!: (error: Error) => void;
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Renderização', () => {
    it('não renderiza quando fechado', () => {
      render(<PointModal {...createProps({ isOpen: false })} />);

      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });

    it('exibe título correto por modo', () => {
      const { rerender } = render(<PointModal {...createProps()} />);
      expect(screen.getByRole('heading', { name: /novo ponto/i })).toBeInTheDocument();

      rerender(<PointModal {...createProps({ mode: 'edit', initialName: 'Ponto' })} />);
      expect(screen.getByRole('heading', { name: /editar ponto/i })).toBeInTheDocument();
    });

    it('preenche campo com valor inicial no modo edição', () => {
      render(<PointModal {...createProps({ mode: 'edit', initialName: 'Praça da Sé' })} />);

      expect(screen.getByPlaceholderText('Nome do ponto')).toHaveValue('Praça da Sé');
    });

    it('exibe coordenadas formatadas', () => {
      render(<PointModal {...createProps()} />);

      expect(screen.getByDisplayValue('-23.550500')).toBeInTheDocument();
      expect(screen.getByDisplayValue('-46.633300')).toBeInTheDocument();
    });
  });

  describe('Validação', () => {
    it('botão desabilitado com nome vazio', () => {
      render(<PointModal {...createProps()} />);

      expect(screen.getByRole('button', { name: /salvar/i })).toBeDisabled();
    });

    it('botão desabilitado com apenas espaços', async () => {
      const user = userEvent.setup();
      render(<PointModal {...createProps()} />);

      await user.type(screen.getByPlaceholderText('Nome do ponto'), '      ');

      expect(screen.getByRole('button', { name: /salvar/i })).toBeDisabled();
    });

    it('botão habilitado com nome válido', async () => {
      const user = userEvent.setup();
      render(<PointModal {...createProps()} />);

      await user.type(screen.getByPlaceholderText('Nome do ponto'), 'Meu Ponto');

      expect(screen.getByRole('button', { name: /salvar/i })).toBeEnabled();
    });
  });

  describe('Submissão', () => {
    it('chama onSave com nome trimado', async () => {
      const user = userEvent.setup();
      const props = createProps();
      render(<PointModal {...props} />);

      await user.type(screen.getByPlaceholderText('Nome do ponto'), '   Praça Central   ');
      await user.click(screen.getByRole('button', { name: /salvar/i }));

      await waitFor(() => {
        expect(props.onSave).toHaveBeenCalledOnce();
        expect(props.onSave).toHaveBeenCalledWith('Praça Central');
      });
    });

    it('exibe loading durante submit e retorna ao normal', async () => {
      const user = userEvent.setup();
      const deferred = createDeferredPromise<void>();
      const props = createProps({ onSave: vi.fn(() => deferred.promise) });
      render(<PointModal {...props} />);

      await user.type(screen.getByPlaceholderText('Nome do ponto'), 'Ponto');
      await user.click(screen.getByRole('button', { name: /salvar/i }));

      // Durante loading
      expect(screen.getByRole('button', { name: /salvando/i })).toBeDisabled();

      // Resolve para finalizar
      deferred.resolve();

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /salvando/i })).not.toBeInTheDocument();
      });
    });

    it('chama onClose ao clicar em Cancelar', async () => {
      const user = userEvent.setup();
      const props = createProps();
      render(<PointModal {...props} />);

      await user.click(screen.getByRole('button', { name: /cancelar/i }));

      expect(props.onClose).toHaveBeenCalledOnce();
    });
  });

  describe('Tratamento de erros', () => {
    it('exibe erro da API e não fecha modal', async () => {
      const user = userEvent.setup();
      const props = createProps({
        onSave: vi.fn().mockResolvedValue({ error: 'Ponto já existe' }),
      });
      render(<PointModal {...props} />);

      await user.type(screen.getByPlaceholderText('Nome do ponto'), 'Ponto');
      await user.click(screen.getByRole('button', { name: /salvar/i }));

      await waitFor(() => {
        expect(screen.getByText('Ponto já existe')).toBeInTheDocument();
      });
      expect(props.onClose).not.toHaveBeenCalled();
    });

    it('exibe erro genérico quando onSave lança exceção', async () => {
      const user = userEvent.setup();
      const props = createProps({
        onSave: vi.fn().mockRejectedValue(new Error('Network error')),
      });
      render(<PointModal {...props} />);

      await user.type(screen.getByPlaceholderText('Nome do ponto'), 'Ponto');
      await user.click(screen.getByRole('button', { name: /salvar/i }));

      await waitFor(() => {
        expect(screen.getByText(/erro ao salvar ponto/i)).toBeInTheDocument();
      });
    });
  });
});
