import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Modal from './Modal';

/**
 * Testes do componente Modal.
 *
 * Modal é o componente base de diálogo da aplicação.
 * Testes focam em: renderização condicional, acessibilidade e interações.
 *
 * Nota sobre o overlay:
 * O overlay possui aria-hidden="true" pois é um elemento decorativo que não deve
 * ser anunciado por leitores de tela. Por isso, usamos data-testid para localizá-lo
 * nos testes de interação (clique para fechar), já que elementos com aria-hidden
 * não aparecem na accessibility tree e não podem ser encontrados via getByRole.
 */

describe('Modal', () => {
  // Factory function para criar props com overrides
  const createProps = (overrides = {}) => ({
    isOpen: true,
    onClose: vi.fn(),
    children: <p>Conteúdo do modal</p>,
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Renderização condicional', () => {
    it('renderiza o conteúdo quando isOpen é true', () => {
      render(<Modal {...createProps()} />);

      expect(screen.getByText('Conteúdo do modal')).toBeInTheDocument();
    });

    it('não renderiza nada quando isOpen é false', () => {
      render(<Modal {...createProps({ isOpen: false })} />);

      expect(screen.queryByText('Conteúdo do modal')).not.toBeInTheDocument();
    });
  });

  describe('Acessibilidade', () => {
    it('possui role dialog', () => {
      render(<Modal {...createProps()} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('possui aria-modal true', () => {
      render(<Modal {...createProps()} />);

      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    });

    it('aplica aria-labelledby quando fornecido', () => {
      render(
        <Modal {...createProps({ ariaLabelledBy: 'modal-title' })}>
          <h2 id="modal-title">Título do Modal</h2>
        </Modal>
      );

      expect(screen.getByRole('dialog')).toHaveAttribute('aria-labelledby', 'modal-title');
    });
  });

  describe('Interações', () => {
    it('chama onClose ao clicar no overlay', async () => {
      const user = userEvent.setup();
      const props = createProps();
      render(<Modal {...props} />);

      // O overlay usa aria-hidden="true" (elemento decorativo), então não está na
      // accessibility tree. Usamos data-testid como identificador estável para testes.
      const overlay = screen.getByTestId('modal-overlay');

      await user.click(overlay);

      expect(props.onClose).toHaveBeenCalledOnce();
    });

    it('não chama onClose ao clicar no conteúdo do modal', async () => {
      const user = userEvent.setup();
      const props = createProps();
      render(<Modal {...props} />);

      await user.click(screen.getByText('Conteúdo do modal'));

      expect(props.onClose).not.toHaveBeenCalled();
    });
  });

  describe('Children', () => {
    it('renderiza múltiplos children', () => {
      render(
        <Modal {...createProps()}>
          <h2>Título</h2>
          <p>Parágrafo 1</p>
          <p>Parágrafo 2</p>
        </Modal>
      );

      expect(screen.getByRole('heading', { name: 'Título' })).toBeInTheDocument();
      expect(screen.getByText('Parágrafo 1')).toBeInTheDocument();
      expect(screen.getByText('Parágrafo 2')).toBeInTheDocument();
    });
  });
});
