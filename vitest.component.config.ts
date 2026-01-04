import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

/**
 * Configuração do Vitest para testes de componentes React.
 *
 * Esta configuração é separada da principal (vitest.config.ts) porque:
 * 1. Usa happy-dom como ambiente (simula o DOM no Node.js, compatível com ESM)
 * 2. Não precisa do setup do banco de dados
 * 3. Pode rodar em paralelo (não há conflitos de estado)
 */
export default defineConfig({
  plugins: [react()],
  test: {
    // Ambiente happy-dom para simular o navegador (compatível com ESM)
    environment: 'happy-dom',
    // Setup específico para componentes (jest-dom matchers)
    setupFiles: ['./vitest.component.setup.ts'],
    // Padrão para encontrar testes de componentes
    include: ['**/*.component.test.{ts,tsx}'],
    // Exclui node_modules e outros diretórios desnecessários
    exclude: ['node_modules', '.next'],
    // Permite rodar em paralelo (componentes não compartilham estado)
    fileParallelism: true,
  },
  resolve: {
    // '@' aponta para a raiz do projeto (caminho absoluto)
    alias: { '@': path.resolve(__dirname, '.') },
  },
});
