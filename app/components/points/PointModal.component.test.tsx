import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PointModal from './PointModal';

/**
 * Testes do PointModal - modal para criar e editar pontos.
 *
 * getByDisplayValue(): busca input pelo valor atual (útil para campos readonly)
 * Regex /novo ponto/i: o "i" significa case-insensitive (ignora maiúsculas)
 */
describe('PointModal', () => {
  it('não renderiza quando fechado', () => {
    render(
      <PointModal
        isOpen={false}
        onClose={() => {}}
        mode="create"
        initialName=""
        latitude={-23.5505}
        longitude={-46.6333}
        onSave={() => Promise.resolve()}
      />
    );

    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('exibe título "Novo ponto" no modo criar', () => {
    render(
      <PointModal
        isOpen={true}
        onClose={() => {}}
        mode="create"
        initialName=""
        latitude={-23.5505}
        longitude={-46.6333}
        onSave={() => Promise.resolve()}
      />
    );

    expect(screen.getByRole('heading', { name: /novo ponto/i })).toBeInTheDocument();
  });

  it('exibe título "Editar ponto" no modo editar', () => {
    render(
      <PointModal
        isOpen={true}
        onClose={() => {}}
        mode="edit"
        initialName="Praça da Sé"
        latitude={-23.5505}
        longitude={-46.6333}
        onSave={() => Promise.resolve()}
      />
    );

    expect(screen.getByRole('heading', { name: /editar ponto/i })).toBeInTheDocument();
  });

  it('preenche campo com valor inicial no modo edição', () => {
    render(
      <PointModal
        isOpen={true}
        onClose={() => {}}
        mode="edit"
        initialName="Praça da Sé"
        latitude={-23.5505}
        longitude={-46.6333}
        onSave={() => Promise.resolve()}
      />
    );

    expect(screen.getByPlaceholderText('Nome do ponto')).toHaveValue('Praça da Sé');
  });

  it('exibe coordenadas formatadas', () => {
    render(
      <PointModal
        isOpen={true}
        onClose={() => {}}
        mode="create"
        initialName=""
        latitude={-23.5505}
        longitude={-46.6333}
        onSave={() => Promise.resolve()}
      />
    );

    expect(screen.getByDisplayValue('-23.550500')).toBeInTheDocument();
    expect(screen.getByDisplayValue('-46.633300')).toBeInTheDocument();
  });

  it('botão salvar desabilitado com nome vazio', () => {
    render(
      <PointModal
        isOpen={true}
        onClose={() => {}}
        mode="create"
        initialName=""
        latitude={-23.5505}
        longitude={-46.6333}
        onSave={() => Promise.resolve()}
      />
    );

    expect(screen.getByRole('button', { name: /salvar/i })).toBeDisabled();
  });
});
