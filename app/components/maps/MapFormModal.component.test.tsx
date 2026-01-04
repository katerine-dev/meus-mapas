import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MapFormModal from './MapFormModal';

/**
 * Testes do MapFormModal - modal para criar e editar mapas.
 *
 * Estrutura dos testes:
 * - render(): renderiza o componente no DOM virtual
 * - screen.getByText(): busca elemento pelo texto visível
 * - screen.queryByRole(): busca elemento, retorna null se não encontrar
 * - expect().toBeInTheDocument(): verifica se elemento está no DOM
 */
describe('MapFormModal', () => {
  it('não renderiza quando fechado', () => {
    render(
      <MapFormModal isOpen={false} onClose={() => {}} onSubmit={async () => {}} mode="create" />
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renderiza título "Criar Novo Mapa" no modo criação', () => {
    render(
      <MapFormModal isOpen={true} onClose={() => {}} onSubmit={async () => {}} mode="create" />
    );

    expect(screen.getByText('Criar Novo Mapa')).toBeInTheDocument();
  });

  it('renderiza título "Editar Mapa" no modo edição', () => {
    render(
      <MapFormModal
        isOpen={true}
        onClose={() => {}}
        onSubmit={async () => {}}
        mode="edit"
        initialName="Meu Mapa"
      />
    );

    expect(screen.getByText('Editar Mapa')).toBeInTheDocument();
  });

  it('preenche campos com valores iniciais no modo edição', () => {
    render(
      <MapFormModal
        isOpen={true}
        onClose={() => {}}
        onSubmit={async () => {}}
        mode="edit"
        initialName="Mapa Existente"
        initialDescription="Descrição existente"
      />
    );

    expect(screen.getByDisplayValue('Mapa Existente')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Descrição existente')).toBeInTheDocument();
  });

  it('botão submit está desabilitado com nome vazio', () => {
    render(
      <MapFormModal isOpen={true} onClose={() => {}} onSubmit={async () => {}} mode="create" />
    );

    expect(screen.getByRole('button', { name: 'Criar' })).toBeDisabled();
  });
});
