import connection from './connection';
import { Point } from '../model/point';

interface CreatePointData {
  mapId: string;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
}

// Opções para consultas que podem incluir registros deletados
interface QueryOptions {
  includeDeleted?: boolean;
}

// Helper para mapear row do banco para objeto Point
function mapRowToPoint(row: Record<string, unknown>): Point {
  const location = row.location as { x: number; y: number };
  return {
    id: row.id as string,
    mapId: row.map_id as string,
    name: row.name as string,
    description: row.description as string | undefined,
    location: { longitude: location.x, latitude: location.y },
    createdAt: row.created_at as Date,
    updatedAt: row.updated_at as Date,
    deletedAt: row.deleted_at as Date | null,
  };
}

// Função que cria um novo ponto no banco de dados
export async function createPoint(data: CreatePointData): Promise<string> {
  const { mapId: mapId, name, description, latitude, longitude } = data;

  // Insere o ponto usando a função POINT(longitude, latitude)
  // O PostgreSQL POINT usa formato (x, y) onde x=longitude, y=latitude
  const result = await connection.query(
    `INSERT INTO points (map_id, name, description, location)
     VALUES ($1, $2, $3, POINT($4, $5))
     RETURNING id`,
    [mapId, name, description, longitude, latitude]
  );

  return result.rows[0].id;
}

// Função que busca todos os pontos de um mapa específico
export async function getPointsByMapId(
  mapId: string,
  options: QueryOptions = {}
): Promise<Point[]> {
  const { includeDeleted = false } = options;

  // Por padrão, retorna apenas registros ativos (deleted_at IS NULL)
  const whereClause = includeDeleted
    ? 'WHERE map_id = $1'
    : 'WHERE map_id = $1 AND deleted_at IS NULL';

  const result = await connection.query(
    `SELECT * FROM points ${whereClause} ORDER BY created_at DESC`,
    [mapId]
  );

  return result.rows.map(mapRowToPoint);
}

// Função que busca todos os pontos
export async function getAllPoints(options: QueryOptions = {}): Promise<Point[]> {
  const { includeDeleted = false } = options;

  const whereClause = includeDeleted ? '' : 'WHERE deleted_at IS NULL';
  const result = await connection.query(
    `SELECT * FROM points ${whereClause} ORDER BY created_at DESC`
  );

  return result.rows.map(mapRowToPoint);
}

// Função que busca um ponto específico pelo ID
export async function getPointById(id: string, options: QueryOptions = {}): Promise<Point | null> {
  const { includeDeleted = false } = options;

  const whereClause = includeDeleted ? 'WHERE id = $1' : 'WHERE id = $1 AND deleted_at IS NULL';

  const result = await connection.query(`SELECT * FROM points ${whereClause}`, [id]);

  if (result.rows.length === 0) {
    return null;
  }

  return mapRowToPoint(result.rows[0]);
}

interface UpdatePointData {
  id: string;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
}

// Função que atualiza um ponto (apenas se não estiver deletado)
export async function updatePoint(data: UpdatePointData): Promise<Point | null> {
  const { id, name, description, latitude, longitude } = data;

  const result = await connection.query(
    `UPDATE points
     SET name = $2, description = $3, location = POINT($4, $5), updated_at = NOW()
     WHERE id = $1 AND deleted_at IS NULL
     RETURNING *`,
    [id, name, description, longitude, latitude]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return mapRowToPoint(result.rows[0]);
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
