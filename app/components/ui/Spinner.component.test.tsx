import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Spinner from './Spinner';

/**
 * Testes do Spinner - indicador de carregamento.
 *
 * role="status" é usado para elementos que indicam estado (loading, etc.)
 * aria-label fornece texto acessível para leitores de tela
 */
describe('Spinner', () => {
  it('renderiza com role status', () => {
    render(<Spinner />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('possui aria-label padrão', () => {
    render(<Spinner />);

    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Carregando');
  });

  it('exibe label visível quando fornecido', () => {
    render(<Spinner label="Salvando dados..." />);

    expect(screen.getByText('Salvando dados...')).toBeInTheDocument();
  });
});
