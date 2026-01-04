import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Button from './Button';

/**
 * Testes do Button - componente de botão reutilizável.
 *
 * Testamos:
 * - Renderização do texto (children)
 * - Atributo type (button vs submit)
 * - Estado disabled
 *
 * toHaveAttribute(): verifica atributos HTML do elemento
 * toBeDisabled(): verifica se o botão está desabilitado
 */
describe('Button', () => {
  it('renderiza com texto', () => {
    render(<Button onClick={() => {}}>Clique aqui</Button>);

    expect(screen.getByRole('button', { name: 'Clique aqui' })).toBeInTheDocument();
  });

  it('possui type button por padrão', () => {
    render(<Button onClick={() => {}}>Botão</Button>);

    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('aceita type submit', () => {
    render(
      <Button type="submit" onClick={() => {}}>
        Enviar
      </Button>
    );

    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  it('renderiza desabilitado', () => {
    render(
      <Button onClick={() => {}} disabled>
        Botão
      </Button>
    );

    expect(screen.getByRole('button')).toBeDisabled();
  });
});
