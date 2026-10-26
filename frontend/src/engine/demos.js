import { EJERCICIOS_CATALOGO } from './ejercicios';

export const ARTICULACIONES = Object.freeze([
  'cabeza',
  'cuello',
  'hombroI',
  'hombroD',
  'codoI',
  'codoD',
  'munecaI',
  'munecaD',
  'caderaI',
  'caderaD',
  'rodillaI',
  'rodillaD',
  'tobilloI',
  'tobilloD',
]);

export const HUESOS = Object.freeze([
  ['cabeza', 'cuello'],
  ['cuello', 'hombroI'],
  ['cuello', 'hombroD'],
  ['hombroI', 'hombroD'],
  ['cuello', 'caderaI'],
  ['cuello', 'caderaD'],
  ['caderaI', 'caderaD'],
  ['hombroI', 'codoI'],
  ['codoI', 'munecaI'],
  ['hombroD', 'codoD'],
  ['codoD', 'munecaD'],
  ['caderaI', 'rodillaI'],
  ['rodillaI', 'tobilloI'],
  ['caderaD', 'rodillaD'],
  ['rodillaD', 'tobilloD'],
]);

function p(x, y) {
  return { x, y };
}

function pose(cabeza, cuello, hombroI, hombroD, codoI, codoD, munecaI, munecaD, caderaI, caderaD, rodillaI, rodillaD, tobilloI, tobilloD) {
  return {
    cabeza,
    cuello,
    hombroI,
    hombroD,
    codoI,
    codoD,
    munecaI,
    munecaD,
    caderaI,
    caderaD,
    rodillaI,
    rodillaD,
    tobilloI,
    tobilloD,
  };
}

function ajustar(base, cambios) {
  const resultado = {};
  for (const articulacion of ARTICULACIONES) {
    resultado[articulacion] = {
      ...base[articulacion],
      ...(cambios[articulacion] || {}),
    };
  }
  return resultado;
}

// Nuevas definiciones de posturas biomecánicamente correctas

const SENTADILLA_ARRIBA = pose(
  p(0.5, 0.22), p(0.5, 0.3), p(0.44, 0.34), p(0.56, 0.34),
  p(0.4, 0.42), p(0.6, 0.42), p(0.36, 0.5), p(0.64, 0.5),
  p(0.44, 0.52), p(0.56, 0.52), p(0.4, 0.7), p(0.6, 0.7),
  p(0.38, 0.88), p(0.62, 0.88)
);

const SENTADILLA_ABAJO = ajustar(SENTADILLA_ARRIBA, {
  cabeza: { y: 0.36 }, cuello: { y: 0.44 },
  hombroI: { y: 0.48 }, hombroD: { y: 0.48 },
  codoI: { x: 0.38, y: 0.52 }, codoD: { x: 0.62, y: 0.52 },
  munecaI: { x: 0.48, y: 0.55 }, munecaD: { x: 0.52, y: 0.55 },
  caderaI: { y: 0.65 }, caderaD: { y: 0.65 },
  rodillaI: { x: 0.32, y: 0.65 }, rodillaD: { x: 0.68, y: 0.65 },
});

const FLEXION_ARRIBA = pose(
  p(0.2, 0.6), p(0.28, 0.62), p(0.3, 0.63), p(0.3, 0.65),
  p(0.3, 0.8), p(0.3, 0.8), p(0.3, 0.94), p(0.3, 0.94),
  p(0.5, 0.68), p(0.5, 0.7), p(0.7, 0.75), p(0.7, 0.77),
  p(0.9, 0.82), p(0.9, 0.84)
);

const FLEXION_ABAJO = ajustar(FLEXION_ARRIBA, {
  cabeza: { y: 0.78 }, cuello: { y: 0.8 },
  hombroI: { y: 0.81 }, hombroD: { y: 0.83 },
  caderaI: { y: 0.76 }, caderaD: { y: 0.78 },
  codoI: { x: 0.22, y: 0.75 }, codoD: { x: 0.22, y: 0.75 }
});

