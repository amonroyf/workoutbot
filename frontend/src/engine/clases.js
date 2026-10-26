import { GRUPOS_EJERCICIOS } from './ejercicios.js';
// Catálogo de clases grupales funcionales de WorkoutBot.
//
// Cuatro arquetipos (fuerza, hiit, combat, core) con sesiones rápidas y
// funcionales. Cada clase imita una clase grupal real: activación funcional,
// bloque principal y vuelta a la calma, con música, descansos y voz de
// instructor. Solo peso corporal, sin objetos.

export const ARQUETIPOS = Object.freeze([
  Object.freeze({
    id: 'fuerza',
    nombre: 'Fuerza',
    descripcion: 'Fuerza total con movimientos compuestos',
    color: '#f97316',
    impacto: 'bajo',
    bpm: 128,
  }),
  Object.freeze({
    id: 'hiit',
    nombre: 'HIIT',
    descripcion: 'Intervalos de alta intensidad, sesión corta',
    color: '#ef4444',
    impacto: 'alto',
    bpm: 156,
  }),
  Object.freeze({
    id: 'combat',
    nombre: 'Combat',
    descripcion: 'Golpes y patadas sin contacto',
    color: '#8b5cf6',
    impacto: 'medio',
    bpm: 144,
  }),
  Object.freeze({
    id: 'core',
    nombre: 'Core',
    descripcion: 'Centro fuerte, postura y control',
    color: '#06b6d4',
    impacto: 'bajo',
    bpm: 118,
  }),
]);

export function obtenerArquetipo(id) {
  return ARQUETIPOS.find((arquetipo) => arquetipo.id === id) || null;
}

function bloque(ejercicio, trabajo, descanso = 0, intensidad = 'media', pistaVoz = null) {
  return Object.freeze({
    ejercicio,
    trabajo,
    descanso,
    intensidad,
    ...(pistaVoz ? { pistaVoz } : {}),
  });
}

export function generarTabata(ejercicios) {
  return ejercicios.map((ej) =>
    bloque(ej, 20, 10, 'alta')
  );
}

export function generarCircuito(ejercicios, trabajo, descanso, intensidad = 'media') {
  return ejercicios.map((ej) =>
    bloque(ej, trabajo, descanso, intensidad)
  );
}

function seccion(id, nombre, nombreCorto, tipo, bloques, extra = {}) {
  return Object.freeze({
    id,
    nombre,
    nombreCorto,
    tipo,
    rondas: extra.rondas || 1,
    ...(extra.descansoRonda ? { descansoRonda: extra.descansoRonda } : {}),
    ...(extra.pistaVoz ? { pistaVoz: extra.pistaVoz } : {}),
    bloques: Object.freeze(bloques),
  });
}

const ACTIVACION = 'activacion';
const PRINCIPAL = 'principal';
const ENFRIAMIENTO = 'enfriamiento';
const FINISHER = 'finisher';

const MAPA_ACTIVACION = {
  piernas: ['SENTADILLAS', 'ZANCADAS'],
  empuje: ['FLEXIONES', 'PRESS_HOMBRO'],
  tiron: ['REMO', 'PESO_MUERTO'],
  core_frontal: ['PLANCHA', 'PUENTE_GLUTEO'],
  core_lateral: ['ROTACION_TORSO'],
  cardio: ['JUMPING_JACKS', 'RODILLAS_ALTAS'],
  combat: ['GOLPE_DIRECTO', 'ROTACION_TORSO']
};

const MAPA_ENFRIAMIENTO = {
  piernas: ['WALL_SIT', 'SENTADILLA_SUMO'],
  empuje: ['PLANCHA', 'ROTACION_TORSO'],
  tiron: ['PESO_MUERTO', 'SUPERMAN'],
  core_frontal: ['PUENTE_GLUTEO', 'PLANCHA'],
  core_lateral: ['PLANCHA_LATERAL', 'ROTACION_TORSO'],
  cardio: ['WALL_SIT', 'PLANCHA'],
  combat: ['ROTACION_TORSO', 'PLANCHA']
};



