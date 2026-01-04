import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PointsList from './PointsList';
import type { Point } from '@/app/model/point';

/**
 * Testes do componente PointsList.
 *
 * Lista de pontos com seleção, edição e exclusão.
 * Testes focam em: renderização, estado vazio, seleção e ações.
 */

describe('PointsList', () => {
  const createPoint = (overrides: Partial<Point> = {}): Point => ({
    id: '1',
    mapId: 'map-1',
    name: 'Ponto de Teste',
    location: { latitude: -23.5505, longitude: -46.6333 },
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    deletedAt: null,
    ...overrides,
  });

  const createProps = (overrides = {}) => ({
    points: [createPoint()],
    selectedPointId: null,
    onSelectPoint: vi.fn(),
    onEditPoint: vi.fn(),
    onDeletePoint: vi.fn(),
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Renderização', () => {
    it('exibe título com contagem de pontos', () => {
      const points = [
        createPoint({ id: '1', name: 'Ponto 1' }),
        createPoint({ id: '2', name: 'Ponto 2' }),
      ];
      render(<PointsList {...createProps({ points })} />);

      expect(screen.getByText('Pontos cadastrados')).toBeInTheDocument();
      expect(screen.getByText('(2)')).toBeInTheDocument();
    });

    it('exibe nomes dos pontos', () => {
      const points = [
        createPoint({ id: '1', name: 'Praça da Sé' }),
        createPoint({ id: '2', name: 'Parque Ibirapuera' }),
      ];
      render(<PointsList {...createProps({ points })} />);

      expect(screen.getByText('Praça da Sé')).toBeInTheDocument();
      expect(screen.getByText('Parque Ibirapuera')).toBeInTheDocument();
    });
  });

  describe('Estado vazio', () => {
    it('exibe mensagem quando não há pontos', () => {
      render(<PointsList {...createProps({ points: [] })} />);

      expect(screen.getByText('Nenhum ponto ainda')).toBeInTheDocument();
      expect(screen.getByText('Clique no mapa para adicionar')).toBeInTheDocument();
    });
  });

  describe('Seleção', () => {
    it('chama onSelectPoint ao clicar em um ponto', async () => {
      const user = userEvent.setup();
      const props = createProps();
      render(<PointsList {...props} />);

      await user.click(screen.getByText('Ponto de Teste'));

      expect(props.onSelectPoint).toHaveBeenCalledOnce();
      expect(props.onSelectPoint).toHaveBeenCalledWith('1');
    });

    it('ponto selecionado tem aria-selected true', () => {
      const point = createPoint({ id: '1', name: 'Ponto Selecionado' });
      render(<PointsList {...createProps({ points: [point], selectedPointId: '1' })} />);

      const listItem = screen.getByText('Ponto Selecionado').closest('li');
      expect(listItem).toHaveAttribute('aria-selected', 'true');
    });

    it('ponto não selecionado tem aria-selected false', () => {
      const point = createPoint({ id: '1', name: 'Outro Ponto' });
      render(<PointsList {...createProps({ points: [point], selectedPointId: null })} />);

      const listItem = screen.getByText('Outro Ponto').closest('li');
      expect(listItem).toHaveAttribute('aria-selected', 'false');
    });
  });

  describe('Ações', () => {
    it('editar chama onEditPoint sem disparar onSelectPoint', async () => {
      const user = userEvent.setup();
      const point = createPoint({ name: 'Meu Ponto' });
      const props = createProps({ points: [point] });
      render(<PointsList {...props} />);

      await user.click(screen.getByRole('button', { name: 'Editar Meu Ponto' }));

      expect(props.onEditPoint).toHaveBeenCalledOnce();
      expect(props.onEditPoint).toHaveBeenCalledWith(point);
      expect(props.onSelectPoint).not.toHaveBeenCalled();
    });

    it('excluir chama onDeletePoint sem disparar onSelectPoint', async () => {
      const user = userEvent.setup();
      const point = createPoint({ id: 'point-123', name: 'Meu Ponto' });
      const props = createProps({ points: [point] });
      render(<PointsList {...props} />);

      await user.click(screen.getByRole('button', { name: 'Excluir Meu Ponto' }));

      expect(props.onDeletePoint).toHaveBeenCalledOnce();
      expect(props.onDeletePoint).toHaveBeenCalledWith('point-123');
      expect(props.onSelectPoint).not.toHaveBeenCalled();
    });
  });
});
