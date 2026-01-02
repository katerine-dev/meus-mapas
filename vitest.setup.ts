import { Pool } from 'pg';
import { config } from 'dotenv';
import { DatabaseError, PG_DATABASE_EXISTS } from '@/app/db/errors';

config({ path: '.env.test' });
// Função de setup global executada uma vez antes de todos os testes
export default async function setup() {
  // Conecta ao banco postgres (padrão) para criar o banco de teste
  const adminPool = new Pool({
    connectionString: process.env.DATABASE_URL?.replace(/\/[^/]+$/, '/postgres'), // substitui a base pela do postgres
  });
  try {
    await adminPool.query('CREATE DATABASE meusmapas_test');
  } catch (e) {
    // Se o erro for '42P04' (banco de dados já existe), ignora
    // Qualquer outro erro é propagado
    if ((e as DatabaseError).code !== PG_DATABASE_EXISTS) throw e;
  }

  await adminPool.end();

  // Executa as migrações no banco de dados de teste
  // Importa dinamicamente o runner de migrações
  const { default: runner } = await import('node-pg-migrate');
  // Executa todas as migrações
  await runner({
    databaseUrl: process.env.DATABASE_URL!,
    // Diretório onde estão os arquivos de migração
    dir: 'migrations',
    // Direção: 'up' executa as migrações para frente
    direction: 'up',
    // Nome da tabela que armazena o histórico de migrações
    migrationsTable: 'pgmigrations',
    // Função de log vazia para suprimir mensagens de log
    log: () => {},
  });

  // Retorna a função de teardown que será executada após todos os testes
  return async () => {
    const connection = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    await connection.end();
  };
}
