import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Spinner from './Spinner';

/**
 * Testes do componente Spinner.
 *
 * Estratégia de testes:
 * - Usamos role="status" para localizar o spinner, evitando acoplamento com classes CSS.
 * - Isso torna os testes resilientes a mudanças de estilo (Tailwind, CSS modules, etc).
 * - Focamos em comportamento (renderiza, exibe label, acessibilidade) e não em implementação.
 */

describe('Spinner', () => {
  it('renderiza com role="status" e aria-label padrão para acessibilidade', () => {
    // role="status" + aria-live="polite" permite que leitores de tela anunciem o loading
    // aria-label garante um rótulo acessível mesmo sem label visível
    render(<Spinner />);

    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('aria-label', 'Carregando');
    expect(spinner).toHaveAttribute('aria-live', 'polite');
  });

  it('exibe label visível e usa como aria-label quando fornecido', () => {
    render(<Spinner label="Salvando dados..." />);

    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('aria-label', 'Salvando dados...');
    expect(screen.getByText('Salvando dados...')).toBeInTheDocument();
  });

  it('não exibe label visível quando não fornecido', () => {
    render(<Spinner />);

    // Apenas o aria-label existe, não há texto visível
    expect(screen.queryByText('Carregando')).not.toBeInTheDocument();
  });

  // Teste parametrizado "smoke" para garantir que todas as combinações de size/variant renderizam
  // Sem asserts de classe - apenas verifica que não quebra
  it.each([
    { size: 'xs', variant: 'default' },
    { size: 'sm', variant: 'white' },
    { size: 'md', variant: 'default' },
    { size: 'lg', variant: 'white' },
  ] as const)('renderiza sem erros com size=$size e variant=$variant', ({ size, variant }) => {
    render(<Spinner size={size} variant={variant} />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
