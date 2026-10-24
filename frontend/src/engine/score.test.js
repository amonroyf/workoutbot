import { describe, it, expect } from 'vitest';
import { calcularTotal, calcularSegundos, separarTotales } from './score';

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

  it('no cuenta los segundos de ejercicios de tiempo como repeticiones', () => {
    expect(calcularTotal({ SENTADILLAS: 10, PLANCHA: 45, MARCHA_SUAVE: 120 })).toBe(10);
  });
});

describe('separarTotales', () => {
  it('separa repeticiones y segundos sostenidos', () => {
    const { reps, segundos } = separarTotales({
      SENTADILLAS: 12,
      PLANCHA: 45,
      MARCHA_SUAVE: 120,
    });
    expect(reps).toEqual({ SENTADILLAS: 12 });
    expect(segundos).toEqual({ PLANCHA: 45, MARCHA_SUAVE: 120 });
  });
});

describe('calcularSegundos', () => {
  it('suma solo los ejercicios de tiempo', () => {
    expect(calcularSegundos({ SENTADILLAS: 10, PLANCHA: 45, MARCHA_SUAVE: 120 })).toBe(165);
  });

  it('devuelve 0 sin ejercicios de tiempo', () => {
    expect(calcularSegundos({ SENTADILLAS: 10 })).toBe(0);
  });
});
