import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Modal from './Modal';

/**
 * Testes do Modal - componente base de diálogo.
 *
 * Testamos:
 * - Renderização condicional (isOpen true/false)
 * - Atributos de acessibilidade (role="dialog", aria-modal)
 *
 * queryByText(): diferente de getByText, retorna null se não encontrar
 * (útil para verificar que algo NÃO está renderizado)
 */
describe('Modal', () => {
  it('renderiza conteúdo quando isOpen é true', () => {
    render(
      <Modal isOpen={true} onClose={() => {}}>
        <p>Conteúdo do modal</p>
      </Modal>
    );

    expect(screen.getByText('Conteúdo do modal')).toBeInTheDocument();
  });

  it('não renderiza quando isOpen é false', () => {
    render(
      <Modal isOpen={false} onClose={() => {}}>
        <p>Conteúdo do modal</p>
      </Modal>
    );

    expect(screen.queryByText('Conteúdo do modal')).not.toBeInTheDocument();
  });

  it('possui role dialog', () => {
    render(
      <Modal isOpen={true} onClose={() => {}}>
        <p>Conteúdo</p>
      </Modal>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('possui aria-modal true', () => {
    render(
      <Modal isOpen={true} onClose={() => {}}>
        <p>Conteúdo</p>
      </Modal>
    );

    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });
});
