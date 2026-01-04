import { Point } from '@/app/model/point';
import { handleResponse } from './fetch-helper';

interface CreatePointData {
  name: string;
  latitude: number;
  longitude: number;
}

interface UpdatePointData {
  name: string;
}

export function getAllPoints(mapId: string): Promise<Point[]> {
  return fetch(`/api/maps/${mapId}/points`).then(handleResponse);
}

export function createPoint(mapId: string, data: CreatePointData): Promise<{ id: string }> {
  return fetch(`/api/maps/${mapId}/points`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handleResponse);
}

export function updatePoint(mapId: string, pointId: string, data: UpdatePointData): Promise<void> {
  return fetch(`/api/maps/${mapId}/points/${pointId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then((res) => handleResponse(res, true));
}

export function deletePoint(mapId: string, pointId: string): Promise<void> {
  return fetch(`/api/maps/${mapId}/points/${pointId}`, {
    method: 'DELETE',
  }).then((res) => handleResponse(res, true));
}

export function deleteAllPoints(mapId: string): Promise<void> {
  return fetch(`/api/maps/${mapId}/points`, {
    method: 'DELETE',
  }).then((res) => handleResponse(res, true));
}
