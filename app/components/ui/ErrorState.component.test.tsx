import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorState from './ErrorState';

/**
 * Testes do componente ErrorState.
 *
 * Foco em COMPORTAMENTO, não em layout:
 * - Exibe conteúdo de erro (título + mensagem)
 * - Botão de retry aparece condicionalmente e funciona
 * - Modo compact é apenas variação visual, não altera comportamento
 */

describe('ErrorState', () => {
  it('exibe título e mensagem (valores padrão ou customizados)', () => {
    // Valores padrão
    const { rerender } = render(<ErrorState />);
    expect(screen.getByText('Algo deu errado')).toBeInTheDocument();
    expect(screen.getByText('Ocorreu um erro inesperado.')).toBeInTheDocument();

    // Valores customizados
    rerender(
      <ErrorState title="Falha no carregamento" message="Não foi possível carregar os dados." />
    );
    expect(screen.getByText('Falha no carregamento')).toBeInTheDocument();
    expect(screen.getByText('Não foi possível carregar os dados.')).toBeInTheDocument();
  });

  // Smoke test: compact é variação visual, apenas garante que não quebra
  it.each([false, true])('renderiza sem erros com compact=%s', (compact) => {
    render(<ErrorState compact={compact} />);

    expect(screen.getByText('Algo deu errado')).toBeInTheDocument();
  });

  describe('Botão de retry', () => {
    it('não exibe botão quando onRetry não é fornecido', () => {
      render(<ErrorState />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('exibe botão e chama onRetry ao clicar', async () => {
      const onRetry = vi.fn();
      render(<ErrorState onRetry={onRetry} />);

      await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));

      expect(onRetry).toHaveBeenCalledOnce();
    });

    it('aceita label customizado no botão', () => {
      render(<ErrorState onRetry={vi.fn()} retryLabel="Recarregar" />);

      expect(screen.getByRole('button', { name: 'Recarregar' })).toBeInTheDocument();
    });
  });
});
