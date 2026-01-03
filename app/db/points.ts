import connection from './connection';
import { Point } from '@/app/model/point';
import * as errors from './errors';

interface CreatePointData {
  mapId: string;
  name: string;
  latitude: number;
  longitude: number;
}

// Helper para mapear row do banco para objeto Point
function mapRowToPoint(row: Record<string, unknown>): Point {
  const location = row.location as { x: number; y: number };
  return {
    id: row.id as string,
    mapId: row.map_id as string,
    name: row.name as string,
    location: { longitude: location.x, latitude: location.y },
    createdAt: row.created_at as Date,
    updatedAt: row.updated_at as Date,
    deletedAt: row.deleted_at as Date | null,
  };
}

// Função que cria um novo ponto no banco de dados
export async function createPoint(data: CreatePointData): Promise<string> {
  const { mapId: mapId, name, latitude, longitude } = data;

  try {
    // Insere o ponto usando a função POINT(longitude, latitude)
    // O PostgreSQL POINT usa formato (x, y) onde x=longitude, y=latitude
    const result = await connection.query(
      `INSERT INTO points (map_id, name, location)
       VALUES ($1, $2, POINT($3, $4))
       RETURNING id`,
      [mapId, name, longitude, latitude]
    );

    return result.rows[0].id;
  } catch (error) {
    if ((error as errors.DatabaseError).code === errors.PG_UNIQUE_VIOLATION) {
      throw new errors.DuplicateNameError();
    }
    throw error;
  }
}

// Função que busca todos os pontos de um mapa específico
export async function getPointsByMapId(mapId: string): Promise<Point[]> {
  // Retorna apenas registros ativos (deleted_at IS NULL)
  const result = await connection.query(
    `SELECT * FROM points WHERE map_id = $1 AND deleted_at IS NULL ORDER BY created_at DESC`,
    [mapId]
  );

  return result.rows.map(mapRowToPoint);
}

// Função que busca todos os pontos
export async function getAllPoints(): Promise<Point[]> {
  const result = await connection.query(
    `SELECT * FROM points WHERE deleted_at IS NULL ORDER BY created_at DESC`
  );

  return result.rows.map(mapRowToPoint);
}

// Função que busca um ponto específico pelo ID
export async function getPointById(id: string): Promise<Point | null> {
  const result = await connection.query(
    `SELECT * FROM points WHERE id = $1 AND deleted_at IS NULL`,
    [id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return mapRowToPoint(result.rows[0]);
}

interface UpdatePointData {
  id: string;
  name: string;
}

// Função que atualiza um ponto (apenas nome, não permite alterar localização)
export async function updatePoint(data: UpdatePointData): Promise<Point | null> {
  const { id, name } = data;

  try {
    const result = await connection.query(
      `UPDATE points
       SET name = $2, updated_at = NOW()
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING *`,
      [id, name]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return mapRowToPoint(result.rows[0]);
  } catch (error) {
    if ((error as errors.DatabaseError).code === errors.PG_UNIQUE_VIOLATION) {
      throw new errors.DuplicateNameError();
    }
    throw error;
  }
}

/**
 * Soft delete de um ponto.
 * @returns O ponto deletado com deleted_at preenchido, ou null se não encontrado
 */
export async function deletePoint(id: string): Promise<Point | null> {
  const result = await connection.query(
    `UPDATE points
     SET deleted_at = NOW()
     WHERE id = $1 AND deleted_at IS NULL
     RETURNING *`,
    [id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return mapRowToPoint(result.rows[0]);
}
