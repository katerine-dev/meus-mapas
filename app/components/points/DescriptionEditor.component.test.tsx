import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DescriptionEditor from './DescriptionEditor';

/**
 * Testes do DescriptionEditor - editor inline de descrição.
 *
 * Componente tem dois modos:
 * - Visualização (isEditing=false): exibe texto
 * - Edição (isEditing=true): exibe textarea com botões
 */
describe('DescriptionEditor', () => {
  it('exibe descrição no modo visualização', () => {
    render(
      <DescriptionEditor
        description="Meu mapa"
        isEditing={false}
        value=""
        onValueChange={() => {}}
        onEdit={() => {}}
        onCancel={() => {}}
        onSave={() => {}}
      />
    );

    expect(screen.getByText('Meu mapa')).toBeInTheDocument();
  });

  it('exibe "Sem descrição" quando descrição está vazia', () => {
    render(
      <DescriptionEditor
        description=""
        isEditing={false}
        value=""
        onValueChange={() => {}}
        onEdit={() => {}}
        onCancel={() => {}}
        onSave={() => {}}
      />
    );

    expect(screen.getByText('Sem descrição')).toBeInTheDocument();
  });

  it('não exibe textarea no modo visualização', () => {
    render(
      <DescriptionEditor
        description="Meu mapa"
        isEditing={false}
        value=""
        onValueChange={() => {}}
        onEdit={() => {}}
        onCancel={() => {}}
        onSave={() => {}}
      />
    );

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('exibe textarea no modo edição', () => {
    render(
      <DescriptionEditor
        description="Meu mapa"
        isEditing={true}
        value="Texto"
        onValueChange={() => {}}
        onEdit={() => {}}
        onCancel={() => {}}
        onSave={() => {}}
      />
    );

    expect(screen.getByRole('textbox')).toHaveValue('Texto');
  });

  it('exibe botões de cancelar e salvar no modo edição', () => {
    render(
      <DescriptionEditor
        description=""
        isEditing={true}
        value=""
        onValueChange={() => {}}
        onEdit={() => {}}
        onCancel={() => {}}
        onSave={() => {}}
      />
    );

    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /salvar/i })).toBeInTheDocument();
  });
});
