import { Pool } from 'pg';
import { config } from 'dotenv';

config({ path: '.env.test' });

// Função de setup global executada uma vez antes de todos os testes
export default async function setup() {
  // Cria um pool de conexões com o banco de dados de teste
  const adminPool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  try {
    await adminPool.query('CREATE DATABASE meusmapas_test');
  } catch (e: any) {
    // Se o erro for '42P04' (banco de dados já existe), ignora
    // Qualquer outro erro é propagado
    if (e.code !== '42P04') throw e;
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
