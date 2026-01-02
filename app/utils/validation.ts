import { z } from 'zod';

// Constantes de validação
export const MAP_VALIDATION = {
  NAME_MIN_LENGTH: 3,
  NAME_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
};

export const POINT_VALIDATION = {
  NAME_MIN_LENGTH: 1,
  NAME_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
  LATITUDE_MIN: -90,
  LATITUDE_MAX: 90,
  LONGITUDE_MIN: -180,
  LONGITUDE_MAX: 180,
};

// Tipo de erro de validação
export interface ValidationError {
  field: string;
  message: string;
}

// Schema Zod para validação de mapas
export const MapSchema = z.object({
  name: z
    .string()
    .transform((val) => val.trim())
    .refine((val) => val.length > 0, { message: 'Nome é obrigatório' })
    .refine((val) => val.length >= MAP_VALIDATION.NAME_MIN_LENGTH, {
      message: `Nome deve ter pelo menos ${MAP_VALIDATION.NAME_MIN_LENGTH} caracteres`,
    })
    .refine((val) => val.length <= MAP_VALIDATION.NAME_MAX_LENGTH, {
      message: `Nome deve ter no máximo ${MAP_VALIDATION.NAME_MAX_LENGTH} caracteres`,
    }),
  description: z
    .string()
    .max(MAP_VALIDATION.DESCRIPTION_MAX_LENGTH, {
      message: `Descrição deve ter no máximo ${MAP_VALIDATION.DESCRIPTION_MAX_LENGTH} caracteres`,
    })
    .optional()
    .default(''),
});

// Schema Zod para validação de pontos
export const PointSchema = z.object({
  name: z
    .string()
    .transform((val) => val.trim())
    .refine((val) => val.length > 0, { message: 'Nome é obrigatório' })
    .refine((val) => val.length >= POINT_VALIDATION.NAME_MIN_LENGTH, {
      message: `Nome deve ter pelo menos ${POINT_VALIDATION.NAME_MIN_LENGTH} caracteres`,
    })
    .refine((val) => val.length <= POINT_VALIDATION.NAME_MAX_LENGTH, {
      message: `Nome deve ter no máximo ${POINT_VALIDATION.NAME_MAX_LENGTH} caracteres`,
    }),
  description: z
    .string()
    .max(POINT_VALIDATION.DESCRIPTION_MAX_LENGTH, {
      message: `Descrição deve ter no máximo ${POINT_VALIDATION.DESCRIPTION_MAX_LENGTH} caracteres`,
    })
    .optional()
    .default(''),
  latitude: z
    .number({
      message: 'Latitude é obrigatória e deve ser um número',
    })
    .min(POINT_VALIDATION.LATITUDE_MIN, {
      message: `Latitude deve ser no mínimo ${POINT_VALIDATION.LATITUDE_MIN}`,
    })
    .max(POINT_VALIDATION.LATITUDE_MAX, {
      message: `Latitude deve ser no máximo ${POINT_VALIDATION.LATITUDE_MAX}`,
    }),
  longitude: z
    .number({
      message: 'Longitude é obrigatória e deve ser um número',
    })
    .min(POINT_VALIDATION.LONGITUDE_MIN, {
      message: `Longitude deve ser no mínimo ${POINT_VALIDATION.LONGITUDE_MIN}`,
    })
    .max(POINT_VALIDATION.LONGITUDE_MAX, {
      message: `Longitude deve ser no máximo ${POINT_VALIDATION.LONGITUDE_MAX}`,
    }),
});

// Função auxiliar para converter ZodError em ValidationError[]
function zodErrorToValidationErrors(error: z.ZodError): ValidationError[] {
  const errors: ValidationError[] = [];
  const seenFields = new Set<string>();

  for (const issue of error.issues) {
    const field = issue.path[0]?.toString() || 'unknown';
    // Mantém apenas o primeiro erro por campo
    if (!seenFields.has(field)) {
      seenFields.add(field);
      errors.push({ field, message: issue.message });
    }
  }

  return errors;
}

// Função de validação de mapas
export function validateMapData(name: string, description: string): ValidationError[] {
  const result = MapSchema.safeParse({ name, description });

  if (result.success) {
    return [];
  }

  return zodErrorToValidationErrors(result.error);
}

// Função de validação de pontos
export function validatePointData(data: {
  name?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
}): ValidationError[] {
  const result = PointSchema.safeParse(data);

  if (result.success) {
    return [];
  }

  return zodErrorToValidationErrors(result.error);
}
