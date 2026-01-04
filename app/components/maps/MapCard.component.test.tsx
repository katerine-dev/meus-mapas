import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MapCard from './MapCard';
import type { Map } from '@/app/model/map';

/**
 * Testes do componente MapCard.
 *
 * O MapCard exibe um mapa na lista com preview, informações e menu de ações.
 * Testes focam em: renderização, interações do menu, propagação de eventos e acessibilidade.
 */

// Mock do formatDateBR para garantir output consistente independente de timezone
vi.mock('@/lib/date', () => ({
  formatDateBR: () => '01/01/2024',
}));

describe('MapCard', () => {
  // Fixture base para testes - representa um mapa válido
  const baseMap: Map = {
    id: '1',
    name: 'Mapa de Teste',
    description: 'Descrição do mapa',
    pointsCount: 5,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    deletedAt: null,
  };

  // Factory function para criar props com overrides - evita mutação entre testes
  const createProps = (overrides = {}) => ({
    map: baseMap,
    onEdit: vi.fn(),
    onOpen: vi.fn(),
    onDelete: vi.fn(),
    ...overrides,
  });

  // Limpa mocks entre testes para evitar interferência
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Renderização', () => {
    it('exibe nome, descrição, contagem de pontos e data formatada', () => {
      render(<MapCard {...createProps()} />);

      // Verifica elementos essenciais usando queries semânticas
      expect(screen.getByRole('heading', { name: 'Mapa de Teste' })).toBeInTheDocument();
      expect(screen.getByText('Descrição do mapa')).toBeInTheDocument();
      expect(screen.getByText('Pontos cadastrados (5)')).toBeInTheDocument();
      expect(screen.getByText('Atualizado em 01/01/2024')).toBeInTheDocument();
    });

    it('exibe "Sem descrição" quando descrição está vazia', () => {
      const mapSemDescricao = { ...baseMap, description: '' };
      render(<MapCard {...createProps({ map: mapSemDescricao })} />);

      expect(screen.getByText('Sem descrição')).toBeInTheDocument();
    });
  });

  describe('Navegação - clique no card', () => {
    it('chama onOpen ao clicar no card', async () => {
      const user = userEvent.setup();
      const props = createProps();
      render(<MapCard {...props} />);

      // Clicar em qualquer área do card (exceto menu) deve navegar para o mapa
      await user.click(screen.getByRole('heading', { name: 'Mapa de Teste' }));

      expect(props.onOpen).toHaveBeenCalledTimes(1);
    });
  });

  describe('Menu de opções', () => {
    it('abre menu ao clicar no botão de opções', async () => {
      const user = userEvent.setup();
      render(<MapCard {...createProps()} />);

      const menuButton = screen.getByRole('button', { name: 'Opções do mapa' });
      await user.click(menuButton);

      // Menu aberto exibe as opções Editar e Excluir
      expect(screen.getByRole('button', { name: /editar/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /excluir/i })).toBeInTheDocument();
    });

    it('clicar no botão de opções NÃO dispara onOpen (stopPropagation)', async () => {
      const user = userEvent.setup();
      const props = createProps();
      render(<MapCard {...props} />);

      // O botão de menu está dentro do card clicável
      // Deve usar stopPropagation para não navegar ao abrir menu
      const menuButton = screen.getByRole('button', { name: 'Opções do mapa' });
      await user.click(menuButton);

      expect(props.onOpen).not.toHaveBeenCalled();
    });

    it('clicar em "Editar" chama onEdit e NÃO chama onOpen', async () => {
      const user = userEvent.setup();
      const props = createProps();
      render(<MapCard {...props} />);

      await user.click(screen.getByRole('button', { name: 'Opções do mapa' }));
      await user.click(screen.getByRole('button', { name: /editar/i }));

      // Deve chamar apenas onEdit, não navegar
      expect(props.onEdit).toHaveBeenCalledTimes(1);
      expect(props.onOpen).not.toHaveBeenCalled();
    });

    it('clicar em "Excluir" chama onDelete e NÃO chama onOpen', async () => {
      const user = userEvent.setup();
      const props = createProps();
      render(<MapCard {...props} />);

      await user.click(screen.getByRole('button', { name: 'Opções do mapa' }));
      await user.click(screen.getByRole('button', { name: /excluir/i }));

      // Deve chamar apenas onDelete, não navegar
      expect(props.onDelete).toHaveBeenCalledTimes(1);
      expect(props.onOpen).not.toHaveBeenCalled();
    });

    it('fecha menu ao clicar fora dele', async () => {
      const user = userEvent.setup();
      render(<MapCard {...createProps()} />);

      // Abre o menu
      const menuButton = screen.getByRole('button', { name: 'Opções do mapa' });
      await user.click(menuButton);
      expect(screen.getByRole('button', { name: /editar/i })).toBeInTheDocument();

      // Clica fora - usa useEffect com mousedown listener no componente
      await user.click(document.body);

      // Menu deve fechar (click outside pattern)
      expect(screen.queryByRole('button', { name: /editar/i })).not.toBeInTheDocument();
    });
  });

  describe('Acessibilidade', () => {
    it('botão do menu tem atributos ARIA corretos', async () => {
      const user = userEvent.setup();
      render(<MapCard {...createProps()} />);

      const menuButton = screen.getByRole('button', { name: 'Opções do mapa' });

      // Estado inicial: menu fechado
      expect(menuButton).toHaveAttribute('aria-haspopup', 'menu');
      expect(menuButton).toHaveAttribute('aria-expanded', 'false');

      // Após abrir: aria-expanded muda para true
      await user.click(menuButton);
      expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('Preview do mapa', () => {
    it('exibe fallback quando não há previewLocation', () => {
      render(<MapCard {...createProps()} />);

      // Sem coordenadas, exibe ícone de fallback ao invés de tile do OSM
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('renderiza imagem quando há previewLocation', () => {
      const mapComPreview = {
        ...baseMap,
        previewLocation: { latitude: -23.5505, longitude: -46.6333 },
      };
      render(<MapCard {...createProps({ map: mapComPreview })} />);

      // Com coordenadas, carrega tile do OpenStreetMap
      const img = screen.getByRole('img', { name: /preview do mapa/i });
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src');
    });

    it('exibe fallback quando imagem de preview falha ao carregar', () => {
      const mapComPreview = {
        ...baseMap,
        previewLocation: { latitude: -23.5505, longitude: -46.6333 },
      };
      render(<MapCard {...createProps({ map: mapComPreview })} />);

      const img = screen.getByRole('img', { name: /preview do mapa/i });

      // Simula falha de rede ou tile indisponível
      // O componente usa onError para mudar para fallback
      fireEvent.error(img);

      // Após erro, exibe fallback (ícone) ao invés da imagem
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });
  });
});