const JUMPING_JACK_CERRADO = pose(
  p(0.5, 0.2), p(0.5, 0.28), p(0.44, 0.3), p(0.56, 0.3),
  p(0.42, 0.42), p(0.58, 0.42), p(0.4, 0.52), p(0.6, 0.52),
  p(0.46, 0.5), p(0.54, 0.5), p(0.46, 0.7), p(0.54, 0.7),
  p(0.46, 0.9), p(0.54, 0.9)
);

const JUMPING_JACK_ABIERTO = ajustar(JUMPING_JACK_CERRADO, {
  codoI: { x: 0.3, y: 0.25 }, codoD: { x: 0.7, y: 0.25 },
  munecaI: { x: 0.4, y: 0.1 }, munecaD: { x: 0.6, y: 0.1 },
  rodillaI: { x: 0.35 }, rodillaD: { x: 0.65 },
  tobilloI: { x: 0.25 }, tobilloD: { x: 0.75 }
});

const ESTIRAMIENTO_ARRIBA = ajustar(JUMPING_JACK_ABIERTO, {
  munecaI: { x: 0.48, y: 0.05 },
  munecaD: { x: 0.52, y: 0.05 },
  tobilloI: { x: 0.4, y: 0.9 },
  tobilloD: { x: 0.6, y: 0.9 }
});

const ESTIRAMIENTO_LADO = ajustar(ESTIRAMIENTO_ARRIBA, {
  cabeza: { x: 0.6 },
  cuello: { x: 0.58 },
  hombroI: { x: 0.52 },
  hombroD: { x: 0.64 },
  codoI: { x: 0.48, y: 0.2 },
  codoD: { x: 0.8, y: 0.3 },
  munecaI: { x: 0.62, y: 0.15 },
  munecaD: { x: 0.68, y: 0.15 }
});

const ZANCADA_ARRIBA = pose(
  p(0.5, 0.2), p(0.5, 0.28), p(0.48, 0.3), p(0.48, 0.32),
  p(0.45, 0.4), p(0.45, 0.42), p(0.48, 0.48), p(0.48, 0.5),
  p(0.48, 0.52), p(0.48, 0.54), p(0.38, 0.7), p(0.58, 0.7),
  p(0.35, 0.88), p(0.65, 0.88)
);

const ZANCADA_ABAJO = ajustar(ZANCADA_ARRIBA, {
  cabeza: { y: 0.35 },
  cuello: { y: 0.43 },
  hombroI: { y: 0.45 },
  hombroD: { y: 0.47 },
  codoI: { y: 0.55 },
  codoD: { y: 0.57 },
  munecaI: { y: 0.63 },
  munecaD: { y: 0.65 },
  caderaI: { y: 0.67 },
  caderaD: { y: 0.69 },
  rodillaI: { x: 0.35, y: 0.75 },
  rodillaD: { x: 0.48, y: 0.85 },
  tobilloI: { x: 0.35, y: 0.88 },
  tobilloD: { x: 0.65, y: 0.88 }
});

const PLANCHA_FIRME = pose(
  p(0.2, 0.6), p(0.28, 0.62), p(0.3, 0.63), p(0.3, 0.65),
  p(0.3, 0.75), p(0.3, 0.75), p(0.4, 0.75), p(0.4, 0.75),
  p(0.55, 0.68), p(0.55, 0.7), p(0.75, 0.72), p(0.75, 0.74),
  p(0.9, 0.75), p(0.9, 0.77)
);

const PLANCHA_ALTA = ajustar(PLANCHA_FIRME, {
  codoI: { y: 0.78 },
  codoD: { y: 0.78 },
  munecaI: { x: 0.3, y: 0.94 },
  munecaD: { x: 0.3, y: 0.94 },
  caderaI: { y: 0.55 },
  caderaD: { y: 0.57 },
  rodillaI: { y: 0.65 },
  rodillaD: { y: 0.67 },
  tobilloI: { y: 0.75 },
  tobilloD: { y: 0.77 }
});

