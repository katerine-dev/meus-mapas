import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Input from './Input';

/**
 * Testes do Input - campo de texto de linha única.
 *
 * toBeDisabled() / toBeEnabled(): verifica estado do input
 * Componente controlado: recebe value e onChange como props
 */
describe('Input', () => {
  it('renderiza com valor e placeholder', () => {
    render(<Input value="Texto inicial" placeholder="Digite aqui" onChange={() => {}} />);

    expect(screen.getByRole('textbox')).toHaveValue('Texto inicial');
    expect(screen.getByPlaceholderText('Digite aqui')).toBeInTheDocument();
  });

  it('renderiza desabilitado', () => {
    render(<Input value="Original" onChange={() => {}} disabled />);

    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('está habilitado por padrão', () => {
    render(<Input value="" onChange={() => {}} />);

    expect(screen.getByRole('textbox')).toBeEnabled();
  });
});
