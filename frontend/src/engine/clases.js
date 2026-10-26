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
    for (let ronda = 1; ronda <= rondas; ronda += 1) {
      seccion.bloques.forEach((bloque, indice) => {
        const esUltimo = indice === seccion.bloques.length - 1;
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

function ajustarDuracion(clase, objetivoSeg) {
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
    bloques: seccion.bloques.map((bloque) => ({
      ...bloque,
      trabajo: escalar(bloque.trabajo, 8),
      descanso: escalar(bloque.descanso, 5),
    })),
  }));

  return { ...clase, secciones };
}

// --- Fuerza funcional -----------------------------------------------------

const FUERZA_10 = base('fuerza-10', 'Fuerza 10', 'fuerza', 'principiante', {
  etiqueta: '10 min',
  duracionMin: 10,
  descripcion: 'Circuito funcional de cuerpo completo para días con poco tiempo.',
  equipamiento: [],
  briefing: 'Peso corporal. Técnica y control antes que velocidad.',
  cues: ['Reps controladas', 'Abdomen firme'],
  secciones: [
    activacion([
      bloque('SENTADILLAS', 30, 0, 'suave', 'Sentadillas suaves, rango cómodo.'),
      bloque('FLEXIONES', 30, 0, 'suave', 'Flexiones apoyando rodillas si hace falta.'),
      bloque('PESO_MUERTO', 30, 0, 'suave', 'Bisagra de cadera, espalda larga.'),
    ], 'Activación funcional. Preparamos el cuerpo.'),
    seccion('bloque', 'Circuito de fuerza', 'Fuerza', PRINCIPAL, [
      bloque('SENTADILLAS', 30, 15, 'media', 'Sentadilla, cadera atrás y pecho arriba.'),
      bloque('FLEXIONES', 30, 15, 'media', 'Flexión, cuerpo en plancha.'),
      bloque('REMO', 30, 15, 'media', 'Remo, codos atrás y espalda firme.'),
      bloque('PESO_MUERTO', 30, 15, 'media', 'Bisagra, empuja el piso con los pies.'),
    ], { rondas: 2, descansoRonda: 20, pistaVoz: 'Dos rondas de fuerza. Misma técnica.' }),
    seccion('core', 'Core', 'Core', PRINCIPAL, [
      bloque('PLANCHA', 40, 0, 'media', 'Plancha, abdomen firme.'),
    ], { pistaVoz: 'Cierre de abdomen. Aguanta.' }),
    calma([
      bloque('MARCHA_SUAVE', 20, 0, 'suave', 'Baja el pulso caminando suave.'),
      bloque('ESTIRAMIENTO_GENERAL', 40, 0, 'suave', 'Estira sin rebotar.'),
    ], 'Vuelta a la calma. Respira.'),
  ],
});

