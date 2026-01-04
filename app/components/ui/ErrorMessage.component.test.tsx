import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorMessage from './ErrorMessage';

/**
 * Testes do componente ErrorMessage.
 *
 * Comportamento essencial:
 * 1. Não renderiza nada quando não há mensagem (null ou vazia) - evita "espaço vazio" na UI
 * 2. Renderiza a mensagem quando fornecida - exibe feedback de erro ao usuário
 *
 * Testes de mensagens longas/caracteres especiais foram removidos pois não testam
 * comportamento do componente - apenas que o React renderiza strings corretamente.
 */

describe('ErrorMessage', () => {
  it.each([null, ''])('não renderiza nada quando message é %s', (message) => {
    const { container } = render(<ErrorMessage message={message} />);

    // container.toBeEmptyDOMElement() é apropriado aqui pois validamos
    // que o componente retorna null (não há elemento para buscar semanticamente)
    expect(container).toBeEmptyDOMElement();
  });

  it('renderiza a mensagem de erro quando fornecida', () => {
    render(<ErrorMessage message="Erro ao salvar os dados" />);

    expect(screen.getByText('Erro ao salvar os dados')).toBeInTheDocument();
  });
});