const RODILLAS_NEUTRO = JUMPING_JACK_CERRADO;
const RODILLA_IZQ_ARRIBA = ajustar(RODILLAS_NEUTRO, {
  codoI: { x: 0.35, y: 0.4 },
  munecaI: { x: 0.4, y: 0.3 },
  codoD: { x: 0.65, y: 0.5 },
  munecaD: { x: 0.6, y: 0.6 },
  rodillaI: { y: 0.5 },
  tobilloI: { y: 0.65 }
});
const RODILLA_DER_ARRIBA = ajustar(RODILLAS_NEUTRO, {
  codoD: { x: 0.65, y: 0.4 },
  munecaD: { x: 0.6, y: 0.3 },
  codoI: { x: 0.35, y: 0.5 },
  munecaI: { x: 0.4, y: 0.6 },
  rodillaD: { y: 0.5 },
  tobilloD: { y: 0.65 }
});

const PUENTE_ABAJO = pose(
  p(0.2, 0.8), p(0.28, 0.82), p(0.3, 0.83), p(0.3, 0.85),
  p(0.4, 0.85), p(0.4, 0.87), p(0.5, 0.88), p(0.5, 0.9),
  p(0.55, 0.84), p(0.55, 0.86), p(0.7, 0.65), p(0.7, 0.67),
  p(0.8, 0.88), p(0.8, 0.9)
);

const PUENTE_ARRIBA = ajustar(PUENTE_ABAJO, {
  caderaI: { y: 0.65 },
  caderaD: { y: 0.67 },
  rodillaI: { x: 0.75, y: 0.6 },
  rodillaD: { x: 0.75, y: 0.62 }
});

const ABDOMINAL_ABAJO = PUENTE_ABAJO;
const ABDOMINAL_ARRIBA = ajustar(ABDOMINAL_ABAJO, {
  cabeza: { x: 0.35, y: 0.65 },
  cuello: { x: 0.4, y: 0.68 },
  hombroI: { x: 0.42, y: 0.7 },
  hombroD: { x: 0.42, y: 0.72 },
  codoI: { x: 0.38, y: 0.6 },
  codoD: { x: 0.38, y: 0.62 },
  munecaI: { x: 0.33, y: 0.65 },
  munecaD: { x: 0.33, y: 0.67 }
});

const SUMO_ARRIBA = ajustar(SENTADILLA_ARRIBA, {
  tobilloI: { x: 0.2 },
  tobilloD: { x: 0.8 }
});
const SUMO_ABAJO = ajustar(SENTADILLA_ABAJO, {
  rodillaI: { x: 0.2 },
  rodillaD: { x: 0.8 },
  tobilloI: { x: 0.2 },
  tobilloD: { x: 0.8 }
});

const DIAMANTE_ARRIBA = ajustar(FLEXION_ARRIBA, {
  munecaI: { x: 0.32 },
  munecaD: { x: 0.32 }
});
const DIAMANTE_ABAJO = ajustar(FLEXION_ABAJO, {
  codoI: { x: 0.32, y: 0.7 },
  codoD: { x: 0.32, y: 0.7 },
  munecaI: { x: 0.32 },
  munecaD: { x: 0.32 }
});

const ESCALADOR_IZQ = ajustar(PLANCHA_ALTA, {
  rodillaI: { x: 0.45, y: 0.75 },
  tobilloI: { x: 0.4, y: 0.8 }
});
const ESCALADOR_DER = ajustar(PLANCHA_ALTA, {
  rodillaD: { x: 0.45, y: 0.77 },
  tobilloD: { x: 0.4, y: 0.82 }
});

const PLANCHA_LATERAL_FIRME = pose(
  p(0.4, 0.4), p(0.43, 0.45), p(0.45, 0.48), p(0.45, 0.48),
  p(0.45, 0.65), p(0.3, 0.45), p(0.45, 0.75), p(0.2, 0.3),
  p(0.6, 0.55), p(0.6, 0.55), p(0.75, 0.65), p(0.75, 0.65),
  p(0.9, 0.75), p(0.9, 0.75)
);

const PLANCHA_LATERAL_ALTA = ajustar(PLANCHA_LATERAL_FIRME, {
  caderaI: { y: 0.5 },
  caderaD: { y: 0.5 }
});

const SUPERMAN_ABAJO = pose(
  p(0.2, 0.8), p(0.28, 0.82), p(0.3, 0.83), p(0.3, 0.85),
  p(0.26, 0.74), p(0.26, 0.76), p(0.16, 0.74), p(0.16, 0.76),
  p(0.55, 0.78), p(0.55, 0.8), p(0.7, 0.8), p(0.7, 0.82),
  p(0.85, 0.82), p(0.85, 0.84)
);

