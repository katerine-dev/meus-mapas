import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
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

      expect(screen.getByRole('heading', { name: 'Mapa de Teste' })).toBeInTheDocument();
      expect(screen.getByText('Descrição do mapa')).toBeInTheDocument();
      expect(screen.getByText('Pontos cadastrados (5)')).toBeInTheDocument();
      expect(screen.getByText('Atualizado em 01/01/2024')).toBeInTheDocument();
    });

    it('exibe placeholder quando descrição está vazia', () => {
      const mapSemDescricao = { ...baseMap, description: '' };
      render(<MapCard {...createProps({ map: mapSemDescricao })} />);

      expect(screen.getByText('Sem descrição')).toBeInTheDocument();
    });
  });

  describe('Navegação', () => {
    it('chama onOpen ao clicar no card', async () => {
      const user = userEvent.setup();
      const props = createProps();
      render(<MapCard {...props} />);

      await user.click(screen.getByRole('heading', { name: 'Mapa de Teste' }));

      expect(props.onOpen).toHaveBeenCalledOnce();
    });
  });

  describe('Menu de ações', () => {
    it('abre menu ao clicar no botão de opções', async () => {
      const user = userEvent.setup();
      render(<MapCard {...createProps()} />);

      await user.click(screen.getByRole('button', { name: 'Opções do mapa' }));

      expect(screen.getByRole('button', { name: /editar/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /excluir/i })).toBeInTheDocument();
    });

    it('não navega ao abrir o menu (stopPropagation)', async () => {
      const user = userEvent.setup();
      const props = createProps();
      render(<MapCard {...props} />);

      await user.click(screen.getByRole('button', { name: 'Opções do mapa' }));

      expect(props.onOpen).not.toHaveBeenCalled();
    });

    it('chama onEdit ao clicar em Editar, sem navegar', async () => {
      const user = userEvent.setup();
      const props = createProps();
      render(<MapCard {...props} />);

      await user.click(screen.getByRole('button', { name: 'Opções do mapa' }));
      await user.click(screen.getByRole('button', { name: /editar/i }));

      expect(props.onEdit).toHaveBeenCalledOnce();
      expect(props.onOpen).not.toHaveBeenCalled();
    });

    it('chama onDelete ao clicar em Excluir, sem navegar', async () => {
      const user = userEvent.setup();
      const props = createProps();
      render(<MapCard {...props} />);

      await user.click(screen.getByRole('button', { name: 'Opções do mapa' }));
      await user.click(screen.getByRole('button', { name: /excluir/i }));

      expect(props.onDelete).toHaveBeenCalledOnce();
      expect(props.onOpen).not.toHaveBeenCalled();
    });

    it('fecha menu ao clicar fora', async () => {
      const user = userEvent.setup();
      render(<MapCard {...createProps()} />);

      await user.click(screen.getByRole('button', { name: 'Opções do mapa' }));
      expect(screen.getByRole('button', { name: /editar/i })).toBeInTheDocument();

      await user.click(document.body);

      expect(screen.queryByRole('button', { name: /editar/i })).not.toBeInTheDocument();
    });

    it('botão de opções tem atributos ARIA corretos', async () => {
      const user = userEvent.setup();
      render(<MapCard {...createProps()} />);

      const menuButton = screen.getByRole('button', { name: 'Opções do mapa' });
      expect(menuButton).toHaveAttribute('aria-haspopup', 'menu');
      expect(menuButton).toHaveAttribute('aria-expanded', 'false');

      await user.click(menuButton);

      expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('Preview do mapa', () => {
    it('não exibe imagem quando não há previewLocation', () => {
      render(<MapCard {...createProps()} />);

      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('exibe imagem quando há previewLocation', () => {
      const mapComPreview = {
        ...baseMap,
        previewLocation: { latitude: -23.5505, longitude: -46.6333 },
      };
      render(<MapCard {...createProps({ map: mapComPreview })} />);

      const img = screen.getByRole('img', { name: /preview do mapa/i });
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src');
    });
  });
});
