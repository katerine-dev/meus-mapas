import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from './SearchBar';
import { SORT_OPTIONS } from '../../constants/sort';

/**
 * Testes do componente SearchBar.
 *
 * Barra de busca com campo de texto e dropdown de ordenação.
 * Testes focam em: busca, abertura do dropdown e seleção de opções.
 */

describe('SearchBar', () => {
  const createProps = (overrides = {}) => ({
    onSearch: vi.fn(),
    onSortChange: vi.fn(),
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Campo de busca', () => {
    it('chama onSearch ao digitar', async () => {
      const user = userEvent.setup();
      const props = createProps();
      render(<SearchBar {...props} />);

      await user.type(screen.getByPlaceholderText('Buscar mapas...'), 'meu mapa');

      expect(props.onSearch).toHaveBeenLastCalledWith('meu mapa');
    });
  });

  describe('Dropdown de ordenação', () => {
    it('abre dropdown com opções ao clicar no botão', async () => {
      const user = userEvent.setup();
      render(<SearchBar {...createProps()} />);

      const sortButton = screen.getByRole('button', { name: 'Ordenar mapas' });
      expect(sortButton).toHaveAttribute('aria-expanded', 'false');

      await user.click(sortButton);

      expect(sortButton).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByRole('button', { name: SORT_OPTIONS.recent })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: SORT_OPTIONS.oldest })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: SORT_OPTIONS.az })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: SORT_OPTIONS.za })).toBeInTheDocument();
    });

    it('selecionar opção chama onSortChange e fecha dropdown', async () => {
      const user = userEvent.setup();
      const props = createProps();
      render(<SearchBar {...props} />);

      await user.click(screen.getByRole('button', { name: 'Ordenar mapas' }));
      await user.click(screen.getByRole('button', { name: SORT_OPTIONS.az }));

      expect(props.onSortChange).toHaveBeenCalledOnce();
      expect(props.onSortChange).toHaveBeenCalledWith('az');
      expect(screen.queryByRole('button', { name: SORT_OPTIONS.oldest })).not.toBeInTheDocument();
    });

    it('botão tem atributos ARIA corretos', () => {
      render(<SearchBar {...createProps()} />);

      const sortButton = screen.getByRole('button', { name: 'Ordenar mapas' });
      expect(sortButton).toHaveAttribute('aria-haspopup', 'listbox');
      expect(sortButton).toHaveAttribute('aria-expanded', 'false');
    });
  });
});
