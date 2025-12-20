import { describe, it, expect, afterAll, beforeEach } from 'vitest';
import { POST } from './route';
import * as testHelper from '@/lib/test-helper';
import connection from '@/app/db/connection';
import * as uuid from 'uuid';

/* Antes de qualquer execução dos testes precisamos verificar se o banco de dados
 está limpo, evitano que os teste se interfiram */

describe('Criando um novo mapa', () => {
  // Executa antes de cada teste individual
  beforeEach(async () => {
    // Limpa todas as tabelas do banco de dados de teste
    await testHelper.cleanDatabase();
  });
  afterAll(async () => {
    await connection.end();
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
    const json = await response.json();
    // Verifica se o id retornado é uma string
    expect(uuid.validate(json.id)).toBe(true);
  });

  // Teste: deve criar um mapa sem descrição
  it('deve criar um mapa sem descrição', async () => {
    const request = testHelper.post('/api/maps', {
      name: 'Outro Mapa',
    });

    const response = await POST(request);
    expect(response.status).toBe(201);
    const json = await response.json();
    expect(uuid.validate(json.id)).toBe(true);
  });
});
