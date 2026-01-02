import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { POST, GET } from './route';
import * as testHelper from '@/lib/test-helper';
import connection from '@/app/db/connection';
import { Map } from '@/app/model/map';
import { Point } from '@/app/model/point';
import * as uuid from 'uuid';

describe('Criando um novo ponto', () => {
  // Mapa que será usado nos testes
  let map: Map;

  // Cria um mapa antes de todos os testes e limpa o banco
  beforeAll(async () => {
    await testHelper.cleanDatabase();
    map = await testHelper.insertMap();
  });

  // Limpa apenas a tabela de pontos antes de cada teste
  beforeEach(async () => {
    await connection.query('DELETE FROM points');
  });

  // Teste: deve criar um ponto com todos os campos e retornar status 201 com id
  it('deve criar um ponto com todos os campos e retornar 201 com id', async () => {
    // Cria uma requisição POST com todos os campos obrigatórios
    const request = testHelper.post(`/api/maps/${map.id}/points`, {
      name: 'Ponto A',
      latitude: -23.5505199,
      longitude: -46.6333094,
    });

    const params = { params: Promise.resolve({ id: map.id }) };
    const response = await POST(request, params);
    expect(response.status).toBe(201);
    const body = await response.json();
    // Verifica se o id retornado é um UUID válido
    expect(uuid.validate(body.id)).toBe(true);
  });

  // Teste: deve retornar 409 se o nome do ponto já existir no mesmo mapa
  it('deve retornar 409 se o nome do ponto já existir no mesmo mapa', async () => {
    const point = await testHelper.insertPoint(map.id);

    const request = testHelper.post(`/api/maps/${map.id}/points`, {
      name: point.name,
      latitude: -23.5629,
      longitude: -46.6544,
    });

    const params = { params: Promise.resolve({ id: map.id }) };
    const response = await POST(request, params);
    expect(response.status).toBe(409); // 409 = Conflict
  });

  // Teste: deve retornar 400 se name estiver faltando
  it('deve retornar 400 se name estiver faltando', async () => {
    const request = testHelper.post(`/api/maps/${map.id}/points`, {
      latitude: -23.5629,
      longitude: -46.6544,
    });

    const params = { params: Promise.resolve({ id: map.id }) };
    const response = await POST(request, params);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.errors).toBeDefined();
    expect(body.errors.some((e: { field: string }) => e.field === 'name')).toBe(true);
  });

  // Teste: deve retornar 400 se latitude estiver faltando
  it('deve retornar 400 se latitude estiver faltando', async () => {
    const request = testHelper.post(`/api/maps/${map.id}/points`, {
      name: 'Ponto D',
      longitude: -46.6544,
    });

    const params = { params: Promise.resolve({ id: map.id }) };
    const response = await POST(request, params);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.errors).toBeDefined();
    expect(body.errors.some((e: { field: string }) => e.field === 'latitude')).toBe(true);
  });

  // Teste: deve retornar 400 se longitude estiver faltando
  it('deve retornar 400 se longitude estiver faltando', async () => {
    const request = testHelper.post(`/api/maps/${map.id}/points`, {
      name: 'Ponto E',
      latitude: -23.5629,
    });

    const params = { params: Promise.resolve({ id: map.id }) };
    const response = await POST(request, params);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.errors).toBeDefined();
    expect(body.errors.some((e: { field: string }) => e.field === 'longitude')).toBe(true);
  });

  // Teste: deve retornar 404 se o mapa não existir
  it('deve retornar 404 se o mapa não existir', async () => {
    const fakeMapId = '00000000-0000-0000-0000-000000000000';
    const request = testHelper.post(`/api/maps/${fakeMapId}/points`, {
      name: 'Ponto X',
      latitude: -23.5629,
      longitude: -46.6544,
    });

    const params = { params: Promise.resolve({ id: fakeMapId }) };
    const response = await POST(request, params);
    expect(response.status).toBe(404);
  });

  // Teste: deve retornar 404 se o mapa estiver deletado
  it('deve retornar 404 se o mapa estiver deletado', async () => {
    const deletedMap = await testHelper.insertMap({ deletedAt: new Date() });

    const request = testHelper.post(`/api/maps/${deletedMap.id}/points`, {
      name: 'Ponto Y',
      latitude: -23.5629,
      longitude: -46.6544,
    });

    const params = { params: Promise.resolve({ id: deletedMap.id }) };
    const response = await POST(request, params);
    expect(response.status).toBe(404);
  });

  // Teste: deve aceitar latitude e longitude com valores negativos
  it('deve aceitar latitude e longitude com valores negativos', async () => {
    const request = testHelper.post(`/api/maps/${map.id}/points`, {
      name: 'Ponto F',
      latitude: -90.0,
      longitude: -180.0,
    });

    const params = { params: Promise.resolve({ id: map.id }) };
    const response = await POST(request, params);
    expect(response.status).toBe(201);
  });

  // Teste: deve aceitar latitude e longitude com valores positivos
  it('deve aceitar latitude e longitude com valores positivos', async () => {
    const request = testHelper.post(`/api/maps/${map.id}/points`, {
      name: 'Ponto G',
      latitude: 90.0,
      longitude: 180.0,
    });

    const params = { params: Promise.resolve({ id: map.id }) };
    const response = await POST(request, params);
    expect(response.status).toBe(201);
  });

  // Teste: deve aceitar latitude e longitude zero
  it('deve aceitar latitude e longitude zero', async () => {
    const request = testHelper.post(`/api/maps/${map.id}/points`, {
      name: 'Ponto H',
      latitude: 0,
      longitude: 0,
    });

    const params = { params: Promise.resolve({ id: map.id }) };
    const response = await POST(request, params);
    expect(response.status).toBe(201);
  });
});

