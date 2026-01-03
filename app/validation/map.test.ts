import { describe, it, expect } from 'vitest';
import { validateMapData } from './map';

describe('validateMapData', () => {
  describe('campo name', () => {
    it('deve retornar erro quando name está vazio', () => {
      const errors = validateMapData('', 'descrição');

      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('name');
      expect(errors[0].message).toBe('Nome é obrigatório');
    });

    it('deve retornar erro quando name tem apenas espaços', () => {
      const errors = validateMapData('   ', 'descrição');

      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('name');
      expect(errors[0].message).toBe('Nome é obrigatório');
    });

    it('deve retornar erro quando name tem mais de 100 caracteres', () => {
      const longName = 'a'.repeat(101);
      const errors = validateMapData(longName, 'descrição');

      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('name');
      expect(errors[0].message).toContain('no máximo 100 caracteres');
    });

    it('deve aceitar name com exatamente 1 caractere', () => {
      const errors = validateMapData('a', 'descrição');

      expect(errors).toHaveLength(0);
    });

    it('deve aceitar name com exatamente 100 caracteres', () => {
      const name = 'a'.repeat(100);
      const errors = validateMapData(name, 'descrição');

      expect(errors).toHaveLength(0);
    });
  });

  describe('campo description', () => {
    it('deve aceitar description vazia', () => {
      const errors = validateMapData('Meu Mapa', '');

      expect(errors).toHaveLength(0);
    });

    it('deve retornar erro quando description tem mais de 40 caracteres', () => {
      const longDescription = 'a'.repeat(41);
      const errors = validateMapData('Meu Mapa', longDescription);

      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('description');
      expect(errors[0].message).toContain('no máximo 40 caracteres');
    });

    it('deve aceitar description com exatamente 40 caracteres', () => {
      const description = 'a'.repeat(40);
      const errors = validateMapData('Meu Mapa', description);

      expect(errors).toHaveLength(0);
    });
  });

  describe('validação completa', () => {
    it('deve retornar múltiplos erros quando name e description são inválidos', () => {
      const errors = validateMapData('', 'a'.repeat(41));

      expect(errors).toHaveLength(2);
      expect(errors.map((e) => e.field)).toContain('name');
      expect(errors.map((e) => e.field)).toContain('description');
    });

    it('deve aceitar dados válidos', () => {
      const errors = validateMapData('Meu Mapa', 'Uma descrição válida');

      expect(errors).toHaveLength(0);
    });
  });
});
