import { describe, it, expect } from 'vitest';
import {
  calculateAngle,
  esVisible,
  distancia,
  normalizarLandmarks,
  detectarOrientacion,
} from './angles';

describe('calculateAngle', () => {
  it('calcula 90 grados', () => {
    const a = { x: 0, y: 1 };
    const b = { x: 0, y: 0 };
    const c = { x: 1, y: 0 };
    expect(calculateAngle(a, b, c)).toBeCloseTo(90, 5);
  });

  it('calcula 180 grados en linea recta', () => {
    const a = { x: 0, y: 0 };
    const b = { x: 1, y: 0 };
    const c = { x: 2, y: 0 };
    expect(calculateAngle(a, b, c)).toBeCloseTo(180, 5);
  });

  it('calcula 0 grados cuando los puntos coinciden', () => {
    const a = { x: 1, y: 0 };
    const b = { x: 0, y: 0 };
    const c = { x: 1, y: 0 };
    expect(calculateAngle(a, b, c)).toBeCloseTo(0, 5);
  });
});

describe('esVisible', () => {
  const landmarks = [
    { x: 0, y: 0, visibility: 0.9 },
    { x: 1, y: 1, visibility: 0.2 },
  ];

  it('devuelve true si todos superan el umbral', () => {
    expect(esVisible(landmarks, [0])).toBe(true);
  });

  it('devuelve false si alguno esta por debajo', () => {
    expect(esVisible(landmarks, [0, 1])).toBe(false);
  });

  it('trata visibility ausente como visible', () => {
    expect(esVisible([{ x: 0, y: 0 }], [0])).toBe(true);
  });
});

describe('distancia', () => {
  it('calcula la distancia euclidiana', () => {
    expect(distancia({ x: 0, y: 0 }, { x: 3, y: 4 })).toBeCloseTo(5, 5);
  });
});

describe('detectarOrientacion', () => {
  function base() {
    const lms = Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, visibility: 1 }));
    return lms;
  }

  it('detecta frontal cuando el ancho de hombros es amplio', () => {
    const lms = base();
    lms[11] = { x: 0.3, y: 0.3, visibility: 1 };
    lms[12] = { x: 0.5, y: 0.3, visibility: 1 };
    expect(detectarOrientacion(lms)).toBe('frontal');
  });

  it('detecta perfil cuando los hombros se solapan', () => {
    const lms = base();
    lms[11] = { x: 0.48, y: 0.3, visibility: 1 };
    lms[12] = { x: 0.51, y: 0.3, visibility: 1 };
    expect(detectarOrientacion(lms)).toBe('perfil');
  });

  it('devuelve null si faltan los hombros', () => {
    expect(detectarOrientacion(null)).toBe(null);
    expect(detectarOrientacion([{ x: 0, y: 0 }])).toBe(null);
  });
});

describe('normalizarLandmarks', () => {
  function landmarks() {
    return Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, z: 0, visibility: 1 }));
  }

  it('centra en la cadera y escala por el largo del torso', () => {
    const lms = landmarks();
    lms[11] = { x: 0.4, y: 0.2, z: 0, visibility: 1 };
    lms[12] = { x: 0.6, y: 0.2, z: 0, visibility: 1 };
    lms[23] = { x: 0.4, y: 0.6, z: 0, visibility: 1 };
    lms[24] = { x: 0.6, y: 0.6, z: 0, visibility: 1 };

    const n = normalizarLandmarks(lms);
    expect(n).not.toBe(null);
    expect(n[23].x).toBeCloseTo(-0.25, 5);
    expect(n[23].y).toBeCloseTo(0, 5);
    expect(n[24].x).toBeCloseTo(0.25, 5);
    expect(n[11].y).toBeCloseTo(-1, 5);
    expect(
      distancia(
        { x: (n[11].x + n[12].x) / 2, y: (n[11].y + n[12].y) / 2 },
        { x: (n[23].x + n[24].x) / 2, y: (n[23].y + n[24].y) / 2 }
      )
    ).toBeCloseTo(1, 5);
  });

  it('devuelve null si el torso no tiene longitud', () => {
    expect(normalizarLandmarks(landmarks())).toBe(null);
  });

  it('devuelve null si no hay suficientes landmarks', () => {
    expect(normalizarLandmarks([{ x: 0, y: 0 }])).toBe(null);
  });
});
