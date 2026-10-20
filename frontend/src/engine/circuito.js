import { CLASE_POR_DEFECTO, duracionClase } from './clases';

export const EJERCICIOS = CLASE_POR_DEFECTO.bloques.map((bloque) => bloque.ejercicio);
export const TIEMPO_TRABAJO = CLASE_POR_DEFECTO.bloques[0].trabajo;
export const TIEMPO_DESCANSO = CLASE_POR_DEFECTO.bloques[0].descanso;
export const DURACION_TOTAL = duracionClase(CLASE_POR_DEFECTO);

export function totalesVacios(clase = CLASE_POR_DEFECTO) {
  const totales = {};
  for (const bloque of clase.bloques) {
    totales[bloque.ejercicio] = 0;
  }
  return totales;
}

function indiceBloque(estado, clase) {
  if (Number.isInteger(estado.bloqueActual) && estado.bloqueActual >= 0) {
    return estado.bloqueActual;
  }
  const indice = clase.bloques.findIndex((bloque) => bloque.ejercicio === estado.ejercicioActual);
  return indice < 0 ? 0 : indice;
}

function descansoDe(bloque) {
  return bloque.descanso || 0;
}

export function progresoCircuito(estado, clase = CLASE_POR_DEFECTO) {
  if (estado.faseActual === 'FIN') return 1;
  if (estado.faseActual === 'CALIBRACION') return 0;

  const indice = indiceBloque(estado, clase);
  const bloque = clase.bloques[indice];
  if (!bloque) return 0;

  let previos = 0;
  for (let i = 0; i < indice; i += 1) {
    previos += clase.bloques[i].trabajo + descansoDe(clase.bloques[i]);
  }

  const transcurrido =
    estado.faseActual === 'TRABAJO'
      ? previos + (bloque.trabajo - estado.tiempoRestante)
      : previos + bloque.trabajo + (descansoDe(bloque) - estado.tiempoRestante);

  const total = duracionClase(clase);
  return Math.min(1, Math.max(0, transcurrido / total));
}

export function estacionesCircuito(estado, clase = CLASE_POR_DEFECTO) {
  if (estado.faseActual === 'FIN') {
    return clase.bloques.map((bloque) => ({ ejercicio: bloque.ejercicio, estado: 'completado' }));
  }

  if (estado.faseActual === 'CALIBRACION') {
    return clase.bloques.map((bloque) => ({ ejercicio: bloque.ejercicio, estado: 'pendiente' }));
  }

  const indice = indiceBloque(estado, clase);

  return clase.bloques.map((bloque, i) => {
    if (estado.faseActual === 'DESCANSO') {
      if (i <= indice) return { ejercicio: bloque.ejercicio, estado: 'completado' };
      if (i === indice + 1) return { ejercicio: bloque.ejercicio, estado: 'actual' };
      return { ejercicio: bloque.ejercicio, estado: 'pendiente' };
    }

    if (i < indice) return { ejercicio: bloque.ejercicio, estado: 'completado' };
    if (i === indice) return { ejercicio: bloque.ejercicio, estado: 'actual' };
    return { ejercicio: bloque.ejercicio, estado: 'pendiente' };
  });
}

export function estacionesSeccion(estado, clase = CLASE_POR_DEFECTO) {
  if (!Array.isArray(clase.secciones)) return null;

  const indice = indiceBloque(estado, clase);
  const bloque = clase.bloques[indice];
  const esFin = estado.faseActual === 'FIN';
  const esCalibracion = estado.faseActual === 'CALIBRACION';
  const referencia =
    !esFin && !esCalibracion && estado.faseActual === 'DESCANSO'
      ? clase.bloques[indice + 1] || bloque
      : bloque;
  const seccionActual = referencia?.seccionIndex ?? 0;

  return clase.secciones.map((seccion, i) => {
    let estadoSeccion = 'pendiente';
    if (esFin || i < seccionActual) estadoSeccion = 'completado';
    else if (!esCalibracion && i === seccionActual) estadoSeccion = 'actual';

    return {
      id: seccion.id,
      nombre: seccion.nombre,
      estado: estadoSeccion,
      ronda: i === seccionActual ? referencia?.ronda ?? 1 : null,
      totalRondas: seccion.rondas || 1,
    };
  });
}

export function estadoInicialCircuito(ahoraMs, clase = CLASE_POR_DEFECTO) {
  const bloque = clase.bloques[0];
  return {
    faseActual: 'TRABAJO',
    claseId: clase.id,
    bloqueActual: 0,
    ejercicioActual: bloque.ejercicio,
    tiempoRestante: bloque.trabajo,
    repeticiones: 0,
    combo: 0,
    totales: totalesVacios(clase),
    finFaseEn: ahoraMs + bloque.trabajo * 1000,
  };
}

export function avanzarCircuito(estado, ahoraMs, clase = CLASE_POR_DEFECTO) {
  if (estado.finFaseEn == null) return null;

  const restante = Math.max(0, Math.ceil((estado.finFaseEn - ahoraMs) / 1000));

  if (restante > 0) {
    if (restante === estado.tiempoRestante) return null;
    return { estado: { tiempoRestante: restante }, sonido: null };
  }

  const indice = indiceBloque(estado, clase);
  const bloque = clase.bloques[indice];
  const esTrabajo = estado.faseActual === 'TRABAJO';

  const totales = esTrabajo
    ? {
        ...estado.totales,
        [estado.ejercicioActual]:
          (estado.totales[estado.ejercicioActual] || 0) + estado.repeticiones,
      }
    : estado.totales;

  if (esTrabajo && descansoDe(bloque) > 0) {
    return {
      estado: {
        faseActual: 'DESCANSO',
        tiempoRestante: descansoDe(bloque),
        finFaseEn: ahoraMs + descansoDe(bloque) * 1000,
        totales,
        combo: 0,
      },
      sonido: 'silbato',
    };
  }

  const siguienteIndice = indice + 1;
  if (siguienteIndice < clase.bloques.length) {
    const siguiente = clase.bloques[siguienteIndice];
    return {
      estado: {
        faseActual: 'TRABAJO',
        bloqueActual: siguienteIndice,
        ejercicioActual: siguiente.ejercicio,
        tiempoRestante: siguiente.trabajo,
        finFaseEn: ahoraMs + siguiente.trabajo * 1000,
        repeticiones: 0,
        combo: 0,
        totales,
      },
      sonido: 'inicio',
    };
  }

  return {
    estado: { faseActual: 'FIN', tiempoRestante: 0, finFaseEn: null, totales },
    sonido: 'silbato',
  };
}
