import { describe, it, expect } from 'vitest';
import {
  ajustarVoz,
  esEnFuego,
  mereceEuforia,
  UMBRAL_COMBO_FUEGO,
  RATE_MAX,
  PITCH_MAX,
} from './personalidad';

describe('esEnFuego', () => {
  it('se activa a partir del umbral de combo', () => {
    expect(esEnFuego(0)).toBe(false);
    expect(esEnFuego(UMBRAL_COMBO_FUEGO - 1)).toBe(false);
    expect(esEnFuego(UMBRAL_COMBO_FUEGO)).toBe(true);
    expect(esEnFuego(12)).toBe(true);
  });

  it('rechaza valores no numericos', () => {
    expect(esEnFuego(null)).toBe(false);
    expect(esEnFuego(undefined)).toBe(false);
    expect(esEnFuego(NaN)).toBe(false);
  });
});

describe('ajustarVoz', () => {
  it('no modifica la voz sin racha', () => {
    const r = ajustarVoz({ combo: 0 });
    expect(r.enFuego).toBe(false);
    expect(r.rate).toBe(1);
    expect(r.pitch).toBe(1);
  });

  it('aumenta velocidad y tono en modo On Fire', () => {
    const r = ajustarVoz({ combo: UMBRAL_COMBO_FUEGO });
    expect(r.enFuego).toBe(true);
    expect(r.rate).toBeGreaterThan(1);
    expect(r.pitch).toBeGreaterThan(1);
  });

  it('el climax suma energia extra', () => {
    const normal = ajustarVoz({ combo: 0 });
    const climax = ajustarVoz({ combo: 0, climax: true });
    expect(climax.rate).toBeGreaterThan(normal.rate);
    expect(climax.pitch).toBeGreaterThan(normal.pitch);
  });

  it('respeta los limites de la sintesis', () => {
    const r = ajustarVoz({ rate: 5, pitch: 5, combo: 50, climax: true });
    expect(r.rate).toBeLessThanOrEqual(RATE_MAX);
    expect(r.pitch).toBeLessThanOrEqual(PITCH_MAX);
  });

  it('nunca baja de un tono audible', () => {
    const r = ajustarVoz({ rate: 0.01, pitch: 0.01 });
    expect(r.rate).toBeGreaterThan(0);
    expect(r.pitch).toBeGreaterThan(0);
  });
});

describe('mereceEuforia', () => {
  const base = { umbralPerfecto: 85 };

  it('grita con forma perfecta y racha alta', () => {
    expect(mereceEuforia({ ...base, score: 90, combo: 5 })).toBe(true);
    expect(mereceEuforia({ ...base, score: 85, combo: 7 })).toBe(true);
  });

  it('no grita sin racha', () => {
    expect(mereceEuforia({ ...base, score: 95, combo: 4 })).toBe(false);
    expect(mereceEuforia({ ...base, score: 95, combo: 0 })).toBe(false);
  });

  it('no grita si la forma no es perfecta', () => {
    expect(mereceEuforia({ ...base, score: 84, combo: 9 })).toBe(false);
    expect(mereceEuforia({ ...base, score: null, combo: 9 })).toBe(false);
    expect(mereceEuforia({ ...base, combo: 9 })).toBe(false);
  });
});