const FUERZA_30 = base('fuerza-30', 'Fuerza 30', 'fuerza', 'principiante', {
  etiqueta: '30 min',
  duracionMin: 30,
  descripcion: 'Bloques de piernas, empuje y tirón con movimientos compuestos.',
  equipamiento: [],
  briefing: 'Carga el peso en los pies y el control en el abdomen. Sin prisa.',
  cues: ['Tempo controlado', 'Rango completo', 'Respira en cada repetición'],
  secciones: [
    activacion([
      bloque('SENTADILLAS', 45, 0, 'suave', 'Sentadillas para subir la temperatura.'),
      bloque('PESO_MUERTO', 45, 0, 'suave', 'Bisagra de cadera suave.'),
      bloque('FLEXIONES', 45, 0, 'suave', 'Flexiones controladas.'),
      bloque('REMO', 45, 0, 'suave', 'Remo sin carga, aprieta la espalda.'),
    ], 'Activación funcional de todo el cuerpo.'),
    seccion('bloque', 'Piernas', 'Piernas', PRINCIPAL, [
      bloque('SENTADILLAS', 45, 15, 'media', 'Sentadilla profunda, cadera atrás.'),
      bloque('ZANCADAS', 45, 15, 'media', 'Zancadas alternas, paso controlado.'),
      bloque('SENTADILLA_SUMO', 45, 15, 'media', 'Sentadilla sumo, rodillas afuera.'),
      bloque('WALL_SIT', 30, 30, 'media', 'Sentadilla en pared, sostén.'),
    ], { rondas: 2, descansoRonda: 20, pistaVoz: 'Bloque de piernas, dos rondas.' }),
    seccion('bloque2', 'Empuje y tirón', 'Torso', PRINCIPAL, [
      bloque('FLEXIONES', 45, 15, 'media', 'Flexión con codos a 45 grados.'),
      bloque('PRESS_HOMBRO', 45, 15, 'media', 'Press de hombro controlado.'),
      bloque('REMO', 45, 15, 'media', 'Remo, aprieta la espalda.'),
      bloque('PESO_MUERTO', 45, 15, 'media', 'Peso muerto, cadena posterior.'),
    ], { rondas: 2, descansoRonda: 20, pistaVoz: 'Empuje y tirón, dos rondas.' }),
    seccion('core', 'Core', 'Core', PRINCIPAL, [
      bloque('PUENTE_GLUTEO', 40, 15, 'media', 'Puente, aprieta glúteos.'),
      bloque('ABDOMINALES', 40, 15, 'media', 'Abdominales controlados.'),
      bloque('PLANCHA', 40, 0, 'media', 'Plancha final.'),
    ], { pistaVoz: 'Core y glúteo.' }),
    calma([
      bloque('MARCHA_SUAVE', 30, 0, 'suave', 'Baja el pulso.'),
      bloque('ESTIRAMIENTO_ISQUIOS', 45, 0, 'suave', 'Isquios, espalda larga.'),
      bloque('ESTIRAMIENTO_GENERAL', 60, 0, 'suave', 'Estiramiento general.'),
    ], 'Vuelta a la calma.'),
  ],
});

const FUERZA_45 = base('fuerza-45', 'Fuerza 45', 'fuerza', 'intermedio', {
  etiqueta: '45 min',
  duracionMin: 45,
  descripcion: 'La experiencia completa: patrones funcionales con progresión.',
  equipamiento: [],
  briefing: 'Cuida la técnica en cada ronda. Si pierdes la forma, descansa.',
  cues: ['Baja antes de romper la técnica', 'Rondas anunciadas'],
  secciones: [
    activacion([
      bloque('SENTADILLAS', 60, 0, 'suave', 'Sentadillas, respiración constante.'),
      bloque('PESO_MUERTO', 60, 0, 'suave', 'Bisagra de cadera.'),
      bloque('FLEXIONES', 45, 0, 'suave', 'Flexiones controladas.'),
      bloque('REMO', 45, 0, 'suave', 'Remo, espalda activa.'),
      bloque('ZANCADAS', 45, 0, 'suave', 'Zancadas alternas suaves.'),
    ], 'Activación funcional completa.'),
    seccion('bloque', 'Piernas', 'Piernas', PRINCIPAL, [
      bloque('SENTADILLAS', 50, 15, 'media', 'Sentadilla, primera serie.'),
      bloque('ZANCADAS', 50, 15, 'media', 'Zancada larga.'),
      bloque('SENTADILLA_SUMO', 50, 15, 'media', 'Sentadilla sumo.'),
      bloque('WALL_SIT', 40, 40, 'media', 'Sostén en pared.'),
    ], { rondas: 2, descansoRonda: 20, pistaVoz: 'Piernas, dos rondas.' }),
    seccion('bloque2', 'Empuje', 'Empuje', PRINCIPAL, [
      bloque('FLEXIONES', 50, 15, 'media', 'Flexiones, pecho al piso.'),
      bloque('FLEXION_DIAMANTE', 45, 15, 'media', 'Flexión diamante.'),
      bloque('PRESS_HOMBRO', 45, 30, 'media', 'Press de hombro.'),
    ], { rondas: 2, descansoRonda: 20, pistaVoz: 'Empuje, dos rondas.' }),
    seccion('bloque3', 'Cadena posterior', 'Espalda', PRINCIPAL, [
      bloque('REMO', 50, 15, 'media', 'Remo, codos atrás.'),
      bloque('PESO_MUERTO', 50, 15, 'media', 'Peso muerto, cadera atrás.'),
      bloque('SUPERMAN', 40, 15, 'media', 'Superman para espalda baja.'),
      bloque('PUENTE_GLUTEO', 40, 15, 'media', 'Puente de glúteo.'),
    ], { rondas: 2, descansoRonda: 20, pistaVoz: 'Cadena posterior.' }),
    seccion('core', 'Core', 'Core', PRINCIPAL, [
      bloque('PLANCHA', 45, 15, 'media', 'Plancha frontal.'),
      bloque('PLANCHA_LATERAL', 30, 15, 'media', 'Plancha lateral.'),
      bloque('DEAD_BUG', 40, 15, 'media', 'Dead bug controlado.'),
      bloque('ABDOMINALES', 40, 0, 'media', 'Abdominales controlados.'),
    ], { pistaVoz: 'Core y estabilidad.' }),
    calma([
      bloque('MARCHA_SUAVE', 40, 0, 'suave', 'Baja el pulso.'),
      bloque('ESTIRAMIENTO_CUADRICEPS', 45, 0, 'suave', 'Cuádriceps con apoyo.'),
      bloque('ESTIRAMIENTO_GENERAL', 90, 0, 'suave', 'Estiramiento largo.'),
    ], 'Vuelta a la calma. Lo lograste.'),
  ],
});

