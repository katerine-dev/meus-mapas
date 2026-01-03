import { describe, it, expect } from 'vitest';
import { validateMapData, MAP_VALIDATION } from './map';

/**
 * Testes para a função validateMapData.
 * Utiliza o padrão it.each() para evitar duplicação de código nos casos de teste.
 * Valida os campos 'name' (obrigatório) e 'description' (opcional).
 */
describe('validateMapData', () => {
  // Testes para o campo 'name' - obrigatório, 1-100 caracteres
  describe('campo name', () => {
    // Testa cenários onde name deve ser rejeitado (vazio ou apenas espaços)
    it.each([
      { name: '', desc: 'vazio', expectedMessage: 'Nome é obrigatório' },
      { name: '   ', desc: 'apenas espaços', expectedMessage: 'Nome é obrigatório' },
    ])('deve retornar erro quando name está $desc', ({ name, expectedMessage }) => {
      const errors = validateMapData(name, 'descrição');

      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('name');
      expect(errors[0].message).toBe(expectedMessage);
    });

    // Testa se name muito longo é rejeitado
    it('deve retornar erro quando name excede o limite', () => {
      const errors = validateMapData('a'.repeat(MAP_VALIDATION.NAME_MAX_LENGTH + 1), 'descrição');

      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('name');
      expect(errors[0].message).toContain(`no máximo ${MAP_VALIDATION.NAME_MAX_LENGTH} caracteres`);
    });

    // Testa valores nos limites válidos (boundary testing)
    it.each([
      { name: 'a', desc: 'mínimo (1 caractere)' },
      { name: 'a'.repeat(100), desc: 'máximo (100 caracteres)' },
    ])('deve aceitar name no limite $desc', ({ name }) => {
      const errors = validateMapData(name, 'descrição');
      expect(errors).toHaveLength(0);
    });
  });

  // Testes para o campo 'description' - opcional, máximo 40 caracteres
  describe('campo description', () => {
    // Description é opcional, então vazio deve ser aceito
    it('deve aceitar description vazia', () => {
      const errors = validateMapData('Meu Mapa', '');
      expect(errors).toHaveLength(0);
    });

    // Testa se description muito longa é rejeitada
    it('deve retornar erro quando description excede o limite', () => {
      const errors = validateMapData(
        'Meu Mapa',
        'a'.repeat(MAP_VALIDATION.DESCRIPTION_MAX_LENGTH + 1)
      );

      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('description');
      expect(errors[0].message).toContain(
        `no máximo ${MAP_VALIDATION.DESCRIPTION_MAX_LENGTH} caracteres`
      );
    });

    // Testa boundary: exatamente no limite máximo deve ser aceito
    it('deve aceitar description no limite máximo', () => {
      const errors = validateMapData('Meu Mapa', 'a'.repeat(MAP_VALIDATION.DESCRIPTION_MAX_LENGTH));
      expect(errors).toHaveLength(0);
    });
  });

  // Testes de integração: múltiplos campos + caso de sucesso
  describe('validação completa', () => {
    // Garante que todos os erros são retornados de uma vez (não para no primeiro)
    it('deve retornar múltiplos erros quando name e description são inválidos', () => {
      const errors = validateMapData('', 'a'.repeat(MAP_VALIDATION.DESCRIPTION_MAX_LENGTH + 1));

      expect(errors).toHaveLength(2);
      expect(errors.map((e) => e.field)).toContain('name');
      expect(errors.map((e) => e.field)).toContain('description');
    });

    // Smoke test: dados típicos devem passar
    it('deve aceitar dados válidos', () => {
      const errors = validateMapData('Meu Mapa', 'Uma descrição válida');
      expect(errors).toHaveLength(0);
    });
  });
});
