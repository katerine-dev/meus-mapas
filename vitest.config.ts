import { defineConfig } from 'vitest/config';
import { config } from 'dotenv';

config({ path: '.env.test' });

// Exporta as configurações do Vitest
export default defineConfig({
  test: {
    globalSetup: './vitest.setup.ts',
    // Executa os arquivos de teste sequencialmente para evitar conflitos no banco de dados
    fileParallelism: false,
  },
  resolve: {
    // '@' aponta para a raiz do projeto ('.')
    alias: { '@': '.' },
  },
});