// --- HIIT -----------------------------------------------------------------

const HIIT_10 = base('hiit-10', 'HIIT 10', 'hiit', 'intermedio', {
  etiqueta: '10 min',
  duracionMin: 10,
  descripcion: 'Intervalos cortos de alta intensidad y descanso mínimo.',
  equipamiento: [],
  briefing: 'Trabajo y descanso. Versión sin salto disponible siempre.',
  cues: ['3, 2, 1, cambio', 'Todo lo que tengas con forma'],
  secciones: [
    activacion([
      bloque('SENTADILLAS', 30, 0, 'suave', 'Sentadillas para activar.'),
      bloque('FLEXIONES', 30, 0, 'suave', 'Flexiones suaves.'),
      bloque('RODILLAS_ALTAS', 30, 0, 'media', 'Rodillas altas a ritmo cómodo.'),
    ], 'Activación funcional de dos minutos.'),
    seccion('pico', 'Intervalos', 'Intervalos', PRINCIPAL, [
      bloque('SENTADILLA_SALTO', 20, 10, 'alta', 'Sentadilla con salto. Sin salto si necesitas.'),
      bloque('ESCALADOR', 20, 10, 'alta', 'Escaladores rápidos.'),
      bloque('JUMPING_JACKS', 20, 10, 'alta', 'Jumping jacks.'),
      bloque('RODILLAS_ALTAS', 20, 20, 'alta', 'Rodillas altas.'),
    ], { rondas: 3, descansoRonda: 30, pistaVoz: 'Tres rondas de intervalos.' }),
    calma([
      bloque('MARCHA_SUAVE', 45, 0, 'suave', 'Camina y respira.'),
      bloque('ESTIRAMIENTO_CUADRICEPS', 45, 0, 'suave', 'Cuádriceps suave.'),
      bloque('ESTIRAMIENTO_GENERAL', 45, 0, 'suave', 'Estira lo que trabajaste.'),
    ], 'Vuelta a la calma.'),
  ],
});

