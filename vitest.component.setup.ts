import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

/**
 * Setup para testes de componentes React.
 *
 * Importa os matchers do jest-dom para uso com Vitest.
 * Isso adiciona matchers como:
 * - toBeInTheDocument()
 * - toHaveTextContent()
 * - toBeVisible()
 * - toBeDisabled()
 * - toHaveClass()
 * - etc.
 */

// Limpa o DOM após cada teste para evitar vazamento entre testes
afterEach(() => {
  cleanup();
});
