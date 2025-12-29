import connection from './connection';
import { Point } from '../model/point';

interface CreatePointData {
  map_id: string;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
}

// Função que cria um novo ponto no banco de dados
export async function createPoint(data: CreatePointData): Promise<string> {
  const { map_id, name, description, latitude, longitude } = data;

  // Insere o ponto usando a função POINT(longitude, latitude)
  // O PostgreSQL POINT usa formato (x, y) onde x=longitude, y=latitude
  const result = await connection.query(
    `INSERT INTO points (map_id, name, description, location)
     VALUES ($1, $2, $3, POINT($4, $5))
     RETURNING id`,
    [map_id, name, description, longitude, latitude]
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
