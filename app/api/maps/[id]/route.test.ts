import { describe, it, expect, beforeEach } from 'vitest';
import { GET, PUT, DELETE } from './route';
import * as testHelper from '@/lib/test-helper';
import connection from '@/app/db/connection';

describe('GET /api/maps/[id]', () => {
  // Limpa o banco antes de cada teste
  beforeEach(async () => {
    await testHelper.cleanDatabase();
  });

  // Teste: deve retornar um mapa existente com status 200
  it('deve retornar um mapa existente com status 200', async () => {
    // Primeiro cria um mapa no banco
    const map = await testHelper.insertMap();

    // Simula os params da rota dinâmica
    const params = { params: Promise.resolve({ id: map.id }) };
    // Cria uma requisição mock para o GET
    const request = testHelper.get(`/api/maps/${map.id}`);

    const response = await GET(request, params);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.id).toBe(map.id);
    expect(body.name).toBe(map.name);
    expect(body.description).toBe(map.description);
    expect(body.deletedAt).toBeNull();
  });

  // Teste: deve retornar 404 quando o mapa não existe
  it('deve retornar 404 quando o mapa não existe', async () => {
    // ID que não existe no banco
    const fakeId = '00000000-0000-0000-0000-000000000000';
    const params = { params: Promise.resolve({ id: fakeId }) };
    // Cria uma requisição mock para o GET
    const request = testHelper.get(`/api/maps/${fakeId}`);

    const response = await GET(request, params);
    expect(response.status).toBe(404);
  });

  // Teste: deve retornar 404 para mapa deletado (soft delete)
  it('deve retornar 404 para mapa deletado (soft delete)', async () => {
    // Cria um mapa já deletado
    const map = await testHelper.insertMap({ deletedAt: new Date() });

    const params = { params: Promise.resolve({ id: map.id }) };
    const request = testHelper.get(`/api/maps/${map.id}`);

    const response = await GET(request, params);
    expect(response.status).toBe(404);
  });
});

describe('PUT /api/maps/[id]', () => {
  // Limpa o banco antes de cada teste
  beforeEach(async () => {
    await testHelper.cleanDatabase();
  });

  // Teste: deve atualizar um mapa existente e retornar 204
  it('deve atualizar um mapa existente e retornar 204', async () => {
    // Primeiro cria um mapa no banco
    const map = await testHelper.insertMap();

    // Cria a requisição PUT com os novos dados
    const updatedData = { name: 'Mapa Atualizado', description: 'Nova descrição' };
    const request = testHelper.put(`/api/maps/${map.id}`, updatedData);

    // Simula os params da rota dinâmica
    const params = { params: Promise.resolve({ id: map.id }) };

    const response = await PUT(request, params);
    expect(response.status).toBe(204);

    // Verifica se o mapa foi realmente atualizado no banco
    const result = await connection.query('SELECT * FROM maps WHERE id = $1', [map.id]);
    expect(result.rows[0].name).toBe(updatedData.name);
    expect(result.rows[0].description).toBe(updatedData.description);
  });

  // Teste: deve retornar 404 quando o mapa não existe
  it('deve retornar 404 quando o mapa não existe', async () => {
    // ID que não existe no banco
    const fakeId = '00000000-0000-0000-0000-000000000000';

    const request = testHelper.put(`/api/maps/${fakeId}`, {
      name: 'Mapa Inexistente',
      description: 'Descrição',
    });

    const params = { params: Promise.resolve({ id: fakeId }) };

    const response = await PUT(request, params);
    expect(response.status).toBe(404);
  });

  // Teste: deve atualizar um mapa com descrição vazia
  it('deve atualizar um mapa com descrição vazia', async () => {
    // Cria um mapa com descrição
    const map = await testHelper.insertMap();

    // Atualiza com descrição vazia
    const updatedData = { name: 'Mapa Sem Descrição', description: '' };
    const request = testHelper.put(`/api/maps/${map.id}`, updatedData);

    const params = { params: Promise.resolve({ id: map.id }) };

    const response = await PUT(request, params);
    expect(response.status).toBe(204);

    // Verifica se a descrição foi atualizada para vazio
    const result = await connection.query('SELECT * FROM maps WHERE id = $1', [map.id]);
    expect(result.rows[0].name).toBe(updatedData.name);
    expect(result.rows[0].description).toBe(updatedData.description);
  });

  // Teste: não deve permitir atualizar mapa deletado (retorna 404)
  it('não deve permitir atualizar mapa deletado (retorna 404)', async () => {
    // Cria um mapa já deletado
    const map = await testHelper.insertMap({ deletedAt: new Date() });

    // Tenta atualizar o mapa deletado
    const request = testHelper.put(`/api/maps/${map.id}`, {
      name: 'Tentativa de Atualização',
      description: 'Não deveria funcionar',
    });

    const params = { params: Promise.resolve({ id: map.id }) };

    const response = await PUT(request, params);
    expect(response.status).toBe(404);
  });
});