const HIIT_20 = base('hiit-20', 'HIIT 20', 'hiit', 'intermedio', {
  etiqueta: '20 min',
  duracionMin: 20,
  descripcion: 'Dos bloques metabólicos con descanso activo entre ellos.',
  equipamiento: [],
  briefing: 'Alternamos patrones para no fatigar el mismo músculo.',
  cues: ['Descanso activo, no te sientes', 'Última ronda, esta es la buena'],
  secciones: [
    activacion([
      bloque('piernas', 45, 0, 'suave', 'Sentadillas progresivas.'),
      bloque('empuje', 30, 0, 'suave', 'Flexiones controladas.'),
      bloque('cardio', 30, 0, 'media', 'Rodillas altas.'),
      bloque('cardio', 30, 0, 'media', 'Escaladores suaves.'),
    ], 'Activación funcional de tres minutos.'),
    seccion('pico', 'Bloque 1', 'Bloque 1', PRINCIPAL, [
      bloque('potencia', 40, 20, 'alta', 'Sentadilla con salto.'),
      bloque('cardio', 40, 20, 'alta', 'Escaladores.'),
      bloque('potencia', 40, 20, 'alta', 'Burpees, versión sin salto si prefieres.'),
      bloque('cardio', 40, 20, 'alta', 'Mountain climber.'),
      bloque('cardio', 40, 60, 'alta', 'Rodillas altas.'),
    ], { pistaVoz: 'Bloque uno: todo lo que tengas.' }),
    seccion('recuperacion', 'Descanso activo', 'Descanso', 'recuperacion', [
      bloque('MARCHA_SUAVE', 45, 15, 'suave', 'Camina y recupera.'),
      bloque('RESPIRACION_DIAFRAGMATICA', 30, 0, 'suave', 'Recupera el aliento.'),
    ], { pistaVoz: 'Descanso entre bloques. Respira.' }),
    seccion('pico2', 'Bloque 2', 'Bloque 2', PRINCIPAL, [
      bloque('empuje', 40, 20, 'alta', 'Flexiones, codos a 45.'),
      bloque('piernas', 40, 20, 'alta', 'Zancadas alternas.'),
      bloque('cardio', 40, 20, 'alta', 'Mountain climber.'),
      bloque('cardio', 40, 40, 'alta', 'Jumping jacks finales.'),
    ], { pistaVoz: 'Bloque dos: última parte.' }),
    calma([
      bloque('MARCHA_SUAVE', 45, 0, 'suave', 'Baja el pulso.'),
      bloque('ESTIRAMIENTO_ISQUIOS', 45, 0, 'suave', 'Isquios.'),
      bloque('ESTIRAMIENTO_GENERAL', 75, 0, 'suave', 'Estiramiento completo.'),
    ], 'Terminaste. Respira.'),
  ],
});

const HIIT_30 = base('hiit-30', 'HIIT 30', 'hiit', 'avanzado', {
  etiqueta: '30 min',
  duracionMin: 30,
  descripcion: 'Tres bloques: intervalos largos, descanso activo y final explosivo.',
  equipamiento: [],
  briefing: 'Clase exigente. Ajusta el impacto con la versión sin salto.',
  cues: ['Calidad sobre cantidad', 'Una más'],
  secciones: [
    activacion([
      bloque('SENTADILLAS', 60, 0, 'suave', 'Sentadillas progresivas.'),
      bloque('FLEXIONES', 45, 0, 'suave', 'Flexiones.'),
      bloque('RODILLAS_ALTAS', 45, 0, 'media', 'Rodillas altas.'),
      bloque('MOUNTAIN_CLIMBER', 45, 0, 'media', 'Escaladores.'),
    ], 'Activación funcional de cuatro minutos.'),
    seccion('pico', 'Bloque 1', 'Bloque 1', PRINCIPAL, [
      bloque('SENTADILLA_SALTO', 40, 20, 'alta', 'Sentadilla con salto.'),
      bloque('FLEXIONES', 40, 20, 'alta', 'Flexiones.'),
      bloque('ZANCADAS', 40, 20, 'alta', 'Zancadas alternas.'),
      bloque('PRESS_HOMBRO', 40, 20, 'alta', 'Press de hombro.'),
      bloque('BURPEE', 40, 60, 'alta', 'Burpees.'),
    ], { pistaVoz: 'Bloque uno.' }),
    seccion('recuperacion', 'Descanso activo', 'Descanso', 'recuperacion', [
      bloque('MARCHA_SUAVE', 60, 0, 'suave', 'Descanso activo.'),
    ], { pistaVoz: 'Descanso entre bloques.' }),
    seccion('pico2', 'Tabata', 'Tabata', PRINCIPAL, [
      bloque('MOUNTAIN_CLIMBER', 20, 10, 'alta', 'Escaladores.'),
      bloque('SENTADILLA_SALTO', 20, 10, 'alta', 'Sentadilla con salto.'),
      bloque('PLANK_JACK', 20, 10, 'alta', 'Plank jack.'),
      bloque('RODILLAS_ALTAS', 20, 60, 'alta', 'Rodillas altas.'),
    ], { rondas: 4, descansoRonda: 30, pistaVoz: 'Tabata final.' }),
    calma([
      bloque('MARCHA_SUAVE', 60, 0, 'suave', 'Baja el pulso.'),
      bloque('ESTIRAMIENTO_CUADRICEPS', 45, 0, 'suave', 'Cuádriceps.'),
      bloque('ESTIRAMIENTO_GENERAL', 90, 0, 'suave', 'Estiramiento completo.'),
    ], 'Clase terminada. Excelente.'),
  ],
});

