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

const SENTADILLA_ARRIBA = pose(
  p(0.5, 0.22),
  p(0.5, 0.3),
  p(0.47, 0.34),
  p(0.5, 0.34),
  p(0.52, 0.42),
  p(0.56, 0.42),
  p(0.57, 0.48),
  p(0.61, 0.48),
  p(0.47, 0.52),
  p(0.5, 0.52),
  p(0.49, 0.7),
  p(0.52, 0.7),
  p(0.52, 0.88),
  p(0.55, 0.88)
);

const SENTADILLA_ABAJO = pose(
  p(0.53, 0.34),
  p(0.5, 0.42),
  p(0.47, 0.45),
  p(0.5, 0.45),
  p(0.55, 0.5),
  p(0.59, 0.5),
  p(0.61, 0.55),
  p(0.65, 0.55),
  p(0.39, 0.6),
  p(0.42, 0.6),
  p(0.57, 0.7),
  p(0.6, 0.7),
  p(0.52, 0.88),
  p(0.55, 0.88)
);

const FLEXION_ARRIBA = pose(
  p(0.25, 0.68),
  p(0.31, 0.7),
  p(0.34, 0.71),
  p(0.34, 0.74),
  p(0.34, 0.82),
  p(0.34, 0.82),
  p(0.34, 0.94),
  p(0.34, 0.94),
  p(0.55, 0.74),
  p(0.55, 0.78),
  p(0.7, 0.76),
  p(0.7, 0.8),
  p(0.85, 0.78),
  p(0.85, 0.82)
);

const FLEXION_ABAJO = pose(
  p(0.25, 0.76),
  p(0.31, 0.78),
  p(0.34, 0.78),
  p(0.34, 0.81),
  p(0.29, 0.86),
  p(0.29, 0.86),
  p(0.34, 0.94),
  p(0.34, 0.94),
  p(0.55, 0.82),
  p(0.55, 0.86),
  p(0.7, 0.84),
  p(0.7, 0.88),
  p(0.85, 0.86),
  p(0.85, 0.9)
);

const JUMPING_JACK_CERRADO = pose(
  p(0.5, 0.23),
  p(0.5, 0.32),
  p(0.44, 0.34),
  p(0.56, 0.34),
  p(0.42, 0.44),
  p(0.58, 0.44),
  p(0.41, 0.55),
  p(0.59, 0.55),
  p(0.46, 0.55),
  p(0.54, 0.55),
  p(0.47, 0.72),
  p(0.53, 0.72),
  p(0.47, 0.9),
  p(0.53, 0.9)
);

const JUMPING_JACK_ABIERTO = pose(
  p(0.5, 0.23),
  p(0.5, 0.32),
  p(0.44, 0.34),
  p(0.56, 0.34),
  p(0.34, 0.22),
  p(0.66, 0.22),
  p(0.24, 0.08),
  p(0.76, 0.08),
  p(0.46, 0.55),
  p(0.54, 0.55),
  p(0.36, 0.72),
  p(0.64, 0.72),
  p(0.28, 0.9),
  p(0.72, 0.9)
);

const ZANCADA_ARRIBA = pose(
  p(0.5, 0.22),
  p(0.5, 0.3),
  p(0.47, 0.34),
  p(0.5, 0.34),
  p(0.52, 0.42),
  p(0.56, 0.42),
  p(0.57, 0.48),
  p(0.61, 0.48),
  p(0.45, 0.54),
  p(0.5, 0.54),
  p(0.38, 0.68),
  p(0.58, 0.68),
  p(0.28, 0.88),
  p(0.62, 0.88)
);

const ZANCADA_ABAJO = pose(
  p(0.5, 0.32),
  p(0.5, 0.4),
  p(0.47, 0.44),
  p(0.5, 0.44),
  p(0.55, 0.5),
  p(0.6, 0.5),
  p(0.62, 0.55),
  p(0.66, 0.55),
  p(0.44, 0.62),
  p(0.49, 0.62),
  p(0.36, 0.8),
  p(0.6, 0.68),
  p(0.28, 0.88),
  p(0.62, 0.88)
);

const PLANCHA_FIRME = pose(
  p(0.25, 0.68),
  p(0.31, 0.7),
  p(0.34, 0.71),
  p(0.34, 0.74),
  p(0.34, 0.82),
  p(0.34, 0.82),
  p(0.34, 0.94),
  p(0.34, 0.94),
  p(0.55, 0.74),
  p(0.55, 0.78),
  p(0.7, 0.76),
  p(0.7, 0.8),
  p(0.85, 0.78),
  p(0.85, 0.82)
);