const SUPERMAN_ARRIBA = ajustar(SUPERMAN_ABAJO, {
  cabeza: { y: 0.7 },
  cuello: { y: 0.72 },
  hombroI: { y: 0.73 },
  hombroD: { y: 0.75 },
  codoI: { y: 0.7 },
  codoD: { y: 0.72 },
  munecaI: { y: 0.68 },
  munecaD: { y: 0.7 },
  rodillaI: { y: 0.75 },
  rodillaD: { y: 0.77 },
  tobilloI: { y: 0.72 },
  tobilloD: { y: 0.74 }
});

const DEAD_BUG_A = ajustar(PUENTE_ABAJO, {
  codoI: { y: 0.6 },
  munecaI: { y: 0.4 },
  codoD: { y: 0.85 },
  munecaD: { x: 0.1, y: 0.85 },
  rodillaI: { x: 0.55, y: 0.5 },
  tobilloI: { x: 0.7, y: 0.5 },
  rodillaD: { y: 0.85 },
  tobilloD: { x: 0.9, y: 0.85 }
});

const DEAD_BUG_B = ajustar(PUENTE_ABAJO, {
  codoD: { y: 0.6 },
  munecaD: { y: 0.4 },
  codoI: { y: 0.85 },
  munecaI: { x: 0.1, y: 0.85 },
  rodillaD: { x: 0.55, y: 0.5 },
  tobilloD: { x: 0.7, y: 0.5 },
  rodillaI: { y: 0.85 },
  tobilloI: { x: 0.9, y: 0.85 }
});

const HOLLOW_ABAJO = ajustar(PUENTE_ABAJO, {
  codoI: { y: 0.85 },
  munecaI: { x: 0.1, y: 0.85 },
  codoD: { y: 0.85 },
  munecaD: { x: 0.1, y: 0.85 },
  rodillaI: { y: 0.85 },
  tobilloI: { x: 0.9, y: 0.85 },
  rodillaD: { y: 0.85 },
  tobilloD: { x: 0.9, y: 0.85 }
});
const HOLLOW_ARRIBA = ajustar(HOLLOW_ABAJO, {
  cabeza: { y: 0.65 },
  cuello: { y: 0.7 },
  hombroI: { y: 0.73 },
  hombroD: { y: 0.75 },
  codoI: { y: 0.7 },
  munecaI: { x: 0.15, y: 0.6 },
  codoD: { y: 0.7 },
  munecaD: { x: 0.15, y: 0.6 },
  rodillaI: { y: 0.75 },
  tobilloI: { x: 0.85, y: 0.7 },
  rodillaD: { y: 0.75 },
  tobilloD: { x: 0.85, y: 0.7 }});
const WALL_SIT = pose(
  p(0.2, 0.25), p(0.2, 0.33), p(0.22, 0.35), p(0.22, 0.37),
  p(0.25, 0.45), p(0.25, 0.47),
  p(0.3, 0.55), p(0.3, 0.57),
  p(0.22, 0.65), p(0.22, 0.67),
  p(0.5, 0.65), p(0.5, 0.67),
  p(0.5, 0.9), p(0.5, 0.9)
);

const WALL_SIT_ALTO = ajustar(WALL_SIT, {
  caderaI: { y: 0.55 },
  caderaD: { y: 0.57 },
  rodillaI: { y: 0.55 },
  rodillaD: { y: 0.57 }
});const BIRD_DOG_A = pose(
  p(0.2, 0.4),
  p(0.28, 0.42),
  p(0.32, 0.45), p(0.32, 0.47),
  p(0.3, 0.65), p(0.3, 0.67),
  p(0.3, 0.85), p(0.3, 0.87),
  p(0.6, 0.45), p(0.6, 0.47),
  p(0.6, 0.65), p(0.6, 0.67),
  p(0.6, 0.85), p(0.6, 0.87)
);

const BIRD_DOG_B = ajustar(BIRD_DOG_A, {
  codoI: { x: 0.2, y: 0.45 },
  munecaI: { x: 0.1, y: 0.45 },
  rodillaD: { x: 0.75, y: 0.47 },
  tobilloD: { x: 0.9, y: 0.47 }
});

