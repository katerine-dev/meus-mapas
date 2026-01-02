import connection from '@/app/db/connection';
import { faker } from '@faker-js/faker';
import type { Map } from '@/app/model/map';

// Função auxiliar para criar uma requisição POST para testes
export function post(url: string, body: object) {
  return new Request(`http://localhost${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// Função auxiliar para criar uma requisição PUT para testes
export function put(url: string, body: object) {
  return new Request(`http://localhost${url}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// Função auxiliar para criar uma requisição GET para testes
export function get(url: string) {
  return new Request(`http://localhost${url}`, {
    method: 'GET',
  });
}

// Função auxiliar para criar uma requisição DELETE para testes
export function del(url: string) {
  return new Request(`http://localhost${url}`, {
    method: 'DELETE',
  });
}

// Função para limpar todas as tabelas do banco de dados de teste
export async function cleanDatabase() {
  // Consulta todas as tabelas do schema 'public', excluindo a tabela de migrações
  const { rows } = await connection.query(`
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public' AND tablename != 'pgmigrations'
  `);

  // Se houver tabelas para limpar
  if (rows.length > 0) {
    // Junta todos os nomes de tabelas em uma string separada por vírgulas
    const tables = rows.map((r) => r.tablename).join(', ');
    // Executa TRUNCATE em todas as tabelas de uma vez
    // RESTART IDENTITY reseta sequências/auto-increment
    // CASCADE remove dados de tabelas relacionadas
    await connection.query(`TRUNCATE ${tables} RESTART IDENTITY CASCADE`);
  }
}
// ============================================
// Helpers para geração de massa de dados - Maps
// ============================================

// Insere um mapa no banco via SQL e retorna os dados gerados
// Use { deletedAt: new Date() } para criar um mapa já deletado
export async function insertMap(overrides: { deletedAt?: Date } = {}): Promise<Map> {
  const deletedAt = overrides.deletedAt ?? null;

  const result = await connection.query(
    'INSERT INTO maps (name, description, deleted_at) VALUES ($1, $2, $3) RETURNING *',
    [faker.location.city(), faker.lorem.sentence(), deletedAt]
  );

  const row = result.rows[0];
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}
