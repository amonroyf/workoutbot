import { describe, it, expect } from 'vitest';
import {
  estadoInicialCircuito,
  avanzarCircuito,
  avanzarTransicion,
  totalesVacios,
  transcurridoCircuito,
  progresoCircuito,
  progresoSecciones,
  estacionesCircuito,
  estacionesSeccion,
  DURACION_TOTAL,
} from './circuito';
import { CLASE_POR_DEFECTO, obtenerClase, duracionClase, PAUSA_ACTIVA_OFICINA } from './clases';

const BLOQUES = [
  { ejercicio: 'SENTADILLAS', trabajo: 30, descanso: 15 },
  { ejercicio: 'FLEXIONES', trabajo: 30, descanso: 15 },
  { ejercicio: 'PLANCHA', trabajo: 20, descanso: 0 },
].map((bloque, indice) => ({
  ...bloque,
  seccionId: 'bloque',
  seccionNombre: 'Bloque',
  seccionTipo: 'principal',
  seccionIndex: 0,
  totalSecciones: 1,
  ronda: 1,
  totalRondas: 1,
}));

const CLASE = Object.freeze({
  id: 'sintetica',
  formato: 'clase',
  bloques: Object.freeze(BLOQUES),
  secciones: Object.freeze([
    Object.freeze({
      id: 'bloque',
      nombre: 'Bloque',
      nombreCorto: 'Bloque',
      tipo: 'principal',
      rondas: 1,
      bloques: Object.freeze(BLOQUES),
    }),
  ]),
});

const DURACION = 30 + 15 + 30 + 15 + 20;

function aplicar(estado, ahoraMs, clase = CLASE) {
  const resultado = avanzarCircuito(estado, ahoraMs, clase);
  if (!resultado) return { estado, sonido: null };
  return { estado: { ...estado, ...resultado.estado }, sonido: resultado.sonido };
}

describe('estadoInicialCircuito', () => {
  it('empieza en TRABAJO con el primer ejercicio', () => {
    const e = estadoInicialCircuito(0, CLASE);
    expect(e.faseActual).toBe('TRABAJO');
    expect(e.ejercicioActual).toBe('SENTADILLAS');
    expect(e.tiempoRestante).toBe(30);
    expect(e.repeticiones).toBe(0);
    expect(e.finFaseEn).toBe(30000);
    expect(e.totales).toEqual(totalesVacios(CLASE));
    expect(e.combo).toBe(0);
  });

  it('arranca una clase real por su activación', () => {
    const e = estadoInicialCircuito(0, obtenerClase('fuerza-10'));
    expect(e.ejercicioActual).toBe('SENTADILLAS');
    expect(e.tiempoRestante).toBeGreaterThan(0);
  });

  it('usa la posición del primer bloque si está declarada', () => {
    const e = estadoInicialCircuito(0, PAUSA_ACTIVA_OFICINA);
    expect(e.posicion).toBe('sentado');
  });
});

