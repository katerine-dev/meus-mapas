import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConfirmModal from './ConfirmModal';

/**
 * Testes do componente ConfirmModal.
 *
 * ConfirmModal é o diálogo de confirmação para ações destrutivas.
 * Testes focam em comportamento: interações, estados de loading e tratamento de erros.
 *
 * Nota: O teste de "clique no overlay fecha" foi removido pois é responsabilidade
 * do Modal base, testado em Modal.component.test.tsx. Evita duplicação de testes.
 */

describe('ConfirmModal', () => {
  // Factory function para criar props com overrides
  const createProps = (overrides = {}) => ({
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn().mockResolvedValue(undefined),
    title: 'Confirmar exclusão',
    message: 'Deseja realmente excluir este item?',
    ...overrides,
  });

  /**
   * Cria uma promise controlada para testar estados intermediários (loading).
   * Permite controlar quando a promise resolve/rejeita, possibilitando asserts
   * enquanto a operação ainda está "em andamento".
   */
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
    it('exibe título e mensagem quando aberto', () => {
      render(<ConfirmModal {...createProps()} />);

      expect(screen.getByRole('heading', { name: 'Confirmar exclusão' })).toBeInTheDocument();
      expect(screen.getByText('Deseja realmente excluir este item?')).toBeInTheDocument();
    });

    it('não renderiza quando fechado', () => {
      render(<ConfirmModal {...createProps({ isOpen: false })} />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('exibe botões de cancelar e confirmar', () => {
      render(<ConfirmModal {...createProps()} />);

      expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Confirmar' })).toBeInTheDocument();
    });
  });

  describe('Acessibilidade', () => {
    it('possui aria-labelledby apontando para o título', () => {
      render(<ConfirmModal {...createProps()} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby', 'confirm-modal-title');
      expect(screen.getByRole('heading')).toHaveAttribute('id', 'confirm-modal-title');
    });
  });

  describe('Interações', () => {
    it('chama onClose ao clicar em Cancelar', async () => {
      const user = userEvent.setup();
      const props = createProps();
      render(<ConfirmModal {...props} />);

      await user.click(screen.getByRole('button', { name: 'Cancelar' }));

      expect(props.onClose).toHaveBeenCalledOnce();
    });

    it('chama onConfirm ao clicar em Confirmar', async () => {
      const user = userEvent.setup();
      const props = createProps();
      render(<ConfirmModal {...props} />);

      await user.click(screen.getByRole('button', { name: 'Confirmar' }));

      expect(props.onConfirm).toHaveBeenCalledOnce();
    });
  });

  describe('Estados de loading', () => {
    it('exibe spinner durante confirmação', async () => {
      const user = userEvent.setup();
      const deferred = createDeferredPromise<void>();
      const props = createProps({ onConfirm: () => deferred.promise });
      render(<ConfirmModal {...props} />);

      await user.click(screen.getByRole('button', { name: 'Confirmar' }));

      // Spinner usa role="status" para acessibilidade - evita acoplamento a classes CSS
      expect(screen.getByRole('status')).toBeInTheDocument();

      // Resolve a promise para limpar o estado de loading
      deferred.resolve(undefined);
    });

    it('desabilita botões durante loading', async () => {
      const user = userEvent.setup();
      const deferred = createDeferredPromise<void>();
      const props = createProps({ onConfirm: () => deferred.promise });
      render(<ConfirmModal {...props} />);

      await user.click(screen.getByRole('button', { name: 'Confirmar' }));

      // Durante loading, botões ficam desabilitados para evitar múltiplos cliques
      expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();

      deferred.resolve(undefined);
    });
  });

  describe('Tratamento de erros', () => {
    it('exibe mensagem de erro quando onConfirm retorna error', async () => {
      const user = userEvent.setup();
      const props = createProps({
        onConfirm: vi.fn().mockResolvedValue({ error: 'Falha ao excluir' }),
      });
      render(<ConfirmModal {...props} />);

      await user.click(screen.getByRole('button', { name: 'Confirmar' }));

      await waitFor(() => {
        expect(screen.getByText('Falha ao excluir')).toBeInTheDocument();
      });
    });

    it('exibe mensagem genérica quando onConfirm lança exceção', async () => {
      const user = userEvent.setup();
      const props = createProps({
        onConfirm: vi.fn().mockRejectedValue(new Error('Network error')),
      });
      render(<ConfirmModal {...props} />);

      await user.click(screen.getByRole('button', { name: 'Confirmar' }));

      await waitFor(() => {
        expect(screen.getByText('Erro ao executar ação. Tente novamente.')).toBeInTheDocument();
      });
    });

    it('limpa erro quando modal reabre', async () => {
      const user = userEvent.setup();
      const props = createProps({
        onConfirm: vi.fn().mockResolvedValue({ error: 'Falha ao excluir' }),
      });
      const { rerender } = render(<ConfirmModal {...props} />);

      await user.click(screen.getByRole('button', { name: 'Confirmar' }));

      await waitFor(() => {
        expect(screen.getByText('Falha ao excluir')).toBeInTheDocument();
      });

      // Fecha e reabre o modal - erro deve ser limpo
      rerender(<ConfirmModal {...props} isOpen={false} />);
      rerender(<ConfirmModal {...props} isOpen={true} />);

      expect(screen.queryByText('Falha ao excluir')).not.toBeInTheDocument();
    });
  });
});
