import { describe, it, expect } from 'vitest';
import { diferenciaReps, textoComparacion, textoNarrado } from './progreso';

function resumen(ultima, anterior, racha = 2) {
  return {
    racha,
    ultima: ultima == null ? null : { total_reps: ultima, perfectas: 4, mejor_combo: 9 },
    anterior: anterior == null ? null : { total_reps: anterior },
  };
}

describe('diferenciaReps', () => {
  it('calcula la diferencia con la sesión anterior', () => {
    expect(diferenciaReps(resumen(20, 15))).toBe(5);
    expect(diferenciaReps(resumen(10, 15))).toBe(-5);
    expect(diferenciaReps(resumen(10, 10))).toBe(0);
  });

  it('devuelve null si falta alguna sesión', () => {
    expect(diferenciaReps(resumen(10, null))).toBeNull();
    expect(diferenciaReps(null)).toBeNull();
  });
});

describe('textoComparacion', () => {
  it('narra mejora, caída, empate y primera sesión', () => {
    expect(textoComparacion(resumen(20, 15))).toContain('Mejoraste 5 repeticiones');
    expect(textoComparacion(resumen(10, 15))).toContain('Quedaste 5 repeticiones por debajo');
    expect(textoComparacion(resumen(10, 10))).toContain('Igualaste');
    expect(textoComparacion(resumen(10, null))).toContain('Primera sesión');
  });
});

describe('textoNarrado', () => {
  it('incluye reps, perfectas, combo, racha y comparación', () => {
    const texto = textoNarrado(resumen(20, 15, 3));
    expect(texto).toContain('20 repeticiones');
    expect(texto).toContain('4 perfectas');
    expect(texto).toContain('mejor combo de 9');
    expect(texto).toContain('racha de 3 días');
    expect(texto).toContain('Mejoraste 5 repeticiones');
  });

  it('devuelve vacío sin última sesión', () => {
    expect(textoNarrado(null)).toBe('');
    expect(textoNarrado(resumen(null, null))).toBe('');
  });
});
