import { describe, it, expect } from 'vitest';
import {
  estadoInicialCircuito,
  avanzarCircuito,
  totalesVacios,
  progresoCircuito,
  estacionesCircuito,
  estacionesSeccion,
  DURACION_TOTAL,
} from './circuito';
import { obtenerClase, duracionClase } from './clases';

const CLASICO = obtenerClase('clasico');
const FUNCIONAL = obtenerClase('funcional-45');

function aplicar(estado, ahoraMs, clase = CLASICO) {
  const resultado = avanzarCircuito(estado, ahoraMs, clase);
  if (!resultado) return { estado, sonido: null };
  return { estado: { ...estado, ...resultado.estado }, sonido: resultado.sonido };
}

describe('estadoInicialCircuito', () => {
  it('empieza en TRABAJO con el primer ejercicio', () => {
    const e = estadoInicialCircuito(0, CLASICO);
    expect(e.faseActual).toBe('TRABAJO');
    expect(e.ejercicioActual).toBe(CLASICO.bloques[0].ejercicio);
    expect(e.tiempoRestante).toBe(CLASICO.bloques[0].trabajo);
    expect(e.repeticiones).toBe(0);
    expect(e.finFaseEn).toBe(CLASICO.bloques[0].trabajo * 1000);
    expect(e.totales).toEqual(totalesVacios(CLASICO));
    expect(e.combo).toBe(0);
  });

  it('arranca la clase completa con el calentamiento', () => {
    const e = estadoInicialCircuito(0, FUNCIONAL);
    expect(e.ejercicioActual).toBe('MARCHA');
    expect(e.tiempoRestante).toBe(120);
  });
});

describe('progresoCircuito', () => {
  it('va de 0 a 1 durante la clase completa', () => {
    expect(DURACION_TOTAL).toBe(2700);
    expect(progresoCircuito({ faseActual: 'CALIBRACION' })).toBe(0);
    expect(
      progresoCircuito({ faseActual: 'TRABAJO', ejercicioActual: 'MARCHA', tiempoRestante: 60 })
    ).toBeCloseTo(60 / 2700, 5);
    expect(
      progresoCircuito({
        faseActual: 'TRABAJO',
        ejercicioActual: 'ESTIRAMIENTO_GENERAL',
        tiempoRestante: 0,
      })
    ).toBe(1);
    expect(progresoCircuito({ faseActual: 'FIN' })).toBe(1);
  });

  it('también calcula el progreso de una clase exprés', () => {
    expect(duracionClase(CLASICO)).toBe(160);
    expect(
      progresoCircuito(
        { faseActual: 'TRABAJO', ejercicioActual: 'SENTADILLAS', tiempoRestante: 20 },
        CLASICO
      )
    ).toBeCloseTo(20 / 160, 5);
  });
});

describe('estacionesCircuito', () => {
  it('marca el primer ejercicio como actual al empezar', () => {
    expect(
      estacionesCircuito({ faseActual: 'TRABAJO', ejercicioActual: 'SENTADILLAS' }, CLASICO)
    ).toEqual([
      { ejercicio: 'SENTADILLAS', estado: 'actual' },
      { ejercicio: 'FLEXIONES', estado: 'pendiente' },
      { ejercicio: 'JUMPING_JACKS', estado: 'pendiente' },
    ]);
  });

  it('marca completados los anteriores y actual el que va', () => {
    expect(
      estacionesCircuito({ faseActual: 'TRABAJO', ejercicioActual: 'FLEXIONES' }, CLASICO)
    ).toEqual([
      { ejercicio: 'SENTADILLAS', estado: 'completado' },
      { ejercicio: 'FLEXIONES', estado: 'actual' },
      { ejercicio: 'JUMPING_JACKS', estado: 'pendiente' },
    ]);
  });

  it('en descanso marca el siguiente como actual', () => {
    expect(
      estacionesCircuito({ faseActual: 'DESCANSO', ejercicioActual: 'SENTADILLAS' }, CLASICO)
    ).toEqual([
      { ejercicio: 'SENTADILLAS', estado: 'completado' },
      { ejercicio: 'FLEXIONES', estado: 'actual' },
      { ejercicio: 'JUMPING_JACKS', estado: 'pendiente' },
    ]);
  });

  it('marca todo completado al terminar', () => {
    expect(
      estacionesCircuito({ faseActual: 'FIN', ejercicioActual: 'JUMPING_JACKS' }, CLASICO)
    ).toEqual([
      { ejercicio: 'SENTADILLAS', estado: 'completado' },
      { ejercicio: 'FLEXIONES', estado: 'completado' },
      { ejercicio: 'JUMPING_JACKS', estado: 'completado' },
    ]);
  });

  it('deja todo pendiente en calibración', () => {
    const estaciones = estacionesCircuito(
      { faseActual: 'CALIBRACION', ejercicioActual: 'SENTADILLAS' },
      CLASICO
    );
    expect(estaciones.every((e) => e.estado === 'pendiente')).toBe(true);
  });
});

