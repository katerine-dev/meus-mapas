import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Input from './Input';

/**
 * Testes do componente Input.
 *
 * Comportamento essencial:
 * - Renderiza campo de texto com valor e placeholder
 * - Dispara onChange ao digitar
 * - Suporta eventos de teclado (Enter, Escape) para UX de formulários
 * - Respeita estado disabled
 */

describe('Input', () => {
  // Helper que reduz repetição: renderiza, configura userEvent e retorna o input
  const setup = (props = {}) => {
    const defaultProps = {
      value: '',
      onChange: vi.fn(),
      ...props,
    };
    render(<Input {...defaultProps} />);
    return {
      user: userEvent.setup(),
      input: screen.getByRole('textbox'),
      onChange: defaultProps.onChange,
    };
  };

  it('renderiza com valor e placeholder', () => {
    render(<Input value="Texto inicial" onChange={vi.fn()} placeholder="Digite aqui" />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('Texto inicial');
    expect(screen.getByPlaceholderText('Digite aqui')).toBeInTheDocument();
  });

  it('chama onChange ao digitar', async () => {
    const { user, input, onChange } = setup();

    await user.type(input, 'Novo texto');

    expect(onChange).toHaveBeenCalledTimes('Novo texto'.length);
    expect(onChange).toHaveBeenLastCalledWith('o');
  });

  it('dispara onKeyDown com a tecla pressionada', async () => {
    // Eventos de teclado (Enter/Escape) são usados para submeter ou cancelar forms
    const onKeyDown = vi.fn();
    render(<Input value="" onChange={vi.fn()} onKeyDown={onKeyDown} />);
    const user = userEvent.setup();

    await user.type(screen.getByRole('textbox'), '{Enter}');

    expect(onKeyDown).toHaveBeenCalledOnce();
    expect(onKeyDown.mock.calls[0][0].key).toBe('Enter');
  });

  it('respeita estado disabled', async () => {
    const { user, input, onChange } = setup({ disabled: true, value: 'Original' });

    expect(input).toBeDisabled();
    await user.type(input, 'Novo texto');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('está habilitado por padrão', () => {
    const { input } = setup();

    expect(input).toBeEnabled();
  });
});
