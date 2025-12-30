import connection from './connection';
import { Point } from '../model/point';

interface CreatePointData {
  mapId: string;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
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
export async function getPointsByMapId(mapId: string): Promise<Point[]> {
  const result = await connection.query(
    'SELECT * FROM points WHERE map_id = $1 ORDER BY created_at DESC',
    [mapId]
  );
  // PostgreSQL POINT retorna {x: longitude, y: latitude}
  return result.rows.map((row) => ({
    ...row,
    location: { longitude: row.location.x, latitude: row.location.y },
  }));
}

// Função que busca todos os pontos
export async function getAllPoints(): Promise<Point[]> {
  const result = await connection.query('SELECT * FROM points ORDER BY created_at DESC');
  // PostgreSQL POINT retorna {x: longitude, y: latitude}
  return result.rows.map((row) => ({
    ...row,
    location: { longitude: row.location.x, latitude: row.location.y },
  }));
}

// Função que busca um ponto específico pelo ID
export async function getPointById(id: string): Promise<Point | null> {
  const result = await connection.query('SELECT * FROM points WHERE id = $1', [id]);

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    ...row,
    location: { longitude: row.location.x, latitude: row.location.y },
  };
}

interface UpdatePointData {
  id: string;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
}

// Função que atualiza um ponto
export async function updatePoint(data: UpdatePointData): Promise<Point | null> {
  const { id, name, description, latitude, longitude } = data;

  const result = await connection.query(
    `UPDATE points
     SET name = $2, description = $3, location = POINT($4, $5), updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, name, description, longitude, latitude]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    ...row,
    location: { longitude: row.location.x, latitude: row.location.y },
  };
}
