// Opções de ordenação para mapas
export const SORT_OPTIONS = {
  recent: 'Mais recentes',
  oldest: 'Mais antigos',
  az: 'A-Z',
  za: 'Z-A',
} as const;

// Tipo para as chaves de ordenação
export type SortKey = keyof typeof SORT_OPTIONS;

// Valor padrão de ordenação
export const DEFAULT_SORT: SortKey = 'recent';
