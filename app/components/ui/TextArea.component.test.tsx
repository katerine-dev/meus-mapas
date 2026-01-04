import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TextArea from './TextArea';

/**
 * Testes do TextArea - campo de texto multilinha.
 *
 * toHaveValue(): verifica o valor atual do input/textarea
 * toHaveAttribute('rows'): verifica atributo que define altura do campo
 */
describe('TextArea', () => {
  it('renderiza com valor e placeholder', () => {
    render(
      <TextArea value="Texto inicial" placeholder="Digite uma descrição" onChange={() => {}} />
    );

    expect(screen.getByRole('textbox')).toHaveValue('Texto inicial');
    expect(screen.getByPlaceholderText('Digite uma descrição')).toBeInTheDocument();
  });

  it('usa rows padrão (3)', () => {
    render(<TextArea value="" onChange={() => {}} />);

    expect(screen.getByRole('textbox')).toHaveAttribute('rows', '3');
  });

  it('aceita rows customizado', () => {
    render(<TextArea value="" rows={5} onChange={() => {}} />);

    expect(screen.getByRole('textbox')).toHaveAttribute('rows', '5');
  });
});
