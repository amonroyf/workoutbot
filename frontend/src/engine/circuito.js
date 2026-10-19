export const EJERCICIOS = ['SENTADILLAS', 'FLEXIONES', 'JUMPING_JACKS'];
export const TIEMPO_TRABAJO = 40;
export const TIEMPO_DESCANSO = 20;
export const DURACION_TOTAL =
  TIEMPO_TRABAJO * EJERCICIOS.length + TIEMPO_DESCANSO * (EJERCICIOS.length - 1);

export function totalesVacios() {
  return { SENTADILLAS: 0, FLEXIONES: 0, JUMPING_JACKS: 0 };
}

export function progresoCircuito(estado) {
  if (estado.faseActual === 'FIN') return 1;
  if (estado.faseActual === 'CALIBRACION') return 0;

  const indice = EJERCICIOS.indexOf(estado.ejercicioActual);
  if (indice < 0) return 0;

  const transcurrido =
    indice * (TIEMPO_TRABAJO + TIEMPO_DESCANSO) +
    (estado.faseActual === 'TRABAJO'
      ? TIEMPO_TRABAJO - estado.tiempoRestante
      : TIEMPO_TRABAJO + (TIEMPO_DESCANSO - estado.tiempoRestante));

  return Math.min(1, Math.max(0, transcurrido / DURACION_TOTAL));
}

export function estadoInicialCircuito(ahoraMs) {
  return {
    faseActual: 'TRABAJO',
    ejercicioActual: EJERCICIOS[0],
    tiempoRestante: TIEMPO_TRABAJO,
    repeticiones: 0,
    combo: 0,
    totales: totalesVacios(),
    finFaseEn: ahoraMs + TIEMPO_TRABAJO * 1000,
  };
}

export function avanzarCircuito(estado, ahoraMs) {
  if (estado.finFaseEn == null) return null;

  const restante = Math.max(0, Math.ceil((estado.finFaseEn - ahoraMs) / 1000));

  if (restante > 0) {
    if (restante === estado.tiempoRestante) return null;
    return { estado: { tiempoRestante: restante }, sonido: null };
  }

  if (estado.faseActual === 'TRABAJO') {
    return {
      estado: {
        faseActual: 'DESCANSO',
        tiempoRestante: TIEMPO_DESCANSO,
        finFaseEn: ahoraMs + TIEMPO_DESCANSO * 1000,
        totales: { ...estado.totales, [estado.ejercicioActual]: estado.repeticiones },
        combo: 0,
      },
      sonido: 'silbato',
    };
  }

  const idxActual = EJERCICIOS.indexOf(estado.ejercicioActual);
  if (idxActual < EJERCICIOS.length - 1) {
    return {
      estado: {
        faseActual: 'TRABAJO',
        ejercicioActual: EJERCICIOS[idxActual + 1],
        tiempoRestante: TIEMPO_TRABAJO,
        finFaseEn: ahoraMs + TIEMPO_TRABAJO * 1000,
        repeticiones: 0,
        combo: 0,
      },
      sonido: 'inicio',
    };
  }

  return {
    estado: { faseActual: 'FIN', tiempoRestante: 0, finFaseEn: null },
    sonido: 'silbato',
  };
}
