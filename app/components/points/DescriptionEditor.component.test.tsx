import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DescriptionEditor from './DescriptionEditor';

/**
 * Testes do componente DescriptionEditor.
 *
 * Editor inline para descrição do mapa.
 * Testes focam em: transições de modo e interações principais.
 */

describe('DescriptionEditor', () => {
  const createProps = (overrides = {}) => ({
    description: 'Descrição do mapa',
    isEditing: false,
    value: '',
    onValueChange: vi.fn(),
    onEdit: vi.fn(),
    onCancel: vi.fn(),
    onSave: vi.fn(),
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Modo visualização', () => {
    it('exibe descrição ou placeholder', () => {
      const { rerender } = render(
        <DescriptionEditor {...createProps({ description: 'Meu mapa' })} />
      );
      expect(screen.getByText('Meu mapa')).toBeInTheDocument();

      rerender(<DescriptionEditor {...createProps({ description: '' })} />);
      expect(screen.getByText('Sem descrição')).toBeInTheDocument();
    });

    it('chama onEdit ao clicar no botão de editar', async () => {
      const user = userEvent.setup();
      const props = createProps();
      render(<DescriptionEditor {...props} />);

      await user.click(screen.getByRole('button', { name: /editar descrição/i }));

      expect(props.onEdit).toHaveBeenCalledOnce();
    });

    it('não exibe textarea', () => {
      render(<DescriptionEditor {...createProps()} />);

      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });
  });

  describe('Modo edição', () => {
    it('exibe textarea com valor e botões de ação', () => {
      render(<DescriptionEditor {...createProps({ isEditing: true, value: 'Texto' })} />);

      expect(screen.getByRole('textbox')).toHaveValue('Texto');
      expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /salvar/i })).toBeInTheDocument();
    });

    it('textarea tem maxLength definido', () => {
      render(<DescriptionEditor {...createProps({ isEditing: true })} />);

      expect(screen.getByRole('textbox')).toHaveAttribute('maxLength');
    });

    it('digitar chama onValueChange', async () => {
      const user = userEvent.setup();
      const props = createProps({ isEditing: true, value: '' });
      render(<DescriptionEditor {...props} />);

      await user.type(screen.getByRole('textbox'), 'Nova');

      expect(props.onValueChange).toHaveBeenCalled();
    });

    it('cancelar chama onCancel', async () => {
      const user = userEvent.setup();
      const props = createProps({ isEditing: true });
      render(<DescriptionEditor {...props} />);

      await user.click(screen.getByRole('button', { name: /cancelar/i }));

      expect(props.onCancel).toHaveBeenCalledOnce();
    });

    it('salvar chama onSave', async () => {
      const user = userEvent.setup();
      const props = createProps({ isEditing: true, value: 'Descrição atualizada' });
      render(<DescriptionEditor {...props} />);

      await user.click(screen.getByRole('button', { name: /salvar/i }));

      expect(props.onSave).toHaveBeenCalledOnce();
    });
  });
});