// --- Rutinas de escritorio: figuras de pie, solo tren superior.
// Base: brazos caidos, piernas juntas (postura frente a la cámara).
const ESCRITORIO_BASE = pose(
  p(0.2, 0.15),
  p(0.2, 0.2),
  p(0.25, 0.22),
  p(0.25, 0.28),
  p(0.35, 0.3),
  p(0.35, 0.3),
  p(0.45, 0.3),
  p(0.45, 0.3),
  p(0.5, 0.3),
  p(0.5, 0.3),
  p(0.6, 0.3),
  p(0.6, 0.3),
  p(0.65, 0.3),
  p(0.65, 0.3)
);

// Rotación de torso: hombros girados a cada lado.
const ROTACION_TORSO_IZQ = ajustar(ESCRITORIO_BASE, {
  cabeza: { x: 0.4, y: 0.2 },
  hombroI: { x: 0.35, y: 0.3 },
  hombroD: { x: 0.5, y: 0.3 },
  codoI: { x: 0.3, y: 0.45 },
  codoD: { x: 0.45, y: 0.45 },
  munecaI: { x: 0.35, y: 0.5 },
  munecaD: { x: 0.4, y: 0.5 }
});

const ROTACION_TORSO_DER = ajustar(ESCRITORIO_BASE, {
  cabeza: { x: 0.6, y: 0.2 },
  hombroI: { x: 0.5, y: 0.3 },
  hombroD: { x: 0.65, y: 0.3 },
  codoI: { x: 0.55, y: 0.45 },
  codoD: { x: 0.7, y: 0.45 },
  munecaI: { x: 0.6, y: 0.5 },
  munecaD: { x: 0.65, y: 0.5 }
});

