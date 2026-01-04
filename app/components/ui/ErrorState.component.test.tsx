import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorState from './ErrorState';

/**
 * Testes do ErrorState - componente de estado de erro.
 *
 * Testamos:
 * - Valores padrão (título e mensagem)
 * - Valores customizados via props
 * - Renderização condicional do botão retry
 */
describe('ErrorState', () => {
  it('exibe título e mensagem padrão', () => {
    render(<ErrorState />);

    expect(screen.getByText('Algo deu errado')).toBeInTheDocument();
    expect(screen.getByText('Ocorreu um erro inesperado.')).toBeInTheDocument();
  });

  it('exibe título e mensagem customizados', () => {
    render(
      <ErrorState title="Falha no carregamento" message="Não foi possível carregar os dados." />
    );

    expect(screen.getByText('Falha no carregamento')).toBeInTheDocument();
    expect(screen.getByText('Não foi possível carregar os dados.')).toBeInTheDocument();
  });

  it('não exibe botão quando onRetry não é fornecido', () => {
    render(<ErrorState />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('exibe botão quando onRetry é fornecido', () => {
    render(<ErrorState onRetry={() => {}} />);

    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeInTheDocument();
  });
});
