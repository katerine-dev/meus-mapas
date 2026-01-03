import { z } from 'zod';
import { ValidationError, zodErrorToValidationErrors } from './types';

export const POINT_VALIDATION = {
  NAME_MIN_LENGTH: 1,
  NAME_MAX_LENGTH: 100,
  LATITUDE_MIN: -90,
  LATITUDE_MAX: 90,
  LONGITUDE_MIN: -180,
  LONGITUDE_MAX: 180,
};

export const CreatePointSchema = z.object({
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

export const UpdatePointSchema = z
  .object({
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
  })
  .passthrough(); // Ignora campos extras (latitude/longitude enviados por engano)

export function validatePointData(data: {
  name?: string;
  latitude?: number;
  longitude?: number;
}): ValidationError[] {
  const result = CreatePointSchema.safeParse(data);

  if (result.success) {
    return [];
  }

  return zodErrorToValidationErrors(result.error);
}

export function validateUpdatePointData(data: Record<string, unknown>): ValidationError[] {
  const result = UpdatePointSchema.safeParse(data);

  if (result.success) {
    return [];
  }

  return zodErrorToValidationErrors(result.error);
}