// --- DEMOS BASE CON POSTURAS ACTUALIZADAS ---
const DEMOS_BASE = Object.freeze({
  SENTADILLAS: Object.freeze({
    nombre: 'Sentadilla',
    vista: 'perfil',
    cicloMs: 2600,
    pistas: ['Pies al ancho de hombros', 'Cadera atrás, pecho arriba', 'Rodillas hacia afuera'],
    keyframes: Object.freeze([
      { t: 0, pose: SENTADILLA_ARRIBA },
      { t: 0.35, pose: SENTADILLA_ABAJO },
      { t: 0.5, pose: SENTADILLA_ABAJO },
      { t: 0.85, pose: SENTADILLA_ARRIBA },
      { t: 1, pose: SENTADILLA_ARRIBA },
    ]),
  }),
  FLEXIONES: Object.freeze({
    nombre: 'Flexión',
    vista: 'perfil',
    cicloMs: 2400,
    pistas: ['Cuerpo en plancha', 'Codos a 45 grados', 'Baja el pecho con control'],
    keyframes: Object.freeze([
      { t: 0, pose: FLEXION_ARRIBA },
      { t: 0.35, pose: FLEXION_ABAJO },
      { t: 0.5, pose: FLEXION_ABAJO },
      { t: 0.85, pose: FLEXION_ARRIBA },
      { t: 1, pose: FLEXION_ARRIBA },
    ]),
  }),
  JUMPING_JACKS: Object.freeze({
    nombre: 'Jumping jack',
    vista: 'frontal',
    cicloMs: 1300,
    pistas: ['Abre brazos y piernas', 'Aterriza suave', 'Mantén el ritmo'],
    keyframes: Object.freeze([
      { t: 0, pose: JUMPING_JACK_CERRADO },
      { t: 0.35, pose: JUMPING_JACK_ABIERTO },
      { t: 0.55, pose: JUMPING_JACK_ABIERTO },
      { t: 0.9, pose: JUMPING_JACK_CERRADO },
      { t: 1, pose: JUMPING_JACK_CERRADO },
    ]),
  }),
  ZANCADAS: Object.freeze({
    nombre: 'Zancada',
    vista: 'perfil',
    cicloMs: 2600,
    pistas: ['Da un paso largo', 'Baja la rodilla de atrás', 'Pecho arriba'],
    keyframes: Object.freeze([
      { t: 0, pose: ZANCADA_ARRIBA },
      { t: 0.35, pose: ZANCADA_ABAJO },
      { t: 0.5, pose: ZANCADA_ABAJO },
      { t: 0.85, pose: ZANCADA_ARRIBA },
      { t: 1, pose: ZANCADA_ARRIBA },
    ]),
  }),
  PLANCHA: Object.freeze({
    nombre: 'Plancha',
    vista: 'perfil',
    cicloMs: 1800,
    pistas: ['Cuerpo en línea recta', 'Aprieta el abdomen', 'No dejes caer la cadera'],
    keyframes: Object.freeze([
      { t: 0, pose: PLANCHA_FIRME },
      { t: 0.5, pose: PLANCHA_ALTA },
      { t: 1, pose: PLANCHA_FIRME },
    ]),
  }),
  RODILLAS_ALTAS: Object.freeze({
    nombre: 'Rodillas altas',
    vista: 'frontal',
    cicloMs: 1000,
    pistas: ['Sube la rodilla a la cadera', 'Brazos en movimiento', 'Aterriza suave'],
    keyframes: Object.freeze([
      { t: 0, pose: RODILLAS_NEUTRO },
      { t: 0.2, pose: RODILLA_IZQ_ARRIBA },
      { t: 0.4, pose: RODILLAS_NEUTRO },
      { t: 0.6, pose: RODILLA_DER_ARRIBA },
      { t: 0.8, pose: RODILLAS_NEUTRO },
      { t: 1, pose: RODILLAS_NEUTRO },
    ]),
  }),
  MARCHA_SUAVE: Object.freeze({
    nombre: 'Marcha suave',
    vista: 'frontal',
    cicloMs: 2600,
    pistas: ['Baja el ritmo', 'Respira profundo', 'Deja que el pulso baje'],
    keyframes: Object.freeze([
      { t: 0, pose: RODILLAS_NEUTRO },
      { t: 0.25, pose: RODILLA_IZQ_ARRIBA },
      { t: 0.5, pose: RODILLAS_NEUTRO },
      { t: 0.75, pose: RODILLA_DER_ARRIBA },
      { t: 1, pose: RODILLAS_NEUTRO },
    ]),
  }),
  ESTIRAMIENTO_GENERAL: Object.freeze({
    nombre: 'Estiramiento general',
    vista: 'frontal',
    cicloMs: 6000,
    pistas: ['Estira sin rebotar', 'Respira lento', 'Sostén cada posición'],
    keyframes: Object.freeze([
      { t: 0, pose: ESTIRAMIENTO_ARRIBA },
      { t: 0.5, pose: ESTIRAMIENTO_LADO },
      { t: 1, pose: ESTIRAMIENTO_ARRIBA },
    ]),
  }),
  PUENTE_GLUTEO: Object.freeze({
    nombre: 'Puente de glúteo',
    vista: 'perfil',
    cicloMs: 2400,
    pistas: ['Acuéstate boca arriba', 'Empuja con los talones', 'Aprieta los glúteos arriba'],
    keyframes: Object.freeze([
      { t: 0, pose: PUENTE_ABAJO },
      { t: 0.35, pose: PUENTE_ARRIBA },
      { t: 0.55, pose: PUENTE_ARRIBA },
      { t: 0.9, pose: PUENTE_ABAJO },
      { t: 1, pose: PUENTE_ABAJO },
    ]),
  }),
  ABDOMINALES: Object.freeze({
    nombre: 'Abdominal',
    vista: 'perfil',
    cicloMs: 2600,
    pistas: ['Manos detrás de la cabeza', 'Sube con el abdomen', 'Baja con control'],
    keyframes: Object.freeze([
      { t: 0, pose: ABDOMINAL_ABAJO },
      { t: 0.35, pose: ABDOMINAL_ARRIBA },
      { t: 0.55, pose: ABDOMINAL_ARRIBA },
      { t: 0.9, pose: ABDOMINAL_ABAJO },
      { t: 1, pose: ABDOMINAL_ABAJO },
    ]),
  }),
  SENTADILLA_SUMO: Object.freeze({
    nombre: 'Sentadilla sumo',
    vista: 'frontal',
    cicloMs: 2600,
    pistas: ['Pies bien abiertos', 'Rodillas hacia afuera', 'Baja con el pecho arriba'],
    keyframes: Object.freeze([
      { t: 0, pose: SUMO_ARRIBA },
      { t: 0.35, pose: SUMO_ABAJO },
      { t: 0.5, pose: SUMO_ABAJO },
      { t: 0.85, pose: SUMO_ARRIBA },
      { t: 1, pose: SUMO_ARRIBA },
    ]),
  }),
  FLEXION_DIAMANTE: Object.freeze({
    nombre: 'Flexión diamante',
    vista: 'perfil',
    cicloMs: 2400,
    pistas: ['Manos juntas bajo el pecho', 'Codos cerca del torso', 'Baja y empuja fuerte'],
    keyframes: Object.freeze([
      { t: 0, pose: DIAMANTE_ARRIBA },
      { t: 0.35, pose: DIAMANTE_ABAJO },
      { t: 0.5, pose: DIAMANTE_ABAJO },
      { t: 0.85, pose: DIAMANTE_ARRIBA },
      { t: 1, pose: DIAMANTE_ARRIBA },
    ]),
  }),
  MOUNTAIN_CLIMBER: Object.freeze({
    nombre: 'Mountain climber',
    vista: 'perfil',
    cicloMs: 1000,
    pistas: ['Manos bajo los hombros', 'Rodillas al pecho', 'Mantén la cadera baja'],
    keyframes: Object.freeze([
      { t: 0, pose: ESCALADOR_IZQ },
      { t: 0.25, pose: PLANCHA_FIRME },
      { t: 0.5, pose: ESCALADOR_DER },
      { t: 0.75, pose: PLANCHA_FIRME },
      { t: 1, pose: ESCALADOR_IZQ },
    ]),
  }),
  PLANCHA_LATERAL: Object.freeze({
    nombre: 'Plancha lateral',
    vista: 'perfil',
    cicloMs: 2200,
    pistas: ['Codo debajo del hombro', 'Cadera bien arriba', 'Cuerpo en línea recta'],
    keyframes: Object.freeze([
      { t: 0, pose: PLANCHA_LATERAL_FIRME },
      { t: 0.5, pose: PLANCHA_LATERAL_ALTA },
      { t: 1, pose: PLANCHA_LATERAL_FIRME },
    ]),
  }),
  SUPERMAN: Object.freeze({
    nombre: 'Superman',
    vista: 'perfil',
    cicloMs: 2200,
    pistas: ['Acuéstate boca abajo', 'Estira brazos y piernas', 'Levanta sin forzar el cuello'],
    keyframes: Object.freeze([
      { t: 0, pose: SUPERMAN_ABAJO },
      { t: 0.4, pose: SUPERMAN_ARRIBA },
      { t: 0.6, pose: SUPERMAN_ARRIBA },
      { t: 1, pose: SUPERMAN_ABAJO },
    ]),
  }),
  DEAD_BUG: Object.freeze({
    nombre: 'Dead bug',
    vista: 'perfil',
    cicloMs: 2600,
    pistas: ['Espalda pegada al piso', 'Brazos hacia el techo', 'Estira brazo y pierna opuestos'],
    keyframes: Object.freeze([
      { t: 0, pose: DEAD_BUG_A },
      { t: 0.4, pose: DEAD_BUG_B },
      { t: 0.6, pose: DEAD_BUG_B },
      { t: 1, pose: DEAD_BUG_A },
    ]),
  }),
  HOLLOW_HOLD: Object.freeze({
    nombre: 'Hollow hold',
    vista: 'perfil',
    cicloMs: 2200,
    pistas: ['Baja la espalda al piso', 'Brazos y piernas estirados', 'Sostén sin perder la lumbar'],
    keyframes: Object.freeze([
      { t: 0, pose: HOLLOW_ABAJO },
      { t: 0.5, pose: HOLLOW_ARRIBA },
      { t: 1, pose: HOLLOW_ABAJO },
    ]),
  }),
  WALL_SIT: Object.freeze({
    nombre: 'Sentadilla en pared',
    vista: 'perfil',
    cicloMs: 2200,
    pistas: ['Espalda contra la pared', 'Muslos paralelos al piso', 'Rodillas sobre los tobillos'],
    keyframes: Object.freeze([
      { t: 0, pose: WALL_SIT },
      { t: 0.5, pose: WALL_SIT_ALTO },
      { t: 1, pose: WALL_SIT },
    ]),
  }),
  BIRD_DOG: Object.freeze({
    nombre: 'Bird dog',
    vista: 'perfil',
    cicloMs: 2600,
    pistas: ['Manos y rodillas en el piso', 'Estira brazo y pierna opuestos', 'No gire la cadera'],
    keyframes: Object.freeze([
      { t: 0, pose: BIRD_DOG_A },
      { t: 0.4, pose: BIRD_DOG_B },
      { t: 0.6, pose: BIRD_DOG_B },
      { t: 1, pose: BIRD_DOG_A },
    ]),
  }),
  ROTACION_TORSO: Object.freeze({
    nombre: 'Rotación de torso',
    vista: 'frontal',
    cicloMs: 2400,
    pistas: ['Gire el torso a un lado', 'Lleve la mano al hombro contrario', 'Vuelva al centro y alterne'],
    keyframes: Object.freeze([
      { t: 0, pose: ROTACION_TORSO_IZQ },
      { t: 0.3, pose: ESCRITORIO_BASE },
      { t: 0.6, pose: ROTACION_TORSO_DER },
      { t: 0.8, pose: ESCRITORIO_BASE },
      { t: 1, pose: ROTACION_TORSO_IZQ },
    ]),
  }),
});

