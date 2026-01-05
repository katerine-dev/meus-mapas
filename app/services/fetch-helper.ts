import { DuplicateNameError } from '@/lib/errors';

/**
 * Helper para processar respostas de fetch com tratamento padrão de erros.
 * - 409: lança DuplicateNameError
 * - Outros erros: lança Error genérico
 * @param noContent Se true, não tenta parsear JSON (para DELETE)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function handleResponse(response: Response, noContent = false): Promise<any> {
  if (!response.ok) {
    if (response.status === 409) {
      const data = await response.json();
      throw new DuplicateNameError(data.error || 'Nome já existe');
    }
    throw new Error('Erro na requisição');
  }

  if (noContent) {
    return;
  }

  return response.json();
}
