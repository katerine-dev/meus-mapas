import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ConfirmModal from './ConfirmModal';

/**
 * Testes do ConfirmModal - modal de confirmação de ações.
 *
 * onConfirm retorna Promise porque a ação pode ser assíncrona.
 * aria-labelledby conecta o dialog ao seu título para acessibilidade.
 */
describe('ConfirmModal', () => {
  it('exibe título e mensagem quando aberto', () => {
    render(
      <ConfirmModal
        isOpen={true}
        onClose={() => {}}
        onConfirm={() => Promise.resolve()}
        title="Confirmar exclusão"
        message="Deseja realmente excluir este item?"
      />
    );

    expect(screen.getByRole('heading', { name: 'Confirmar exclusão' })).toBeInTheDocument();
    expect(screen.getByText('Deseja realmente excluir este item?')).toBeInTheDocument();
  });

  it('não renderiza quando fechado', () => {
    render(
      <ConfirmModal
        isOpen={false}
        onClose={() => {}}
        onConfirm={() => Promise.resolve()}
        title="Título"
        message="Mensagem"
      />
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('exibe botões de cancelar e confirmar', () => {
    render(
      <ConfirmModal
        isOpen={true}
        onClose={() => {}}
        onConfirm={() => Promise.resolve()}
        title="Título"
        message="Mensagem"
      />
    );

    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirmar' })).toBeInTheDocument();
  });

  it('possui aria-labelledby apontando para o título', () => {
    render(
      <ConfirmModal
        isOpen={true}
        onClose={() => {}}
        onConfirm={() => Promise.resolve()}
        title="Título"
        message="Mensagem"
      />
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby', 'confirm-modal-title');
  });
});
