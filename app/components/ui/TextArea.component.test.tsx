import { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TextArea from './TextArea';

/**
 * Testes do componente TextArea.
 *
 * Comportamento essencial:
 * - Renderiza campo multilinha com valor, placeholder e rows
 * - Dispara onChange ao digitar (com valor completo, incluindo \n)
 * - Respeita estado disabled
 */

/**
 * TestHarness para TextArea controlado.
 *
 * TextArea é um componente controlled (value + onChange). Em testes com value fixo,
 * o React "reseta" o campo a cada keystroke, resultando em valores incorretos.
 * Este harness simula uso real: mantém estado interno e repassa para o TextArea.
 */
function TextAreaHarness({
  initialValue = '',
  onChangeSpy,
  ...props
}: {
  initialValue?: string;
  onChangeSpy?: (value: string) => void;
} & Omit<React.ComponentProps<typeof TextArea>, 'value' | 'onChange'>) {
  const [value, setValue] = useState(initialValue);

  const handleChange = (newValue: string) => {
    setValue(newValue);
    onChangeSpy?.(newValue);
  };

  return <TextArea value={value} onChange={handleChange} {...props} />;
}

describe('TextArea', () => {
  it('renderiza com valor e placeholder', () => {
    render(<TextAreaHarness initialValue="Texto inicial" placeholder="Digite uma descrição" />);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveValue('Texto inicial');
    expect(screen.getByPlaceholderText('Digite uma descrição')).toBeInTheDocument();
  });

  it('usa rows padrão (3)', () => {
    render(<TextAreaHarness />);

    expect(screen.getByRole('textbox')).toHaveAttribute('rows', '3');
  });

  it('aceita rows customizado', () => {
    render(<TextAreaHarness rows={5} />);

    expect(screen.getByRole('textbox')).toHaveAttribute('rows', '5');
  });

  it('chama onChange com valor completo ao digitar', async () => {
    const onChangeSpy = vi.fn();
    render(<TextAreaHarness onChangeSpy={onChangeSpy} />);

    await userEvent.type(screen.getByRole('textbox'), 'Novo texto');

    // Valida comportamento real: onChange recebe o valor acumulado, não apenas a tecla
    expect(onChangeSpy).toHaveBeenCalled();
    expect(onChangeSpy).toHaveBeenLastCalledWith('Novo texto');
    expect(screen.getByRole('textbox')).toHaveValue('Novo texto');
  });

  it('suporta texto multilinha com Enter', async () => {
    // Enter em TextArea insere nova linha (diferente de Input onde pode submeter form)
    const onChangeSpy = vi.fn();
    render(<TextAreaHarness onChangeSpy={onChangeSpy} />);

    await userEvent.type(screen.getByRole('textbox'), 'Linha 1{Enter}Linha 2');

    // Valida que o valor final contém quebra de linha
    const lastValue = onChangeSpy.mock.calls.at(-1)?.[0] as string;
    expect(lastValue).toContain('\n');
    expect(lastValue).toBe('Linha 1\nLinha 2');
  });

  it('respeita estado disabled', async () => {
    const onChangeSpy = vi.fn();
    render(<TextAreaHarness initialValue="Original" onChangeSpy={onChangeSpy} disabled />);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeDisabled();

    await userEvent.type(textarea, 'Novo texto');

    expect(onChangeSpy).not.toHaveBeenCalled();
    expect(textarea).toHaveValue('Original');
  });

  it('está habilitado por padrão', () => {
    render(<TextAreaHarness />);

    expect(screen.getByRole('textbox')).toBeEnabled();
  });
});