// Mapeo de grupos a demo por defecto
const BASE_POR_GRUPO = Object.freeze({
  piernas: 'SENTADILLAS',
  'glúteos': 'PUENTE_GLUTEO',
  pecho: 'FLEXIONES',
  hombros: 'FLEXIONES',
  espalda: 'SUPERMAN',
  core: 'PLANCHA',
  cardio: 'JUMPING_JACKS',
  combate: 'FLEXIONES',
  movilidad: 'ESTIRAMIENTO_GENERAL',
});

function demoDesdeBase(ejercicio) {
  const base = DEMOS_BASE[BASE_POR_GRUPO[ejercicio.grupo]] || DEMOS_BASE.SENTADILLAS;
  return Object.freeze({
    nombre: ejercicio.nombre,
    vista: ejercicio.vista || base.vista,
    cicloMs: base.cicloMs,
    pistas: Object.freeze([...ejercicio.pistas]),
    keyframes: base.keyframes,
  });
}

export const DEMOS = Object.freeze(
  Object.fromEntries(
    Object.keys(EJERCICIOS_CATALOGO).map((id) => [
      id,
      DEMOS_BASE[id] || demoDesdeBase(EJERCICIOS_CATALOGO[id]),
    ])
  )
);

export function obtenerDemo(ejercicio) {
  return DEMOS[ejercicio] || DEMOS.SENTADILLAS;
}

