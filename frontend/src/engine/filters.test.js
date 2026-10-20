import { describe, it, expect } from 'vitest';
import {
  OneEuroFilter,
  crearFiltrosLandmarks,
  filtrarLandmarks,
  reiniciarFiltros,
} from './filters';

describe('OneEuroFilter', () => {
  it('devuelve el primer valor sin suavizar', () => {
    const filtro = new OneEuroFilter();
    expect(filtro.filter(0.25, 0)).toBe(0.25);
  });

  it('suaviza una senal constante', () => {
    const filtro = new OneEuroFilter({ minCutoff: 1, beta: 0 });
    filtro.filter(1, 0);
    let salida = 1;
    for (let i = 1; i <= 60; i++) salida = filtro.filter(1, i * 16);
    expect(salida).toBeCloseTo(1, 4);
  });

  it('se acerca al valor nuevo sin saltar de golpe', () => {
    const filtro = new OneEuroFilter({ minCutoff: 1, beta: 0 });
    filtro.filter(0, 0);
    const salida = filtro.filter(1, 16);
    expect(salida).toBeGreaterThan(0);
    expect(salida).toBeLessThan(1);
  });

  it('responde mas rapido con beta alto', () => {
    const lento = new OneEuroFilter({ minCutoff: 1, beta: 0 });
    const rapido = new OneEuroFilter({ minCutoff: 1, beta: 0.5 });
    lento.filter(0.5, 0);
    rapido.filter(0.5, 0);
    expect(rapido.filter(1, 16)).toBeGreaterThan(lento.filter(1, 16));
  });

  it('conserva el ultimo valor si el tiempo no avanza', () => {
    const filtro = new OneEuroFilter();
    filtro.filter(0.2, 100);
    const salida = filtro.filter(0.8, 100);
    expect(salida).toBe(0.2);
  });

  it('ignora valores no finitos', () => {
    const filtro = new OneEuroFilter();
    expect(filtro.filter(Number.NaN, 0)).toBeNaN();
    expect(filtro.filter(0.3, 16)).toBe(0.3);
  });
});

describe('filtros de landmarks', () => {
  const landmarks = Array.from({ length: 33 }, (_, i) => ({
    x: i / 100,
    y: i / 200,
    z: 0,
    visibility: 0.9,
  }));

  it('crea un filtro por cada landmark', () => {
    expect(crearFiltrosLandmarks()).toHaveLength(33);
    expect(crearFiltrosLandmarks(20)).toHaveLength(20);
  });

  it('filtra x, y, z y conserva visibility', () => {
    const filtros = crearFiltrosLandmarks();
    const salida = filtrarLandmarks(landmarks, filtros, 0);
    expect(salida).toHaveLength(33);
    expect(salida[11].x).toBeCloseTo(landmarks[11].x, 5);
    expect(salida[11].visibility).toBe(0.9);
  });

  it('reinicia el estado de los filtros', () => {
    const filtros = crearFiltrosLandmarks();
    filtrarLandmarks(landmarks, filtros, 0);
    filtrarLandmarks(landmarks, filtros, 16);
    reiniciarFiltros(filtros);
    const salida = filtrarLandmarks(landmarks, filtros, 32);
    expect(salida[11].x).toBeCloseTo(landmarks[11].x, 5);
  });
});
