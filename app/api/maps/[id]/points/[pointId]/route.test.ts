import { describe, it, expect, beforeEach } from 'vitest';
import { GET, PUT, DELETE } from './route';
import * as testHelper from '@/lib/test-helper';
import connection from '@/app/db/connection';
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
    const request = testHelper.get(`/api/maps/${mapId}/points/${pointId}`);

    const response = await GET(request, params);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.id).toBe(pointId);
    expect(body.mapId).toBe(mapId);
    expect(body.name).toBe(pointData.name);
    expect(body.description).toBe(pointData.description);
    expect(body.location.longitude).toBeCloseTo(pointData.longitude, 4);
    expect(body.location.latitude).toBeCloseTo(pointData.latitude, 4);
    expect(body.deletedAt).toBeNull();
  });

  // Teste: deve retornar 404 quando o ponto não existe
  it('deve retornar 404 quando o ponto não existe', async () => {
    // ID que não existe no banco
    const fakeId = '00000000-0000-0000-0000-000000000000';
    const params = { params: Promise.resolve({ id: fakeId, pointId: fakeId }) };
    // Cria uma requisição mock para o GET
    const request = testHelper.get(`/api/maps/${fakeId}/points/${fakeId}`);

    const response = await GET(request, params);
    expect(response.status).toBe(404);
  });

  // Teste: deve retornar 404 para ponto deletado (soft delete)
  it('deve retornar 404 para ponto deletado (soft delete)', async () => {
    // Cria um mapa e um ponto
    const mapId = await mapsDb.createMap({
      name: 'Mapa Teste',
      description: 'Descrição do mapa',
    });
    const pointId = await pointsDb.createPoint({
      mapId,
      name: 'Ponto Deletado',
      description: 'Será deletado',
      latitude: -23.5505,
      longitude: -46.6333,
    });

    // Faz soft delete do ponto
    await pointsDb.deletePoint(pointId);

    const params = { params: Promise.resolve({ id: mapId, pointId }) };
    const request = testHelper.get(`/api/maps/${mapId}/points/${pointId}`);

    const response = await GET(request, params);
    expect(response.status).toBe(404);
  });
});

describe('PUT /api/maps/[id]/points/[pointId]', () => {
  // Limpa o banco antes de cada teste
  beforeEach(async () => {
    await testHelper.cleanDatabase();
  });

  // Teste: deve atualizar um ponto existente e retornar 204
  it('deve atualizar um ponto existente e retornar 204', async () => {
    // Primeiro cria um mapa no banco
    const mapId = await mapsDb.createMap({
      name: 'Mapa Teste',
      description: 'Descrição do mapa',
    });

    // Cria um ponto no banco
    const pointId = await pointsDb.createPoint({
      mapId: mapId,
      name: 'Ponto Original',
      description: 'Descrição original',
      latitude: -23.5505,
      longitude: -46.6333,
    });

    // Cria a requisição PUT com os novos dados
    const updatedData = {
      name: 'Ponto Atualizado',
      description: 'Nova descrição',
      latitude: -22.9068,
      longitude: -43.1729,
    };
    const request = testHelper.put(`/api/maps/${mapId}/points/${pointId}`, updatedData);

    // Simula os params da rota dinâmica
    const params = { params: Promise.resolve({ id: mapId, pointId }) };

    const response = await PUT(request, params);
    expect(response.status).toBe(204);

    // Verifica se o ponto foi realmente atualizado no banco
    const result = await connection.query('SELECT * FROM points WHERE id = $1', [pointId]);
    expect(result.rows[0].name).toBe(updatedData.name);
    expect(result.rows[0].description).toBe(updatedData.description);
  });

  // Teste: deve retornar 404 quando o ponto não existe
  it('deve retornar 404 quando o ponto não existe', async () => {
    // ID que não existe no banco
    const fakeId = '00000000-0000-0000-0000-000000000000';

    const request = testHelper.put(`/api/maps/${fakeId}/points/${fakeId}`, {
      name: 'Ponto Inexistente',
      description: 'Descrição',
      latitude: -23.5505,
      longitude: -46.6333,
    });

    const params = { params: Promise.resolve({ id: fakeId, pointId: fakeId }) };

    const response = await PUT(request, params);
    expect(response.status).toBe(404);
  });

  // Teste: deve atualizar um ponto com descrição vazia
  it('deve atualizar um ponto com descrição vazia', async () => {
    // Primeiro cria um mapa no banco
    const mapId = await mapsDb.createMap({
      name: 'Mapa Teste',
      description: 'Descrição do mapa',
    });

    // Cria um ponto com descrição
    const pointId = await pointsDb.createPoint({
      mapId: mapId,
      name: 'Ponto com Descrição',
      description: 'Descrição que será removida',
      latitude: -23.5505,
      longitude: -46.6333,
    });

    // Atualiza com descrição vazia
    const updatedData = {
      name: 'Ponto Sem Descrição',
      description: '',
      latitude: -23.5505,
      longitude: -46.6333,
    };
    const request = testHelper.put(`/api/maps/${mapId}/points/${pointId}`, updatedData);

    const params = { params: Promise.resolve({ id: mapId, pointId }) };

    const response = await PUT(request, params);
    expect(response.status).toBe(204);

    // Verifica se a descrição foi atualizada para vazio
    const result = await connection.query('SELECT * FROM points WHERE id = $1', [pointId]);
    expect(result.rows[0].name).toBe(updatedData.name);
    expect(result.rows[0].description).toBe(updatedData.description);
  });
  // Teste: não deve permitir atualizar ponto deletado (retorna 404)
  it('não deve permitir atualizar ponto deletado (retorna 404)', async () => {
    // Cria um mapa e um ponto
    const mapId = await mapsDb.createMap({
      name: 'Mapa Teste',
      description: 'Descrição do mapa',
    });
    const pointId = await pointsDb.createPoint({
      mapId,
      name: 'Ponto Deletado',
      description: 'Será deletado',
      latitude: -23.5505,
      longitude: -46.6333,
    });

    // Faz soft delete do ponto
    await pointsDb.deletePoint(pointId);

    // Tenta atualizar o ponto deletado
    const request = testHelper.put(`/api/maps/${mapId}/points/${pointId}`, {
      name: 'Tentativa de Atualização',
      description: 'Não deveria funcionar',
      latitude: -22.9068,
      longitude: -43.1729,
    });

    const params = { params: Promise.resolve({ id: mapId, pointId }) };

    const response = await PUT(request, params);
    expect(response.status).toBe(404);
  });
});

