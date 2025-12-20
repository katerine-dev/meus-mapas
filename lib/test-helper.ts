import connection from '@/app/db/connection';

// Função auxiliar para criar uma requisição POST para testes
export function post(url: string, body: object) {
  return new Request(`http://localhost${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// Função para limpar todas as tabelas do banco de dados de teste
export async function cleanDatabase() {
  // Consulta todas as tabelas do schema 'public', excluindo a tabela de migrações
  const { rows } = await connection.query(`
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public' AND tablename != 'pgmigrations'
  `);

  // Se houver tabelas para limpar
  if (rows.length > 0) {
    // Junta todos os nomes de tabelas em uma string separada por vírgulas
    const tables = rows.map((r) => r.tablename).join(', ');
    // Executa TRUNCATE em todas as tabelas de uma vez
    // RESTART IDENTITY reseta sequências/auto-increment
    // CASCADE remove dados de tabelas relacionadas
    await connection.query(`TRUNCATE ${tables} RESTART IDENTITY CASCADE`);
  }
}
