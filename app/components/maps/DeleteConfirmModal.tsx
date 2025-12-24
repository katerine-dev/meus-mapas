'use client';

import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

// Componente modal para confirmar exclusão de um mapa
export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col gap-6 text-center">
        <div>
          <h2 className="text-purple-darkest text-xl font-semibold">Excluir mapa</h2>
          <p className="text-purple-light mt-2">
            Esta ação não pode ser desfeita. Deseja continuar?
          </p>
        </div>
        <div className="flex gap-4">
          <Button onClick={onConfirm} variant="danger" className="flex-1">
            Confirmar
          </Button>
          <Button onClick={onClose} variant="secondary" className="flex-1">
            Cancelar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
