import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorMessage from './ErrorMessage';

/**
 * Testes do ErrorMessage - exibe mensagem de erro inline.
 *
 * toBeEmptyDOMElement(): verifica que o container está vazio
 * (usado quando o componente retorna null)
 */
describe('ErrorMessage', () => {
  it('não renderiza quando message é null', () => {
    const { container } = render(<ErrorMessage message={null} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('não renderiza quando message é vazia', () => {
    const { container } = render(<ErrorMessage message="" />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renderiza a mensagem de erro quando fornecida', () => {
    render(<ErrorMessage message="Erro ao salvar os dados" />);

    expect(screen.getByText('Erro ao salvar os dados')).toBeInTheDocument();
  });
});
