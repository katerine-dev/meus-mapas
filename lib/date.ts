/**
 * Formata uma data para o formato brasileiro (DD/MM/YYYY)
 */
export function formatDateBR(date: Date | string): string {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
