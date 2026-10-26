import { describe, it, expect } from 'vitest';
import {
  ARQUETIPOS,
  CLASES,
  CLASE_INICIAL,
  CLASE_POR_DEFECTO,
  generarClase,
  obtenerClase,
  obtenerArquetipo,
  clasesDeArquetipo,
  duracionClase,
  etiquetaFormato,
  formatearDuracion,
  formatearReloj,
  resumenSecciones,
} from './clases';

// Barajado procedural: cada offset de semilla es una variante distinta pero
// reproducible de la clase del día.
describe('barajado procedural (offset de semilla)', () => {
  it('cada offset es reproducible dentro del mismo dia', () => {
    const a1 = generarClase('core', 5, 0);
    const a2 = generarClase('core', 5, 0);
    const b1 = generarClase('core', 5, 1);
    const b2 = generarClase('core', 5, 1);

    const secuencia = (clase) => clase.bloques.map((b) => b.ejercicio).join('|');
    expect(secuencia(a1)).toBe(secuencia(a2));
    expect(secuencia(b1)).toBe(secuencia(b2));
  });

  it('el offset no cambia identidad del id ni la duracion', () => {
    const sinBarajar = generarClase('core', 5, 0);
    const barajada = generarClase('core', 5, 7);
    expect(barajada.id).toBe(sinBarajar.id);
    expect(duracionClase(barajada)).toBe(duracionClase(sinBarajar));
    expect(barajada.bloques.length).toBe(sinBarajar.bloques.length);
  });
});
import { obtenerEjercicio, esDeTiempo } from './ejercicios';

const IDS_CLAVE = [
  'fuerza-10',
  'fuerza-30',
  'fuerza-45',
  'hiit-10',
  'hiit-20',
  'hiit-30',
  'combat-20',
  'combat-30',
  'core-5',
  'core-10',
  'core-20',
];

describe('CLASES', () => {
  it('tiene ids únicos y una clase por defecto', () => {
    const ids = CLASES.map((clase) => clase.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(CLASE_POR_DEFECTO).toBe(CLASES[0]);
  });
  it('abre con una clase corta para personas nuevas', () => {
    expect(CLASE_INICIAL.arquetipo).toBe('core');
    expect(duracionClase(CLASE_INICIAL)).toBeLessThanOrEqual(400);
  });
  it('usa ejercicios del catálogo y bloques válidos', () => {
    for (const clase of CLASES) {
      expect(clase.nombre.length).toBeGreaterThan(0);
      expect(clase.arquetipo).toBeTruthy();
      expect(obtenerArquetipo(clase.arquetipo)).toBeTruthy();
      expect(clase.bloques.length).toBeGreaterThanOrEqual(2);
      for (const bloque of clase.bloques) {
        expect(obtenerEjercicio(bloque.ejercicio), bloque.ejercicio).toBeTruthy();
        expect(bloque.trabajo).toBeGreaterThan(0);
        expect(bloque.descanso).toBeGreaterThanOrEqual(0);
      }
      expect(clase.bloques[clase.bloques.length - 1].descanso).toBe(0);
    }
  });
  it('busca clases por id y las baraja con la etiqueta procedural correcta', () => {
    const claseEjemplo = obtenerClase('fuerza');
    expect(claseEjemplo.nombre).toBe('Fuerza');
    expect(obtenerClase('no-existe')).toBeNull();
  });
});

describe('etiquetaFormato', () => {
  it('usa la etiqueta de duración de la clase', () => {
    expect(etiquetaFormato(obtenerClase('fuerza-10'))).toBe('10 min');
    expect(etiquetaFormato(obtenerClase('core-5'))).toBe('5 min');
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
  it('resume una clase con duración y ejercicios por sección', () => {
    const resumen = resumenSecciones(obtenerClase('core-5'));
    expect(resumen).toHaveLength(3);
    expect(resumen[0]).toMatchObject({ tipo: 'activacion', rondas: 1 });
    expect(resumen.reduce((total, seccion) => total + seccion.duracion, 0)).toBe(
      duracionClase(obtenerClase('core-5'))
    );
  });

  it('devuelve null si la clase no tiene secciones', () => {
    expect(resumenSecciones({ bloques: [] })).toBeNull();
  });
});

describe('formatearReloj', () => {
  it('formatea minutos y segundos con dos dígitos', () => {
    expect(formatearReloj(45)).toBe('0:45');
    expect(formatearReloj(472)).toBe('7:52');
    expect(formatearReloj(2700)).toBe('45:00');
    expect(formatearReloj(-10)).toBe('0:00');
  });
});

describe('catálogo de ejercicios', () => {
  it('marca los ejercicios de tiempo', () => {
    expect(esDeTiempo('PLANCHA')).toBe(true);
    expect(esDeTiempo('MARCHA_SUAVE')).toBe(true);
    expect(esDeTiempo('BURPEE')).toBe(true);
    expect(esDeTiempo('SENTADILLAS')).toBe(false);
    expect(esDeTiempo('JAB_CROSS')).toBe(false);
  });
});
