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

// Opções para consultas que podem incluir registros deletados
interface QueryOptions {
  includeDeleted?: boolean;
}

// Helper para mapear row do banco para objeto Map
function mapRowToMap(row: Record<string, unknown>): Map {
  return {
    id: row.id as string,
    name: row.name as string,
    description: row.description as string | undefined,
    createdAt: row.created_at as Date,
    updatedAt: row.updated_at as Date,
    deletedAt: row.deleted_at as Date | null,
  };
}

export async function getAllMaps(options: QueryOptions = {}): Promise<Map[]> {
  const { includeDeleted = false } = options;

  // Ordenados por data de criação (mais recente primeiro)
  // Por padrão, retorna apenas registros ativos (deleted_at IS NULL)
  const whereClause = includeDeleted ? '' : 'WHERE deleted_at IS NULL';
  const result = await connection.query(
    `SELECT * FROM maps ${whereClause} ORDER BY created_at DESC`
  );

  return result.rows.map(mapRowToMap);
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

  // Só permite atualizar registros que não foram deletados
  const result = await connection.query(
    `UPDATE maps
     SET name = $2, description = $3, updated_at = NOW()
     WHERE id = $1 AND deleted_at IS NULL
     RETURNING *`,
    [id, name, description]
  );

  // Retorna o mapa atualizado ou null se não encontrado (ou já deletado)
  if (result.rows.length === 0) {
    return null;
  }

  return mapRowToMap(result.rows[0]);
}

/**
 * Soft delete de um mapa e todos os seus pontos associados.
 * Executa em uma transação para garantir consistência.
 * @returns O mapa deletado com deleted_at preenchido, ou null se não encontrado
 */
export async function deleteMap(id: string): Promise<Map | null> {
  const client = await connection.connect();

  try {
    await client.query('BEGIN');

    // Primeiro, soft delete do mapa (apenas se não estiver deletado)
    const mapResult = await client.query(
      `UPDATE maps
       SET deleted_at = NOW()
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING *`,
      [id]
    );

    // Se o mapa não existe ou já foi deletado
    if (mapResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return null;
    }

    // Soft delete de todos os pontos associados ao mapa (cascade)
    // Apenas pontos que ainda não foram deletados
    await client.query(
      `UPDATE points
       SET deleted_at = NOW()
       WHERE map_id = $1 AND deleted_at IS NULL`,
      [id]
    );

    await client.query('COMMIT');

    return mapRowToMap(mapResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function getMapById(id: string, options: QueryOptions = {}): Promise<Map | null> {
  const { includeDeleted = false } = options;

  // Por padrão, retorna apenas registros ativos
  const whereClause = includeDeleted ? 'WHERE id = $1' : 'WHERE id = $1 AND deleted_at IS NULL';

  const result = await connection.query(`SELECT * FROM maps ${whereClause}`, [id]);

  // Retorna o mapa encontrado ou null se não existir (ou estiver deletado)
  if (result.rows.length === 0) {
    return null;
  }

  return mapRowToMap(result.rows[0]);
}
