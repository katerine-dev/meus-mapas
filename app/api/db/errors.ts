export const PG_UNIQUE_VIOLATION = '23505';
export const PG_DATABASE_EXISTS = '42P04';

export interface DatabaseError {
  code: string;
}
