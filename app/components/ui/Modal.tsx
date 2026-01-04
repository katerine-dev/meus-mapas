'use client';

import { ReactNode, useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  /** ID do elemento que serve como título do modal (para aria-labelledby) */
  ariaLabelledBy?: string;
}

// Componente Modal base reutilizável
export default function Modal({ isOpen, onClose, children, ariaLabelledBy }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Move o foco para o modal quando ele abre
  useEffect(() => {
    if (isOpen) {
      modalRef.current?.focus();
    }
  }, [isOpen]);

  // Se não estiver aberto, não renderiza nada
  if (!isOpen) return null;

  return (
    // Container fixo que cobre toda a tela com z-index maior que o Leaflet (que usa 400+)
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      {/*
        Overlay escuro semi-transparente - fecha o modal ao clicar.
        aria-hidden="true": remove o overlay da accessibility tree, pois é puramente decorativo.
        data-testid: identificador estável para testes, já que o overlay não está na accessibility tree
        e não pode ser localizado via queries semânticas (getByRole, etc).
      */}
      <div
        className="bg-text-primary/60 absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
        data-testid="modal-overlay"
      />

      {/* Container do conteúdo do modal - centralizado sobre o overlay */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledBy}
        tabIndex={-1}
        className="modal-content relative z-10 w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl focus:outline-none"
      >
        {children}
      </div>
    </div>
  );
}
