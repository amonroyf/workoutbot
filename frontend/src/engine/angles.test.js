import { describe, it, expect } from 'vitest';
import { calculateAngle, esVisible, distancia } from './angles';

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