// --- Combat ---------------------------------------------------------------

const COMBAT_20 = base('combat-20', 'Combat 20', 'combat', 'principiante', {
  etiqueta: '20 min',
  duracionMin: 20,
  descripcion: 'Golpes y patadas sin contacto para descargar tensión.',
  equipamiento: [],
  briefing: 'Guardia arriba. No es pelear, es moverse. Versión sin salto siempre.',
  cues: ['Exhala en cada golpe', 'Vuelve a la guardia'],
  secciones: [
    activacion([
      bloque('ROTACION_TORSO', 45, 0, 'suave', 'Rotación de torso, hombros sueltos.'),
      bloque('GUARDIA', 45, 0, 'suave', 'Guardia y paso ligero.'),
      bloque('JAB_CROSS', 30, 0, 'suave', 'Jab y cross lento.'),
    ], 'Activación con guardia.'),
    seccion('bloque', 'Boxeo', 'Boxeo', PRINCIPAL, [
      bloque('JAB_CROSS', 45, 15, 'media', 'Jab y cross, al aire.'),
      bloque('RODILLAZO', 45, 15, 'media', 'Rodillazos alternos.'),
      bloque('COMBINACION', 45, 30, 'media', 'Combinación de golpes.'),
    ], { rondas: 2, descansoRonda: 20, pistaVoz: 'Bloque de boxeo, dos rondas.' }),
    seccion('pico', 'Patadas', 'Patadas', PRINCIPAL, [
      bloque('PATADA_FRONTAL', 45, 15, 'alta', 'Patada frontal controlada.'),
      bloque('PATADA_LATERAL', 45, 15, 'alta', 'Patada lateral.'),
      bloque('JAB_CROSS', 45, 30, 'alta', 'Jab y cross rápidos.'),
    ], { rondas: 2, descansoRonda: 20, pistaVoz: 'Bloque de patadas, dos rondas.' }),
    seccion('core', 'Core combat', 'Core', PRINCIPAL, [
      bloque('PLANCHA', 40, 15, 'media', 'Plancha firme.'),
      bloque('MOUNTAIN_CLIMBER', 40, 0, 'media', 'Escaladores.'),
    ], { pistaVoz: 'Core de combate.' }),
    calma([
      bloque('MARCHA_SUAVE', 45, 0, 'suave', 'Baja la guardia, respira.'),
      bloque('ESTIRAMIENTO_GENERAL', 90, 0, 'suave', 'Estira brazos y piernas.'),
    ], 'Baja la guardia. Buen trabajo.'),
  ],
});

