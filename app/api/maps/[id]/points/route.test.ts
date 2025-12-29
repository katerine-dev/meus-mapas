import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { POST, GET } from './route';
import * as testHelper from '@/lib/test-helper';
import connection from '@/app/db/connection';
import * as uuid from 'uuid';

describe('Criando um novo ponto', () => {
  // ID do mapa que será usado nos testes
  let mapId: string;

  // Cria um mapa antes de todos os testes e limpa o banco
  beforeAll(async () => {
    await testHelper.cleanDatabase();
    // Cria um mapa para associar os pontos
    const result = await connection.query(
      'INSERT INTO maps (name, description) VALUES ($1, $2) RETURNING id',
      ['Mapa de Teste', 'Mapa para testar pontos']
    );
    mapId = result.rows[0].id;
  });

  // Limpa apenas a tabela de pontos antes de cada teste
  beforeEach(async () => {
    await connection.query('DELETE FROM points');
  });

  // Teste: deve criar um ponto com todos os campos e retornar status 201 com id
  it('deve criar um ponto com todos os campos e retornar 201 com id', async () => {
    // Cria uma requisição POST com todos os campos obrigatórios
    const request = testHelper.post(`/api/maps/${mapId}/points`, {
      name: 'Ponto A',
      description: 'Descrição do ponto A',
      latitude: -23.5505199,
      longitude: -46.6333094,
    });

    const params = { params: Promise.resolve({ id: mapId }) };
    const response = await POST(request, params);
    expect(response.status).toBe(201);
    const body = await response.json();
    // Verifica se o id retornado é um UUID válido
    expect(uuid.validate(body.id)).toBe(true);
  });

  // Teste: deve criar um ponto sem descrição (campo opcional)
  it('deve criar um ponto sem descrição', async () => {
    const request = testHelper.post(`/api/maps/${mapId}/points`, {
      name: 'Ponto B',
      latitude: -23.5629,
      longitude: -46.6544,
    });

    const params = { params: Promise.resolve({ id: mapId }) };
    const response = await POST(request, params);
    expect(response.status).toBe(201);
    const body = await response.json();
    expect(uuid.validate(body.id)).toBe(true);
  });

  // Teste: deve retornar 400 se name estiver faltando
  it('deve retornar 400 se name estiver faltando', async () => {
    const request = testHelper.post(`/api/maps/${mapId}/points`, {
      latitude: -23.5629,
      longitude: -46.6544,
    });

    const params = { params: Promise.resolve({ id: mapId }) };
    const response = await POST(request, params);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe('name, latitude e longitude são obrigatórios');
  });

  // Teste: deve retornar 400 se latitude estiver faltando
  it('deve retornar 400 se latitude estiver faltando', async () => {
    const request = testHelper.post(`/api/maps/${mapId}/points`, {
      name: 'Ponto D',
      longitude: -46.6544,
    });

    const params = { params: Promise.resolve({ id: mapId }) };
    const response = await POST(request, params);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe('name, latitude e longitude são obrigatórios');
  });

  // Teste: deve retornar 400 se longitude estiver faltando
  it('deve retornar 400 se longitude estiver faltando', async () => {
    const request = testHelper.post(`/api/maps/${mapId}/points`, {
      name: 'Ponto E',
      latitude: -23.5629,
    });

    const params = { params: Promise.resolve({ id: mapId }) };
    const response = await POST(request, params);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe('name, latitude e longitude são obrigatórios');
  });

  // Teste: deve aceitar latitude e longitude com valores negativos
  it('deve aceitar latitude e longitude com valores negativos', async () => {
    const request = testHelper.post(`/api/maps/${mapId}/points`, {
      name: 'Ponto F',
      latitude: -90.0,
      longitude: -180.0,
    });

    const params = { params: Promise.resolve({ id: mapId }) };
    const response = await POST(request, params);
    expect(response.status).toBe(201);
  });

  // Teste: deve aceitar latitude e longitude com valores positivos
  it('deve aceitar latitude e longitude com valores positivos', async () => {
    const request = testHelper.post(`/api/maps/${mapId}/points`, {
      name: 'Ponto G',
      latitude: 90.0,
      longitude: 180.0,
    });

    const params = { params: Promise.resolve({ id: mapId }) };
    const response = await POST(request, params);
    expect(response.status).toBe(201);
  });

  // Teste: deve aceitar latitude e longitude zero
  it('deve aceitar latitude e longitude zero', async () => {
    const request = testHelper.post(`/api/maps/${mapId}/points`, {
      name: 'Ponto H',
      latitude: 0,
      longitude: 0,
    });

    const params = { params: Promise.resolve({ id: mapId }) };
    const response = await POST(request, params);
    expect(response.status).toBe(201);
  });
});

describe('Buscando todos os pontos', () => {
  // ID do mapa que será usado nos testes
  let mapId: string;

  // Cria um mapa e alguns pontos antes de todos os testes
  beforeAll(async () => {
    await testHelper.cleanDatabase();
    // Cria um mapa para associar os pontos
    const result = await connection.query(
      'INSERT INTO maps (name, description) VALUES ($1, $2) RETURNING id',
      ['Mapa para GET', 'Mapa para testar busca de pontos']
    );
    mapId = result.rows[0].id;

    // Cria pontos para o mapa
    await connection.query(
      'INSERT INTO points (map_id, name, description, location) VALUES ($1, $2, $3, POINT($4, $5))',
      [mapId, 'Ponto 1', 'Descrição 1', -46.6333, -23.5505]
    );
    await connection.query(
      'INSERT INTO points (map_id, name, description, location) VALUES ($1, $2, $3, POINT($4, $5))',
      [mapId, 'Ponto 2', null, -46.6544, -23.5629]
    );
  });

  // Teste: deve retornar todos os pontos
  it('deve retornar todos os pontos', async () => {
    const request = new Request(`http://localhost/api/maps/${mapId}/points`);
    const params = { params: Promise.resolve({ id: mapId }) };
    const response = await GET(request, params);
    expect(response.status).toBe(200);

    const points = await response.json();
    expect(points).toHaveLength(2);

    // Verifica se os pontos têm os campos esperados
    points.forEach(
      (point: {
        id: string;
        map_id: string;
        name: string;
        location: { longitude: number; latitude: number };
      }) => {
        expect(uuid.validate(point.id)).toBe(true);
        expect(point.map_id).toBe(mapId);
        expect(point.name).toBeDefined();
        expect(point.location).toBeDefined();
        expect(point.location.longitude).toBeDefined();
        expect(point.location.latitude).toBeDefined();
      }
    );
  });

  // Teste: deve retornar lista vazia se não houver pontos
  it('deve retornar lista vazia se não houver pontos', async () => {
    // Limpa os pontos
    await connection.query('DELETE FROM points');

    const request = new Request(`http://localhost/api/maps/${mapId}/points`);
    const params = { params: Promise.resolve({ id: mapId }) };
    const response = await GET(request, params);
    expect(response.status).toBe(200);

    const points = await response.json();
    expect(points).toHaveLength(0);
  });
});
