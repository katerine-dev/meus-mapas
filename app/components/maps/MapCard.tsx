'use client';

import { useState, useRef, useEffect } from 'react';

import {
  MapIcon,
  DocumentTextIcon,
  ArrowTopRightOnSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { EllipsisVerticalIcon } from '@heroicons/react/24/solid';

interface MapCardProps {
  id: string;
  name: string;
  description?: string;
  updatedAt: Date;
  createdAt: Date;
  onEdit: () => void;
  onOpen: () => void;
  onDelete: () => void;
}

// Componente card que exibe um mapa na lista
export default function MapCard({
  name,
  description,
  updatedAt,
  onEdit,
  onOpen,
  onDelete,
}: MapCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  // Ref para o container do menu, usado para detectar cliques fora
  const menuRef = useRef<HTMLDivElement>(null);

  // Formata a data de atualização para o formato brasileiro (DD/MM/YYYY)
  const formattedDate = new Date(updatedAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  // Effect para fechar o menu ao clicar fora dele
  useEffect(() => {
    // Função que verifica se o clique foi fora do menu
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false); // Fecha o menu
      }
    }
    // Adiciona o listener no documento
    document.addEventListener('mousedown', handleClickOutside);
    // Remove o listener ao desmontar o componente
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      onClick={onOpen}
      className="card-interactive border-border bg-surface relative cursor-pointer overflow-hidden rounded-2xl border shadow-lg transition-all hover:shadow-xl"
    >
      {/* Preview roxo com ícone de mapa */}
      <div className="bg-primary relative flex h-32 items-center justify-center">
        <MapIcon className="h-12 w-12 text-white/50" strokeWidth={1.5} />

        {/* Botão de menu */}
        <div className="absolute right-3 top-3" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30"
          >
            <EllipsisVerticalIcon className="h-5 w-5" />
          </button>

          {/* Menu dropdown */}
          {menuOpen && (
            <div className="border-border bg-surface absolute right-0 top-10 z-10 w-48 rounded-xl border py-2 shadow-xl">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                  setMenuOpen(false);
                }}
                className="text-text-primary hover:bg-surface-hover flex w-full items-center gap-3 px-4 py-2 text-left"
              >
                <DocumentTextIcon className="text-text-muted h-4 w-4" />
                Editar
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpen();
                  setMenuOpen(false);
                }}
                className="text-text-primary hover:bg-surface-hover flex w-full items-center gap-3 px-4 py-2 text-left"
              >
                <ArrowTopRightOnSquareIcon className="text-text-muted h-4 w-4" />
                Abrir
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                  setMenuOpen(false);
                }}
                className="text-destructive hover:bg-destructive-light flex w-full items-center gap-3 px-4 py-2 text-left"
              >
                <TrashIcon className="h-4 w-4" />
                Excluir
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Informações do mapa */}
      <div className="p-4">
        <h3 className="text-text-primary text-lg font-semibold">{name}</h3>
        <p className="text-text-muted text-sm">{description || 'Sem descrição'}</p>
        <p className="text-text-placeholder mt-1 text-xs">Atualizado em {formattedDate}</p>
      </div>
    </div>
  );
}
