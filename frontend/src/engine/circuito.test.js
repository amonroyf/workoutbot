import { describe, it, expect } from 'vitest';
import {
  estadoInicialCircuito,
  avanzarCircuito,
  totalesVacios,
  progresoCircuito,
  EJERCICIOS,
  TIEMPO_TRABAJO,
  TIEMPO_DESCANSO,
  DURACION_TOTAL,
} from './circuito';

function aplicar(estado, ahoraMs) {
  const resultado = avanzarCircuito(estado, ahoraMs);
  if (!resultado) return { estado, sonido: null };
  return { estado: { ...estado, ...resultado.estado }, sonido: resultado.sonido };
}

describe('estadoInicialCircuito', () => {
  it('empieza en TRABAJO con el primer ejercicio', () => {
    const e = estadoInicialCircuito(0);
    expect(e.faseActual).toBe('TRABAJO');
    expect(e.ejercicioActual).toBe(EJERCICIOS[0]);
    expect(e.tiempoRestante).toBe(TIEMPO_TRABAJO);
    expect(e.repeticiones).toBe(0);
    expect(e.finFaseEn).toBe(TIEMPO_TRABAJO * 1000);
    expect(e.totales).toEqual(totalesVacios());
    expect(e.combo).toBe(0);
  });
});

describe('progresoCircuito', () => {
  it('va de 0 a 1 durante el circuito', () => {
    expect(DURACION_TOTAL).toBe(TIEMPO_TRABAJO * 3 + TIEMPO_DESCANSO * 2);
    expect(progresoCircuito({ faseActual: 'CALIBRACION' })).toBe(0);
    expect(
      progresoCircuito({ faseActual: 'TRABAJO', ejercicioActual: 'SENTADILLAS', tiempoRestante: 40 })
    ).toBe(0);
    expect(
      progresoCircuito({ faseActual: 'DESCANSO', ejercicioActual: 'SENTADILLAS', tiempoRestante: 20 })
    ).toBeCloseTo(40 / DURACION_TOTAL, 5);
    expect(
      progresoCircuito({ faseActual: 'TRABAJO', ejercicioActual: 'JUMPING_JACKS', tiempoRestante: 0 })
    ).toBe(1);
    expect(progresoCircuito({ faseActual: 'FIN' })).toBe(1);
  });
});

describe('avanzarCircuito', () => {
  it('devuelve null cuando no cambia el segundo', () => {
    expect(avanzarCircuito(estadoInicialCircuito(0), 0)).toBeNull();
  });

  it('descuenta segundos con el tiempo real', () => {
    const r = avanzarCircuito(estadoInicialCircuito(0), 10000);
    expect(r).toEqual({ estado: { tiempoRestante: 30 }, sonido: null });
  });

  it('cambia a DESCANSO al terminar el trabajo y acumula repeticiones', () => {
    const e = { ...estadoInicialCircuito(0), repeticiones: 7 };
    const r = avanzarCircuito(e, 40000);
    expect(r.estado.faseActual).toBe('DESCANSO');
    expect(r.estado.tiempoRestante).toBe(TIEMPO_DESCANSO);
    expect(r.estado.totales.SENTADILLAS).toBe(7);
    expect(r.sonido).toBe('silbato');
  });

  it('avanza al siguiente ejercicio tras el descanso', () => {
    const e = {
      ...estadoInicialCircuito(0),
      faseActual: 'DESCANSO',
      tiempoRestante: 0,
      finFaseEn: 60000,
    };
    const r = avanzarCircuito(e, 60000);
    expect(r.estado.faseActual).toBe('TRABAJO');
    expect(r.estado.ejercicioActual).toBe('FLEXIONES');
    expect(r.estado.tiempoRestante).toBe(TIEMPO_TRABAJO);
    expect(r.estado.repeticiones).toBe(0);
    expect(r.sonido).toBe('inicio');
  });

  it('recorre el circuito completo y termina en FIN', () => {
    let { estado } = { estado: estadoInicialCircuito(0) };

    estado = { ...estado, repeticiones: 10 };
    estado = aplicar(estado, 40000).estado;
    expect(estado.faseActual).toBe('DESCANSO');

    estado = aplicar(estado, 60000).estado;
    expect(estado.ejercicioActual).toBe('FLEXIONES');

    estado = { ...estado, repeticiones: 6 };
    estado = aplicar(estado, 100000).estado;
    expect(estado.totales.FLEXIONES).toBe(6);

    estado = aplicar(estado, 120000).estado;
    expect(estado.ejercicioActual).toBe('JUMPING_JACKS');

    estado = { ...estado, repeticiones: 4 };
    estado = aplicar(estado, 160000).estado;
    expect(estado.totales.JUMPING_JACKS).toBe(4);

    const fin = aplicar(estado, 180000);
    expect(fin.estado.faseActual).toBe('FIN');
    expect(fin.estado.tiempoRestante).toBe(0);
    expect(fin.estado.finFaseEn).toBeNull();
    expect(fin.estado.totales).toEqual({
      SENTADILLAS: 10,
      FLEXIONES: 6,
      JUMPING_JACKS: 4,
    });
  });
});
