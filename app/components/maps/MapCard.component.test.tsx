import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MapCard from './MapCard';
import type { Map } from '@/app/model/map';

/**
 * Testes do MapCard - card que exibe um mapa na lista.
 *
 * Usamos um objeto "mapa" como fixture - dados de exemplo reutilizáveis.
 * Os callbacks (onEdit, onOpen, onDelete) usam arrow functions vazias
 * porque estamos testando apenas a renderização, não as interações.
 */
describe('MapCard', () => {
  // Fixture: objeto de exemplo usado em todos os testes
  const mapa: Map = {
    id: '1',
    name: 'Mapa de Teste',
    description: 'Descrição do mapa',
    pointsCount: 5,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    deletedAt: null,
  };

  it('renderiza nome do mapa', () => {
    render(<MapCard map={mapa} onEdit={() => {}} onOpen={() => {}} onDelete={() => {}} />);

    expect(screen.getByText('Mapa de Teste')).toBeInTheDocument();
  });

  it('renderiza descrição do mapa', () => {
    render(<MapCard map={mapa} onEdit={() => {}} onOpen={() => {}} onDelete={() => {}} />);

    expect(screen.getByText('Descrição do mapa')).toBeInTheDocument();
  });

  it('renderiza contagem de pontos', () => {
    render(<MapCard map={mapa} onEdit={() => {}} onOpen={() => {}} onDelete={() => {}} />);

    expect(screen.getByText('Pontos cadastrados (5)')).toBeInTheDocument();
  });

  it('renderiza "Sem descrição" quando descrição é undefined', () => {
    const mapaSemDescricao = {
      id: mapa.id,
      name: mapa.name,
      pointsCount: mapa.pointsCount,
      createdAt: mapa.createdAt,
      updatedAt: mapa.updatedAt,
      deletedAt: mapa.deletedAt,
    };
    render(
      <MapCard map={mapaSemDescricao} onEdit={() => {}} onOpen={() => {}} onDelete={() => {}} />
    );

    expect(screen.getByText('Sem descrição')).toBeInTheDocument();
  });

  it('renderiza botão de opções', () => {
    render(<MapCard map={mapa} onEdit={() => {}} onOpen={() => {}} onDelete={() => {}} />);

    expect(screen.getByRole('button', { name: 'Opções do mapa' })).toBeInTheDocument();
  });
});
