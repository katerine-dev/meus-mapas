import { describe, it, expect, beforeEach } from 'vitest';
import { GET, PUT, DELETE } from './route';
import * as testHelper from '@/lib/test-helper';
import connection from '@/app/db/connection';

describe('GET /api/maps/[id]/points/[pointId]', () => {
  // Limpa o banco antes de cada teste
  beforeEach(async () => {
    await testHelper.cleanDatabase();
  });

  // Teste: deve retornar um ponto existente com status 200
  it('deve retornar um ponto existente com status 200', async () => {
    // Primeiro cria um mapa e um ponto no banco
    const map = await testHelper.insertMap();
    const point = await testHelper.insertPoint(map.id);

    // Simula os params da rota dinâmica
    const params = { params: Promise.resolve({ id: map.id, pointId: point.id }) };
    // Cria uma requisição mock para o GET
    const request = testHelper.get(`/api/maps/${map.id}/points/${point.id}`);

    const response = await GET(request, params);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.id).toBe(point.id);
    expect(body.mapId).toBe(map.id);
    expect(body.name).toBe(point.name);
    expect(body.location.longitude).toBeCloseTo(point.location.longitude, 4);
    expect(body.location.latitude).toBeCloseTo(point.location.latitude, 4);
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
    // Cria um mapa e um ponto já deletado
    const map = await testHelper.insertMap();
    const point = await testHelper.insertPoint(map.id, { deletedAt: new Date() });

    const params = { params: Promise.resolve({ id: map.id, pointId: point.id }) };
    const request = testHelper.get(`/api/maps/${map.id}/points/${point.id}`);

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
    // Cria um mapa e um ponto no banco
    const map = await testHelper.insertMap();
    const point = await testHelper.insertPoint(map.id);

    // Cria a requisição PUT com os novos dados
    const updatedData = {
      name: 'Ponto Atualizado',
    };
    const request = testHelper.put(`/api/maps/${map.id}/points/${point.id}`, updatedData);

    // Simula os params da rota dinâmica
    const params = { params: Promise.resolve({ id: map.id, pointId: point.id }) };

    const response = await PUT(request, params);
    expect(response.status).toBe(204);

    // Verifica se o ponto foi realmente atualizado no banco
    const result = await connection.query('SELECT * FROM points WHERE id = $1', [point.id]);
    expect(result.rows[0].name).toBe(updatedData.name);
  });

  // Teste: deve retornar 404 quando o ponto não existe
  it('deve retornar 404 quando o ponto não existe', async () => {
    // ID que não existe no banco
    const fakeId = '00000000-0000-0000-0000-000000000000';

    const request = testHelper.put(`/api/maps/${fakeId}/points/${fakeId}`, {
      name: 'Ponto Inexistente',
    });

    const params = { params: Promise.resolve({ id: fakeId, pointId: fakeId }) };

    const response = await PUT(request, params);
    expect(response.status).toBe(404);
  });

  // Teste: não deve permitir atualizar ponto deletado (retorna 404)
  it('não deve permitir atualizar ponto deletado (retorna 404)', async () => {
    // Cria um mapa e um ponto já deletado
    const map = await testHelper.insertMap();
    const point = await testHelper.insertPoint(map.id, { deletedAt: new Date() });

    // Tenta atualizar o ponto deletado
    const request = testHelper.put(`/api/maps/${map.id}/points/${point.id}`, {
      name: 'Tentativa de Atualização',
    });

    const params = { params: Promise.resolve({ id: map.id, pointId: point.id }) };

    const response = await PUT(request, params);
    expect(response.status).toBe(404);
  });

  // Teste: deve retornar 400 quando name está vazio (validação Zod)
  it('deve retornar 400 quando name está vazio na atualização', async () => {
    const map = await testHelper.insertMap();
    const point = await testHelper.insertPoint(map.id);

    const request = testHelper.put(`/api/maps/${map.id}/points/${point.id}`, {
      name: '', // name vazio
    });

    const params = { params: Promise.resolve({ id: map.id, pointId: point.id }) };

    const response = await PUT(request, params);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.errors).toBeDefined();
    expect(body.errors[0].field).toBe('name');
  });

  // Teste: campos extras (latitude/longitude) são ignorados - atualização só altera o nome
  it('deve ignorar latitude e longitude e atualizar apenas o nome', async () => {
    // Cria um mapa e um ponto no banco
    const map = await testHelper.insertMap();
    const point = await testHelper.insertPoint(map.id);

    // Tenta atualizar enviando latitude e longitude (devem ser ignorados)
    const request = testHelper.put(`/api/maps/${map.id}/points/${point.id}`, {
      name: 'Nome Atualizado',
      latitude: -22.9068,
      longitude: -43.1729,
    });

    const params = { params: Promise.resolve({ id: map.id, pointId: point.id }) };

    const response = await PUT(request, params);
    // Deve retornar 204 - atualização bem-sucedida (campos extras são ignorados)
    expect(response.status).toBe(204);
  });

  // Teste: deve retornar 409 ao atualizar para nome que já existe em outro ponto do mesmo mapa
  it('deve retornar 409 ao atualizar para nome que já existe no mesmo mapa', async () => {
    // Cria um mapa e dois pontos
    const map = await testHelper.insertMap();
    await testHelper.insertPoint(map.id, { name: 'Ponto Original' });
    const point2 = await testHelper.insertPoint(map.id, { name: 'Outro Ponto' });

    // Tenta atualizar point2 para ter o mesmo nome do primeiro ponto
    const request = testHelper.put(`/api/maps/${map.id}/points/${point2.id}`, {
      name: 'Ponto Original', // Nome já existe
    });

    const params = { params: Promise.resolve({ id: map.id, pointId: point2.id }) };

    const response = await PUT(request, params);
    expect(response.status).toBe(409);
    const body = await response.json();
    expect(body.error).toBeDefined();
  });
});

