import { describe, it, expect, beforeEach } from 'vitest';
import { GET, PUT, DELETE } from './route';
import * as testHelper from '@/lib/test-helper';
import connection from '@/app/db/connection';
import * as mapsDb from '@/app/db/maps';

describe('GET /api/maps/[id]', () => {
  // Limpa o banco antes de cada teste
  beforeEach(async () => {
    await testHelper.cleanDatabase();
  });

  // Teste: deve retornar um mapa existente com status 200
  it('deve retornar um mapa existente com status 200', async () => {
    // Primeiro cria um mapa no banco
    const mapData = { name: 'Mapa Teste', description: 'Descrição do mapa' };
    const mapId = await mapsDb.createMap(mapData);

    // Simula os params da rota dinâmica
    const params = { params: Promise.resolve({ id: mapId }) };
    // Cria uma requisição mock para o GET
    const request = new Request(`http://localhost/api/maps/${mapId}`);

    const response = await GET(request, params);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.id).toBe(mapId);
    expect(body.name).toBe(mapData.name);
    expect(body.description).toBe(mapData.description);
    expect(body.deletedAt).toBeNull();
  });

  // Teste: deve retornar 404 quando o mapa não existe
  it('deve retornar 404 quando o mapa não existe', async () => {
    // ID que não existe no banco
    const fakeId = '00000000-0000-0000-0000-000000000000';
    const params = { params: Promise.resolve({ id: fakeId }) };
    // Cria uma requisição mock para o GET
    const request = new Request(`http://localhost/api/maps/${fakeId}`);

    const response = await GET(request, params);
    expect(response.status).toBe(404);
  });

  // Teste: deve retornar 404 para mapa deletado (soft delete)
  it('deve retornar 404 para mapa deletado (soft delete)', async () => {
    // Cria um mapa e faz soft delete
    const mapId = await mapsDb.createMap({ name: 'Mapa Deletado', description: 'Será deletado' });
    await mapsDb.deleteMap(mapId);

    const params = { params: Promise.resolve({ id: mapId }) };
    const request = new Request(`http://localhost/api/maps/${mapId}`);

    const response = await GET(request, params);
    expect(response.status).toBe(404);
  });

  // Teste: deve retornar mapa deletado quando include_deleted=true
  it('deve retornar mapa deletado quando include_deleted=true', async () => {
    // Cria um mapa e faz soft delete
    const mapId = await mapsDb.createMap({ name: 'Mapa Deletado', description: 'Será deletado' });
    await mapsDb.deleteMap(mapId);

    const params = { params: Promise.resolve({ id: mapId }) };
    const request = new Request(`http://localhost/api/maps/${mapId}?include_deleted=true`);

    const response = await GET(request, params);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.id).toBe(mapId);
    expect(body.deletedAt).not.toBeNull();
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
    const mapId = await mapsDb.createMap({
      name: 'Mapa Original',
      description: 'Descrição original',
    });

    // Cria a requisição PUT com os novos dados
    const updatedData = { name: 'Mapa Atualizado', description: 'Nova descrição' };
    const request = testHelper.put(`/api/maps/${mapId}`, updatedData);

    // Simula os params da rota dinâmica
    const params = { params: Promise.resolve({ id: mapId }) };

    const response = await PUT(request, params);
    expect(response.status).toBe(204);

    // Verifica se o mapa foi realmente atualizado no banco
    const result = await connection.query('SELECT * FROM maps WHERE id = $1', [mapId]);
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
    const mapId = await mapsDb.createMap({
      name: 'Mapa com Descrição',
      description: 'Descrição que será removida',
    });

    // Atualiza com descrição vazia
    const updatedData = { name: 'Mapa Sem Descrição', description: '' };
    const request = testHelper.put(`/api/maps/${mapId}`, updatedData);

    const params = { params: Promise.resolve({ id: mapId }) };

    const response = await PUT(request, params);
    expect(response.status).toBe(204);

    // Verifica se a descrição foi atualizada para vazio
    const result = await connection.query('SELECT * FROM maps WHERE id = $1', [mapId]);
    expect(result.rows[0].name).toBe(updatedData.name);
    expect(result.rows[0].description).toBe(updatedData.description);
  });

  // Teste: não deve permitir atualizar mapa deletado (retorna 404)
  it('não deve permitir atualizar mapa deletado (retorna 404)', async () => {
    // Cria um mapa e faz soft delete
    const mapId = await mapsDb.createMap({
      name: 'Mapa Deletado',
      description: 'Será deletado',
    });
    await mapsDb.deleteMap(mapId);

    // Tenta atualizar o mapa deletado
    const request = testHelper.put(`/api/maps/${mapId}`, {
      name: 'Tentativa de Atualização',
      description: 'Não deveria funcionar',
    });

    const params = { params: Promise.resolve({ id: mapId }) };

    const response = await PUT(request, params);
    expect(response.status).toBe(404);
  });
});

