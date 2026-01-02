import { describe, it, expect } from 'vitest';
import { validatePointData, validateUpdatePointData } from './point';

describe('validatePointData (criação)', () => {
  describe('campo name', () => {
    it('deve retornar erro quando name está vazio', () => {
      const errors = validatePointData({
        name: '',
        latitude: -23.5505,
        longitude: -46.6333,
      });

      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('name');
      expect(errors[0].message).toBe('Nome é obrigatório');
    });

    it('deve retornar erro quando name tem apenas espaços', () => {
      const errors = validatePointData({
        name: '   ',
        latitude: -23.5505,
        longitude: -46.6333,
      });

      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('name');
      expect(errors[0].message).toBe('Nome é obrigatório');
    });

    it('deve retornar erro quando name tem mais de 100 caracteres', () => {
      const errors = validatePointData({
        name: 'a'.repeat(101),
        latitude: -23.5505,
        longitude: -46.6333,
      });

      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('name');
      expect(errors[0].message).toContain('no máximo 100 caracteres');
    });

    it('deve aceitar name com exatamente 1 caractere', () => {
      const errors = validatePointData({
        name: 'a',
        latitude: -23.5505,
        longitude: -46.6333,
      });

      expect(errors).toHaveLength(0);
    });

    it('deve aceitar name com exatamente 100 caracteres', () => {
      const errors = validatePointData({
        name: 'a'.repeat(100),
        latitude: -23.5505,
        longitude: -46.6333,
      });

      expect(errors).toHaveLength(0);
    });

    it('deve fazer trim do name antes de validar', () => {
      const errors = validatePointData({
        name: '  ponto  ',
        latitude: -23.5505,
        longitude: -46.6333,
      });

      expect(errors).toHaveLength(0);
    });
  });

  describe('campo latitude', () => {
    it('deve retornar erro quando latitude não é informada', () => {
      const errors = validatePointData({
        name: 'Ponto',
        longitude: -46.6333,
      });

      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('latitude');
    });

    it('deve retornar erro quando latitude é menor que -90', () => {
      const errors = validatePointData({
        name: 'Ponto',
        latitude: -91,
        longitude: -46.6333,
      });

      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('latitude');
      expect(errors[0].message).toContain('no mínimo -90');
    });

    it('deve retornar erro quando latitude é maior que 90', () => {
      const errors = validatePointData({
        name: 'Ponto',
        latitude: 91,
        longitude: -46.6333,
      });

      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('latitude');
      expect(errors[0].message).toContain('no máximo 90');
    });

    it('deve aceitar latitude no limite -90', () => {
      const errors = validatePointData({
        name: 'Ponto',
        latitude: -90,
        longitude: -46.6333,
      });

      expect(errors).toHaveLength(0);
    });

    it('deve aceitar latitude no limite 90', () => {
      const errors = validatePointData({
        name: 'Ponto',
        latitude: 90,
        longitude: -46.6333,
      });

      expect(errors).toHaveLength(0);
    });
  });

  describe('campo longitude', () => {
    it('deve retornar erro quando longitude não é informada', () => {
      const errors = validatePointData({
        name: 'Ponto',
        latitude: -23.5505,
      });

      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('longitude');
    });

    it('deve retornar erro quando longitude é menor que -180', () => {
      const errors = validatePointData({
        name: 'Ponto',
        latitude: -23.5505,
        longitude: -181,
      });

      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('longitude');
      expect(errors[0].message).toContain('no mínimo -180');
    });

    it('deve retornar erro quando longitude é maior que 180', () => {
      const errors = validatePointData({
        name: 'Ponto',
        latitude: -23.5505,
        longitude: 181,
      });

      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('longitude');
      expect(errors[0].message).toContain('no máximo 180');
    });

    it('deve aceitar longitude no limite -180', () => {
      const errors = validatePointData({
        name: 'Ponto',
        latitude: -23.5505,
        longitude: -180,
      });

      expect(errors).toHaveLength(0);
    });

    it('deve aceitar longitude no limite 180', () => {
      const errors = validatePointData({
        name: 'Ponto',
        latitude: -23.5505,
        longitude: 180,
      });

      expect(errors).toHaveLength(0);
    });
  });

  describe('validação completa', () => {
    it('deve retornar múltiplos erros quando vários campos são inválidos', () => {
      const errors = validatePointData({
        name: '',
        latitude: -91,
        longitude: 181,
      });

      expect(errors.length).toBeGreaterThanOrEqual(3);
      expect(errors.map((e) => e.field)).toContain('name');
      expect(errors.map((e) => e.field)).toContain('latitude');
      expect(errors.map((e) => e.field)).toContain('longitude');
    });

    it('deve aceitar dados válidos', () => {
      const errors = validatePointData({
        name: 'Meu Ponto',
        latitude: -23.5505,
        longitude: -46.6333,
      });

      expect(errors).toHaveLength(0);
    });
  });
});

describe('validateUpdatePointData (atualização)', () => {
  describe('campos permitidos', () => {
    it('deve aceitar atualização com name válido', () => {
      const errors = validateUpdatePointData({
        name: 'Novo Nome',
      });

      expect(errors).toHaveLength(0);
    });

    it('deve retornar erro quando name está vazio', () => {
      const errors = validateUpdatePointData({
        name: '',
      });

      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('name');
    });
  });

  describe('campos proibidos', () => {
    it('deve retornar erro ao tentar alterar latitude', () => {
      const errors = validateUpdatePointData({
        name: 'Novo Nome',
        latitude: -23.5505,
      });

      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('latitude');
      expect(errors[0].message).toContain('Não é permitido alterar a latitude');
    });

    it('deve retornar erro ao tentar alterar longitude', () => {
      const errors = validateUpdatePointData({
        name: 'Novo Nome',
        longitude: -46.6333,
      });

      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('longitude');
      expect(errors[0].message).toContain('Não é permitido alterar a longitude');
    });

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
