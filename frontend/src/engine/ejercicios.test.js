import { describe, it, expect } from 'vitest';
import {
  EJERCICIOS_CATALOGO,
  MODIFICACIONES,
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
