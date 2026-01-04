/**
 * Erro lançado quando há tentativa de criar/atualizar um registro
 * com nome que já existe.
 */
export class DuplicateNameError extends Error {
  constructor(message = 'Nome já existe') {
    super(message);
    this.name = 'DuplicateNameError';
  }
}