describe('DELETE /api/maps/[id]', () => {
  // Limpa o banco antes de cada teste
  beforeEach(async () => {
    await testHelper.cleanDatabase();
  });

  // Teste: deve fazer soft delete de um mapa existente e retornar 200 com dados
  it('deve fazer soft delete de um mapa existente e retornar 200 com dados', async () => {
    // Primeiro cria um mapa no banco
    const mapId = await mapsDb.createMap({
      name: 'Mapa para Deletar',
      description: 'Será deletado',
    });

    // Simula os params da rota dinâmica
    const params = { params: Promise.resolve({ id: mapId }) };
    // Cria uma requisição mock para o DELETE
    const request = new Request(`http://localhost/api/maps/${mapId}`, { method: 'DELETE' });

    const response = await DELETE(request, params);
    expect(response.status).toBe(200);

    // Verifica o corpo da resposta
    const body = await response.json();
    expect(body.id).toBe(mapId);
    expect(body.name).toBe('Mapa para Deletar');
    expect(body.deletedAt).not.toBeNull();

    // Verifica se o mapa ainda existe no banco mas com deleted_at preenchido
    const result = await connection.query('SELECT * FROM maps WHERE id = $1', [mapId]);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].deleted_at).not.toBeNull();
  });

  // Teste: deve retornar 404 ao tentar deletar mapa inexistente
  it('deve retornar 404 ao tentar deletar mapa inexistente', async () => {
    // ID que não existe no banco
    const fakeId = '00000000-0000-0000-0000-000000000000';
    const params = { params: Promise.resolve({ id: fakeId }) };
    // Cria uma requisição mock para o DELETE
    const request = new Request(`http://localhost/api/maps/${fakeId}`, { method: 'DELETE' });

    const response = await DELETE(request, params);
    expect(response.status).toBe(404);
  });

  // Teste: deve retornar 404 ao tentar deletar mapa já deletado
  it('deve retornar 404 ao tentar deletar mapa já deletado', async () => {
    // Cria um mapa e faz soft delete
    const mapId = await mapsDb.createMap({
      name: 'Mapa Deletado',
      description: 'Já deletado',
    });
    await mapsDb.deleteMap(mapId);

    const params = { params: Promise.resolve({ id: mapId }) };
    const request = new Request(`http://localhost/api/maps/${mapId}`, { method: 'DELETE' });

    const response = await DELETE(request, params);
    expect(response.status).toBe(404);
  });

  // Teste: deve fazer soft delete dos pontos associados ao mapa (cascade)
  it('deve fazer soft delete dos pontos associados ao mapa (cascade)', async () => {
    // Cria um mapa
    const mapId = await mapsDb.createMap({
      name: 'Mapa com Pontos',
      description: 'Tem pontos que serão deletados',
    });

    // Cria pontos associados ao mapa
    await connection.query(
      'INSERT INTO points (map_id, name, location) VALUES ($1, $2, POINT($3, $4))',
      [mapId, 'Ponto 1', -46.6333, -23.5505]
    );
    await connection.query(
      'INSERT INTO points (map_id, name, location) VALUES ($1, $2, POINT($3, $4))',
      [mapId, 'Ponto 2', -43.1729, -22.9068]
    );

    // Faz soft delete do mapa
    const params = { params: Promise.resolve({ id: mapId }) };
    const request = new Request(`http://localhost/api/maps/${mapId}`, { method: 'DELETE' });

    const response = await DELETE(request, params);
    expect(response.status).toBe(200);

    // Verifica se os pontos também foram soft deleted
    const pointsResult = await connection.query('SELECT * FROM points WHERE map_id = $1', [mapId]);
    expect(pointsResult.rows).toHaveLength(2);
    pointsResult.rows.forEach((point) => {
      expect(point.deleted_at).not.toBeNull();
    });
  });
});
