import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from './Button';

/**
 * Testes do componente Button.
 *
 * Foco em COMPORTAMENTO, não em estilo:
 * - Click dispara handler (interação principal)
 * - Disabled bloqueia interação (acessibilidade)
 * - Type correto para formulários (submit vs button)
 * - Variantes renderizam sem quebrar (smoke test)
 */

describe('Button', () => {
  describe('Comportamento', () => {
    it('chama onClick ao clicar', async () => {
      const onClick = vi.fn();
      render(<Button onClick={onClick}>Clique aqui</Button>);

      await userEvent.click(screen.getByRole('button', { name: 'Clique aqui' }));

      expect(onClick).toHaveBeenCalledOnce();
    });

    it('não chama onClick quando disabled', async () => {
      const onClick = vi.fn();
      render(
        <Button onClick={onClick} disabled>
          Clique aqui
        </Button>
      );

      await userEvent.click(screen.getByRole('button', { name: 'Clique aqui' }));

      expect(onClick).not.toHaveBeenCalled();
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('Atributo type', () => {
    // type="button" evita submit acidental em forms; type="submit" permite submissão
    it.each([
      [undefined, 'button'], // padrão seguro
      ['submit', 'submit'],
      ['button', 'button'],
    ] as const)('com type=%s renderiza type="%s"', (typeProp, expectedType) => {
      render(
        <Button type={typeProp} onClick={vi.fn()}>
          Botão
        </Button>
      );

      expect(screen.getByRole('button')).toHaveAttribute('type', expectedType);
    });
  });

  describe('Variantes (smoke test)', () => {
    // Smoke test: apenas verifica que renderiza sem quebrar, sem asserts de classe/estilo
    it.each(['primary', 'secondary', 'danger', 'outlined'] as const)(
      'variante "%s" renderiza sem erros',
      (variant) => {
        render(
          <Button variant={variant} onClick={vi.fn()}>
            Botão
          </Button>
        );

        expect(screen.getByRole('button', { name: 'Botão' })).toBeInTheDocument();
      }
    );
  });
});
