'use client';

import Modal from '@/app/components/ui/Modal';
import Button from '@/app/components/ui/Button';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-text-primary mb-2 text-xl font-bold">{title}</h2>
      <p className="text-text-muted mb-6 text-sm">{message}</p>

      <div className="flex gap-3">
        <Button variant="secondary" onClick={onClose} fullWidth>
          Cancelar
        </Button>
        <Button variant="danger" onClick={onConfirm} fullWidth>
          Confirmar
        </Button>
      </div>
    </Modal>
  );
}