function activacion(bloques, pistaVoz) {
  return seccion('activacion', 'Activación funcional', 'Activación', ACTIVACION, bloques, {
    pistaVoz,
  });
}

function calma(bloques, pistaVoz) {
  return seccion('enfriamiento', 'Vuelta a la calma', 'Calma', ENFRIAMIENTO, bloques, { pistaVoz });
}

export function finisherCondicional(bloques, pistaVoz) {
  return seccion('finisher_1', 'Burnout Final', 'Burnout', FINISHER, bloques, { pistaVoz });
}

function base(id, nombre, arquetipo, nivel, extra) {
  const cruda = {
    id,
    nombre,
    arquetipo,
    nivel,
    tipo: 'clase',
    formato: 'clase',
    etiqueta: extra.etiqueta,
    descripcion: extra.descripcion,
    duracionMin: extra.duracionMin,
    impacto: extra.impacto || obtenerArquetipo(arquetipo)?.impacto || 'bajo',
    equipamiento: extra.equipamiento || [],
    briefing: extra.briefing,
    cues: extra.cues || [],
    secciones: extra.secciones,
  };
  return ajustarDuracion(cruda, extra.duracionMin * 60);
}

// Ajusta una clase a su duración objetivo escalando trabajo y descanso de
// forma proporcional. Mantiene la estructura (secciones, rondas, orden).
function duracionExpandida(clase) {
  return clase.secciones.reduce((total, seccion) => {
    const rondas = Math.max(1, seccion.rondas || 1);
    let subtotal = 0;
    const bloques = seccion.bloques || [];
    for (let ronda = 1; ronda <= rondas; ronda += 1) {
      bloques.forEach((bloque, indice) => {
        const esUltimo = indice === bloques.length - 1;
        const descanso =
          esUltimo && ronda < rondas
            ? seccion.descansoRonda ?? bloque.descanso ?? 0
            : bloque.descanso ?? 0;
        subtotal += bloque.trabajo + descanso;
      });
    }
    return total + subtotal;
  }, 0);
}

export function ajustarDuracion(clase, objetivoSeg) {
  const actual = duracionExpandida(clase);
  if (!objetivoSeg || actual <= 0) return clase;

  const factor = objetivoSeg / actual;
  const escalar = (valor, minimo) =>
    valor ? Math.max(minimo, Math.round(valor * factor)) : 0;

  const secciones = clase.secciones.map((seccion) => ({
    ...seccion,
    ...(seccion.descansoRonda
      ? { descansoRonda: escalar(seccion.descansoRonda, 10) }
      : {}),
    bloques: (seccion.bloques || []).map((bloque) => ({
      ...bloque,
      trabajo: escalar(bloque.trabajo, 8),
      descanso: escalar(bloque.descanso, 5),
    })),
  }));

  return { ...clase, secciones };
}

// --- Fuerza funcional -----------------------------------------------------

const CLASE_MAESTRA_FUERZA = base('fuerza', 'Fuerza', 'fuerza', 'multinivel', {
  etiqueta: 'Libre',
  duracionMin: 30,
  descripcion: 'Desarrollo de fuerza total. Selecciona tu tiempo.',
  secciones: [
    activacionDinamica('Activación muscular.'),
    seccion('bloque1', 'Piernas', 'Piernas', PRINCIPAL, [
      bloque('piernas', 45, 15, 'media', ''),
      bloque('piernas', 45, 15, 'media', ''),
    ], { rondas: 3, descansoRonda: 20 }),
    seccion('bloque2', 'Torso', 'Torso', PRINCIPAL, [
      bloque('empuje', 45, 15, 'media', ''),
      bloque('tiron', 45, 15, 'media', ''),
    ], { rondas: 3, descansoRonda: 20 }),
    seccion('core', 'Core', 'Core', PRINCIPAL, [
      bloque('core_frontal', 45, 15, 'media', ''),
      bloque('core_lateral', 45, 15, 'media', ''),
    ], { rondas: 2 }),
    calmaDinamica('Vuelta a la calma.'),
  ],
});

