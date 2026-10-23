// Catálogo de clases grupales de WorkoutBot.
//
// Cada clase tiene un arquetipo (fuerza, hiit, danza, combat, core, movilidad,
// spinning), una duración, un nivel, un impacto y una estructura de secciones
// que imita una clase grupal real: calentamiento, bloque principal y vuelta a
// la calma, con música, descansos y voz de instructor.

export const ARQUETIPOS = Object.freeze([
  Object.freeze({
    id: 'fuerza',
    nombre: 'Fuerza',
    descripcion: 'Fuerza total con repeticiones y carga ligera',
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
    id: 'danza',
    nombre: 'Danza',
    descripcion: 'Cardio que se siente como fiesta',
    color: '#ec4899',
    impacto: 'medio',
    bpm: 138,
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
  Object.freeze({
    id: 'movilidad',
    nombre: 'Movilidad',
    descripcion: 'Recuperación, respiración y flexibilidad',
    color: '#22c55e',
    impacto: 'bajo',
    bpm: 92,
  }),
  Object.freeze({
    id: 'spinning',
    nombre: 'Ritmo',
    descripcion: 'Cardio de bajo impacto guiado por el ritmo',
    color: '#eab308',
    impacto: 'bajo',
    bpm: 132,
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

const CALENTAMIENTO = 'calentamiento';
const PRINCIPAL = 'principal';
const ENFRIAMIENTO = 'enfriamiento';

function calentamiento(bloques, pistaVoz) {
  return seccion('calentamiento', 'Calentamiento', 'Calent.', CALENTAMIENTO, bloques, { pistaVoz });
}

function calma(bloques, pistaVoz) {
  return seccion('enfriamiento', 'Vuelta a la calma', 'Calma', ENFRIAMIENTO, bloques, { pistaVoz });
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

// --- Fuerza estilo pump ---------------------------------------------------

const FUERZA_10 = base('fuerza-10', 'Fuerza 10', 'fuerza', 'principiante', {
  etiqueta: '10 min',
  duracionMin: 10,
  descripcion: 'Circuito de fuerza completo para días con poco tiempo.',
  equipamiento: ['mochila', 'botellas'],
  briefing: 'Usa mochila o botellas si tienes; si no, peso del cuerpo. Técnica primero.',
  cues: ['Reps lentas y controladas', 'No sueltes el abdomen'],
  secciones: [
    calentamiento([
      bloque('MARCHA', 45, 0, 'suave', 'Camina en el lugar y suelta los hombros.'),
      bloque('SENTADILLAS', 45, 0, 'suave', 'Sentadillas sin peso, rango cómodo.'),
    ], 'Calentamiento corto. Preparamos el cuerpo.'),
    seccion('bloque', 'Circuito de fuerza', 'Fuerza', PRINCIPAL, [
      bloque('SENTADILLAS', 30, 15, 'media', 'Sentadilla, cadera atrás y pecho arriba.'),
      bloque('FLEXIONES', 30, 15, 'media', 'Flexión, cuerpo en plancha.'),
      bloque('PRESS_HOMBRO', 30, 15, 'media', 'Press, empuja hacia arriba.'),
      bloque('REMO', 30, 15, 'media', 'Remo, codos atrás.'),
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
  descripcion: 'Cinco bloques por grupo muscular, estilo clase con barra.',
  equipamiento: ['mochila', 'botellas', 'banda elástica'],
  briefing: 'Carga ligera y muchas repeticiones. Si no tienes peso, hazlo lento.',
  cues: ['Tempo controlado', 'Rango completo', 'Respira en cada repetición'],
  secciones: [
    calentamiento([
      bloque('MARCHA', 90, 0, 'suave', 'En marcha, sube la temperatura.'),
      bloque('SENTADILLAS', 60, 15, 'suave', 'Sentadillas suaves.'),
      bloque('PRESS_HOMBRO', 45, 0, 'suave', 'Press sin peso para hombros.'),
    ], 'Calentamiento de cinco minutos.'),
    seccion('bloque', 'Piernas', 'Piernas', PRINCIPAL, [
      bloque('SENTADILLAS', 45, 15, 'media', 'Sentadilla profunda, cadera atrás.'),
      bloque('ZANCADAS', 45, 15, 'media', 'Zancadas alternas, paso controlado.'),
      bloque('SENTADILLAS', 45, 15, 'media', 'Sentadilla, tempo lento.'),
      bloque('WALL_SIT', 30, 30, 'media', 'Sentadilla en pared, sostén.'),
    ], { pistaVoz: 'Bloque de piernas.' }),
    seccion('bloque2', 'Empuje y tirón', 'Torso', PRINCIPAL, [
      bloque('FLEXIONES', 45, 15, 'media', 'Flexión con codos a 45 grados.'),
      bloque('PRESS_HOMBRO', 45, 15, 'media', 'Press de hombro controlado.'),
      bloque('REMO', 45, 15, 'media', 'Remo, aprieta la espalda.'),
      bloque('CURL_BICEPS', 40, 30, 'media', 'Curl de bíceps, codos pegados.'),
    ], { pistaVoz: 'Empuje y tirón.' }),
    seccion('core', 'Core', 'Core', PRINCIPAL, [
      bloque('PUENTE_GLUTEO', 40, 15, 'media', 'Puente, aprieta glúteos.'),
      bloque('ABDOMINALES', 40, 15, 'media', 'Abdominales controlados.'),
      bloque('PLANCHA', 40, 0, 'media', 'Plancha final.'),
    ], { pistaVoz: 'Core y glúteo.' }),
    calma([
      bloque('MARCHA_SUAVE', 30, 0, 'suave', 'Baja el pulso.'),
      bloque('ESTIRAMIENTO_GENERAL', 90, 0, 'suave', 'Estiramiento general.'),
    ], 'Vuelta a la calma.'),
  ],
});

const FUERZA_45 = base('fuerza-45', 'Fuerza 45', 'fuerza', 'intermedio', {
  etiqueta: '45 min',
  duracionMin: 45,
  descripcion: 'La experiencia completa: ocho bloques con progresión de carga.',
  equipamiento: ['mochila', 'botellas', 'banda elástica'],
  briefing: 'Progresión completa. Ajusta la carga para llegar al último bloque.',
  cues: ['Baja la carga antes que la técnica', 'Rondas anunciadas'],
  secciones: [
    calentamiento([
      bloque('MARCHA', 120, 0, 'suave', 'Calentamiento completo, respira.'),
      bloque('SENTADILLAS', 60, 15, 'suave', 'Sentadillas suaves.'),
      bloque('ZANCADAS', 60, 15, 'suave', 'Zancadas alternas.'),
      bloque('PRESS_HOMBRO', 45, 0, 'suave', 'Press de hombro sin peso.'),
    ], 'Calentamiento de seis minutos.'),
    seccion('bloque', 'Piernas', 'Piernas', PRINCIPAL, [
      bloque('SENTADILLAS', 50, 15, 'media', 'Sentadilla, primera serie.'),
      bloque('ZANCADAS', 50, 15, 'media', 'Zancada larga.'),
      bloque('SENTADILLAS', 50, 15, 'media', 'Sentadilla con pausa.'),
      bloque('WALL_SIT', 40, 40, 'media', 'Sostén en pared.'),
    ], { pistaVoz: 'Piernas, primera parte.' }),
    seccion('bloque2', 'Pecho', 'Pecho', PRINCIPAL, [
      bloque('FLEXIONES', 50, 15, 'media', 'Flexiones, pecho al piso.'),
      bloque('FLEXION_DIAMANTE', 45, 15, 'media', 'Flexión diamante.'),
      bloque('PRESS_HOMBRO', 45, 30, 'media', 'Press de hombro.'),
    ], { pistaVoz: 'Pecho y empuje.' }),
    seccion('bloque3', 'Espalda y brazos', 'Espalda', PRINCIPAL, [
      bloque('REMO', 50, 15, 'media', 'Remo, codos atrás.'),
      bloque('PESO_MUERTO', 50, 15, 'media', 'Peso muerto, cadera atrás.'),
      bloque('CURL_BICEPS', 45, 15, 'media', 'Curl de bíceps.'),
      bloque('EXTENSION_TRICEPS', 40, 30, 'media', 'Extensión de tríceps.'),
    ], { pistaVoz: 'Espalda y brazos.' }),
    seccion('core', 'Core', 'Core', PRINCIPAL, [
      bloque('PLANCHA', 45, 15, 'media', 'Plancha frontal.'),
      bloque('PLANCHA_LATERAL', 30, 15, 'media', 'Plancha lateral.'),
      bloque('DEAD_BUG', 40, 15, 'media', 'Dead bug controlado.'),
      bloque('SUPERMAN', 30, 0, 'media', 'Superman para espalda baja.'),
    ], { pistaVoz: 'Core y estabilidad.' }),
    calma([
      bloque('MARCHA_SUAVE', 40, 0, 'suave', 'Baja el pulso.'),
      bloque('ESTIRAMIENTO_GENERAL', 120, 0, 'suave', 'Estiramiento largo.'),
    ], 'Vuelta a la calma. Lo lograste.'),
  ],
});

// --- HIIT -----------------------------------------------------------------

const HIIT_10 = base('hiit-10', 'HIIT 10', 'hiit', 'intermedio', {
  etiqueta: '10 min',
  duracionMin: 10,
  descripcion: 'Tabata corto: intervalos de alta intensidad y descanso mínimo.',
  equipamiento: ['toalla'],
  briefing: 'Trabajo y descanso. Versión sin salto disponible siempre.',
  cues: ['3, 2, 1, cambio', 'Todo lo que tengas con forma'],
  secciones: [
    calentamiento([
      bloque('MARCHA', 60, 0, 'suave', 'Calentamiento progresivo.'),
      bloque('JUMPING_JACKS', 30, 0, 'media', 'Jumping jacks suaves.'),
      bloque('SENTADILLAS', 30, 0, 'media', 'Sentadillas para activar.'),
    ], 'Calentamiento de dos minutos.'),
    seccion('pico', 'Tabata', 'Tabata', PRINCIPAL, [
      bloque('SENTADILLA_SALTO', 20, 10, 'alta', 'Sentadilla con salto. Sin salto si necesitas.'),
      bloque('ESCALADOR', 20, 10, 'alta', 'Escaladores rápidos.'),
      bloque('JUMPING_JACKS', 20, 10, 'alta', 'Jumping jacks.'),
      bloque('RODILLAS_ALTAS', 20, 20, 'alta', 'Rodillas altas.'),
    ], { rondas: 4, descansoRonda: 30, pistaVoz: 'Cuatro rondas de Tabata.' }),
    calma([
      bloque('MARCHA_SUAVE', 45, 0, 'suave', 'Camina y respira.'),
      bloque('ESTIRAMIENTO_GENERAL', 75, 0, 'suave', 'Estira lo que trabajaste.'),
    ], 'Vuelta a la calma.'),
  ],
});

const HIIT_20 = base('hiit-20', 'HIIT 20', 'hiit', 'intermedio', {
  etiqueta: '20 min',
  duracionMin: 20,
  descripcion: 'Dos bloques metabólicos con descanso entre ellos.',
  equipamiento: ['toalla'],
  briefing: 'Alternamos patrón para no fatigar el mismo músculo.',
  cues: ['Descanso activo, no te sientes', 'Última ronda, esta es la buena'],
  secciones: [
    calentamiento([
      bloque('MARCHA', 90, 0, 'suave', 'Calentamiento progresivo.'),
      bloque('SENTADILLAS', 45, 15, 'media', 'Sentadillas.'),
      bloque('PLANK_JACK', 30, 0, 'media', 'Plank jack suave.'),
    ], 'Calentamiento de tres minutos.'),
    seccion('pico', 'Bloque 1', 'Bloque 1', PRINCIPAL, [
      bloque('SENTADILLA_SALTO', 40, 20, 'alta', 'Sentadilla con salto.'),
      bloque('ESCALADOR', 40, 20, 'alta', 'Escaladores.'),
      bloque('BURPEE', 40, 20, 'alta', 'Burpees, versión sin salto si prefieres.'),
      bloque('SKATER', 40, 20, 'alta', 'Skater de lado a lado.'),
      bloque('RODILLAS_ALTAS', 40, 60, 'alta', 'Rodillas altas.'),
    ], { pistaVoz: 'Bloque uno: todo lo que tengas.' }),
    seccion('recuperacion', 'Descanso activo', 'Descanso', 'recuperacion', [
      bloque('MARCHA_SUAVE', 45, 15, 'suave', 'Camina y recupera.'),
      bloque('RESPIRACION_DIAFRAGMATICA', 30, 0, 'suave', 'Recupera el aliento.'),
    ], { pistaVoz: 'Descanso entre bloques. Respira.' }),
    seccion('pico2', 'Bloque 2', 'Bloque 2', PRINCIPAL, [
      bloque('FLEXIONES', 40, 20, 'alta', 'Flexiones, codos a 45.'),
      bloque('ZANCADAS', 40, 20, 'alta', 'Zancadas alternas.'),
      bloque('MOUNTAIN_CLIMBER', 40, 20, 'alta', 'Mountain climber.'),
      bloque('JUMPING_JACKS', 40, 40, 'alta', 'Jumping jacks finales.'),
    ], { pistaVoz: 'Bloque dos: última parte.' }),
    calma([
      bloque('MARCHA_SUAVE', 45, 0, 'suave', 'Baja el pulso.'),
      bloque('ESTIRAMIENTO_GENERAL', 90, 0, 'suave', 'Estiramiento completo.'),
    ], 'Terminaste. Respira.'),
  ],
});

const HIIT_30 = base('hiit-30', 'HIIT 30', 'hiit', 'avanzado', {
  etiqueta: '30 min',
  duracionMin: 30,
  descripcion: 'Tres bloques: intervalos largos, Tabata y potencia final.',
  equipamiento: ['toalla', 'botellas'],
  briefing: 'Clase exigente. Ajusta el impacto con la versión sin salto.',
  cues: ['Calidad sobre cantidad', 'Una más'],
  secciones: [
    calentamiento([
      bloque('MARCHA', 120, 0, 'suave', 'Calentamiento progresivo.'),
      bloque('SENTADILLAS', 45, 15, 'media', 'Sentadillas.'),
      bloque('JUMPING_JACKS', 45, 0, 'media', 'Jumping jacks.'),
    ], 'Calentamiento de cuatro minutos.'),
    seccion('pico', 'Bloque 1', 'Bloque 1', PRINCIPAL, [
      bloque('SENTADILLA_SALTO', 40, 20, 'alta', 'Sentadilla con salto.'),
      bloque('FLEXIONES', 40, 20, 'alta', 'Flexiones.'),
      bloque('SKATER', 40, 20, 'alta', 'Skater.'),
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
      bloque('ESTIRAMIENTO_GENERAL', 100, 0, 'suave', 'Estiramiento completo.'),
    ], 'Clase terminada. Excelente.'),
  ],
});

// --- Danza ----------------------------------------------------------------

const DANZA_20 = base('danza-20', 'Danza 20', 'danza', 'principiante', {
  etiqueta: '20 min',
  duracionMin: 20,
  descripcion: 'Ritmos latinos sin saltos: merengue, salsa y reggaetón.',
  equipamiento: [],
  briefing: 'No hay pasos incorrectos. Sigue el pie y sonríe.',
  cues: ['Paso al lado, cadera libre', '3, 2, 1, cambio'],
  secciones: [
    calentamiento([
      bloque('MARCHA', 90, 0, 'suave', 'Marcha al ritmo, suelta el cuerpo.'),
      bloque('STEP_TOUCH', 45, 0, 'suave', 'Step touch suave.'),
      bloque('CADERA', 45, 0, 'suave', 'Mueve la cadera al ritmo.'),
    ], 'Calentamiento bailando.'),
    seccion('bloque', 'Merengue', 'Merengue', PRINCIPAL, [
      bloque('MERENGUE', 120, 15, 'media', 'Merengue, paso rápido y corto.'),
      bloque('GRAPEVINE', 90, 15, 'media', 'Grapevine de lado a lado.'),
      bloque('SALSA', 120, 30, 'media', 'Salsa, cambio de peso.'),
    ], { pistaVoz: 'Merengue y salsa.' }),
    seccion('pico', 'Reggaetón', 'Pico', PRINCIPAL, [
      bloque('CADERA', 90, 15, 'alta', 'Cadera al ritmo.'),
      bloque('STEP_TOUCH', 90, 15, 'alta', 'Step touch rápido.'),
      bloque('SALSA', 90, 30, 'alta', 'Salsa con giro de torso.'),
    ], { pistaVoz: 'Subimos el ritmo.' }),
    calma([
      bloque('MARCHA_SUAVE', 60, 0, 'suave', 'Baja el ritmo.'),
      bloque('ESTIRAMIENTO_GENERAL', 90, 0, 'suave', 'Estiramiento final.'),
    ], 'Lo bailaste. Eso es cardio.'),
  ],
});

const DANZA_30 = base('danza-30', 'Danza 30', 'danza', 'principiante', {
  etiqueta: '30 min',
  duracionMin: 30,
  descripcion: 'Clase de baile completa: calentamiento, tres ritmos y calma.',
  equipamiento: [],
  briefing: 'La música manda. Repetimos los pasos hasta que salgan.',
  cues: ['Sonríe, estás bailando', 'Cadera libre'],
  secciones: [
    calentamiento([
      bloque('MARCHA', 120, 0, 'suave', 'Marcha al ritmo.'),
      bloque('STEP_TOUCH', 60, 0, 'suave', 'Step touch.'),
      bloque('CADERA', 60, 0, 'suave', 'Cadera suave.'),
    ], 'Calentamiento de cuatro minutos.'),
    seccion('bloque', 'Merengue y cumbia', 'Merengue', PRINCIPAL, [
      bloque('MERENGUE', 150, 15, 'media', 'Merengue.'),
      bloque('STEP_TOUCH', 120, 15, 'media', 'Step touch.'),
      bloque('GRAPEVINE', 120, 30, 'media', 'Grapevine.'),
    ], { pistaVoz: 'Merengue y cumbia.' }),
    seccion('pico', 'Salsa', 'Salsa', PRINCIPAL, [
      bloque('SALSA', 150, 15, 'alta', 'Salsa, cambio de peso.'),
      bloque('CADERA', 120, 15, 'alta', 'Cadera al ritmo.'),
      bloque('MERENGUE', 120, 30, 'alta', 'Merengue rápido.'),
    ], { pistaVoz: 'Salsa y más ritmo.' }),
    seccion('pico2', 'Reggaetón', 'Reggaetón', PRINCIPAL, [
      bloque('SALSA', 120, 15, 'alta', 'Salsa con giro.'),
      bloque('STEP_TOUCH', 120, 15, 'alta', 'Step touch.'),
      bloque('CADERA', 120, 30, 'alta', 'Cadera final.'),
    ], { pistaVoz: 'Reggaetón, última parte.' }),
    calma([
      bloque('MARCHA_SUAVE', 60, 0, 'suave', 'Baja el ritmo.'),
      bloque('ESTIRAMIENTO_GENERAL', 120, 0, 'suave', 'Estiramiento largo.'),
    ], 'Lo bailaste. Nos vemos la próxima.'),
  ],
});

const DANZA_45 = base('danza-45', 'Danza 45', 'danza', 'intermedio', {
  etiqueta: '45 min',
  duracionMin: 45,
  descripcion: 'Experiencia completa de baile con cuatro bloques de ritmo.',
  equipamiento: [],
  briefing: 'Cuarenta y cinco minutos de fiesta. Hidrátate.',
  cues: ['Sin salto también quema', 'Mantén el ritmo'],
  secciones: [
    calentamiento([
      bloque('MARCHA', 150, 0, 'suave', 'Marcha al ritmo.'),
      bloque('STEP_TOUCH', 90, 0, 'suave', 'Step touch.'),
      bloque('CADERA', 60, 0, 'suave', 'Cadera suave.'),
    ], 'Calentamiento de cinco minutos.'),
    seccion('bloque', 'Merengue', 'Merengue', PRINCIPAL, [
      bloque('MERENGUE', 180, 15, 'media', 'Merengue.'),
      bloque('GRAPEVINE', 150, 15, 'media', 'Grapevine.'),
      bloque('STEP_TOUCH', 150, 30, 'media', 'Step touch.'),
    ], { pistaVoz: 'Merengue.' }),
    seccion('pico', 'Salsa', 'Salsa', PRINCIPAL, [
      bloque('SALSA', 180, 15, 'alta', 'Salsa.'),
      bloque('CADERA', 150, 15, 'alta', 'Cadera.'),
      bloque('SALSA', 150, 30, 'alta', 'Salsa con giro.'),
    ], { pistaVoz: 'Salsa.' }),
    seccion('pico2', 'Reggaetón', 'Reggaetón', PRINCIPAL, [
      bloque('MERENGUE', 180, 15, 'alta', 'Merengue rápido.'),
      bloque('STEP_TOUCH', 150, 15, 'alta', 'Step touch.'),
      bloque('CADERA', 150, 30, 'alta', 'Cadera al máximo.'),
    ], { pistaVoz: 'Reggaetón.' }),
    seccion('pico3', 'Batidora final', 'Final', PRINCIPAL, [
      bloque('SALSA', 120, 15, 'alta', 'Salsa.'),
      bloque('MERENGUE', 120, 15, 'alta', 'Merengue.'),
      bloque('CADERA', 120, 0, 'alta', 'Cadera, última canción.'),
    ], { pistaVoz: 'Canción final, todo el mundo.' }),
    calma([
      bloque('MARCHA_SUAVE', 60, 0, 'suave', 'Baja el ritmo.'),
      bloque('ESTIRAMIENTO_GENERAL', 150, 0, 'suave', 'Estiramiento completo.'),
    ], 'Clase terminada. Excelente baile.'),
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
    calentamiento([
      bloque('MARCHA', 90, 0, 'suave', 'Marcha y suelta los hombros.'),
      bloque('GUARDIA', 60, 0, 'suave', 'Guardia y paso ligero.'),
      bloque('CIRCULOS_BRAZOS', 30, 0, 'suave', 'Círculos de brazos.'),
    ], 'Calentamiento con guardia.'),
    seccion('bloque', 'Boxeo', 'Boxeo', PRINCIPAL, [
      bloque('JAB_CROSS', 45, 15, 'media', 'Jab y cross, al aire.'),
      bloque('RODILLAZO', 45, 15, 'media', 'Rodillazos alternos.'),
      bloque('COMBINACION', 45, 30, 'media', 'Combinación de golpes.'),
    ], { pistaVoz: 'Bloque de boxeo.' }),
    seccion('pico', 'Patadas', 'Patadas', PRINCIPAL, [
      bloque('PATADA_FRONTAL', 45, 15, 'alta', 'Patada frontal controlada.'),
      bloque('PATADA_LATERAL', 45, 15, 'alta', 'Patada lateral.'),
      bloque('JAB_CROSS', 45, 30, 'alta', 'Jab y cross rápidos.'),
    ], { pistaVoz: 'Bloque de patadas.' }),
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
  descripcion: 'Cinco tracks: boxeo, potencia, patadas y acondicionamiento.',
  equipamiento: [],
  briefing: 'Aprende cuatro golpes antes de ir rápido. Sin contacto.',
  cues: ['Golpea con la cadera', 'No hiperextiendas el codo'],
  secciones: [
    calentamiento([
      bloque('MARCHA', 120, 0, 'suave', 'Marcha y hombros sueltos.'),
      bloque('GUARDIA', 60, 0, 'suave', 'Guardia y paso.'),
      bloque('JAB_CROSS', 45, 0, 'suave', 'Jab y cross lento.'),
    ], 'Calentamiento con guardia.'),
    seccion('bloque', 'Combat 1', 'Combat 1', PRINCIPAL, [
      bloque('JAB_CROSS', 50, 15, 'alta', 'Combinaciones de boxeo.'),
      bloque('RODILLAZO', 45, 15, 'alta', 'Rodillazos.'),
      bloque('COMBINACION', 45, 30, 'alta', 'Combinación completa.'),
    ], { pistaVoz: 'Combat uno.' }),
    seccion('potencia', 'Potencia 1', 'Potencia', PRINCIPAL, [
      bloque('SENTADILLA_SALTO', 45, 15, 'alta', 'Potencia de piernas.'),
      bloque('ZANCADAS', 45, 15, 'alta', 'Zancadas con impulso.'),
      bloque('SKATER', 45, 30, 'alta', 'Skater lateral.'),
    ], { pistaVoz: 'Potencia de piernas.' }),
    seccion('bloque2', 'Patadas', 'Patadas', PRINCIPAL, [
      bloque('PATADA_FRONTAL', 50, 15, 'alta', 'Patada frontal.'),
      bloque('PATADA_LATERAL', 50, 15, 'alta', 'Patada lateral.'),
      bloque('RODILLAZO', 45, 30, 'alta', 'Rodillazos finales.'),
    ], { pistaVoz: 'Patadas.' }),
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
    calentamiento([
      bloque('MARCHA', 30, 0, 'suave', 'Marcha suave para calentar.'),
      bloque('BIRD_DOG', 30, 0, 'suave', 'Bird dog, activa el core.'),
    ], 'Calentamiento corto.'),
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
  equipamiento: ['toalla'],
  briefing: 'Respira en cada repetición; si la forma se rompe, descansa.',
  cues: ['Controla el descenso', 'Abdomen firme'],
  secciones: [
    calentamiento([
      bloque('MARCHA', 45, 0, 'suave', 'Marcha en el lugar.'),
      bloque('BIRD_DOG', 45, 0, 'suave', 'Bird dog alternado.'),
    ], 'Calentamiento de core.'),
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
    ], 'Vuelta a la calma.'),
  ],
});

const CORE_20 = base('core-20', 'Core 20', 'core', 'intermedio', {
  etiqueta: '20 min',
  duracionMin: 20,
  descripcion: 'Cuatro bloques de core: frontal, lateral, antirotación y espalda.',
  equipamiento: ['toalla'],
  briefing: 'Veinte minutos para un centro sólido. Sin prisa.',
  cues: ['Costillas abajo', 'Respira, no aguantes el aire'],
  secciones: [
    calentamiento([
      bloque('MARCHA', 60, 0, 'suave', 'Marcha y respira.'),
      bloque('BIRD_DOG', 60, 0, 'suave', 'Bird dog.'),
      bloque('DEAD_BUG', 45, 0, 'suave', 'Dead bug suave.'),
    ], 'Calentamiento de core.'),
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

// --- Movilidad ------------------------------------------------------------

const MOVILIDAD_10 = base('movilidad-10', 'Movilidad 10', 'movilidad', 'principiante', {
  etiqueta: '10 min',
  duracionMin: 10,
  descripcion: 'Movilidad de columna, hombros y caderas para soltar el cuerpo.',
  equipamiento: ['toalla'],
  briefing: 'Sin rebotar. Respira y sostén cada posición.',
  cues: ['Respira lento', 'Sin dolor, hasta donde llegues'],
  secciones: [
    calentamiento([
      bloque('MARCHA', 45, 0, 'suave', 'Marcha suave.'),
      bloque('CIRCULOS_BRAZOS', 45, 0, 'suave', 'Círculos de brazos.'),
    ], 'Empezamos a soltar el cuerpo.'),
    seccion('bloque', 'Movilidad', 'Movilidad', PRINCIPAL, [
      bloque('GATO_CAMELLO', 60, 10, 'suave', 'Gato y camello con la respiración.'),
      bloque('ROTACION_TORSO', 45, 10, 'suave', 'Rotación de torso.'),
      bloque('ESTIRAMIENTO_CUELLO', 45, 10, 'suave', 'Cuello suave, oreja al hombro.'),
      bloque('POSTURA_NINO', 60, 0, 'suave', 'Postura del niño.'),
    ], { pistaVoz: 'Movilidad guiada.' }),
    seccion('bloque2', 'Caderas', 'Caderas', PRINCIPAL, [
      bloque('ESTIRAMIENTO_ISQUIOS', 60, 10, 'suave', 'Isquios, espalda larga.'),
      bloque('ESTIRAMIENTO_CUADRICEPS', 60, 0, 'suave', 'Cuádriceps con apoyo.'),
    ], { pistaVoz: 'Movilidad de piernas.' }),
    calma([
      bloque('RESPIRACION_DIAFRAGMATICA', 90, 0, 'suave', 'Respira profundo y suelta.'),
    ], 'Terminamos con respiración.'),
  ],
});

const MOVILIDAD_20 = base('movilidad-20', 'Movilidad 20', 'movilidad', 'principiante', {
  etiqueta: '20 min',
  duracionMin: 20,
  descripcion: 'Flujo suave de movilidad y estiramiento profundo.',
  equipamiento: ['toalla'],
  briefing: 'Recuperación activa. Ideal para días de descanso.',
  cues: ['Sigue la respiración', 'Sostén sin forzar'],
  secciones: [
    calentamiento([
      bloque('MARCHA', 60, 0, 'suave', 'Marcha suave.'),
      bloque('CIRCULOS_BRAZOS', 60, 0, 'suave', 'Círculos de brazos.'),
      bloque('ROTACION_TORSO', 60, 0, 'suave', 'Rotación de torso.'),
    ], 'Calentamiento suave.'),
    seccion('bloque', 'Columna', 'Columna', PRINCIPAL, [
      bloque('GATO_CAMELLO', 90, 10, 'suave', 'Gato y camello.'),
      bloque('SALUDO_SOL', 90, 10, 'suave', 'Saludo al sol, fluido.'),
      bloque('POSTURA_NINO', 60, 0, 'suave', 'Postura del niño.'),
    ], { pistaVoz: 'Columna y fluidez.' }),
    seccion('bloque2', 'Hombros y cuello', 'Hombros', PRINCIPAL, [
      bloque('APERTURA_PECHO', 60, 10, 'suave', 'Apertura de pecho.'),
      bloque('ESTIRAMIENTO_CUELLO', 60, 10, 'suave', 'Estiramiento de cuello.'),
      bloque('CIRCULOS_BRAZOS', 45, 0, 'suave', 'Círculos de brazos.'),
    ], { pistaVoz: 'Hombros y cuello.' }),
    seccion('bloque3', 'Piernas', 'Piernas', PRINCIPAL, [
      bloque('ESTIRAMIENTO_ISQUIOS', 75, 10, 'suave', 'Isquios.'),
      bloque('ESTIRAMIENTO_CUADRICEPS', 75, 10, 'suave', 'Cuádriceps.'),
      bloque('GATO_CAMELLO', 60, 0, 'suave', 'Vuelve a la columna.'),
    ], { pistaVoz: 'Piernas.' }),
    calma([
      bloque('RESPIRACION_DIAFRAGMATICA', 90, 0, 'suave', 'Respiración final.'),
      bloque('ESTIRAMIENTO_GENERAL', 60, 0, 'suave', 'Estiramiento general.'),
    ], 'Recuperación completa. Descansa.'),
  ],
});

// --- Spinning / ritmo -----------------------------------------------------

const SPINNING_30 = base('spinning-30', 'Ritmo 30', 'spinning', 'intermedio', {
  etiqueta: '30 min',
  duracionMin: 30,
  descripcion: 'Cardio guiado por el ritmo, sin bicicleta: pedaleo en el sitio.',
  equipamiento: ['toalla', 'botellas'],
  briefing: 'Imagina el pedaleo: cadencia constante. Sin saltos.',
  cues: ['Mantén la cadencia', 'Torso firme, hombros relajados'],
  secciones: [
    calentamiento([
      bloque('PEDALEO_SENTADO', 120, 0, 'suave', 'Pedaleo suave para calentar.'),
      bloque('MARCHA', 60, 0, 'suave', 'Marcha y respiración.'),
    ], 'Calentamiento al ritmo.'),
    seccion('bloque', 'Subida', 'Subida', PRINCIPAL, [
      bloque('PEDALEO_SENTADO', 150, 20, 'media', 'Pedaleo constante, cadencia firme.'),
      bloque('PEDALEO_PIE', 90, 20, 'media', 'Sube de pie y mantén el ritmo.'),
    ], { pistaVoz: 'Bloque de subida.' }),
    seccion('pico', 'Sprints', 'Sprints', PRINCIPAL, [
      bloque('SPRINT', 60, 30, 'alta', 'Sprint: todo lo que tengas.'),
      bloque('PEDALEO_SENTADO', 120, 20, 'media', 'Recupera pedaleando.'),
      bloque('SPRINT', 60, 30, 'alta', 'Último sprint.'),
    ], { pistaVoz: 'Sprints. Aguanten.' }),
    seccion('bloque2', 'Final', 'Final', PRINCIPAL, [
      bloque('PEDALEO_PIE', 120, 20, 'alta', 'De pie, rodillas altas.'),
      bloque('PEDALEO_SENTADO', 90, 0, 'media', 'Sentado, baja la cadencia.'),
    ], { pistaVoz: 'Recta final.' }),
    calma([
      bloque('MARCHA_SUAVE', 60, 0, 'suave', 'Baja el pulso.'),
      bloque('ESTIRAMIENTO_GENERAL', 120, 0, 'suave', 'Estira las piernas.'),
    ], 'Baja el ritmo. Buen trabajo.'),
  ],
});

const CLASES_BASE = Object.freeze([
  FUERZA_10,
  FUERZA_30,
  FUERZA_45,
  HIIT_10,
  HIIT_20,
  HIIT_30,
  DANZA_20,
  DANZA_30,
  DANZA_45,
  COMBAT_20,
  COMBAT_30,
  CORE_5,
  CORE_10,
  CORE_20,
  MOVILIDAD_10,
  MOVILIDAD_20,
  SPINNING_30,
]);

function congelarLista(lista) {
  return Object.freeze(lista.map((item) => Object.freeze({ ...item })));
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

// La puerta de entrada es la clase corta y amable de movilidad/core.
export const CLASE_INICIAL =
  obtenerClase('core-5') || CLASE_POR_DEFECTO;

export function obtenerClase(id) {
  return CLASES.find((clase) => clase.id === id) || null;
}

export function clasesDeArquetipo(arquetipo) {
  return CLASES.filter((clase) => clase.arquetipo === arquetipo);
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
