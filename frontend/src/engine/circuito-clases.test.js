import { describe, it, expect } from 'vitest';
import { obtenerClase } from './clases';
import {
  estadoInicialCircuito,
  avanzarCircuito,
  totalesVacios,
} from './circuito';

const CORE_5 = obtenerClase('core-5');

function aplicar(estado, ahoraMs, clase = CORE_5) {
  const resultado = avanzarCircuito(estado, ahoraMs, clase);
  if (!resultado) return { estado, sonido: null };
  return { estado: { ...estado, ...resultado.estado }, sonido: resultado.sonido };
}

describe('motor de una clase real', () => {
  it('inicia con el primer bloque de la clase elegida', () => {
    const estado = estadoInicialCircuito(0, CORE_5);
    expect(estado.claseId).toBe('core-5');
    expect(estado.bloqueActual).toBe(0);
    expect(estado.ejercicioActual).toBe('BIRD_DOG');
    expect(estado.tiempoRestante).toBe(Math.ceil(CORE_5.bloques[0].trabajo / 2));
    expect(estado.totales).toEqual(totalesVacios(CORE_5));
  });

  it('avanza de un ejercicio de tiempo al siguiente sin descanso', () => {
    let { estado } = { estado: estadoInicialCircuito(0, CORE_5) };
    const trabajo = Math.ceil(CORE_5.bloques[0].trabajo / 2);

    estado = aplicar(estado, trabajo * 1000).estado;
    expect(estado.ejercicioActual).toBe('BIRD_DOG');
    expect(estado.totales.BIRD_DOG).toBe(trabajo);
    expect(estado.faseActual).toBe('CAMBIO_LADO');
  });

  it('acumula repeticiones manuales y pasa a descanso', () => {
    const base = estadoInicialCircuito(0, CORE_5);
    const indice = CORE_5.bloques.findIndex(
      (bloque) => bloque.ejercicio === 'ABDOMINALES'
    );
    const bloque = CORE_5.bloques[indice];
    const estado = {
      ...base,
      bloqueActual: indice,
      ejercicioActual: 'ABDOMINALES',
      repeticiones: 6,
      finFaseEn: 0,
    };

    const resultado = avanzarCircuito(estado, 0, CORE_5);
    expect(resultado.estado.faseActual).toBe('DESCANSO');
    expect(resultado.estado.tiempoRestante).toBe(bloque.descanso);
    expect(resultado.estado.totales.ABDOMINALES).toBe(6);
  });

  it('termina en FIN al completar el último bloque', () => {
    const base = estadoInicialCircuito(0, CORE_5);
    const ultimo = CORE_5.bloques.length - 1;
    const bloque = CORE_5.bloques[ultimo];
    const estado = {
      ...base,
      bloqueActual: ultimo,
      ejercicioActual: bloque.ejercicio,
      finFaseEn: 0,
    };

    const resultado = avanzarCircuito(estado, 0, CORE_5);
    expect(resultado.estado.faseActual).toBe('FIN');
    expect(resultado.estado.totales[bloque.ejercicio]).toBe(bloque.trabajo);
    expect(resultado.sonido).toBe('silbato');
  });
});
