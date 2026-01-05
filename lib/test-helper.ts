import connection from '@/app/api/db/connection';
import { faker } from '@faker-js/faker';
import type { Map } from '@/app/model/map';
import type { Point } from '@/app/model/point';

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
// Use { name: 'Nome' } para especificar o nome do mapa
export async function insertMap(overrides: { deletedAt?: Date; name?: string } = {}): Promise<Map> {
  const deletedAt = overrides.deletedAt ?? null;
  const name = overrides.name ?? faker.location.city();
  const description = faker.lorem.sentence();
  const result = await connection.query(
    'INSERT INTO maps (name, description, deleted_at) VALUES ($1, $2, $3) RETURNING *',
    [name, description, deletedAt]
  );

  const row = result.rows[0];
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    pointsCount: 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

// ============================================
// Helpers para geração de massa de dados - Points
// ============================================

// Insere um ponto no banco via SQL e retorna os dados gerados
// Use { deletedAt: new Date() } para criar um ponto já deletado
// Use { name: 'Nome' } para especificar o nome do ponto
export async function insertPoint(
  mapId: string,
  overrides: { deletedAt?: Date; name?: string } = {}
): Promise<Point> {
  const name = overrides.name ?? faker.location.street();
  const latitude = faker.location.latitude();
  const longitude = faker.location.longitude();
  const deletedAt = overrides.deletedAt ?? null;

  const result = await connection.query(
    'INSERT INTO points (map_id, name, location, deleted_at) VALUES ($1, $2, POINT($3, $4), $5) RETURNING *',
    [mapId, name, longitude, latitude, deletedAt]
  );

  const row = result.rows[0];
  const location = row.location;
  return {
    id: row.id,
    mapId: row.map_id,
    name: row.name,
    location: { longitude: location.x, latitude: location.y },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}
