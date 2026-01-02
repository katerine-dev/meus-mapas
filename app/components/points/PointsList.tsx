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
      <div className="border-border-light border-b p-3">
        <h2 className="text-text-primary text-sm font-semibold">
          Pontos cadastrados{' '}
          {points.length > 0 && <span className="text-primary">({points.length})</span>}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {points.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-primary-light mb-3 rounded-full p-3">
              <MapPinIcon className="text-primary h-6 w-6" />
            </div>
            <p className="text-text-secondary text-sm font-medium">Nenhum ponto ainda</p>
            <p className="text-text-muted mt-1 text-xs">Clique no mapa para adicionar</p>
          </div>
        ) : (
          <ul>
            {points.map((point) => (
              <li
                key={point.id}
                className={`list-item-interactive border-border-light group flex cursor-pointer items-center justify-between border-b px-3 py-2.5 ${
                  point.id === selectedPointId
                    ? 'border-l-selection-border bg-selection-bg border-l-2'
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
                  <span className="text-text-primary truncate text-sm">{point.name}</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditPoint(point);
                    }}
                    className={`icon-interactive text-text-muted hover:bg-primary-light hover:text-primary rounded-lg p-1.5 ${
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
                    className={`icon-interactive text-text-muted hover:bg-destructive-light hover:text-destructive rounded-lg p-1.5 ${
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
