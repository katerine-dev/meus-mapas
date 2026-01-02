import { z } from 'zod';
import { ValidationError, zodErrorToValidationErrors } from './types';

export const MAP_VALIDATION = {
  NAME_MIN_LENGTH: 3,
  NAME_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
};

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

export function validateMapData(name: string, description: string): ValidationError[] {
  const result = MapSchema.safeParse({ name, description });

  if (result.success) {
    return [];
  }

  return zodErrorToValidationErrors(result.error);
}