describe('estacionesSeccion', () => {
  it('resume la clase completa en cinco secciones', () => {
    const estaciones = estacionesSeccion({ faseActual: 'TRABAJO' }, FUNCIONAL);
    expect(estaciones).toHaveLength(5);
    expect(estaciones[0]).toMatchObject({ id: 'calentamiento', estado: 'actual' });
    expect(estaciones[4]).toMatchObject({ id: 'enfriamiento', estado: 'pendiente' });
  });

  it('marca secciones completadas y muestra la ronda actual', () => {
    const indice = FUNCIONAL.bloques.findIndex(
      (bloque) => bloque.seccionId === 'fuerza' && bloque.ronda === 2
    );
    const estaciones = estacionesSeccion(
      { faseActual: 'TRABAJO', bloqueActual: indice },
      FUNCIONAL
    );
    expect(estaciones[0].estado).toBe('completado');
    expect(estaciones[1]).toMatchObject({ estado: 'actual', ronda: 2, totalRondas: 3 });
  });

  it('devuelve null para clases exprés', () => {
    expect(estacionesSeccion({ faseActual: 'TRABAJO' }, CLASICO)).toBeNull();
  });
});

describe('avanzarCircuito', () => {
  it('devuelve null cuando no cambia el segundo', () => {
    expect(avanzarCircuito(estadoInicialCircuito(0, CLASICO), 0, CLASICO)).toBeNull();
  });

  it('descuenta segundos con el tiempo real', () => {
    const r = avanzarCircuito(estadoInicialCircuito(0, CLASICO), 10000, CLASICO);
    expect(r).toEqual({ estado: { tiempoRestante: 30 }, sonido: null });
  });

  it('cambia a DESCANSO al terminar el trabajo y acumula repeticiones', () => {
    const e = { ...estadoInicialCircuito(0, CLASICO), repeticiones: 7 };
    const r = avanzarCircuito(e, 40000, CLASICO);
    expect(r.estado.faseActual).toBe('DESCANSO');
    expect(r.estado.tiempoRestante).toBe(CLASICO.bloques[0].descanso);
    expect(r.estado.totales.SENTADILLAS).toBe(7);
    expect(r.sonido).toBe('silbato');
  });

  it('avanza al siguiente ejercicio tras el descanso', () => {
    const e = {
      ...estadoInicialCircuito(0, CLASICO),
      faseActual: 'DESCANSO',
      tiempoRestante: 0,
      finFaseEn: 60000,
    };
    const r = avanzarCircuito(e, 60000, CLASICO);
    expect(r.estado.faseActual).toBe('TRABAJO');
    expect(r.estado.ejercicioActual).toBe('FLEXIONES');
    expect(r.estado.tiempoRestante).toBe(CLASICO.bloques[1].trabajo);
    expect(r.estado.repeticiones).toBe(0);
    expect(r.sonido).toBe('inicio');
  });

  it('avanza del calentamiento al primer ejercicio de fuerza sin descanso', () => {
    const e = estadoInicialCircuito(0, FUNCIONAL);
    const r = avanzarCircuito(e, 120000, FUNCIONAL);
    expect(r.estado.faseActual).toBe('TRABAJO');
    expect(r.estado.ejercicioActual).toBe('SENTADILLAS');
    expect(r.estado.bloqueActual).toBe(1);
  });

  it('acumula repeticiones del mismo ejercicio en distintas rondas', () => {
    const base = estadoInicialCircuito(0, FUNCIONAL);
    const indiceSentadillas = FUNCIONAL.bloques.findIndex(
      (bloque) => bloque.ejercicio === 'SENTADILLAS'
    );
    const e = {
      ...base,
      bloqueActual: indiceSentadillas,
      ejercicioActual: 'SENTADILLAS',
      repeticiones: 8,
      totales: { ...base.totales, SENTADILLAS: 5 },
      finFaseEn: 0,
    };
    const r = avanzarCircuito(e, 0, FUNCIONAL);
    expect(r.estado.totales.SENTADILLAS).toBe(13);
  });

  it('recorre el circuito completo y termina en FIN', () => {
    let estado = estadoInicialCircuito(0, CLASICO);

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
