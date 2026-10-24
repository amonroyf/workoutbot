import { describe, it, expect } from 'vitest';
import { obtenerFrase, EVENTOS_VOZ } from './voz';

describe('obtenerFrase', () => {
  it('devuelve una frase para cada evento', () => {
    for (const evento of EVENTOS_VOZ) {
      expect(obtenerFrase(evento, 0, 'SENTADILLAS').length).toBeGreaterThan(0);
    }
  });

  it('entrega una frase distinta segun el ejercicio', () => {
    const sentadilla = obtenerFrase('TRABAJO', 0, 'SENTADILLAS');
    const flexion = obtenerFrase('TRABAJO', 0, 'FLEXIONES');
    const jj = obtenerFrase('TRABAJO', 0, 'JUMPING_JACKS');
    expect(sentadilla).toMatch(/Sentadillas/);
    expect(flexion).toMatch(/Flexiones/);
    expect(jj).toMatch(/Jumping jacks/);
    expect(new Set([sentadilla, flexion, jj]).size).toBe(3);
  });

  it('rota de forma determinista y ciclica', () => {
    const a = obtenerFrase('ANIMO', 0);
    const b = obtenerFrase('ANIMO', 1);
    const c = obtenerFrase('ANIMO', 2);
    expect(a).not.toBe(b);
    expect(b).not.toBe(c);
    expect(obtenerFrase('ANIMO', 6)).toBe(a);
  });

  it('usa un banco general si el ejercicio es desconocido', () => {
    expect(obtenerFrase('TRABAJO', 0, 'BAILE').length).toBeGreaterThan(0);
  });

  it('devuelve vacio para un evento desconocido', () => {
    expect(obtenerFrase('NO_EXISTE', 0)).toBe('');
  });

  it('tiene frases propias para los ejercicios del catálogo', () => {
    const general = obtenerFrase('TRABAJO', 0, 'BAILE');
    const frases = [
      'ROTACION_TORSO',
      'PRESS_HOMBRO',
      'REMO',
      'PESO_MUERTO',
      'BIRD_DOG',
      'DEAD_BUG',
    ].map((ejercicio) => obtenerFrase('TRABAJO', 0, ejercicio));
    expect(new Set(frases).size).toBe(frases.length);
    for (const frase of frases) {
      expect(frase.length).toBeGreaterThan(0);
      expect(frase).not.toBe(general);
    }
  });

  it('tiene frases propias para el modo On Fire', () => {
    const frases = [0, 1, 2].map((i) => obtenerFrase('ON_FIRE', i));
    for (const frase of frases) {
      expect(frase.length).toBeGreaterThan(0);
    }
    expect(new Set(frases).size).toBe(3);
  });
});
