export const MAP_VALIDATION = {
  NAME_MIN_LENGTH: 3, // Tamanho mínimo do nome do mapa (3 caracteres)
  NAME_MAX_LENGTH: 100, // Tamanho máximo do nome do mapa (100 caracteres)
  DESCRIPTION_MAX_LENGTH: 500, // Tamanho máximo da descrição do mapa (500 caracteres)
};

export interface ValidationError {
  field: 'name' | 'description';
  message: string;
}

// Função que valida os dados de um mapa e retorna uma lista de erros
export function validateMapData(name: string, description: string): ValidationError[] {
  // Array que armazenará todos os erros encontrados
  const errors: ValidationError[] = [];

  // Validação do campo nome
  // Remove espaços em branco do início e fim para verificar se há conteúdo real
  const trimmedName = name.trim();
  // Verifica se o nome está vazio após o trim
  if (!trimmedName) {
    errors.push({ field: 'name', message: 'Nome é obrigatório' });
    // Verifica se o nome é menor que o tamanho mínimo permitido
  } else if (trimmedName.length < MAP_VALIDATION.NAME_MIN_LENGTH) {
    errors.push({
      field: 'name',
      message: `Nome deve ter pelo menos ${MAP_VALIDATION.NAME_MIN_LENGTH} caracteres`,
    });
    // Verifica se o nome excede o tamanho máximo permitido
  } else if (trimmedName.length > MAP_VALIDATION.NAME_MAX_LENGTH) {
    errors.push({
      field: 'name',
      message: `Nome deve ter no máximo ${MAP_VALIDATION.NAME_MAX_LENGTH} caracteres`,
    });
  }

  // Validação do campo descrição
  // Verifica se a descrição excede o tamanho máximo permitido
  if (description.length > MAP_VALIDATION.DESCRIPTION_MAX_LENGTH) {
    errors.push({
      field: 'description',
      message: `Descrição deve ter no máximo ${MAP_VALIDATION.DESCRIPTION_MAX_LENGTH} caracteres`,
    });
  }

  // Retorna o array de erros (vazio se não houver erros)
  return errors;
}