describe('Buscando todos os pontos', () => {
  // Mapa e pontos que serão usados nos testes
  let map: Map;
  let point1: Point;
  let point2: Point;

  // Cria um mapa e alguns pontos antes de todos os testes
  beforeAll(async () => {
    await testHelper.cleanDatabase();
    map = await testHelper.insertMap();
    point1 = await testHelper.insertPoint(map.id);
    point2 = await testHelper.insertPoint(map.id);
  });

  // Teste: deve retornar todos os pontos
  it('deve retornar todos os pontos', async () => {
    const request = testHelper.get(`/api/maps/${map.id}/points`);
    const params = { params: Promise.resolve({ id: map.id }) };
    const response = await GET(request, params);
    expect(response.status).toBe(200);

    const points = await response.json();
    expect(points).toHaveLength(2);

    // Ordenado por created_at DESC, então point2 vem primeiro
    expect(points[0].name).toBe(point2.name);
    expect(points[0].location.longitude).toBeCloseTo(point2.location.longitude, 4);
    expect(points[0].location.latitude).toBeCloseTo(point2.location.latitude, 4);
    expect(points[0].deletedAt).toBeNull();

    expect(points[1].name).toBe(point1.name);
    expect(points[1].location.longitude).toBeCloseTo(point1.location.longitude, 4);
    expect(points[1].location.latitude).toBeCloseTo(point1.location.latitude, 4);
    expect(points[1].deletedAt).toBeNull();

    points.forEach((point: { createdAt: string; updatedAt: string }) => {
      expect(typeof point.createdAt).toBe('string');
      expect(typeof point.updatedAt).toBe('string');
    });
  });

  // Teste: deve retornar lista vazia se não houver pontos
  it('deve retornar lista vazia se não houver pontos', async () => {
    // Limpa os pontos
    await connection.query('DELETE FROM points');

    const request = testHelper.get(`/api/maps/${map.id}/points`);
    const params = { params: Promise.resolve({ id: map.id }) };
    const response = await GET(request, params);
    expect(response.status).toBe(200);

    const points = await response.json();
    expect(points).toHaveLength(0);
  });

  // Teste: não deve retornar pontos deletados por padrão
  it('não deve retornar pontos deletados por padrão', async () => {
    // Recria os pontos
    const newPoint1 = await testHelper.insertPoint(map.id);
    await testHelper.insertPoint(map.id, { deletedAt: new Date() });

    const request = testHelper.get(`/api/maps/${map.id}/points`);
    const params = { params: Promise.resolve({ id: map.id }) };
    const response = await GET(request, params);
    expect(response.status).toBe(200);

    const points = await response.json();
    expect(points).toHaveLength(1);
    expect(points[0].name).toBe(newPoint1.name);
  });

  // Teste: deve retornar 404 se o mapa não existir
  it('deve retornar 404 se o mapa não existir', async () => {
    const fakeMapId = '00000000-0000-0000-0000-000000000000';
    const request = testHelper.get(`/api/maps/${fakeMapId}/points`);
    const params = { params: Promise.resolve({ id: fakeMapId }) };
    const response = await GET(request, params);
    expect(response.status).toBe(404);
  });
});