const PLANCHA_ALTA = pose(
  p(0.25, 0.675),
  p(0.31, 0.695),
  p(0.34, 0.705),
  p(0.34, 0.735),
  p(0.34, 0.815),
  p(0.34, 0.815),
  p(0.34, 0.935),
  p(0.34, 0.935),
  p(0.55, 0.735),
  p(0.55, 0.775),
  p(0.7, 0.755),
  p(0.7, 0.795),
  p(0.85, 0.775),
  p(0.85, 0.815)
);

const RODILLAS_NEUTRO = pose(
  p(0.5, 0.23),
  p(0.5, 0.32),
  p(0.44, 0.34),
  p(0.56, 0.34),
  p(0.42, 0.46),
  p(0.58, 0.46),
  p(0.45, 0.58),
  p(0.55, 0.58),
  p(0.46, 0.55),
  p(0.54, 0.55),
  p(0.47, 0.72),
  p(0.53, 0.72),
  p(0.47, 0.9),
  p(0.53, 0.9)
);

const RODILLA_IZQ_ARRIBA = pose(
  p(0.5, 0.23),
  p(0.5, 0.32),
  p(0.44, 0.34),
  p(0.56, 0.34),
  p(0.4, 0.44),
  p(0.58, 0.42),
  p(0.36, 0.54),
  p(0.62, 0.34),
  p(0.46, 0.55),
  p(0.54, 0.55),
  p(0.42, 0.55),
  p(0.53, 0.72),
  p(0.4, 0.68),
  p(0.53, 0.9)
);

const RODILLA_DER_ARRIBA = pose(
  p(0.5, 0.23),
  p(0.5, 0.32),
  p(0.44, 0.34),
  p(0.56, 0.34),
  p(0.42, 0.42),
  p(0.6, 0.44),
  p(0.38, 0.34),
  p(0.64, 0.54),
  p(0.46, 0.55),
  p(0.54, 0.55),
  p(0.47, 0.72),
  p(0.58, 0.55),
  p(0.47, 0.9),
  p(0.6, 0.68)
);

const PUENTE_ABAJO = pose(
  p(0.22, 0.78),
  p(0.3, 0.8),
  p(0.34, 0.8),
  p(0.34, 0.82),
  p(0.42, 0.82),
  p(0.42, 0.84),
  p(0.5, 0.84),
  p(0.5, 0.86),
  p(0.55, 0.8),
  p(0.55, 0.82),
  p(0.65, 0.64),
  p(0.65, 0.66),
  p(0.7, 0.88),
  p(0.7, 0.9)
);

const PUENTE_ARRIBA = pose(
  p(0.22, 0.78),
  p(0.3, 0.8),
  p(0.34, 0.8),
  p(0.34, 0.82),
  p(0.42, 0.82),
  p(0.42, 0.84),
  p(0.5, 0.84),
  p(0.5, 0.86),
  p(0.55, 0.7),
  p(0.55, 0.72),
  p(0.65, 0.58),
  p(0.65, 0.6),
  p(0.7, 0.88),
  p(0.7, 0.9)
);

const ABDOMINAL_ABAJO = pose(
  p(0.22, 0.78),
  p(0.3, 0.8),
  p(0.34, 0.8),
  p(0.34, 0.82),
  p(0.3, 0.7),
  p(0.3, 0.72),
  p(0.26, 0.66),
  p(0.26, 0.68),
  p(0.55, 0.8),
  p(0.55, 0.82),
  p(0.65, 0.65),
  p(0.65, 0.67),
  p(0.7, 0.88),
  p(0.7, 0.9)
);

const ABDOMINAL_ARRIBA = pose(
  p(0.26, 0.66),
  p(0.32, 0.7),
  p(0.36, 0.72),
  p(0.36, 0.74),
  p(0.32, 0.62),
  p(0.32, 0.64),
  p(0.28, 0.58),
  p(0.28, 0.6),
  p(0.55, 0.8),
  p(0.55, 0.82),
  p(0.65, 0.65),
  p(0.65, 0.67),
  p(0.7, 0.88),
  p(0.7, 0.9)
);

export const DEMOS = Object.freeze({
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
});

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