describe('DELETE /api/maps/[id]/points/[pointId]', () => {
  // Limpa o banco antes de cada teste
  beforeEach(async () => {
    await testHelper.cleanDatabase();
  });

  // Teste: deve fazer soft delete de um ponto existente e retornar 204
  it('deve fazer soft delete de um ponto existente e retornar 204', async () => {
    // Primeiro cria um mapa no banco
    const mapId = await mapsDb.createMap({
      name: 'Mapa Teste',
      description: 'Descrição do mapa',
    });

    // Cria um ponto no banco
    const pointId = await pointsDb.createPoint({
      mapId: mapId,
      name: 'Ponto para Deletar',
      description: 'Será deletado',
      latitude: -23.5505,
      longitude: -46.6333,
    });

    // Simula os params da rota dinâmica
    const params = { params: Promise.resolve({ id: mapId, pointId }) };
    // Cria uma requisição mock para o DELETE
    const request = testHelper.del(`/api/maps/${mapId}/points/${pointId}`);

    const response = await DELETE(request, params);
    expect(response.status).toBe(204);

    // Verifica se o ponto ainda existe no banco mas com deleted_at preenchido
    const result = await connection.query('SELECT * FROM points WHERE id = $1', [pointId]);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].deleted_at).not.toBeNull();
  });

  // Teste: deve retornar 404 ao tentar deletar ponto inexistente
  it('deve retornar 404 ao tentar deletar ponto inexistente', async () => {
    // ID que não existe no banco
    const fakeId = '00000000-0000-0000-0000-000000000000';
    const params = { params: Promise.resolve({ id: fakeId, pointId: fakeId }) };
    // Cria uma requisição mock para o DELETE
    const request = testHelper.del(`/api/maps/${fakeId}/points/${fakeId}`);

    const response = await DELETE(request, params);
    expect(response.status).toBe(404);
  });

  // Teste: deve retornar 404 ao tentar deletar ponto já deletado
  it('deve retornar 404 ao tentar deletar ponto já deletado', async () => {
    // Cria um mapa e um ponto
    const mapId = await mapsDb.createMap({
      name: 'Mapa Teste',
      description: 'Descrição do mapa',
    });
    const pointId = await pointsDb.createPoint({
      mapId,
      name: 'Ponto Deletado',
      description: 'Já deletado',
      latitude: -23.5505,
      longitude: -46.6333,
    });

    // Faz soft delete do ponto
    await pointsDb.deletePoint(pointId);

    const params = { params: Promise.resolve({ id: mapId, pointId }) };
    const request = testHelper.del(`/api/maps/${mapId}/points/${pointId}`);

    const response = await DELETE(request, params);
    expect(response.status).toBe(404);
  });
});