const COMBAT_30 = base('combat-30', 'Combat 30', 'combat', 'intermedio', {
  etiqueta: '30 min',
  duracionMin: 30,
  descripcion: 'Boxeo, potencia y patadas con acondicionamiento final.',
  equipamiento: [],
  briefing: 'Aprende cuatro golpes antes de ir rápido. Sin contacto.',
  cues: ['Golpea con la cadera', 'No hiperextiendas el codo'],
  secciones: [
    activacion([
      bloque('ROTACION_TORSO', 45, 0, 'suave', 'Rotación de torso.'),
      bloque('GUARDIA', 45, 0, 'suave', 'Guardia y paso.'),
      bloque('JAB_CROSS', 30, 0, 'suave', 'Jab y cross lento.'),
      bloque('MOUNTAIN_CLIMBER', 30, 0, 'media', 'Escaladores suaves.'),
    ], 'Activación con guardia.'),
    seccion('bloque', 'Combat 1', 'Combat 1', PRINCIPAL, [
      bloque('JAB_CROSS', 50, 15, 'alta', 'Combinaciones de boxeo.'),
      bloque('RODILLAZO', 45, 15, 'alta', 'Rodillazos.'),
      bloque('COMBINACION', 45, 30, 'alta', 'Combinación completa.'),
    ], { rondas: 2, descansoRonda: 20, pistaVoz: 'Combat uno, dos rondas.' }),
    seccion('potencia', 'Potencia', 'Potencia', PRINCIPAL, [
      bloque('SENTADILLA_SALTO', 45, 15, 'alta', 'Potencia de piernas.'),
      bloque('ZANCADAS', 45, 15, 'alta', 'Zancadas con impulso.'),
      bloque('MOUNTAIN_CLIMBER', 45, 30, 'alta', 'Escaladores explosivos.'),
    ], { rondas: 2, descansoRonda: 20, pistaVoz: 'Potencia de piernas.' }),
    seccion('bloque2', 'Patadas', 'Patadas', PRINCIPAL, [
      bloque('PATADA_FRONTAL', 50, 15, 'alta', 'Patada frontal.'),
      bloque('PATADA_LATERAL', 50, 15, 'alta', 'Patada lateral.'),
      bloque('RODILLAZO', 45, 30, 'alta', 'Rodillazos finales.'),
    ], { rondas: 2, descansoRonda: 20, pistaVoz: 'Patadas, dos rondas.' }),
    seccion('core', 'Condicionamiento', 'Core', PRINCIPAL, [
      bloque('PLANCHA', 45, 15, 'media', 'Plancha.'),
      bloque('MOUNTAIN_CLIMBER', 45, 15, 'media', 'Escaladores.'),
      bloque('ABDOMINALES', 40, 0, 'media', 'Abdominales.'),
    ], { pistaVoz: 'Acondicionamiento final.' }),
    calma([
      bloque('MARCHA_SUAVE', 60, 0, 'suave', 'Baja el pulso.'),
      bloque('ESTIRAMIENTO_GENERAL', 120, 0, 'suave', 'Estiramiento completo.'),
    ], 'Baja la guardia. Buen trabajo.'),
  ],
});

// --- Core -----------------------------------------------------------------

const CORE_5 = base('core-5', 'Core 5', 'core', 'principiante', {
  etiqueta: '5 min',
  duracionMin: 5,
  descripcion: 'Cinco minutos de abdomen y estabilidad.',
  equipamiento: [],
  briefing: 'Calidad antes que velocidad. Lumbar pegada al piso.',
  cues: ['Exhala al subir', 'No jales el cuello'],
  secciones: [
    activacion([
      bloque('BIRD_DOG', 30, 0, 'suave', 'Bird dog, activa el core.'),
      bloque('DEAD_BUG', 30, 0, 'suave', 'Dead bug suave.'),
    ], 'Activación corta de core.'),
    seccion('core', 'Circuito de core', 'Core', PRINCIPAL, [
      bloque('PLANCHA', 40, 15, 'media', 'Plancha.'),
      bloque('ABDOMINALES', 40, 15, 'media', 'Abdominales.'),
      bloque('DEAD_BUG', 40, 15, 'media', 'Dead bug.'),
      bloque('PLANCHA', 30, 0, 'media', 'Plancha final.'),
    ], { pistaVoz: 'Circuito de core.' }),
    calma([
      bloque('ESTIRAMIENTO_GENERAL', 45, 0, 'suave', 'Estira el abdomen.'),
    ], 'Bajamos y respiramos.'),
  ],
});

