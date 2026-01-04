import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TextArea from './TextArea';

/**
 * Testes do componente TextArea.
 *
 * Comportamento essencial:
 * - Renderiza campo multilinha com valor, placeholder e rows
 * - Dispara onChange ao digitar (incluindo Enter para nova linha)
 * - Respeita estado disabled
 */

describe('TextArea', () => {
  // Helper que reduz repetição: renderiza, configura userEvent e retorna o textarea
  const setup = (props = {}) => {
    const defaultProps = {
      value: '',
      onChange: vi.fn(),
      ...props,
    };
    render(<TextArea {...defaultProps} />);
    return {
      user: userEvent.setup(),
      textarea: screen.getByRole('textbox'),
      onChange: defaultProps.onChange,
    };
  };

  it('renderiza com valor e placeholder', () => {
    render(
      <TextArea value="Texto inicial" onChange={vi.fn()} placeholder="Digite uma descrição" />
    );

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveValue('Texto inicial');
    expect(screen.getByPlaceholderText('Digite uma descrição')).toBeInTheDocument();
  });

  it('usa rows padrão (3) ou customizado', () => {
    const { textarea } = setup();
    expect(textarea).toHaveAttribute('rows', '3');

    // Testa rows customizado
    render(<TextArea value="" onChange={vi.fn()} rows={5} />);
    expect(screen.getAllByRole('textbox')[1]).toHaveAttribute('rows', '5');
  });

  it('chama onChange ao digitar', async () => {
    const { user, textarea, onChange } = setup();

    await user.type(textarea, 'Novo texto');

    expect(onChange).toHaveBeenCalledTimes('Novo texto'.length);
    expect(onChange).toHaveBeenLastCalledWith('o');
  });

  it('suporta texto multilinha com Enter', async () => {
    // Enter em TextArea insere nova linha (diferente de Input onde pode submeter form)
    const { user, textarea, onChange } = setup();

    await user.type(textarea, 'Linha 1{Enter}Linha 2');

    expect(onChange).toHaveBeenCalled();
  });

  it('respeita estado disabled', async () => {
    const { user, textarea, onChange } = setup({ disabled: true, value: 'Original' });

    expect(textarea).toBeDisabled();
    await user.type(textarea, 'Novo texto');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('está habilitado por padrão', () => {
    const { textarea } = setup();

    expect(textarea).toBeEnabled();
  });
});
