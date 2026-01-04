'use client';

import { useState, useRef, useEffect } from 'react';

import { MapIcon, DocumentTextIcon, TrashIcon } from '@heroicons/react/24/outline';
import { EllipsisVerticalIcon } from '@heroicons/react/24/solid';
import { Map } from '@/app/model/map';
import { formatDateBR } from '@/lib/date';
import { DEFAULT_ZOOM } from '@/app/constants/map';

interface MapCardProps {
  map: Map;
  onEdit: () => void;
  onOpen: () => void;
  onDelete: () => void;
}

// Componente card que exibe um mapa na lista
export default function MapCard({ map, onEdit, onOpen, onDelete }: MapCardProps) {
  const { name, description, pointsCount, updatedAt, previewLocation } = map;
  const [menuOpen, setMenuOpen] = useState(false);
  // Estado para controlar se a imagem do tile falhou ao carregar
  // Quando true, exibe o fallback roxo com ícone ao invés da imagem
  const [tileImageError, setTileImageError] = useState(false);
  // Ref para o container do menu, usado para detectar cliques fora
  const menuRef = useRef<HTMLDivElement>(null);

  // Converte lat/lng para coordenadas de tile do OpenStreetMap
  // Fórmula: https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames
  const getTileUrl = () => {
    if (!previewLocation) return null;
    const { latitude, longitude } = previewLocation;
    const x = Math.floor(((longitude + 180) / 360) * Math.pow(2, DEFAULT_ZOOM));
    const y = Math.floor(
      ((1 -
        Math.log(Math.tan((latitude * Math.PI) / 180) + 1 / Math.cos((latitude * Math.PI) / 180)) /
          Math.PI) /
        2) *
        Math.pow(2, DEFAULT_ZOOM)
    );
    return `https://tile.openstreetmap.org/${DEFAULT_ZOOM}/${x}/${y}.png`;
  };

  const tileUrl = getTileUrl();

  // Formata a data de atualização para o formato brasileiro (DD/MM/YYYY)
  const formattedDate = formatDateBR(updatedAt);

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
      className="card-interactive relative cursor-pointer rounded-2xl border border-border bg-surface shadow-lg transition-all hover:shadow-xl"
    >
      {/* Botão de menu - fora da div de overflow para não ser cortado */}
      <div className="absolute right-3 top-3 z-50" ref={menuRef}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen(!menuOpen);
          }}
          aria-label="Opções do mapa"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white shadow-lg transition-colors hover:bg-black/70"
        >
          <EllipsisVerticalIcon className="h-5 w-5" />
        </button>

        {/* Menu dropdown */}
        {menuOpen && (
          <div
            role="menu"
            className="absolute right-0 top-10 w-48 rounded-xl border border-border bg-surface py-2 shadow-xl"
          >
            <button
              role="menuitem"
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
              role="menuitem"
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

      {/* Preview: tile do mapa ou fallback roxo com ícone */}
      <div className="relative h-32 overflow-hidden rounded-t-2xl bg-primary">
        {tileUrl && !tileImageError ? (
          // Tenta carregar a imagem do tile do OpenStreetMap
          // Se falhar (servidor offline, rate limit, coordenadas inválidas, etc),
          // o onError dispara e muda para o fallback
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={tileUrl}
            alt={`Preview do mapa ${name}`}
            onError={() => setTileImageError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          // Fallback: fundo roxo com ícone de mapa
          // Exibido quando não há previewLocation ou quando a imagem falha ao carregar
          <div
            className="flex h-full items-center justify-center"
            role="img"
            aria-label="Preview indisponível"
          >
            <MapIcon className="h-12 w-12 text-white/50" strokeWidth={1.5} />
          </div>
        )}
      </div>

      {/* Informações do mapa */}
      <div className="p-4">
        <h3 className="truncate text-lg font-semibold text-text-primary">{name}</h3>
        <p className="line-clamp-2 text-sm text-text-muted">{description || 'Sem descrição'}</p>
        <p className="mt-2 text-sm font-medium text-primary">Pontos cadastrados ({pointsCount})</p>
        <p className="mt-1 text-xs text-text-placeholder">Atualizado em {formattedDate}</p>
      </div>
    </div>
  );
}
