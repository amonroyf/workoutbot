import { describe, it, expect } from 'vitest';
import { calcularTotal } from './score';

describe('calcularTotal', () => {
  it('suma todas las repeticiones', () => {
    expect(
      calcularTotal({ SENTADILLAS: 10, FLEXIONES: 6, JUMPING_JACKS: 4 })
    ).toBe(20);
  });

  it('devuelve 0 con el objeto vacio', () => {
    expect(calcularTotal({})).toBe(0);
  });

  it('ignora valores nulos o indefinidos', () => {
    expect(calcularTotal({ SENTADILLAS: 5, FLEXIONES: null })).toBe(5);
  });
});
