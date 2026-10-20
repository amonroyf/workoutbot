import { describe, it, expect } from 'vitest';
import {
  UMBRAL_SCORE_PERFECTO,
  calcularScoreForma,
  similitudCoseno,
} from './forma';

function landmarks() {
  return Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, z: 0, visibility: 1 }));
}

function conPuntos(overrides) {
  const base = landmarks();
  for (const [indice, punto] of Object.entries(overrides)) {
    base[Number(indice)] = { ...base[Number(indice)], ...punto };
  }
  return base;
}

const PLANCHA_BUENA = {
  11: { x: 0.34, y: 0.7 },
  12: { x: 0.34, y: 0.72 },
  23: { x: 0.55, y: 0.72 },
  24: { x: 0.55, y: 0.74 },
  27: { x: 0.85, y: 0.74 },
  28: { x: 0.85, y: 0.76 },
};

const PLANCHA_CADERA_CAIDA = {
  ...PLANCHA_BUENA,
  23: { x: 0.55, y: 0.9 },
  24: { x: 0.55, y: 0.92 },
};

const SENTADILLA_BUENA = {
  11: { x: 0.5, y: 0.2 },
  12: { x: 0.5, y: 0.22 },
  23: { x: 0.5, y: 0.5 },
  24: { x: 0.5, y: 0.52 },
  25: { x: 0.7, y: 0.5 },
  26: { x: 0.7, y: 0.52 },
  27: { x: 0.7, y: 0.8 },
  28: { x: 0.7, y: 0.82 },
};

const SENTADILLA_POCO_PROFUNDA = {
  ...SENTADILLA_BUENA,
  27: { x: 0.9, y: 0.53 },
  28: { x: 0.9, y: 0.55 },
};

const FLEXION_BUENA = {
  11: { x: 0.34, y: 0.7 },
  12: { x: 0.34, y: 0.72 },
  13: { x: 0.34, y: 0.85 },
  14: { x: 0.34, y: 0.87 },
  15: { x: 0.55, y: 0.85 },
  16: { x: 0.55, y: 0.87 },
  23: { x: 0.55, y: 0.72 },
  24: { x: 0.55, y: 0.74 },
  27: { x: 0.85, y: 0.74 },
  28: { x: 0.85, y: 0.76 },
};

describe('similitudCoseno', () => {
  it('devuelve 1 para vectores paralelos', () => {
    expect(similitudCoseno({ x: 1, y: 0 }, { x: 2, y: 0 })).toBeCloseTo(1, 5);
  });

  it('devuelve 0 para vectores perpendiculares', () => {
    expect(similitudCoseno({ x: 1, y: 0 }, { x: 0, y: 1 })).toBeCloseTo(0, 5);
  });

  it('devuelve 0 si algun vector es nulo', () => {
    expect(similitudCoseno({ x: 0, y: 0 }, { x: 1, y: 0 })).toBe(0);
  });
});

describe('calcularScoreForma', () => {
  it('da score alto a una plancha alineada', () => {
    const score = calcularScoreForma('PLANCHA', conPuntos(PLANCHA_BUENA));
    expect(score).toBeGreaterThanOrEqual(UMBRAL_SCORE_PERFECTO);
  });

  it('baja el score si la cadera se cae', () => {
    const bueno = calcularScoreForma('PLANCHA', conPuntos(PLANCHA_BUENA));
    const malo = calcularScoreForma('PLANCHA', conPuntos(PLANCHA_CADERA_CAIDA));
    expect(malo).toBeLessThan(bueno);
  });

  it('da score alto a una sentadilla profunda y erguida', () => {
    const score = calcularScoreForma('SENTADILLAS', conPuntos(SENTADILLA_BUENA));
    expect(score).toBeGreaterThanOrEqual(UMBRAL_SCORE_PERFECTO);
  });

  it('baja el score si la sentadilla es poco profunda', () => {
    const bueno = calcularScoreForma('SENTADILLAS', conPuntos(SENTADILLA_BUENA));
    const malo = calcularScoreForma(
      'SENTADILLAS',
      conPuntos(SENTADILLA_POCO_PROFUNDA)
    );
    expect(malo).toBeLessThan(bueno);
  });

  it('calcula score para variantes sumo y diamante', () => {
    expect(calcularScoreForma('SENTADILLA_SUMO', conPuntos(SENTADILLA_BUENA))).not.toBeNull();
    expect(calcularScoreForma('FLEXION_DIAMANTE', conPuntos(FLEXION_BUENA))).not.toBeNull();
  });

  it('da score alto a una flexion alineada con codos a 90', () => {
    const score = calcularScoreForma('FLEXIONES', conPuntos(FLEXION_BUENA));
    expect(score).toBeGreaterThanOrEqual(UMBRAL_SCORE_PERFECTO);
  });

  it('devuelve null para ejercicios sin score', () => {
    expect(calcularScoreForma('JUMPING_JACK', conPuntos(PLANCHA_BUENA))).toBe(null);
  });

  it('devuelve null si faltan landmarks visibles', () => {
    const lms = conPuntos(SENTADILLA_BUENA);
    lms[25].visibility = 0.1;
    expect(calcularScoreForma('SENTADILLAS', lms)).toBe(null);
  });

  it('devuelve null si el torso no tiene longitud', () => {
    expect(calcularScoreForma('PLANCHA', landmarks())).toBe(null);
  });
});