describe('PAUSA_ACTIVA_OFICINA', () => {
  it('genera una transición entre bloques sentado y de pie', () => {
    const bloqueAnterior = PAUSA_ACTIVA_OFICINA.bloques[3];
    const bloqueSiguiente = PAUSA_ACTIVA_OFICINA.bloques[4];
    const tTrabajo = bloqueAnterior.trabajo;
    const tDescanso = bloqueAnterior.descanso;
    const tTransicion = bloqueSiguiente.tiempoTransicionSegundos || 30;

    const ahoraMs = (tTrabajo + tDescanso) * 1000;
    const estadoInicial = estadoInicialCircuito(0, PAUSA_ACTIVA_OFICINA);
    estadoInicial.tiempoRestante = tTrabajo;
    estadoInicial.finFaseEn = ahoraMs;
    estadoInicial.totales = {};

    // 1. Avanzar hasta el final del trabajo -> pasa a DESCANSO
    let paso = avanzarCircuito(estadoInicial, ahoraMs, PAUSA_ACTIVA_OFICINA);
    expect(paso.estado.faseActual).toBe('DESCANSO');
    expect(paso.estado.tiempoRestante).toBe(tDescanso);

    // 2. Avanzar durante el descanso -> detecta cambio de posición y pasa a TRANSICION
    const estadoDescanso = { ...estadoInicial, ...paso.estado };
    paso = avanzarCircuito(estadoDescanso, ahoraMs + tDescanso * 1000, PAUSA_ACTIVA_OFICINA);
    expect(paso.estado.faseActual).toBe('TRANSICION');
    expect(paso.estado.tiempoRestante).toBe(tTransicion);
    expect(paso.estado.posicion).toBe('de_pie');
    expect(paso.sonido).toBe('transicion');

    // 3. Avanzar durante la transición -> expira y arranca TRABAJO de pie
    const estadoTransicion = { ...estadoDescanso, ...paso.estado };
    paso = avanzarTransicion(estadoTransicion, ahoraMs + (tDescanso + tTransicion) * 1000, PAUSA_ACTIVA_OFICINA);
    expect(paso.estado.faseActual).toBe('TRABAJO');
    expect(paso.estado.bloqueActual).toBe(4);
    expect(paso.estado.ejercicioActual).toBe('PRESS_HOMBRO');
    expect(paso.estado.posicion).toBe('de_pie');
    expect(paso.sonido).toBe('inicio');
  });

  it('repite la transición si el detector no la valida', () => {
    const tTrabajo = PAUSA_ACTIVA_OFICINA.bloques[3].trabajo;
    const tDescanso = PAUSA_ACTIVA_OFICINA.bloques[3].descanso;
    const tTransicion = PAUSA_ACTIVA_OFICINA.bloques[4].tiempoTransicionSegundos || 30;

    const ahoraMs = (tTrabajo + tDescanso) * 1000;
    const estadoInicial = estadoInicialCircuito(0, PAUSA_ACTIVA_OFICINA);
    estadoInicial.tiempoRestante = tTrabajo;
    estadoInicial.finFaseEn = ahoraMs;
    estadoInicial.totales = {};

    let paso = avanzarCircuito(estadoInicial, ahoraMs, PAUSA_ACTIVA_OFICINA);
    expect(paso.estado.faseActual).toBe('DESCANSO');

    const estadoDescanso = { ...estadoInicial, ...paso.estado };
    paso = avanzarCircuito(estadoDescanso, ahoraMs + tDescanso * 1000, PAUSA_ACTIVA_OFICINA);
    expect(paso.estado.faseActual).toBe('TRANSICION');

    const estadoTrans = { ...estadoDescanso, ...paso.estado };
    paso = avanzarTransicion(estadoTrans, ahoraMs + (tDescanso + tTransicion + 2) * 1000, PAUSA_ACTIVA_OFICINA);
    const transicionVolver = avanzarCircuito(paso.estado, ahoraMs + (tDescanso + tTransicion + 4) * 1000, PAUSA_ACTIVA_OFICINA);
    expect(transicionVolver.estado.faseActual).toBe('TRABAJO');
  });
});

describe('progresoCircuito', () => {
  it('va de 0 a 1 durante la clase', () => {
    expect(DURACION_TOTAL).toBe(duracionClase(CLASE_POR_DEFECTO));
    expect(progresoCircuito({ faseActual: 'CALIBRACION' }, CLASE)).toBe(0);
    expect(
      progresoCircuito(
        { faseActual: 'TRABAJO', ejercicioActual: 'SENTADILLAS', tiempoRestante: 30 },
        CLASE
      )
    ).toBe(0);
    expect(
      progresoCircuito(
        { faseActual: 'DESCANSO', ejercicioActual: 'SENTADILLAS', tiempoRestante: 15 },
        CLASE
      )
    ).toBeCloseTo(30 / DURACION, 5);
    expect(
      progresoCircuito(
        { faseActual: 'TRABAJO', ejercicioActual: 'PLANCHA', tiempoRestante: 0 },
        CLASE
      )
    ).toBe(1);
    expect(progresoCircuito({ faseActual: 'FIN' }, CLASE)).toBe(1);
  });
});

describe('transcurridoCircuito y progresoSecciones', () => {
  it('calcula el transcurrido en segundos', () => {
    expect(transcurridoCircuito({ faseActual: 'CALIBRACION' }, CLASE)).toBe(0);
    expect(
      transcurridoCircuito(
        { faseActual: 'TRABAJO', ejercicioActual: 'SENTADILLAS', tiempoRestante: 10 },
        CLASE
      )
    ).toBe(20);
    expect(transcurridoCircuito({ faseActual: 'FIN' }, CLASE)).toBe(DURACION);
  });

  it('muestra el avance de cada sección', () => {
    const secciones = progresoSecciones(
      { faseActual: 'TRABAJO', ejercicioActual: 'SENTADILLAS', tiempoRestante: 10 },
      CLASE
    );
    expect(secciones).toHaveLength(1);
    expect(secciones[0]).toMatchObject({
      id: 'bloque',
      duracion: DURACION,
      transcurrido: 20,
      estado: 'actual',
    });
  });

  it('completa las secciones al terminar la clase', () => {
    const secciones = progresoSecciones({ faseActual: 'FIN' }, CLASE);
    expect(secciones.map((seccion) => seccion.estado)).toEqual(['completado']);
  });

  it('devuelve null si la clase no tiene secciones', () => {
    expect(progresoSecciones({ faseActual: 'TRABAJO' }, { bloques: [] })).toBeNull();
  });
});

