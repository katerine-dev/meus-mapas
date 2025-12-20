import connection from './connection';
import { Map } from '../model/map';

interface CreateMapData {
  name: string;
  description?: string;
}

export async function getAllMaps(): Promise<Map[]> {
  const result = await connection.query('SELECT * FROM maps ORDER BY created_at DESC');
  return result.rows;
}

export async function createMap(data: CreateMapData): Promise<string> {
  const { name, description } = data;

  const result = await connection.query(
    `INSERT INTO maps (name, description)
     VALUES ($1, $2)
     RETURNING id`,
    [name, description]
  );

  return result.rows[0].id;
}