export function guionDemo(ejercicio) {
  const demo = obtenerDemo(ejercicio);
  return `Mira cómo se hace. ${demo.nombre}. ${demo.pistas.join('. ')}.`;
}

function suavizar(t) {
  return t * t * (3 - 2 * t);
}

export function interpolarPose(a, b, t) {
  const avance = Math.min(1, Math.max(0, t));
  const resultado = {};
  for (const articulacion of ARTICULACIONES) {
    const inicio = a[articulacion];
    const fin = b[articulacion];
    resultado[articulacion] = {
      x: inicio.x + (fin.x - inicio.x) * avance,
      y: inicio.y + (fin.y - inicio.y) * avance,
    };
  }
  return resultado;
}

export function poseEnTiempo(demo, ms) {
  const { keyframes, cicloMs } = demo;
  const transcurrido = ((ms % cicloMs) + cicloMs) % cicloMs;
  const t = transcurrido / cicloMs;

  for (let i = 0; i < keyframes.length - 1; i += 1) {
    const inicio = keyframes[i];
    const fin = keyframes[i + 1];
    if (t >= inicio.t && t <= fin.t) {
      const tramo = fin.t - inicio.t;
      const local = tramo === 0 ? 0 : (t - inicio.t) / tramo;
      return interpolarPose(inicio.pose, fin.pose, suavizar(local));
    }
  }

  return keyframes[keyframes.length - 1].pose;
}