import { Map } from '@/app/model/map';
import { handleResponse } from './fetch-helper';

interface CreateMapData {
  name: string;
  description?: string;
}

interface UpdateMapData {
  name: string;
  description?: string;
}

export function getAllMaps(): Promise<Map[]> {
  return fetch('/api/maps').then(handleResponse);
}

export function getMapById(id: string): Promise<Map> {
  return fetch(`/api/maps/${id}`).then(handleResponse);
}

export function createMap(data: CreateMapData): Promise<{ id: string }> {
  return fetch('/api/maps', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handleResponse);
}

export function updateMap(id: string, data: UpdateMapData): Promise<void> {
  return fetch(`/api/maps/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then((res) => handleResponse(res, true));
}

export function deleteMap(id: string): Promise<void> {
  return fetch(`/api/maps/${id}`, {
    method: 'DELETE',
  }).then((res) => handleResponse(res, true));
}
