import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from './SearchBar';

/**
 * Testes do componente SearchBar.
 *
 * Barra de busca com campo de texto e dropdown de ordenação.
 * Testes focam em: busca, abertura do dropdown e seleção de opções.
 */

describe('SearchBar', () => {
  // Factory function para criar props com mocks frescos
  const createProps = (overrides = {}) => ({
    onSearch: vi.fn(),
    onSortChange: vi.fn(),
    ...overrides,
  });

  // Limpa mocks entre testes
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Campo de busca', () => {
    it('renderiza campo de busca com placeholder', () => {
      render(<SearchBar {...createProps()} />);

      expect(screen.getByPlaceholderText('Buscar mapas...')).toBeInTheDocument();
    });

    it('chama onSearch ao digitar', async () => {
      const user = userEvent.setup();
      const props = createProps();
      render(<SearchBar {...props} />);

      const input = screen.getByPlaceholderText('Buscar mapas...');
      await user.type(input, 'meu mapa');

      // userEvent.type dispara onChange para cada caractere
      // Verificamos se a última chamada contém o valor completo
      expect(props.onSearch).toHaveBeenLastCalledWith('meu mapa');
    });
  });

  describe('Dropdown de ordenação', () => {
    it('abre dropdown ao clicar no botão de ordenação', async () => {
      const user = userEvent.setup();
      render(<SearchBar {...createProps()} />);

      // Dropdown fechado inicialmente
      expect(screen.queryByRole('button', { name: 'Mais antigos' })).not.toBeInTheDocument();

      // Clica no botão de ordenação (usando aria-label)
      await user.click(screen.getByRole('button', { name: 'Ordenar mapas' }));

      // Dropdown aberto mostra todas as opções como botões
      expect(screen.getByRole('button', { name: 'Mais recentes' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Mais antigos' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'A-Z' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Z-A' })).toBeInTheDocument();
    });

    it('selecionar opção chama onSortChange e fecha dropdown', async () => {
      const user = userEvent.setup();
      const props = createProps();
      render(<SearchBar {...props} />);

      // Abre o dropdown
      await user.click(screen.getByRole('button', { name: 'Ordenar mapas' }));

      // Seleciona "A-Z"
      await user.click(screen.getByRole('button', { name: 'A-Z' }));

      // Callback chamado com a chave correta
      expect(props.onSortChange).toHaveBeenCalledWith('az');

      // Dropdown fecha após seleção (opções não visíveis)
      expect(screen.queryByRole('button', { name: 'Mais antigos' })).not.toBeInTheDocument();
    });

    it('botão de ordenação tem atributos ARIA corretos', async () => {
      const user = userEvent.setup();
      render(<SearchBar {...createProps()} />);

      const sortButton = screen.getByRole('button', { name: 'Ordenar mapas' });

      // Estado inicial: fechado
      expect(sortButton).toHaveAttribute('aria-expanded', 'false');
      expect(sortButton).toHaveAttribute('aria-haspopup', 'listbox');

      // Após abrir
      await user.click(sortButton);
      expect(sortButton).toHaveAttribute('aria-expanded', 'true');
    });
  });
});