const CLASE_MAESTRA_HIIT = base('hiit', 'HIIT', 'hiit', 'multinivel', {
  etiqueta: 'Libre',
  duracionMin: 30,
  descripcion: 'Intervalos de alta intensidad. Selecciona tu tiempo.',
  secciones: [
    activacionDinamica('Activación metabólica.'),
    seccion('pico', 'Bloque 1', 'Bloque 1', PRINCIPAL, [
      bloque('combat', 40, 20, 'alta', ''),
      bloque('cardio', 40, 20, 'alta', ''),
    ], { rondas: 3, descansoRonda: 30 }),
    seccion('core', 'Core', 'Core', PRINCIPAL, [
      bloque('core_frontal', 40, 20, 'alta', ''),
    ], { rondas: 2 }),
    calmaDinamica('Vuelta a la calma.'),
  ],
});

const CLASE_MAESTRA_COMBAT = base('combat', 'Combat', 'combat', 'multinivel', {
  etiqueta: 'Libre',
  duracionMin: 30,
  descripcion: 'Golpes y patadas sin contacto. Selecciona tu tiempo.',
  secciones: [
    activacionDinamica('Activación de golpeo.'),
    seccion('combate', 'Combate', 'Combate', PRINCIPAL, [
      bloque('empuje', 40, 15, 'media', ''),
      bloque('cardio', 40, 15, 'media', ''),
    ], { rondas: 3, descansoRonda: 20 }),
    calmaDinamica('Vuelta a la calma.'),
  ],
});

const CLASE_MAESTRA_CORE = base('core', 'Core', 'core', 'multinivel', {
  etiqueta: 'Libre',
  duracionMin: 30,
  descripcion: 'Centro fuerte, postura y control. Selecciona tu tiempo.',
  secciones: [
    activacionDinamica('Activación de centro.'),
    seccion('core', 'Core', 'Core', PRINCIPAL, [
      bloque('core_frontal', 45, 15, 'media', ''),
      bloque('core_lateral', 45, 15, 'media', ''),
    ], { rondas: 3, descansoRonda: 20 }),
    calmaDinamica('Vuelta a la calma.'),
  ],
});

const CLASES_MAESTRAS = Object.freeze([
  CLASE_MAESTRA_FUERZA,
  CLASE_MAESTRA_HIIT,
  CLASE_MAESTRA_COMBAT,
  CLASE_MAESTRA_CORE,
]);



function congelarLista(lista) {
  return Object.freeze(lista.map((item) => Object.freeze({ ...item })));
}

