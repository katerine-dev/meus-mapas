import connection from './connection';
import { Map } from '../model/map';

interface CreateMapData {
  name: string;
  // ? = opcional
  description?: string;
}

interface UpdateMapData {
  id: string;
  name: string;
  description?: string;
}

export async function getAllMaps(): Promise<Map[]> {
  // Ordenados por data de criação (mais recente primeiro)
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

  // Retorna o ID do mapa recém-criado
  return result.rows[0].id;
}

export async function updateMap(data: UpdateMapData): Promise<Map | null> {
  const { id, name, description } = data;

  const result = await connection.query(
    `UPDATE maps
     SET name = $2, description = $3, updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, name, description]
  );

  // Retorna o mapa atualizado ou null se não encontrado
  // O || null garante que retornamos null em vez de undefined
  return result.rows[0] || null;
}

export async function deleteMap(id: string): Promise<boolean> {
  const result = await connection.query(
    `DELETE FROM maps WHERE id = $1`,
    [id]
  );

  // Retorna true se alguma linha foi deletada, false caso contrário
  return result.rowCount !== null && result.rowCount > 0;
}

export async function getMapById(id: string): Promise<Map | null> {
  const result = await connection.query(
    `SELECT * FROM maps WHERE id = $1`,
    [id]
  );

  // Retorna o mapa encontrado ou null se não existir
  return result.rows[0] || null;
}
