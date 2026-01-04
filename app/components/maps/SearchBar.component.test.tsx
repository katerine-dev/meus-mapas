import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SearchBar from './SearchBar';

/**
 * Testes do SearchBar - barra de busca com campo de texto e ordenação.
 *
 * getByPlaceholderText(): busca input pelo atributo placeholder
 * getByRole('button', { name }): busca botão pelo texto acessível
 */
describe('SearchBar', () => {
  it('renderiza campo de busca', () => {
    render(<SearchBar onSearch={() => {}} onSortChange={() => {}} />);

    expect(screen.getByPlaceholderText('Buscar mapas...')).toBeInTheDocument();
  });

  it('renderiza botão de ordenação', () => {
    render(<SearchBar onSearch={() => {}} onSortChange={() => {}} />);

    expect(screen.getByRole('button', { name: 'Ordenar mapas' })).toBeInTheDocument();
  });
});
