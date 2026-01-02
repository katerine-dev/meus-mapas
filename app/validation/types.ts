import { z } from 'zod';

export interface ValidationError {
  field: string;
  message: string;
}

export function zodErrorToValidationErrors(error: z.ZodError): ValidationError[] {
  const errors: ValidationError[] = [];
  const seenFields = new Set<string>();

  for (const issue of error.issues) {
    const field = issue.path[0]?.toString() || 'unknown';
    if (!seenFields.has(field)) {
      seenFields.add(field);
      errors.push({ field, message: issue.message });
    }
  }

  return errors;
}