const CORE_10 = base('core-10', 'Core 10', 'core', 'principiante', {
  etiqueta: '10 min',
  duracionMin: 10,
  descripcion: 'Abdomen, espalda baja y glúteos con control.',
  equipamiento: [],
  briefing: 'Respira en cada repetición; si la forma se rompe, descansa.',
  cues: ['Controla el descenso', 'Abdomen firme'],
  secciones: [
    activacion([
      bloque('BIRD_DOG', 45, 0, 'suave', 'Bird dog alternado.'),
      bloque('DEAD_BUG', 45, 0, 'suave', 'Dead bug suave.'),
    ], 'Activación de core.'),
    seccion('core', 'Circuito', 'Circuito', PRINCIPAL, [
      bloque('PLANCHA', 40, 15, 'media', 'Plancha frontal.'),
      bloque('ABDOMINALES', 40, 15, 'media', 'Abdominales.'),
      bloque('PUENTE_GLUTEO', 40, 15, 'media', 'Puente de glúteo.'),
      bloque('DEAD_BUG', 40, 15, 'media', 'Dead bug.'),
      bloque('PLANCHA_LATERAL', 30, 0, 'media', 'Plancha lateral.'),
    ], { pistaVoz: 'Circuito completo de core.' }),
    seccion('core2', 'Estabilidad', 'Estabilidad', PRINCIPAL, [
      bloque('HOLLOW_HOLD', 30, 15, 'media', 'Hollow hold.'),
      bloque('SUPERMAN', 30, 15, 'media', 'Superman.'),
      bloque('BIRD_DOG', 30, 0, 'media', 'Bird dog.'),
    ], { pistaVoz: 'Estabilidad final.' }),
    calma([
      bloque('ESTIRAMIENTO_GENERAL', 60, 0, 'suave', 'Estiramiento.'),
      bloque('POSTURA_NINO', 30, 0, 'suave', 'Postura del niño.'),
    ], 'Vuelta a la calma.'),
  ],
});

const CORE_20 = base('core-20', 'Core 20', 'core', 'intermedio', {
  etiqueta: '20 min',
  duracionMin: 20,
  descripcion: 'Cuatro bloques de core: frontal, lateral, espalda y final.',
  equipamiento: [],
  briefing: 'Veinte minutos para un centro sólido. Sin prisa.',
  cues: ['Costillas abajo', 'Respira, no aguantes el aire'],
  secciones: [
    activacion([
      bloque('BIRD_DOG', 45, 0, 'suave', 'Bird dog.'),
      bloque('DEAD_BUG', 45, 0, 'suave', 'Dead bug suave.'),
      bloque('PLANCHA', 30, 0, 'suave', 'Plancha suave.'),
    ], 'Activación de core.'),
    seccion('core', 'Frontal', 'Frontal', PRINCIPAL, [
      bloque('PLANCHA', 45, 15, 'media', 'Plancha frontal.'),
      bloque('ABDOMINALES', 45, 15, 'media', 'Abdominales.'),
      bloque('V_UP', 30, 15, 'media', 'V-up controlado.'),
      bloque('HOLLOW_HOLD', 30, 30, 'media', 'Hollow hold.'),
    ], { pistaVoz: 'Core frontal.' }),
    seccion('core2', 'Lateral', 'Lateral', PRINCIPAL, [
      bloque('PLANCHA_LATERAL', 30, 15, 'media', 'Plancha lateral.'),
      bloque('PLANCHA_LATERAL', 30, 15, 'media', 'Cambia de lado.'),
      bloque('RUSSIAN_TWIST', 45, 30, 'media', 'Giro ruso.'),
    ], { pistaVoz: 'Core lateral.' }),
    seccion('core3', 'Espalda', 'Espalda', PRINCIPAL, [
      bloque('SUPERMAN', 40, 15, 'media', 'Superman.'),
      bloque('BIRD_DOG', 40, 15, 'media', 'Bird dog.'),
      bloque('PUENTE_GLUTEO', 40, 30, 'media', 'Puente de glúteo.'),
    ], { pistaVoz: 'Espalda baja.' }),
    seccion('core4', 'Final', 'Final', PRINCIPAL, [
      bloque('CRUNCH_BICICLETA', 45, 15, 'media', 'Bicicleta.'),
      bloque('ELEVACION_PIERNAS', 40, 15, 'media', 'Elevación de piernas.'),
      bloque('PLANCHA', 40, 0, 'media', 'Plancha final.'),
    ], { pistaVoz: 'Bloque final de core.' }),
    calma([
      bloque('RESPIRACION_DIAFRAGMATICA', 45, 0, 'suave', 'Respira profundo.'),
      bloque('ESTIRAMIENTO_GENERAL', 75, 0, 'suave', 'Estiramiento.'),
    ], 'Core completo. Bien hecho.'),
  ],
});