describe('estacionesCircuito', () => {
  it('marca el primer ejercicio como actual al empezar', () => {
    expect(
      estacionesCircuito({ faseActual: 'TRABAJO', ejercicioActual: 'SENTADILLAS' }, CLASE)
    ).toEqual([
      { ejercicio: 'SENTADILLAS', estado: 'actual' },
      { ejercicio: 'FLEXIONES', estado: 'pendiente' },
      { ejercicio: 'PLANCHA', estado: 'pendiente' },
    ]);
  });

  it('en descanso marca el siguiente como actual', () => {
    expect(
      estacionesCircuito({ faseActual: 'DESCANSO', ejercicioActual: 'SENTADILLAS' }, CLASE)
    ).toEqual([
      { ejercicio: 'SENTADILLAS', estado: 'completado' },
      { ejercicio: 'FLEXIONES', estado: 'actual' },
      { ejercicio: 'PLANCHA', estado: 'pendiente' },
    ]);
  });

  it('marca todo completado al terminar', () => {
    expect(
      estacionesCircuito({ faseActual: 'FIN', ejercicioActual: 'PLANCHA' }, CLASE)
    ).toEqual([
      { ejercicio: 'SENTADILLAS', estado: 'completado' },
      { ejercicio: 'FLEXIONES', estado: 'completado' },
      { ejercicio: 'PLANCHA', estado: 'completado' },
    ]);
  });
});

describe('estacionesSeccion', () => {
  it('resume la clase en sus secciones', () => {
    const estaciones = estacionesSeccion({ faseActual: 'TRABAJO' }, CLASE);
    expect(estaciones).toHaveLength(1);
    expect(estaciones[0]).toMatchObject({ id: 'bloque', estado: 'actual' });
  });

  it('devuelve null si no hay secciones', () => {
    expect(estacionesSeccion({ faseActual: 'TRABAJO' }, { bloques: [] })).toBeNull();
  });
});

describe('avanzarCircuito', () => {
  it('devuelve null cuando no cambia el segundo', () => {
    expect(avanzarCircuito(estadoInicialCircuito(0, CLASE), 0, CLASE)).toBeNull();
  });

  it('descuenta segundos con el tiempo real', () => {
    const r = avanzarCircuito(estadoInicialCircuito(0, CLASE), 10000, CLASE);
    expect(r).toEqual({ estado: { tiempoRestante: 20 }, sonido: null });
  });

  it('cambia a DESCANSO al terminar el trabajo y acumula repeticiones', () => {
    const e = { ...estadoInicialCircuito(0, CLASE), repeticiones: 7 };
    const r = avanzarCircuito(e, 30000, CLASE);
    expect(r.estado.faseActual).toBe('DESCANSO');
    expect(r.estado.tiempoRestante).toBe(15);
    expect(r.estado.totales.SENTADILLAS).toBe(7);
    expect(r.sonido).toBe('silbato');
  });

  it('avanza al siguiente ejercicio tras el descanso', () => {
    const e = {
      ...estadoInicialCircuito(0, CLASE),
      faseActual: 'DESCANSO',
      tiempoRestante: 0,
      finFaseEn: 45000,
    };
    const r = avanzarCircuito(e, 45000, CLASE);
    expect(r.estado.faseActual).toBe('TRABAJO');
    expect(r.estado.ejercicioActual).toBe('FLEXIONES');
    expect(r.estado.tiempoRestante).toBe(30);
    expect(r.estado.repeticiones).toBe(0);
    expect(r.sonido).toBe('inicio');
  });

  it('acumula los segundos sostenidos en ejercicios de tiempo', () => {
    const e = {
      ...estadoInicialCircuito(0, CLASE),
      bloqueActual: 2,
      ejercicioActual: 'PLANCHA',
      finFaseEn: 0,
    };
    const r = avanzarCircuito(e, 0, CLASE);
    expect(r.estado.totales.PLANCHA).toBe(20);
  });

  it('recorre el circuito completo y termina en FIN', () => {
    let estado = estadoInicialCircuito(0, CLASE);

    estado = { ...estado, repeticiones: 10 };
    estado = aplicar(estado, 30000).estado;
    expect(estado.faseActual).toBe('DESCANSO');

    estado = aplicar(estado, 45000).estado;
    expect(estado.ejercicioActual).toBe('FLEXIONES');

    estado = { ...estado, repeticiones: 6 };
    estado = aplicar(estado, 75000).estado;
    expect(estado.totales.FLEXIONES).toBe(6);

    estado = aplicar(estado, 90000).estado;
    expect(estado.ejercicioActual).toBe('PLANCHA');

    const fin = aplicar(estado, 110000);
    expect(fin.estado.faseActual).toBe('FIN');
    expect(fin.estado.tiempoRestante).toBe(0);
    expect(fin.estado.finFaseEn).toBeNull();
    expect(fin.estado.totales).toEqual({
      SENTADILLAS: 10,
      FLEXIONES: 6,
      PLANCHA: 20,
    });
  });
});
