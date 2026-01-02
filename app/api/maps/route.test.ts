import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { POST, GET } from './route';
import * as testHelper from '@/lib/test-helper';
import connection from '@/app/db/connection';
import { Map } from '@/app/model/map';
import * as uuid from 'uuid';

describe('Criando um novo mapa', () => {
  // Limpa o banco antes de cada teste de criação
  beforeEach(async () => {
    await testHelper.cleanDatabase();
  });

  // Teste: deve criar um mapa e retornar status 201 com id
  it('deve criar um mapa e retornar 201 com id', async () => {
    // Cria uma requisição POST com nome e descrição
    const request = testHelper.post('/api/maps', {
      name: 'Meu Mapa',
      description: 'Descrição',
    });

    const response = await POST(request);
    expect(response.status).toBe(201);
    const body = await response.json();
    // Verifica se o id retornado é um UUID válido
    expect(uuid.validate(body.id)).toBe(true);
  });

  // Teste: deve criar um mapa sem descrição
  it('deve criar um mapa sem descrição', async () => {
    const request = testHelper.post('/api/maps', {
      name: 'Outro Mapa',
    });

    const response = await POST(request);
    expect(response.status).toBe(201);
    const body = await response.json();
    expect(uuid.validate(body.id)).toBe(true);
  });

  // Teste: deve retornar 409 se o nome do mapa já existir
  it('deve retornar 409 se o nome do mapa já existir', async () => {
    const map = await testHelper.insertMap();

    const request = testHelper.post('/api/maps', {
      name: map.name,
    });

    const response = await POST(request);
    expect(response.status).toBe(409); // 409 = Conflict
  });
});

/* Antes de executar os testes é necessário ter mapas no banco de dados */
describe('Buscando todos os mapas', () => {
  let map1: Map;
  let map2: Map;
  let map3: Map;

  beforeAll(async () => {
    await testHelper.cleanDatabase();
    map1 = await testHelper.insertMap();
    map2 = await testHelper.insertMap();
    map3 = await testHelper.insertMap();
  });

  // Teste: deve retornar todos os mapas com os valores esperados
  it('deve retornar todos os mapas com os valores esperados', async () => {
    const request = testHelper.get('/api/maps');
    const response = await GET(request);
    expect(response.status).toBe(200);

    const maps = await response.json();
    expect(maps).toHaveLength(3);

    // Verifica os valores (ordenado por createdAt DESC, então map3 vem primeiro)
    expect(maps[0].name).toBe(map3.name);
    expect(maps[0].description).toBe(map3.description);

    expect(maps[1].name).toBe(map2.name);
    expect(maps[1].description).toBe(map2.description);

    expect(maps[2].name).toBe(map1.name);
    expect(maps[2].description).toBe(map1.description);

    // Verifica se todos os mapas têm id, timestamps e deletedAt null
    maps.forEach((map: { id: string; createdAt: string; updatedAt: string; deletedAt: null }) => {
      expect(uuid.validate(map.id)).toBe(true);
      expect(typeof map.createdAt).toBe('string');
      expect(typeof map.updatedAt).toBe('string');
      expect(map.deletedAt).toBeNull();
    });
  });

  // Teste: não deve retornar mapas deletados por padrão
  it('não deve retornar mapas deletados por padrão', async () => {
    // Faz soft delete de um mapa
    await connection.query('UPDATE maps SET deleted_at = NOW() WHERE id = $1', [map1.id]);

    const request = testHelper.get('/api/maps');
    const response = await GET(request);
    expect(response.status).toBe(200);

    const maps = await response.json();
    expect(maps).toHaveLength(2);
    expect(maps.every((map: { id: string }) => map.id !== map1.id)).toBe(true);
  });
});
