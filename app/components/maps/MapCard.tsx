'use client';

import { useState, useRef, useEffect } from 'react';

import { MapIcon, DocumentTextIcon, TrashIcon } from '@heroicons/react/24/outline';
import { EllipsisVerticalIcon } from '@heroicons/react/24/solid';
import { Map } from '@/app/model/map';

interface MapCardProps {
  map: Map;
  onEdit: () => void;
  onOpen: () => void;
  onDelete: () => void;
}

// Componente card que exibe um mapa na lista
export default function MapCard({ map, onEdit, onOpen, onDelete }: MapCardProps) {
  const { name, description, pointsCount, updatedAt } = map;
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
      className="card-interactive relative cursor-pointer overflow-hidden rounded-2xl border border-border bg-surface shadow-lg transition-all hover:shadow-xl"
    >
      {/* Preview roxo com ícone de mapa */}
      <div className="relative flex h-32 items-center justify-center bg-primary">
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
            <div className="absolute right-0 top-10 z-10 w-48 rounded-xl border border-border bg-surface py-2 shadow-xl">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                  setMenuOpen(false);
                }}
                className="flex w-full items-center gap-3 px-4 py-2 text-left text-text-primary hover:bg-surface-hover"
              >
                <DocumentTextIcon className="h-4 w-4 text-text-muted" />
                Editar
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                  setMenuOpen(false);
                }}
                className="flex w-full items-center gap-3 px-4 py-2 text-left text-destructive hover:bg-destructive-light"
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
        <h3 className="text-lg font-semibold text-text-primary">{name}</h3>
        <p className="text-sm text-text-muted">{description || 'Sem descrição'}</p>
        <p className="mt-2 text-sm font-medium text-primary">Pontos cadastrados ({pointsCount})</p>
        <p className="mt-1 text-xs text-text-placeholder">Atualizado em {formattedDate}</p>
      </div>
    </div>
  );
}
