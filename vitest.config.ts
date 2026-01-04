import { defineConfig } from 'vitest/config';
import { config } from 'dotenv';

config({ path: '.env.test' });

// Exporta as configurações do Vitest para testes de API/integração
export default defineConfig({
  test: {
    globalSetup: './vitest.setup.ts',
    // Executa os arquivos de teste sequencialmente para evitar conflitos no banco de dados
    fileParallelism: false,
    // Exclui testes de componentes (rodam com vitest.component.config.ts que tem happy-dom)
    exclude: ['node_modules', '.next', '**/*.component.test.{ts,tsx}'],
  },
  resolve: {
    // '@' aponta para a raiz do projeto ('.')
    alias: { '@': '.' },
  },
});
