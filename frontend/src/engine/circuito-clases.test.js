import { describe, it, expect } from 'vitest';
import { obtenerClase } from './clases';
import {
  estadoInicialCircuito,
  avanzarCircuito,
  progresoCircuito,
  estacionesCircuito,
  totalesVacios,
} from './circuito';

const EXPLOSIVO = obtenerClase('explosivo');

function aplicar(estado, ahoraMs, clase) {
  const resultado = avanzarCircuito(estado, ahoraMs, clase);
  if (!resultado) return { estado, sonido: null };
  return { estado: { ...estado, ...resultado.estado }, sonido: resultado.sonido };
}

describe('motor genérico de clases', () => {
  it('inicia con el primer bloque de la clase elegida', () => {
    const estado = estadoInicialCircuito(0, EXPLOSIVO);
    expect(estado.claseId).toBe('explosivo');
    expect(estado.bloqueActual).toBe(0);
    expect(estado.ejercicioActual).toBe('JUMPING_JACKS');
    expect(estado.tiempoRestante).toBe(30);
    expect(estado.finFaseEn).toBe(30000);
    expect(estado.totales).toEqual(totalesVacios(EXPLOSIVO));
  });

  it('respeta los tiempos de trabajo y descanso de la clase', () => {
    let { estado } = { estado: estadoInicialCircuito(0, EXPLOSIVO) };
    estado = { ...estado, repeticiones: 5 };

    estado = aplicar(estado, 30000, EXPLOSIVO).estado;
    expect(estado.faseActual).toBe('DESCANSO');
    expect(estado.tiempoRestante).toBe(15);
    expect(estado.totales.JUMPING_JACKS).toBe(5);

    estado = aplicar(estado, 45000, EXPLOSIVO).estado;
    expect(estado.faseActual).toBe('TRABAJO');
    expect(estado.bloqueActual).toBe(1);
    expect(estado.ejercicioActual).toBe('SENTADILLAS');
    expect(estado.repeticiones).toBe(0);
  });

  it('recorre una clase completa y acumula totales', () => {
    let { estado } = { estado: estadoInicialCircuito(0, EXPLOSIVO) };
    estado = { ...estado, repeticiones: 5 };
    estado = aplicar(estado, 30000, EXPLOSIVO).estado;
    estado = aplicar(estado, 45000, EXPLOSIVO).estado;

    estado = { ...estado, repeticiones: 7 };
    estado = aplicar(estado, 75000, EXPLOSIVO).estado;
    expect(estado.totales.SENTADILLAS).toBe(7);
    estado = aplicar(estado, 90000, EXPLOSIVO).estado;

    estado = { ...estado, repeticiones: 4 };
    estado = aplicar(estado, 120000, EXPLOSIVO).estado;
    expect(estado.faseActual).toBe('FIN');
    expect(estado.totales).toEqual({
      JUMPING_JACKS: 5,
      SENTADILLAS: 7,
      FLEXIONES: 4,
    });
  });

  it('calcula el progreso con la duración de la clase', () => {
    expect(
      progresoCircuito(
        { faseActual: 'TRABAJO', bloqueActual: 0, ejercicioActual: 'JUMPING_JACKS', tiempoRestante: 30 },
        EXPLOSIVO
      )
    ).toBe(0);
    expect(
      progresoCircuito(
        { faseActual: 'DESCANSO', bloqueActual: 0, ejercicioActual: 'JUMPING_JACKS', tiempoRestante: 15 },
        EXPLOSIVO
      )
    ).toBeCloseTo(30 / 120, 5);
    expect(
      progresoCircuito(
        { faseActual: 'TRABAJO', bloqueActual: 2, ejercicioActual: 'FLEXIONES', tiempoRestante: 0 },
        EXPLOSIVO
      )
    ).toBe(1);
  });

  it('marca las estaciones según el bloque actual', () => {
    expect(
      estacionesCircuito(
        { faseActual: 'DESCANSO', bloqueActual: 0, ejercicioActual: 'JUMPING_JACKS' },
        EXPLOSIVO
      )
    ).toEqual([
      { ejercicio: 'JUMPING_JACKS', estado: 'completado' },
      { ejercicio: 'SENTADILLAS', estado: 'actual' },
      { ejercicio: 'FLEXIONES', estado: 'pendiente' },
    ]);
  });
});
