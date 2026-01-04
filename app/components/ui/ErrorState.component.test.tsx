import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorState from './ErrorState';

/**
 * Testes do componente ErrorState.
 *
 * Comportamento essencial:
 * - Exibe título e mensagem de erro (customizáveis ou com valores padrão)
 * - Botão de retry aparece apenas quando onRetry é fornecido
 * - Funciona em ambos os modos: full (página inteira) e compact (inline)
 */

describe('ErrorState', () => {
  it('exibe título e mensagem com valores padrão', () => {
    render(<ErrorState />);

    expect(screen.getByRole('heading', { name: 'Algo deu errado' })).toBeInTheDocument();
    expect(screen.getByText('Ocorreu um erro inesperado.')).toBeInTheDocument();
  });

  it('exibe título e mensagem customizados', () => {
    render(
      <ErrorState title="Falha no carregamento" message="Não foi possível carregar os dados." />
    );

    expect(screen.getByRole('heading', { name: 'Falha no carregamento' })).toBeInTheDocument();
    expect(screen.getByText('Não foi possível carregar os dados.')).toBeInTheDocument();
  });

  // Teste parametrizado para garantir que ambos os modos renderizam sem quebrar
  it.each([false, true])('renderiza corretamente com compact=%s', (compact) => {
    render(<ErrorState compact={compact} />);

    expect(screen.getByText('Algo deu errado')).toBeInTheDocument();
    expect(screen.getByText('Ocorreu um erro inesperado.')).toBeInTheDocument();
  });

  describe('Botão de retry', () => {
    it('não exibe botão quando onRetry não é fornecido', () => {
      render(<ErrorState />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('exibe botão e chama onRetry ao clicar', async () => {
      const user = userEvent.setup();
      const onRetry = vi.fn();
      render(<ErrorState onRetry={onRetry} />);

      const button = screen.getByRole('button', { name: 'Tentar novamente' });
      expect(button).toBeInTheDocument();

      await user.click(button);

      expect(onRetry).toHaveBeenCalledOnce();
    });

    it('exibe label customizado no botão', () => {
      render(<ErrorState onRetry={vi.fn()} retryLabel="Recarregar" />);

      expect(screen.getByRole('button', { name: 'Recarregar' })).toBeInTheDocument();
    });
  });
});