const CLASES_BASE = Object.freeze([
  FUERZA_10,
  FUERZA_30,
  FUERZA_45,
  HIIT_10,
  HIIT_20,
  HIIT_30,
  COMBAT_20,
  COMBAT_30,
  CORE_5,
  CORE_10,
  CORE_20,
]);

function congelarLista(lista) {
  return Object.freeze(lista.map((item) => Object.freeze({ ...item })));
}

function resolverEjercicio(ejercicio_o_grupo) {
  if (GRUPOS_EJERCICIOS[ejercicio_o_grupo]) {
    const opciones = GRUPOS_EJERCICIOS[ejercicio_o_grupo];
    return opciones[Math.floor(Math.random() * opciones.length)];
  }
  return ejercicio_o_grupo;
}

export function compilarClase(clase) {
  const totalSecciones = clase.secciones.length;
  const bloques = [];

  clase.secciones.forEach((seccion, seccionIndex) => {
    const totalRondas = Math.max(1, seccion.rondas || 1);
    const bloquesSeccion = seccion.bloques;

    for (let ronda = 1; ronda <= totalRondas; ronda += 1) {
      bloquesSeccion.forEach((bloque, indice) => {
        const esUltimo = indice === bloquesSeccion.length - 1;
        const descanso =
          esUltimo && ronda < totalRondas
            ? seccion.descansoRonda ?? bloque.descanso ?? 0
            : bloque.descanso ?? 0;

        bloques.push(
          Object.freeze({
            ...bloque,
            ejercicio: resolverEjercicio(bloque.ejercicio),
            descanso,
            seccionId: seccion.id,
            seccionNombre: seccion.nombre,
            seccionTipo: seccion.tipo,
            seccionIndex,
            totalSecciones,
            ronda,
            totalRondas,
          })
        );
      });
    }
  });

  const secciones = Object.freeze(
    clase.secciones.map((seccion) =>
      Object.freeze({
        ...seccion,
        bloques: congelarLista(seccion.bloques),
      })
    )
  );

  return Object.freeze({
    ...clase,
    secciones,
    bloques: Object.freeze(bloques),
    duracion: bloques.reduce(
      (total, bloque) => total + bloque.trabajo + bloque.descanso,
      0
    ),
  });
}

export const CLASES = Object.freeze(CLASES_BASE.map((clase) => compilarClase(clase)));

export const CLASE_POR_DEFECTO = CLASES[0];

// La puerta de entrada es la clase corta y amable de core.
export const CLASE_INICIAL = obtenerClase('core-5') || CLASE_POR_DEFECTO;

export function obtenerClase(id) {
  const base = CLASES_BASE.find((clase) => clase.id === id);
  if (!base) return null;
  return compilarClase(base);
}

export function clasesDeArquetipo(arquetipo) {
  return CLASES_BASE.filter((clase) => clase.arquetipo === arquetipo).map((clase) => compilarClase(clase));
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
