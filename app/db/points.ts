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

  // Insere o ponto e retorna o ID gerado
  const result = await connection.query(
    `INSERT INTO points (map_id, name, description, latitude, longitude)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [map_id, name, description, latitude, longitude]
  );

  return result.rows[0].id;
}

// Função que busca todos os pontos de um mapa específico
export async function getPointsByMapId(mapId: string): Promise<Point[]> {
  const result = await connection.query(
    'SELECT * FROM points WHERE map_id = $1 ORDER BY created_at DESC',
    [mapId]
  );
  return result.rows;
}
