import connection from './connection';

interface CreateMapData {
  name: string;
  description?: string;
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
