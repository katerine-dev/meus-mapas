'use client';

import { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import ErrorMessage from './ErrorMessage';
import Spinner from './Spinner';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<{ error?: string } | void>;
  title: string;
  message: string;
}

// Componente interno que gerencia o estado - só é montado quando o modal abre
function ConfirmModalContent({
  onClose,
  onConfirm,
  title,
  message,
}: Omit<ConfirmModalProps, 'isOpen'>) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setError(null);
    setLoading(true);

    try {
      const result = await onConfirm();

      if (result?.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      // Sucesso - o onConfirm deve fechar o modal
    } catch {
      setError('Erro ao executar ação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Título e mensagem */}
      <div className="text-center">
        <h2 id="confirm-modal-title" className="text-xl font-semibold text-text-primary">
          {title}
        </h2>
        <p className="mt-2 text-sm text-text-muted">{message}</p>
      </div>

      {/* Erro da API */}
      <ErrorMessage message={error} />

      {/* Botões de ação */}
      <div className="flex gap-3">
        <Button variant="secondary" onClick={onClose} fullWidth disabled={loading}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={handleConfirm} fullWidth disabled={loading}>
          {loading ? <Spinner size="sm" variant="white" /> : 'Confirmar'}
        </Button>
      </div>
    </div>
  );
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
    <Modal isOpen={isOpen} onClose={onClose} ariaLabelledBy="confirm-modal-title">
      <ConfirmModalContent
        onClose={onClose}
        onConfirm={onConfirm}
        title={title}
        message={message}
      />
    </Modal>
  );
}
