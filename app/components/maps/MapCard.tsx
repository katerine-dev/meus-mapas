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
    <div className="border-purple-lightest relative overflow-hidden rounded-2xl border bg-white shadow-xl transition-all hover:shadow-2xl">
      {/* Preview roxo com ícone de mapa */}
      <div className="from-purple-main to-purple-light relative flex h-32 items-center justify-center bg-linear-to-br">
        <MapIcon className="h-12 w-12 text-white/50" strokeWidth={1.5} />

        {/* Botão de menu */}
        <div className="absolute top-3 right-3" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30"
          >
            <EllipsisVerticalIcon className="h-5 w-5" />
          </button>

          {/* Menu dropdown */}
          {menuOpen && (
            <div className="absolute top-10 right-0 z-10 w-48 rounded-xl bg-white py-2 shadow-xl">
              <button
                onClick={() => {
                  onEdit();
                  setMenuOpen(false);
                }}
                className="text-purple-darkest hover:bg-purple-lightest/50 flex w-full items-center gap-3 px-4 py-2 text-left"
              >
                <DocumentTextIcon className="text-purple-light h-4 w-4" />
                Editar
              </button>
              <button
                onClick={() => {
                  onOpen();
                  setMenuOpen(false);
                }}
                className="text-purple-darkest hover:bg-purple-lightest/50 flex w-full items-center gap-3 px-4 py-2 text-left"
              >
                <ArrowTopRightOnSquareIcon className="text-purple-light h-4 w-4" />
                Abrir
              </button>
              <button
                onClick={() => {
                  onDelete();
                  setMenuOpen(false);
                }}
                className="flex w-full items-center gap-3 px-4 py-2 text-left text-red-500 hover:bg-red-50"
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
        <h3 className="text-purple-darkest text-lg font-semibold">{name}</h3>
        <p className="text-purple-light text-sm">{description || 'Sem descrição'}</p>
        <p className="text-purple-light/70 mt-1 text-xs">Atualizado em {formattedDate}</p>
      </div>
    </div>
  );
}
