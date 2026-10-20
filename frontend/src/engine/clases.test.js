import { describe, it, expect } from 'vitest';
import {
  CLASES,
  CLASE_POR_DEFECTO,
  obtenerClase,
  duracionClase,
  formatearDuracion,
  resumenSecciones,
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
    expect(CLASES).toHaveLength(13);
    expect(obtenerClase('funcional-45')).toBeTruthy();
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

  it('incluye la clase completa Funcional 45', () => {
    const clase = obtenerClase('funcional-45');
    expect(clase.formato).toBe('completa');
    expect(clase.secciones).toHaveLength(5);
    expect(clase.bloques).toHaveLength(38);
    expect(duracionClase(clase)).toBe(2700);
    expect(clase.bloques[0]).toMatchObject({
      ejercicio: 'MARCHA',
      seccionId: 'calentamiento',
      ronda: 1,
      totalRondas: 1,
    });
    const fuerza = clase.bloques.filter((bloque) => bloque.seccionId === 'fuerza');
    expect(fuerza).toHaveLength(12);
    expect(fuerza[3]).toMatchObject({ ronda: 1, descanso: 60 });
    expect(fuerza[4]).toMatchObject({ ejercicio: 'SENTADILLAS', ronda: 2 });
  });

  it('calcula la duración total de cada clase', () => {
    expect(duracionClase(obtenerClase('funcional-45'))).toBe(2700);
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

describe('resumenSecciones', () => {
  it('resume la clase completa con duración y ejercicios por sección', () => {
    const resumen = resumenSecciones(obtenerClase('funcional-45'));

    expect(resumen).toHaveLength(5);
    expect(resumen[0]).toMatchObject({
      id: 'calentamiento',
      duracion: 480,
      rondas: 1,
    });
    expect(resumen[0].ejercicios).toContain('MARCHA');
    expect(resumen[1]).toMatchObject({ id: 'fuerza', rondas: 3, duracion: 840 });
    expect(resumen.reduce((total, seccion) => total + seccion.duracion, 0)).toBe(2700);
  });

  it('devuelve null para clases exprés', () => {
    expect(resumenSecciones(obtenerClase('clasico'))).toBeNull();
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
    expect(esDeTiempo('MARCHA')).toBe(true);
    expect(esDeTiempo('MARCHA_SUAVE')).toBe(true);
    expect(esDeTiempo('ESTIRAMIENTO_GENERAL')).toBe(true);
    expect(esDeTiempo('SENTADILLAS')).toBe(false);
    expect(esDeTiempo('SENTADILLA_SUMO')).toBe(false);
    expect(esDeTiempo('MOUNTAIN_CLIMBER')).toBe(false);
  });
});