function obtenerSemillaDelDia(claseId, offset = 0) {
  const hoy = new Date();
  const fechaStr = `${hoy.getFullYear()}-${hoy.getMonth()}-${hoy.getDate()}`;
  // El offset muta el hash sin mover la fecha: cada offset produce una variante
  // distinta pero reproducible de la misma clase del día.
  const str = `${claseId}-${fechaStr}-${offset}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = Math.imul(31, hash) + str.charCodeAt(i) | 0;
  }
  return hash;
}

function crearGenerador(semilla) {
  let x = semilla;
  return function() {
    x = (x * 9301 + 49297) % 233280;
    return x / 233280;
  };
}

function resolverEjercicio(ejercicio_o_grupo, rng) {
  if (GRUPOS_EJERCICIOS[ejercicio_o_grupo]) {
    const opciones = GRUPOS_EJERCICIOS[ejercicio_o_grupo];
    return opciones[Math.floor(Math.abs(rng()) * opciones.length)];
  }
  return ejercicio_o_grupo;
}

export function activacionDinamica(pistaVoz) {
  return { id: 'activacion', dinamica: true, tipo: ACTIVACION, nombre: 'Activación funcional', nombreCorto: 'Activ.', pistaVoz, rondas: 1, bloques: [bloque('MARCHA_SUAVE', 30, 0, 'suave', ''), bloque('MARCHA_SUAVE', 30, 0, 'suave', ''), bloque('MARCHA_SUAVE', 30, 0, 'suave', ''), bloque('MARCHA_SUAVE', 30, 0, 'suave', '')] };
}

export function calmaDinamica(pistaVoz) {
  return { id: 'enfriamiento', dinamica: true, tipo: ENFRIAMIENTO, nombre: 'Vuelta a la calma', nombreCorto: 'Calma', pistaVoz, rondas: 1, bloques: [bloque('MARCHA_SUAVE', 40, 0, 'suave', ''), bloque('MARCHA_SUAVE', 40, 0, 'suave', ''), bloque('MARCHA_SUAVE', 40, 0, 'suave', ''), bloque('MARCHA_SUAVE', 40, 0, 'suave', '')] };
}

export function compilarClase(claseBase, offset = 0) {
  const semilla = obtenerSemillaDelDia(claseBase.id, offset);
  const rng = crearGenerador(semilla);

  const gruposActivos = new Set();

  const seccionesParciales = claseBase.secciones.map(seccion => {
    if (seccion.dinamica) return seccion;

    const bloquesResueltos = seccion.bloques.map(b => {
      const resuelto = resolverEjercicio(b.ejercicio, rng);

      const grupo = Object.keys(GRUPOS_EJERCICIOS).find(g =>
        GRUPOS_EJERCICIOS[g].includes(resuelto)
      ) || b.ejercicio;

      gruposActivos.add(grupo);
      return { ...b, ejercicio: resuelto };
    });

    return { ...seccion, bloques: bloquesResueltos };
  });

  const construirBloquesDinamicos = (tipo, intensidad, trabajoBase) => {
    const mapa = tipo === 'activacion' ? MAPA_ACTIVACION : MAPA_ENFRIAMIENTO;
    const seleccionados = new Set();

    gruposActivos.forEach(grupo => {
      if (mapa[grupo]) mapa[grupo].forEach(ej => seleccionados.add(ej));
    });

    return Array.from(seleccionados).slice(0, 4).map(ej =>
      bloque(ej, trabajoBase, 0, intensidad, '')
    );
  };

  const totalSecciones = claseBase.secciones.length;
  const bloquesFinales = [];

  seccionesParciales.forEach((seccionParcial, seccionIndex) => {
    let bloquesActuales = seccionParcial.bloques || [];

    if (seccionParcial.dinamica) {
      const trabajoBase = seccionParcial.bloques?.[0]?.trabajo || (seccionParcial.tipo === 'activacion' ? 30 : 40);
      bloquesActuales = seccionParcial.tipo === 'activacion'
        ? construirBloquesDinamicos('activacion', 'suave', trabajoBase)
        : construirBloquesDinamicos('enfriamiento', 'suave', trabajoBase);
    }

    const totalRondas = Math.max(1, seccionParcial.rondas || 1);

    for (let ronda = 1; ronda <= totalRondas; ronda += 1) {
      bloquesActuales.forEach((b, indice) => {
        const esUltimo = indice === bloquesActuales.length - 1;
        const descanso = esUltimo && ronda < totalRondas
          ? seccionParcial.descansoRonda ?? b.descanso ?? 0
          : b.descanso ?? 0;

        bloquesFinales.push(Object.freeze({
          ...b,
          descanso,
          seccionId: seccionParcial.id,
          seccionNombre: seccionParcial.nombre,
          seccionTipo: seccionParcial.tipo,
          seccionIndex,
          totalSecciones,
          ronda,
          totalRondas,
        }));
      });
    }
  });

  return Object.freeze({
    ...claseBase,
    bloques: Object.freeze(bloquesFinales),
    duracion: bloquesFinales.reduce((t, b) => t + b.trabajo + b.descanso, 0),
    // Objetivo original de duración (segundos): lo usa el barajado para
    // recompilar variantes que conserven exactamente la misma duración.
    duracionObjetivo:
      claseBase.duracionObjetivo ??
      (claseBase.duracionMin ? claseBase.duracionMin * 60 : null),
  });
}

export const CLASES = Object.freeze(CLASES_MAESTRAS.map((clase) => compilarClase(clase)));

export const CLASE_POR_DEFECTO = CLASES[0];

// La puerta de entrada es la clase corta y amable de core.
export const CLASE_INICIAL = generarClase('core', 5) || CLASE_POR_DEFECTO;

export function generarClase(arquetipoId, minutos, offset = 0) {
  const claseBase = CLASES_MAESTRAS.find((c) => c.arquetipo === arquetipoId);
  if (!claseBase) return null;
  const objetivoSeg = minutos * 60;
  const claseAjustada = {
    ...ajustarDuracion(claseBase, objetivoSeg),
    duracionObjetivo: objetivoSeg,
  };
  return compilarClase(claseAjustada, offset);
}

// Re-arma una clase ya compilada con un offset de semilla distinto: conserva
// arquetipo y duración objetivo exactos. Se referencia por la clase compilada
// (no por id) porque las variantes ajustadas comparten el id de la maestra.
export function barajarClase(claseCompilada, offset = 0) {
  if (!claseCompilada) return null;
  const base = CLASES_MAESTRAS.find((c) => c.arquetipo === claseCompilada.arquetipo);
  if (!base) return null;
  const objetivoSeg = claseCompilada.duracionObjetivo || duracionClase(claseCompilada);
  return compilarClase(
    { ...ajustarDuracion(base, objetivoSeg), duracionObjetivo: objetivoSeg },
    offset
  );
}

export function obtenerClase(id, offset = 0) {
  // Primero intenta el id de la maestra (p. ej. 'core'). Si no existe, intenta
  // los ids derivados del plan semanal con formato '<arquetipo>-<minutos>'
  // (p. ej. 'fuerza-10'), regresando una clase compilada del arquetipo dado.
  const base = CLASES_MAESTRAS.find((clase) => clase.id === id);
  if (base) return compilarClase(base, offset);
  const coincidencia = /^(\w+)-(\d{1,2})$/.exec(id);
  if (coincidencia) {
    const clase = generarClase(coincidencia[1], Number(coincidencia[2]), offset);
    if (clase) return clase;
  }
  return null;
}

export function clasesDeArquetipo(arquetipo) {
  return CLASES_MAESTRAS.filter((clase) => clase.arquetipo === arquetipo).map((clase) => compilarClase(clase));
}

export function resumenSecciones(clase) {
  if (!clase || !Array.isArray(clase.secciones)) return null;

  return clase.secciones.map((seccion, i) => {
    const bloques = clase.bloques.filter((bloque) => bloque.seccionIndex === i);
    return {
      id: seccion.id,
      nombre: seccion.nombre,
      nombreCorto: seccion.nombreCorto || seccion.nombre,
      tipo: seccion.tipo,
      rondas: seccion.rondas || 1,
      duracion: bloques.reduce(
        (total, bloque) => total + bloque.trabajo + (bloque.descanso || 0),
        0
      ),
      ejercicios: [...new Set(bloques.map((bloque) => bloque.ejercicio))],
    };
  });
}

export function duracionClase(clase = CLASE_POR_DEFECTO) {
  return clase.bloques.reduce(
    (total, bloque) => total + bloque.trabajo + (bloque.descanso || 0),
    0
  );
}

export function formatearDuracion(segundos) {
  const minutos = Math.floor(segundos / 60);
  const resto = segundos % 60;
  if (minutos === 0) return `${resto}s`;
  if (resto === 0) return `${minutos} min`;
  return `${minutos} min ${resto}s`;
}

export function etiquetaFormato(clase) {
  if (clase?.etiqueta) return clase.etiqueta;
  const arquetipo = clase?.arquetipo ? obtenerArquetipo(clase.arquetipo) : null;
  return arquetipo?.nombre || 'Clase';
}

export function formatearReloj(segundos) {
  const total = Math.max(0, Math.round(segundos));
  const minutos = Math.floor(total / 60);
  const resto = total % 60;
  return `${minutos}:${String(resto).padStart(2, '0')}`;
}