describe('DELETE /api/maps/[id]', () => {
  // Limpa o banco antes de cada teste
  beforeEach(async () => {
    await testHelper.cleanDatabase();
  });

  // Teste: deve fazer soft delete de um mapa existente e retornar 204
  it('deve fazer soft delete de um mapa existente e retornar 204', async () => {
    // Primeiro cria um mapa no banco
    const map = await testHelper.insertMap();

    // Simula os params da rota dinâmica
    const params = { params: Promise.resolve({ id: map.id }) };
    // Cria uma requisição mock para o DELETE
    const request = testHelper.del(`/api/maps/${map.id}`);

    const response = await DELETE(request, params);
    expect(response.status).toBe(204);

    // Verifica se o mapa ainda existe no banco mas com deleted_at preenchido
    const result = await connection.query('SELECT * FROM maps WHERE id = $1', [map.id]);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].deleted_at).not.toBeNull();
  });

  // Teste: deve retornar 404 ao tentar deletar mapa inexistente
  it('deve retornar 404 ao tentar deletar mapa inexistente', async () => {
    // ID que não existe no banco
    const fakeId = '00000000-0000-0000-0000-000000000000';
    const params = { params: Promise.resolve({ id: fakeId }) };
    // Cria uma requisição mock para o DELETE
    const request = testHelper.del(`/api/maps/${fakeId}`);

    const response = await DELETE(request, params);
    expect(response.status).toBe(404);
  });

  // Teste: deve retornar 404 ao tentar deletar mapa já deletado
  it('deve retornar 404 ao tentar deletar mapa já deletado', async () => {
    // Cria um mapa já deletado
    const map = await testHelper.insertMap({ deletedAt: new Date() });

    const params = { params: Promise.resolve({ id: map.id }) };
    const request = testHelper.del(`/api/maps/${map.id}`);

    const response = await DELETE(request, params);
    expect(response.status).toBe(404);
  });

  // Teste: deve fazer soft delete dos pontos associados ao mapa (cascade)
  it('deve fazer soft delete dos pontos associados ao mapa (cascade)', async () => {
    // Cria um mapa
    const map = await testHelper.insertMap();

    // Cria pontos associados ao mapa
    const point1 = await testHelper.insertPoint(map.id);
    const point2 = await testHelper.insertPoint(map.id);

    // Faz soft delete do mapa
    const params = { params: Promise.resolve({ id: map.id }) };
    const request = testHelper.del(`/api/maps/${map.id}`);

    const response = await DELETE(request, params);
    expect(response.status).toBe(204);

    // Verifica se os pontos também foram soft deleted
    const pointsResult = await connection.query('SELECT * FROM points WHERE id = ANY($1)', [
      [point1.id, point2.id],
    ]);
    expect(pointsResult.rows).toHaveLength(2);
    pointsResult.rows.forEach((point) => {
      expect(point.deleted_at).not.toBeNull();
    });
  });
});
