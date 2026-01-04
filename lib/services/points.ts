import { Point } from '@/app/model/point';
import { DuplicateNameError } from '@/lib/errors';

interface CreatePointData {
  name: string;
  latitude: number;
  longitude: number;
}

interface UpdatePointData {
  name: string;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    if (response.status === 409) {
      const data = await response.json();
      throw new DuplicateNameError(data.error || 'Nome já existe');
    }
    throw new Error('Erro na requisição');
  }
  return response.json();
}

export function getAllPoints(mapId: string): Promise<Point[]> {
  return fetch(`/api/maps/${mapId}/points`).then((res) => handleResponse<Point[]>(res));
}

export function createPoint(mapId: string, data: CreatePointData): Promise<{ id: string }> {
  return fetch(`/api/maps/${mapId}/points`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then((res) => handleResponse<{ id: string }>(res));
}

export function updatePoint(mapId: string, pointId: string, data: UpdatePointData): Promise<Point> {
  return fetch(`/api/maps/${mapId}/points/${pointId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then((res) => handleResponse<Point>(res));
}

export function deletePoint(mapId: string, pointId: string): Promise<void> {
  return fetch(`/api/maps/${mapId}/points/${pointId}`, {
    method: 'DELETE',
  }).then((res) => {
    if (!res.ok) throw new Error('Erro ao excluir ponto');
  });
}

export function deleteAllPoints(mapId: string): Promise<void> {
  return fetch(`/api/maps/${mapId}/points`, {
    method: 'DELETE',
  }).then((res) => {
    if (!res.ok) throw new Error('Erro ao excluir pontos');
  });
}
