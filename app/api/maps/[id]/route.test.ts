import { describe, it, expect, beforeEach } from 'vitest';
import { PUT, DELETE } from './route';
import * as testHelper from '@/lib/test-helper';
import connection from '@/app/db/connection';
import * as mapsDb from '@/app/db/maps';

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
    const request = testHelper.put(`/api/maps/${mapId}`, {
      name: 'Mapa Atualizado',
      description: 'Nova descrição',
    });

    // Simula os params da rota dinâmica
    const params = { params: Promise.resolve({ id: mapId }) };

    const response = await PUT(request, params);
    expect(response.status).toBe(204);

    // Verifica se o mapa foi realmente atualizado no banco
    const result = await connection.query('SELECT * FROM maps WHERE id = $1', [mapId]);
    expect(result.rows[0].name).toBe('Mapa Atualizado');
    expect(result.rows[0].description).toBe('Nova descrição');
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
    const request = testHelper.put(`/api/maps/${mapId}`, {
      name: 'Mapa Sem Descrição',
      description: '',
    });

    const params = { params: Promise.resolve({ id: mapId }) };

    const response = await PUT(request, params);
    expect(response.status).toBe(204);

    // Verifica se a descrição foi atualizada para vazio
    const result = await connection.query('SELECT * FROM maps WHERE id = $1', [mapId]);
    expect(result.rows[0].name).toBe('Mapa Sem Descrição');
    expect(result.rows[0].description).toBe('');
  });
});

describe('DELETE /api/maps/[id]', () => {
  // Limpa o banco antes de cada teste
  beforeEach(async () => {
    await testHelper.cleanDatabase();
  });

  // Teste: deve deletar um mapa existente e retornar 204
  it('deve deletar um mapa existente e retornar 204', async () => {
    // Primeiro cria um mapa no banco
    const mapId = await mapsDb.createMap({
      name: 'Mapa para Deletar',
      description: 'Será deletado',
    });

    // Cria a requisição DELETE
    const request = testHelper.del(`/api/maps/${mapId}`);

    // Simula os params da rota dinâmica
    const params = { params: Promise.resolve({ id: mapId }) };

    const response = await DELETE(request, params);
    expect(response.status).toBe(204);

    // Verifica se o mapa foi realmente deletado do banco
    const result = await connection.query('SELECT * FROM maps WHERE id = $1', [mapId]);
    expect(result.rows).toHaveLength(0);
  });

  // Teste: deve retornar 404 quando o mapa não existe
  it('deve retornar 404 ao tentar deletar mapa inexistente', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';

    const request = testHelper.del(`/api/maps/${fakeId}`);

    const params = { params: Promise.resolve({ id: fakeId }) };

    const response = await DELETE(request, params);
    expect(response.status).toBe(404);
  });
});
