import { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Input from './Input';

/**
 * Testes do componente Input.
 *
 * Comportamento essencial:
 * - Renderiza campo de texto com valor e placeholder
 * - Dispara onChange ao digitar (com valor completo)
 * - Suporta eventos de teclado (Enter, Escape) para UX de formulários
 * - Respeita estado disabled
 */

/**
 * TestHarness para Input controlado.
 *
 * Input é um componente controlled (value + onChange). Em testes com value fixo,
 * o React "reseta" o campo a cada keystroke, resultando em valores incorretos.
 * Este harness simula uso real: mantém estado interno e repassa para o Input.
 */
function InputHarness({
  initialValue = '',
  onChangeSpy,
  ...props
}: {
  initialValue?: string;
  onChangeSpy?: (value: string) => void;
} & Omit<React.ComponentProps<typeof Input>, 'value' | 'onChange'>) {
  const [value, setValue] = useState(initialValue);

  const handleChange = (newValue: string) => {
    setValue(newValue);
    onChangeSpy?.(newValue);
  };

  return <Input value={value} onChange={handleChange} {...props} />;
}

describe('Input', () => {
  it('renderiza com valor e placeholder', () => {
    render(<InputHarness initialValue="Texto inicial" placeholder="Digite aqui" />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('Texto inicial');
    expect(screen.getByPlaceholderText('Digite aqui')).toBeInTheDocument();
  });

  it('chama onChange com valor completo ao digitar', async () => {
    const onChangeSpy = vi.fn();
    render(<InputHarness onChangeSpy={onChangeSpy} />);

    await userEvent.type(screen.getByRole('textbox'), 'Novo texto');

    // Valida comportamento real: onChange recebe o valor acumulado, não apenas a tecla
    expect(onChangeSpy).toHaveBeenCalled();
    expect(onChangeSpy).toHaveBeenLastCalledWith('Novo texto');
    expect(screen.getByRole('textbox')).toHaveValue('Novo texto');
  });

  it('dispara onKeyDown com a tecla pressionada', async () => {
    // Eventos de teclado (Enter/Escape) são usados para submeter ou cancelar forms
    const onKeyDown = vi.fn();
    render(<InputHarness onKeyDown={onKeyDown} />);

    await userEvent.type(screen.getByRole('textbox'), '{Enter}');

    expect(onKeyDown).toHaveBeenCalledOnce();
    expect(onKeyDown.mock.calls[0][0].key).toBe('Enter');
  });

  it('respeita estado disabled', async () => {
    const onChangeSpy = vi.fn();
    render(<InputHarness initialValue="Original" onChangeSpy={onChangeSpy} disabled />);

    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();

    await userEvent.type(input, 'Novo texto');

    expect(onChangeSpy).not.toHaveBeenCalled();
    expect(input).toHaveValue('Original');
  });

  it('está habilitado por padrão', () => {
    render(<InputHarness />);

    expect(screen.getByRole('textbox')).toBeEnabled();
  });
});
