import { describe, it, expect } from 'vitest';
import { validatePointData, validateUpdatePointData, POINT_VALIDATION } from './point';

/**
 * Testes para as funções de validação de pontos.
 * Utiliza o padrão it.each() e objeto VALID_POINT para reduzir duplicação.
 * - validatePointData: valida criação (name, latitude, longitude obrigatórios)
 * - validateUpdatePointData: valida atualização (apenas name pode ser alterado)
 */

// Dados base válidos - usado com spread operator para criar variações
const VALID_POINT = {
  name: 'Meu Ponto',
  latitude: -23.5505,
  longitude: -46.6333,
};

// Testes para criação de pontos - todos os campos são obrigatórios
describe('validatePointData (criação)', () => {
  // Campo 'name' - obrigatório, 1-100 caracteres, trim aplicado
  describe('campo name', () => {
    // Testa cenários onde name deve ser rejeitado
    it.each([
      { name: '', desc: 'vazio' },
      { name: '   ', desc: 'apenas espaços' },
    ])('deve retornar erro quando name está $desc', ({ name }) => {
      const errors = validatePointData({ ...VALID_POINT, name });

      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('name');
      expect(errors[0].message).toBe('Nome é obrigatório');
    });

    // Testa se name muito longo é rejeitado
    it('deve retornar erro quando name excede o limite', () => {
      const errors = validatePointData({
        ...VALID_POINT,
        name: 'a'.repeat(POINT_VALIDATION.NAME_MAX_LENGTH + 1),
      });

      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('name');
      expect(errors[0].message).toContain(
        `no máximo ${POINT_VALIDATION.NAME_MAX_LENGTH} caracteres`
      );
    });

    // Testa valores nos limites válidos (boundary testing)
    // Inclui teste de trim para garantir que espaços são removidos antes da validação
    it.each([
      { name: 'a', desc: 'mínimo (1 caractere)' },
      { name: 'a'.repeat(100), desc: 'máximo (100 caracteres)' },
      { name: '  ponto  ', desc: 'com espaços (trim)' },
    ])('deve aceitar name no limite $desc', ({ name }) => {
      const errors = validatePointData({ ...VALID_POINT, name });
      expect(errors).toHaveLength(0);
    });
  });

  // Campo 'latitude' - obrigatório, range: -90 a 90 (graus)
  describe('campo latitude', () => {
    // Latitude é obrigatória para criar um ponto
    it('deve retornar erro quando latitude não é informada', () => {
      const errors = validatePointData({ name: 'Ponto', longitude: -46.6333 });

      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('latitude');
    });

    // Testa valores fora do range válido (-90 a 90)
    it.each([
      { latitude: -91, desc: 'menor que -90', expectedMsg: 'no mínimo -90' },
      { latitude: 91, desc: 'maior que 90', expectedMsg: 'no máximo 90' },
    ])('deve retornar erro quando latitude é $desc', ({ latitude, expectedMsg }) => {
      const errors = validatePointData({ ...VALID_POINT, latitude });

      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('latitude');
      expect(errors[0].message).toContain(expectedMsg);
    });

    // Boundary testing: exatamente nos limites deve ser aceito
    it.each([
      { latitude: POINT_VALIDATION.LATITUDE_MIN, desc: 'mínimo (-90)' },
      { latitude: POINT_VALIDATION.LATITUDE_MAX, desc: 'máximo (90)' },
    ])('deve aceitar latitude no limite $desc', ({ latitude }) => {
      const errors = validatePointData({ ...VALID_POINT, latitude });
      expect(errors).toHaveLength(0);
    });
  });

  // Campo 'longitude' - obrigatório, range: -180 a 180 (graus)
  describe('campo longitude', () => {
    // Longitude é obrigatória para criar um ponto
    it('deve retornar erro quando longitude não é informada', () => {
      const errors = validatePointData({ name: 'Ponto', latitude: -23.5505 });

      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('longitude');
    });

    // Testa valores fora do range válido (-180 a 180)
    it.each([
      { longitude: -181, desc: 'menor que -180', expectedMsg: 'no mínimo -180' },
      { longitude: 181, desc: 'maior que 180', expectedMsg: 'no máximo 180' },
    ])('deve retornar erro quando longitude é $desc', ({ longitude, expectedMsg }) => {
      const errors = validatePointData({ ...VALID_POINT, longitude });

      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('longitude');
      expect(errors[0].message).toContain(expectedMsg);
    });

    // Boundary testing: exatamente nos limites deve ser aceito
    it.each([
      { longitude: POINT_VALIDATION.LONGITUDE_MIN, desc: 'mínimo (-180)' },
      { longitude: POINT_VALIDATION.LONGITUDE_MAX, desc: 'máximo (180)' },
    ])('deve aceitar longitude no limite $desc', ({ longitude }) => {
      const errors = validatePointData({ ...VALID_POINT, longitude });
      expect(errors).toHaveLength(0);
    });
  });

  // Testes de integração: múltiplos campos + caso de sucesso
  describe('validação completa', () => {
    // Garante que todos os erros são retornados de uma vez (não para no primeiro)
    it('deve retornar múltiplos erros quando vários campos são inválidos', () => {
      const errors = validatePointData({ name: '', latitude: -91, longitude: 181 });

      expect(errors.length).toBeGreaterThanOrEqual(3);
      expect(errors.map((e) => e.field)).toContain('name');
      expect(errors.map((e) => e.field)).toContain('latitude');
      expect(errors.map((e) => e.field)).toContain('longitude');
    });

    // Smoke test: dados típicos devem passar
    it('deve aceitar dados válidos', () => {
      const errors = validatePointData(VALID_POINT);
      expect(errors).toHaveLength(0);
    });
  });
});

// Testes para atualização de pontos - apenas 'name' pode ser alterado
// Localização (latitude/longitude) é imutável após criação
describe('validateUpdatePointData (atualização)', () => {
  // Testes para campos que podem ser alterados
  describe('campos permitidos', () => {
    // Name é o único campo editável
    it('deve aceitar atualização com name válido', () => {
      const errors = validateUpdatePointData({ name: 'Novo Nome' });
      expect(errors).toHaveLength(0);
    });

    // Mesmo na atualização, name continua obrigatório
    it('deve retornar erro quando name está vazio', () => {
      const errors = validateUpdatePointData({ name: '' });

      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('name');
    });
  });

  // Testes para campos que NÃO podem ser alterados (imutáveis)
  // A localização de um ponto é definida na criação e não pode mudar
  describe('campos proibidos', () => {
    // Testa cada campo imutável individualmente
    it.each([
      { field: 'latitude', value: -23.5505, expectedMsg: 'Não é permitido alterar a latitude' },
      { field: 'longitude', value: -46.6333, expectedMsg: 'Não é permitido alterar a longitude' },
    ])('deve retornar erro ao tentar alterar $field', ({ field, value, expectedMsg }) => {
      const errors = validateUpdatePointData({ name: 'Novo Nome', [field]: value });

      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe(field);
      expect(errors[0].message).toContain(expectedMsg);
    });

    // Garante que ambos os erros são retornados quando os dois campos são enviados
    it('deve retornar erros para latitude e longitude juntos', () => {
      const errors = validateUpdatePointData({
        name: 'Novo Nome',
        latitude: -23.5505,
        longitude: -46.6333,
      });

      expect(errors).toHaveLength(2);
      expect(errors.map((e) => e.field)).toContain('latitude');
      expect(errors.map((e) => e.field)).toContain('longitude');
    });
  });
});
