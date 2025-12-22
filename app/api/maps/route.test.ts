import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { POST, GET } from './route';
import * as testHelper from '@/lib/test-helper';
import connection from '@/app/db/connection';
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
});

/* Antes de executar os testes é necessário ter mapas no banco de dados */
describe('Buscando todos os mapas', () => {
  const map1 = { name: 'Mapa 1', description: 'Descrição do mapa 1' };
  const map2 = { name: 'Mapa 2', description: 'Descrição do mapa 2' };
  const map3 = { name: 'Mapa 3', description: null };

  beforeAll(async () => {
    await testHelper.cleanDatabase();
    const query = 'INSERT INTO maps (name, description) VALUES ($1, $2)';
    await connection.query(query, [map1.name, map1.description]);
    await connection.query(query, [map2.name, map2.description]);
    await connection.query(query, [map3.name, map3.description]);
  });

  // Teste: deve retornar todos os mapas com os valores esperados
  it('deve retornar todos os mapas com os valores esperados', async () => {
    const response = await GET();
    expect(response.status).toBe(200);

    const maps = await response.json();
    expect(maps).toHaveLength(3);

    // Verifica os valores (ordenado por created_at DESC, então map3 vem primeiro)
    expect(maps[0].name).toBe(map3.name);
    expect(maps[0].description).toBe(map3.description);

    expect(maps[1].name).toBe(map2.name);
    expect(maps[1].description).toBe(map2.description);

    expect(maps[2].name).toBe(map1.name);
    expect(maps[2].description).toBe(map1.description);

    // Verifica se todos os mapas têm id e timestamps como strings
    maps.forEach((map: { id: string; created_at: string; updated_at: string }) => {
      expect(uuid.validate(map.id)).toBe(true);
      expect(typeof map.created_at).toBe('string');
      expect(typeof map.updated_at).toBe('string');
    });
  });
});
