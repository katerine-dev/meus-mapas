'use client';

import { TrashIcon, PencilIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { Point } from '@/app/model/point';

interface PointsListProps {
  points: Point[];
  selectedPointId: string | null;
  onSelectPoint: (pointId: string) => void;
  onEditPoint: (point: Point) => void;
  onDeletePoint: (pointId: string) => void;
}

export default function PointsList({
  points,
  selectedPointId,
  onSelectPoint,
  onEditPoint,
  onDeletePoint,
}: PointsListProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border-light p-3">
        <h2 className="text-sm font-semibold text-text-primary">
          Pontos cadastrados{' '}
          {points.length > 0 && <span className="text-primary">({points.length})</span>}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {points.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-3 rounded-full bg-primary-light p-3">
              <MapPinIcon className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm font-medium text-text-secondary">Nenhum ponto ainda</p>
            <p className="mt-1 text-xs text-text-muted">Clique no mapa para adicionar</p>
          </div>
        ) : (
          <ul role="listbox" aria-label="Lista de pontos">
            {points.map((point) => (
              <li
                key={point.id}
                role="option"
                aria-selected={point.id === selectedPointId}
                className={`list-item-interactive group flex cursor-pointer items-center justify-between border-b border-border-light px-3 py-2.5 ${
                  point.id === selectedPointId
                    ? 'border-l-2 border-l-selection-border bg-selection-bg'
                    : 'hover:bg-surface-hover'
                }`}
                onClick={() => onSelectPoint(point.id)}
              >
                <div className="flex items-center gap-2 truncate">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      point.id === selectedPointId ? 'bg-primary' : 'bg-text-placeholder'
                    }`}
                  />
                  <span className="truncate text-sm text-text-primary">{point.name}</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditPoint(point);
                    }}
                    aria-label={`Editar ${point.name}`}
                    className={`icon-interactive rounded-lg p-1.5 text-text-muted hover:bg-primary-light hover:text-primary ${
                      point.id === selectedPointId
                        ? 'opacity-100'
                        : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <PencilIcon className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeletePoint(point.id);
                    }}
                    aria-label={`Excluir ${point.name}`}
                    className={`icon-interactive rounded-lg p-1.5 text-text-muted hover:bg-destructive-light hover:text-destructive ${
                      point.id === selectedPointId
                        ? 'opacity-100'
                        : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
