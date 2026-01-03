'use client';

import Modal from './Modal';
import Button from './Button';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

/**
 * Modal genérico de confirmação.
 * Usado para confirmar exclusões e outras ações importantes.
 */
export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col gap-4">
        {/* Título e mensagem */}
        <div className="text-center">
          <h2 className="text-xl font-semibold text-text-primary">{title}</h2>
          <p className="mt-2 text-sm text-text-muted">{message}</p>
        </div>

        {/* Botões de ação */}
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} fullWidth>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm} fullWidth>
            Confirmar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
