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
    // Container fixo que cobre toda a tela com z-index alto
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay escuro semi-transparente - fecha o modal ao clicar */}
      <div className="bg-purple-darkest/70 absolute inset-0" onClick={onClose} />

      {/* Container do conteúdo do modal - centralizado sobre o overlay */}
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        {children}
      </div>
    </div>
  );
}
