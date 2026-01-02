'use client';

import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

// Componente Modal base reutilizável
export default function Modal({ isOpen, onClose, children }: ModalProps) {
  // Se não estiver aberto, não renderiza nada
  if (!isOpen) return null;

  return (
    // Container fixo que cobre toda a tela com z-index maior que o Leaflet (que usa 400+)
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      {/* Overlay escuro semi-transparente - fecha o modal ao clicar */}
      <div className="modal-overlay bg-text-primary/60 absolute inset-0" onClick={onClose} />

      {/* Container do conteúdo do modal - centralizado sobre o overlay */}
      <div className="modal-content border-border bg-surface relative z-10 w-full max-w-md rounded-2xl border p-6 shadow-xl">
        {children}
      </div>
    </div>
  );
}
