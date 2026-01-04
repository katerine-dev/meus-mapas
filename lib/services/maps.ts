import { Map } from '@/app/model/map';
import { DuplicateNameError } from '@/lib/errors';

interface CreateMapData {
  name: string;
  description?: string;
}

interface UpdateMapData {
  name: string;
  description?: string;
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

export function getAllMaps(): Promise<Map[]> {
  return fetch('/api/maps').then((res) => handleResponse<Map[]>(res));
}

export function getMapById(id: string): Promise<Map> {
  return fetch(`/api/maps/${id}`).then((res) => handleResponse<Map>(res));
}

export function createMap(data: CreateMapData): Promise<{ id: string }> {
  return fetch('/api/maps', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then((res) => handleResponse<{ id: string }>(res));
}

export function updateMap(id: string, data: UpdateMapData): Promise<Map> {
  return fetch(`/api/maps/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then((res) => handleResponse<Map>(res));
}

export function deleteMap(id: string): Promise<void> {
  return fetch(`/api/maps/${id}`, {
    method: 'DELETE',
  }).then((res) => {
    if (!res.ok) throw new Error('Erro ao excluir mapa');
  });
}
