import { describe, it, expect, beforeEach } from 'vitest';
import { GET } from './route';
import * as testHelper from '@/lib/test-helper';
import * as mapsDb from '@/app/db/maps';
import * as pointsDb from '@/app/db/points';

describe('GET /api/maps/[id]/points/[pointId]', () => {
  // Limpa o banco antes de cada teste
  beforeEach(async () => {
    await testHelper.cleanDatabase();
  });

  // Teste: deve retornar um ponto existente com status 200
  it('deve retornar um ponto existente com status 200', async () => {
    // Primeiro cria um mapa no banco
    const mapId = await mapsDb.createMap({
      name: 'Mapa Teste',
      description: 'Descrição do mapa',
    });

    // Cria um ponto no banco
    const pointData = {
      mapId: mapId,
      name: 'Ponto Teste',
      description: 'Descrição do ponto',
      latitude: -23.5505,
      longitude: -46.6333,
    };
    const pointId = await pointsDb.createPoint(pointData);

    // Simula os params da rota dinâmica
    const params = { params: Promise.resolve({ id: mapId, pointId }) };
    // Cria uma requisição mock para o GET
    const request = new Request(`http://localhost/api/maps/${mapId}/points/${pointId}`);

    const response = await GET(request, params);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.id).toBe(pointId);
    expect(body.mapId).toBe(mapId);
    expect(body.name).toBe(pointData.name);
    expect(body.description).toBe(pointData.description);
    expect(body.location.longitude).toBeCloseTo(pointData.longitude, 4);
    expect(body.location.latitude).toBeCloseTo(pointData.latitude, 4);
  });

  // Teste: deve retornar 404 quando o ponto não existe
  it('deve retornar 404 quando o ponto não existe', async () => {
    // ID que não existe no banco
    const fakeId = '00000000-0000-0000-0000-000000000000';
    const params = { params: Promise.resolve({ id: fakeId, pointId: fakeId }) };
    // Cria uma requisição mock para o GET
    const request = new Request(`http://localhost/api/maps/${fakeId}/points/${fakeId}`);

    const response = await GET(request, params);
    expect(response.status).toBe(404);
  });
});