describe('DELETE /api/maps/[id]/points/[pointId]', () => {
  // Limpa o banco antes de cada teste
  beforeEach(async () => {
    await testHelper.cleanDatabase();
  });

  // Teste: deve fazer soft delete de um ponto existente e retornar 204
  it('deve fazer soft delete de um ponto existente e retornar 204', async () => {
    // Cria um mapa e um ponto no banco
    const map = await testHelper.insertMap();
    const point = await testHelper.insertPoint(map.id);

    // Simula os params da rota dinâmica
    const params = { params: Promise.resolve({ id: map.id, pointId: point.id }) };
    // Cria uma requisição mock para o DELETE
    const request = testHelper.del(`/api/maps/${map.id}/points/${point.id}`);

    const response = await DELETE(request, params);
    expect(response.status).toBe(204);

    // Verifica se o ponto ainda existe no banco mas com deleted_at preenchido
    const result = await connection.query('SELECT * FROM points WHERE id = $1', [point.id]);
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
    // Cria um mapa e um ponto já deletado
    const map = await testHelper.insertMap();
    const point = await testHelper.insertPoint(map.id, { deletedAt: new Date() });

    const params = { params: Promise.resolve({ id: map.id, pointId: point.id }) };
    const request = testHelper.del(`/api/maps/${map.id}/points/${point.id}`);

    const response = await DELETE(request, params);
    expect(response.status).toBe(404);
  });
});

describe('Validação de UUID', () => {
  const validUuid = '00000000-0000-0000-0000-000000000000';
  const invalidId = 'invalid-uuid';

  it('GET deve retornar 400 para mapId inválido', async () => {
    const params = { params: Promise.resolve({ id: invalidId, pointId: validUuid }) };
    const request = testHelper.get(`/api/maps/${invalidId}/points/${validUuid}`);
    const response = await GET(request, params);
    expect(response.status).toBe(400);
  });

  it('GET deve retornar 400 para pointId inválido', async () => {
    const params = { params: Promise.resolve({ id: validUuid, pointId: invalidId }) };
    const request = testHelper.get(`/api/maps/${validUuid}/points/${invalidId}`);
    const response = await GET(request, params);
    expect(response.status).toBe(400);
  });

  it('PUT deve retornar 400 para mapId inválido', async () => {
    const params = { params: Promise.resolve({ id: invalidId, pointId: validUuid }) };
    const request = testHelper.put(`/api/maps/${invalidId}/points/${validUuid}`, { name: 'Test' });
    const response = await PUT(request, params);
    expect(response.status).toBe(400);
  });

  it('PUT deve retornar 400 para pointId inválido', async () => {
    const params = { params: Promise.resolve({ id: validUuid, pointId: invalidId }) };
    const request = testHelper.put(`/api/maps/${validUuid}/points/${invalidId}`, { name: 'Test' });
    const response = await PUT(request, params);
    expect(response.status).toBe(400);
  });

  it('DELETE deve retornar 400 para mapId inválido', async () => {
    const params = { params: Promise.resolve({ id: invalidId, pointId: validUuid }) };
    const request = testHelper.del(`/api/maps/${invalidId}/points/${validUuid}`);
    const response = await DELETE(request, params);
    expect(response.status).toBe(400);
  });

  it('DELETE deve retornar 400 para pointId inválido', async () => {
    const params = { params: Promise.resolve({ id: validUuid, pointId: invalidId }) };
    const request = testHelper.del(`/api/maps/${validUuid}/points/${invalidId}`);
    const response = await DELETE(request, params);
    expect(response.status).toBe(400);
  });
});
