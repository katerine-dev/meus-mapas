import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PointsList from './PointsList';
import type { Point } from '@/app/model/point';

/**
 * Testes do PointsList - lista de pontos do mapa.
 *
 * Testamos renderização com pontos e estado vazio.
 * Os botões de editar/excluir incluem o nome do ponto
 * no aria-label para acessibilidade.
 */
describe('PointsList', () => {
  // Fixture: ponto de exemplo para os testes
  const ponto: Point = {
    id: '1',
    mapId: 'map-1',
    name: 'Ponto de Teste',
    location: { latitude: -23.5505, longitude: -46.6333 },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    deletedAt: null,
  };

  it('exibe título com contagem de pontos', () => {
    render(
      <PointsList
        points={[ponto]}
        selectedPointId={null}
        onSelectPoint={() => {}}
        onEditPoint={() => {}}
        onDeletePoint={() => {}}
      />
    );

    expect(screen.getByText('Pontos cadastrados')).toBeInTheDocument();
    expect(screen.getByText('(1)')).toBeInTheDocument();
  });

  it('exibe nome do ponto', () => {
    render(
      <PointsList
        points={[ponto]}
        selectedPointId={null}
        onSelectPoint={() => {}}
        onEditPoint={() => {}}
        onDeletePoint={() => {}}
      />
    );

    expect(screen.getByText('Ponto de Teste')).toBeInTheDocument();
  });

  it('exibe mensagem quando não há pontos', () => {
    render(
      <PointsList
        points={[]}
        selectedPointId={null}
        onSelectPoint={() => {}}
        onEditPoint={() => {}}
        onDeletePoint={() => {}}
      />
    );

    expect(screen.getByText('Nenhum ponto ainda')).toBeInTheDocument();
  });

  it('exibe botões de editar e excluir', () => {
    render(
      <PointsList
        points={[ponto]}
        selectedPointId={null}
        onSelectPoint={() => {}}
        onEditPoint={() => {}}
        onDeletePoint={() => {}}
      />
    );

    expect(screen.getByRole('button', { name: 'Editar Ponto de Teste' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Excluir Ponto de Teste' })).toBeInTheDocument();
  });
});
