'use client';

import {
  PencilIcon,
  TrashIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import { Map } from '@/app/model/map';
import { Point } from '@/app/model/point';
import DescriptionEditor from './DescriptionEditor';
import PointsList from './PointsList';
import LocationSearch from './LocationSearch';

/**
 * Props do sidebar (usadas tanto na versão desktop quanto mobile).
 */
export interface MapSidebarProps {
  map: Map;
  points: Point[];
  selectedPointId: string | null;
  // Estado do drawer mobile
  mobileDrawerOpen: boolean;
  onMobileDrawerToggle: () => void;
  // Estado de edição de nome
  editingName: boolean;
  nameValue: string;
  onNameValueChange: (value: string) => void;
  onEditName: () => void;
  onCancelEditName: () => void;
  onSaveName: () => void;
  // Estado de edição de descrição
  editingDescription: boolean;
  descriptionValue: string;
  onDescriptionValueChange: (value: string) => void;
  onEditDescription: () => void;
  onCancelEditDescription: () => void;
  onSaveDescription: () => void;
  // Handlers de pontos
  onSelectPoint: (pointId: string) => void;
  onEditPoint: (point: Point) => void;
  onDeletePoint: (pointId: string) => void;
  onDeleteAllPoints: () => void;
  // Busca de localização (usado no mobile)
  onLocationFound: (lat: number, lng: number, name?: string, isExistingPoint?: boolean) => void;
}

/**
 * Sidebar do mapa com layout responsivo.
 * Desktop (≥768px): painel lateral fixo à esquerda.
 * Mobile: Drawer expansível embaixo.
 */
export default function MapSidebar({
  map,
  points,
  selectedPointId,
  mobileDrawerOpen,
  onMobileDrawerToggle,
  editingName,
  nameValue,
  onNameValueChange,
  onEditName,
  onCancelEditName,
  onSaveName,
  editingDescription,
  descriptionValue,
  onDescriptionValueChange,
  onEditDescription,
  onCancelEditDescription,
  onSaveDescription,
  onSelectPoint,
  onEditPoint,
  onDeletePoint,
  onDeleteAllPoints,
  onLocationFound,
}: MapSidebarProps) {
  return (
    <>
      {/* Desktop */}
      <div className="absolute bottom-4 left-4 top-4 z-[1000] hidden w-80 flex-col gap-4 overflow-hidden md:flex">
        {/* Info do mapa */}
        <div className="card-interactive overflow-hidden rounded-2xl border border-border bg-surface shadow-lg">
          <div className="bg-primary px-5 py-4">
            {editingName ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={nameValue}
                  onChange={(e) => onNameValueChange(e.target.value)}
                  className="w-full rounded-lg bg-white/20 px-2 py-1 text-lg font-semibold text-white placeholder:text-white/60 focus:bg-white/30 focus:outline-none"
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={onCancelEditName}
                    className="text-sm text-white/80 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={onSaveName}
                    disabled={!nameValue.trim()}
                    className="rounded-lg bg-white/20 px-2 py-1 text-sm text-white hover:bg-white/30 disabled:opacity-50"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold text-white">{map.name}</h1>
                <button
                  onClick={onEditName}
                  className="rounded-full p-1 text-white/80 hover:bg-white/20 hover:text-white"
                  aria-label="Editar nome"
                  title="Editar nome"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
          <div className="p-4">
            <DescriptionEditor
              description={map.description || ''}
              isEditing={editingDescription}
              value={descriptionValue}
              onValueChange={onDescriptionValueChange}
              onEdit={onEditDescription}
              onCancel={onCancelEditDescription}
              onSave={onSaveDescription}
              variant="desktop"
            />
          </div>
        </div>

        {/* Lista de pontos */}
        <div className="card-interactive min-h-0 flex-1 overflow-hidden rounded-2xl border border-border bg-surface shadow-lg">
          <PointsList
            points={points}
            selectedPointId={selectedPointId}
            onSelectPoint={onSelectPoint}
            onEditPoint={onEditPoint}
            onDeletePoint={onDeletePoint}
          />
        </div>

        {/* Botão excluir todos */}
        <button
          onClick={onDeleteAllPoints}
          disabled={points.length === 0}
          className="btn-interactive focus:ring-destructive/30 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-destructive-border bg-surface px-3 py-2.5 text-sm text-destructive shadow-sm hover:bg-destructive-light hover:shadow-md focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:border-border disabled:text-text-muted disabled:opacity-50 disabled:hover:bg-surface disabled:hover:shadow-sm"
        >
          <TrashIcon className="h-4 w-4" />
          <span>Excluir todos</span>
        </button>
      </div>

      {/* Mobile */}
      <div className="absolute inset-x-0 bottom-0 z-[1000] md:hidden">
        {/* Handle para expandir/colapsar */}
        <button
          onClick={onMobileDrawerToggle}
          className="mx-auto flex w-full items-center justify-center rounded-t-2xl bg-white px-4 py-2 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]"
        >
          <div className="h-1 w-10 rounded-full bg-border" />
        </button>

        {/* Conteúdo do drawer */}
        <div
          className={`bg-white transition-all duration-300 ease-in-out ${mobileDrawerOpen ? 'max-h-[50vh]' : 'max-h-14'} overflow-hidden`}
        >
          {/* Header do mapa */}
          <div
            className="flex cursor-pointer items-center justify-between bg-primary px-4 py-3"
            onClick={onMobileDrawerToggle}
          >
            <div className="flex items-center gap-2">
              <MapPinIcon className="h-5 w-5 text-white" />
              <h1 className="font-semibold text-white">{map.name}</h1>
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs text-white">
                {points.length} pontos
              </span>
            </div>
            {mobileDrawerOpen ? (
              <ChevronDownIcon className="h-5 w-5 text-white" />
            ) : (
              <ChevronUpIcon className="h-5 w-5 text-white" />
            )}
          </div>

          {/* Conteúdo expandido */}
          {mobileDrawerOpen && (
            <div className="flex max-h-[calc(50vh-48px)] flex-col overflow-hidden">
              {/* Nome do mapa */}
              <div className="border-b border-border p-3">
                {editingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={nameValue}
                      onChange={(e) => onNameValueChange(e.target.value)}
                      className="flex-1 rounded-lg border border-border px-2 py-1 text-sm focus:border-primary focus:outline-none"
                      autoFocus
                    />
                    <button onClick={onCancelEditName} className="text-sm text-text-secondary">
                      Cancelar
                    </button>
                    <button
                      onClick={onSaveName}
                      disabled={!nameValue.trim()}
                      className="rounded-lg bg-primary px-2 py-1 text-sm text-white disabled:opacity-50"
                    >
                      Salvar
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-text-primary">{map.name}</span>
                    <button
                      onClick={onEditName}
                      className="rounded-full p-1 text-text-muted hover:bg-surface-hover hover:text-primary"
                      aria-label="Editar nome"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Descrição */}
              <div className="border-b border-border p-3">
                <DescriptionEditor
                  description={map.description || ''}
                  isEditing={editingDescription}
                  value={descriptionValue}
                  onValueChange={onDescriptionValueChange}
                  onEdit={onEditDescription}
                  onCancel={onCancelEditDescription}
                  onSave={onSaveDescription}
                  variant="mobile"
                />
              </div>

              {/* Busca de localização */}
              <div className="border-b border-border p-3">
                <LocationSearch onLocationFound={onLocationFound} points={points} />
              </div>

              {/* Lista de pontos */}
              <div className="min-h-0 flex-1 overflow-auto">
                <PointsList
                  points={points}
                  selectedPointId={selectedPointId}
                  onSelectPoint={(pointId) => {
                    onSelectPoint(pointId);
                    onMobileDrawerToggle(); // Fecha o drawer ao selecionar
                  }}
                  onEditPoint={onEditPoint}
                  onDeletePoint={onDeletePoint}
                />
              </div>

              {/* Botão excluir todos */}
              <div className="border-t border-border p-3">
                <button
                  onClick={onDeleteAllPoints}
                  disabled={points.length === 0}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-destructive-border py-2 text-sm text-destructive hover:bg-destructive-light disabled:cursor-not-allowed disabled:border-border disabled:text-text-muted disabled:opacity-50"
                >
                  <TrashIcon className="h-4 w-4" />
                  <span>Excluir todos</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
