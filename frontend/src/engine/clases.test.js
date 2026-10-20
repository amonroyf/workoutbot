import { describe, it, expect } from 'vitest';
import {
  CLASES,
  CLASE_POR_DEFECTO,
  obtenerClase,
  duracionClase,
  formatearDuracion,
} from './clases';
import { obtenerEjercicio, nombreEjercicio, esDeTiempo } from './ejercicios';

describe('CLASES', () => {
  it('tiene ids únicos y una clase por defecto', () => {
    const ids = CLASES.map((clase) => clase.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(CLASE_POR_DEFECTO).toBe(CLASES[0]);
  });

  it('usa ejercicios del catálogo y bloques válidos', () => {
    for (const clase of CLASES) {
      expect(clase.nombre.length).toBeGreaterThan(0);
      expect(clase.bloques.length).toBeGreaterThanOrEqual(2);
      for (const bloque of clase.bloques) {
        expect(obtenerEjercicio(bloque.ejercicio)).toBeTruthy();
        expect(bloque.trabajo).toBeGreaterThan(0);
        expect(bloque.descanso).toBeGreaterThanOrEqual(0);
      }
      expect(clase.bloques[clase.bloques.length - 1].descanso).toBe(0);
    }
  });

  it('incluye las clases nuevas', () => {
    expect(CLASES).toHaveLength(12);
    expect(obtenerClase('fuerza-total')).toBeTruthy();
    expect(obtenerClase('cardio-express')).toBeTruthy();
    expect(obtenerClase('core')).toBeTruthy();
    expect(obtenerClase('piernas-gluteos')).toBeTruthy();
    expect(obtenerClase('tren-superior')).toBeTruthy();
    expect(obtenerClase('principiante')).toBeTruthy();
    expect(obtenerClase('core-fuerte')).toBeTruthy();
    expect(obtenerClase('full-body')).toBeTruthy();
    expect(obtenerClase('piernas-express')).toBeTruthy();
  });

  it('calcula la duración total de cada clase', () => {
    expect(duracionClase(obtenerClase('clasico'))).toBe(160);
    expect(duracionClase(obtenerClase('explosivo'))).toBe(120);
    expect(duracionClase(obtenerClase('resistencia'))).toBe(190);
    expect(duracionClase(obtenerClase('fuerza-total'))).toBe(270);
    expect(duracionClase(obtenerClase('cardio-express'))).toBe(210);
    expect(duracionClase(obtenerClase('core'))).toBe(165);
    expect(duracionClase(obtenerClase('piernas-gluteos'))).toBe(220);
    expect(duracionClase(obtenerClase('tren-superior'))).toBe(190);
    expect(duracionClase(obtenerClase('principiante'))).toBe(170);
    expect(duracionClase(obtenerClase('core-fuerte'))).toBe(190);
    expect(duracionClase(obtenerClase('full-body'))).toBe(210);
    expect(duracionClase(obtenerClase('piernas-express'))).toBe(195);
  });

  it('busca clases por id', () => {
    expect(obtenerClase('explosivo').nombre).toBe('Explosivo');
    expect(obtenerClase('no-existe')).toBeNull();
  });
});

describe('formatearDuracion', () => {
  it('formatea segundos y minutos', () => {
    expect(formatearDuracion(45)).toBe('45s');
    expect(formatearDuracion(120)).toBe('2 min');
    expect(formatearDuracion(160)).toBe('2 min 40s');
  });
});

describe('catálogo de ejercicios', () => {
  it('entrega el nombre legible', () => {
    expect(nombreEjercicio('JUMPING_JACKS')).toBe('Jumping jacks');
    expect(nombreEjercicio('NO_EXISTE')).toBe('NO EXISTE');
  });

  it('marca los ejercicios de tiempo', () => {
    expect(esDeTiempo('PLANCHA')).toBe(true);
    expect(esDeTiempo('PLANCHA_LATERAL')).toBe(true);
    expect(esDeTiempo('WALL_SIT')).toBe(true);
    expect(esDeTiempo('SUPERMAN')).toBe(true);
    expect(esDeTiempo('SENTADILLAS')).toBe(false);
    expect(esDeTiempo('SENTADILLA_SUMO')).toBe(false);
    expect(esDeTiempo('MOUNTAIN_CLIMBER')).toBe(false);
  });
});
