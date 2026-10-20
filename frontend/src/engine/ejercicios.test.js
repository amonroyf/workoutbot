import { describe, it, expect } from 'vitest';
import {
  EJERCICIOS_CATALOGO,
  MODIFICACIONES,
  consignaEjercicio,
  modificacionesEjercicio,
} from './ejercicios';

describe('modificacionesEjercicio', () => {
  it('tiene modificaciones para todo el catálogo', () => {
    for (const id of Object.keys(EJERCICIOS_CATALOGO)) {
      const modificacion = MODIFICACIONES[id];
      expect(modificacion, id).toBeTruthy();
      expect(modificacion.facil.length).toBeGreaterThan(0);
      expect(modificacion.fuerte.length).toBeGreaterThan(0);
    }
  });

  it('devuelve opciones fáciles y fuertes', () => {
    const modificacion = modificacionesEjercicio('SENTADILLAS');
    expect(modificacion.facil).toMatch(/silla/i);
    expect(modificacion.fuerte).toMatch(/pausa|pierna/i);
  });

  it('usa valores por defecto si el ejercicio no existe', () => {
    expect(modificacionesEjercicio('NO_EXISTE')).toEqual({
      facil: 'Reduce el rango o el ritmo',
      fuerte: 'Aumenta el rango o el ritmo',
    });
  });
});

describe('consignaEjercicio', () => {
  it('usa la consigna propia de cada ejercicio de tiempo', () => {
    expect(consignaEjercicio('MARCHA').consigna).toBe('Muévete');
    expect(consignaEjercicio('PLANCHA').consigna).toBe('Sostén');
    expect(consignaEjercicio('ESTIRAMIENTO_GENERAL').consigna).toBe('Estira');
    expect(consignaEjercicio('MARCHA').consignaAyuda.length).toBeGreaterThan(0);
  });

  it('cae en valores por defecto si el ejercicio no existe', () => {
    expect(consignaEjercicio('NO_EXISTE')).toEqual({
      consigna: 'Sostén',
      consignaAyuda: 'Mantén la posición',
    });
  });
});
