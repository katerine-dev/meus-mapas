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

// Interface para itens ordenáveis
interface Sortable {
  name: string;
  updatedAt: Date;
}

// Função de comparação para ordenação
export function sortByKey(a: Sortable, b: Sortable, sortKey: SortKey): number {
  switch (sortKey) {
    case 'oldest':
      return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
    case 'az':
      return a.name.localeCompare(b.name);
    case 'za':
      return b.name.localeCompare(a.name);
    default: // 'recent'
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  }
}
