import { calculateAngle, distancia, esVisible } from './angles';

export const UMBRAL_VISIBILIDAD = 0.5;
export const UMBRAL_ANGULO_ARRIBA = 160;
export const UMBRAL_ANGULO_ABAJO = 100;
export const UMBRAL_ZONA_BAJA = 115;
export const UMBRAL_DESCENSO_CADERA = 0.03;
export const UMBRAL_VERTICALIDAD_PLANCHA = 0.55;
export const TIEMPO_SENTADO_MS = 2000;
export const ALPHA_ANGULO = 0.45;
export const ALPHA_BASE = 0.1;

const LADOS_SENTADILLA = [
  [23, 25, 27],
  [24, 26, 28],
];
const LADOS_FLEXION = [
  [11, 13, 15],
  [12, 14, 16],
];
const LADOS_PLANCHA = [
  [11, 23, 27],
  [12, 24, 28],
];
const LADOS_TORSO = [
  [11, 23, 25],
  [12, 24, 26],
];

export const UMBRAL_RODILLA_ALTA = 0.03;
export const UMBRAL_TORSO_ARRIBA = 0.04;
export const UMBRAL_CUERPO_HORIZONTAL = 0.1;
export const UMBRAL_ALINEACION_PLANCHA = 150;
export const UMBRAL_RODILLA_ESCALADOR = 120;
export const UMBRAL_PIERNA_EXTENDIDA = 150;
export const UMBRAL_SUPERMAN = 0.03;

export function crearEstadoDetector() {
  return {
    fase: 'ARRIBA',
    suavizado: null,
    baseY: null,
    tiempoZonaBajaMs: null,
    sentado: false,
    mensaje: null,
    anguloI: null,
    anguloD: null,
    ladoActivo: null,
  };
}

export function suavizar(previo, nuevo, alpha = ALPHA_ANGULO) {
  if (previo == null) return nuevo;
  return previo + alpha * (nuevo - previo);
}

function visibilidad(landmarks, indices) {
  return Math.min(...indices.map((i) => landmarks[i]?.visibility ?? 1));
}

function mejorLado(landmarks, lados, umbral = UMBRAL_VISIBILIDAD) {
  const validos = lados
    .map((indices) => ({ indices, vis: visibilidad(landmarks, indices) }))
    .filter((lado) => lado.vis > umbral)
    .sort((a, b) => b.vis - a.vis);
  return validos[0] || null;
}

function ladoMasFlexionado(landmarks, lados, umbral = UMBRAL_VISIBILIDAD) {
  const validos = lados
    .map((indices) => {
      const [a, b, c] = indices.map((i) => landmarks[i]);
      return {
        indices,
        vis: visibilidad(landmarks, indices),
        angulo: calculateAngle(a, b, c),
      };
    })
    .filter((lado) => lado.vis > umbral)
    .sort((a, b) => a.angulo - b.angulo);
  return validos[0] || null;
}

function cuerpoHorizontal(hombro, cadera) {
  return (
    Math.abs(hombro.x - cadera.x) > UMBRAL_CUERPO_HORIZONTAL &&
    Math.abs(hombro.y - cadera.y) < 0.18
  );
}

function resultado(estado, cambios, repeticion = false) {
  return { estado: { ...estado, ...cambios }, repeticion };
}

export function detectarSentadilla(landmarks, estado, ahoraMs = Date.now()) {
  const lado = mejorLado(landmarks, LADOS_SENTADILLA);
  if (!lado) return resultado(estado, {}, false);

  const [cadera, rodilla, tobillo] = lado.indices.map((i) => landmarks[i]);
  const angulo = suavizar(estado.suavizado, calculateAngle(cadera, rodilla, tobillo));
  const caderaY = (landmarks[23].y + landmarks[24].y) / 2;

  let { fase, baseY, sentado, tiempoZonaBajaMs } = estado;
  let repeticion = false;
  let mensaje = null;

  if (angulo > UMBRAL_ANGULO_ARRIBA) {
    baseY = baseY == null ? caderaY : suavizar(baseY, caderaY, ALPHA_BASE);

    if (fase === 'ABAJO' && !sentado) repeticion = true;
    fase = 'ARRIBA';
    sentado = false;
    tiempoZonaBajaMs = null;
  } else if (fase === 'ARRIBA' && angulo < UMBRAL_ANGULO_ABAJO) {
    const descendioCadera = baseY == null || caderaY > baseY + UMBRAL_DESCENSO_CADERA;
    if (descendioCadera) {
      fase = 'ABAJO';
      tiempoZonaBajaMs = ahoraMs;
    } else {
      mensaje = 'Baja más la cadera';
    }
  } else if (fase === 'ABAJO') {
    if (angulo < UMBRAL_ZONA_BAJA) {
      if (tiempoZonaBajaMs == null) tiempoZonaBajaMs = ahoraMs;
      if (ahoraMs - tiempoZonaBajaMs > TIEMPO_SENTADO_MS) {
        sentado = true;
        mensaje = 'Posición sentado: no cuenta';
      }
    } else {
      tiempoZonaBajaMs = null;
    }
  }

  return resultado(
    estado,
    { fase, suavizado: angulo, baseY, sentado, tiempoZonaBajaMs, mensaje },
    repeticion
  );
}

export function detectarFlexion(landmarks, estado, ahoraMs = Date.now()) {
  const ladoBrazo = mejorLado(landmarks, LADOS_FLEXION);
  if (!ladoBrazo) return resultado(estado, {}, false);

  const [hombro, codo, muneca] = ladoBrazo.indices.map((i) => landmarks[i]);
  const angulo = suavizar(estado.suavizado, calculateAngle(hombro, codo, muneca));

  let esPlancha = true;
  const ladoPlancha = mejorLado(landmarks, LADOS_PLANCHA);
  if (ladoPlancha) {
    const [h, c] = ladoPlancha.indices.map((i) => landmarks[i]);
    const largo = distancia(h, c) || 0.0001;
    esPlancha = Math.abs(h.y - c.y) / largo < UMBRAL_VERTICALIDAD_PLANCHA;
  }

  let { fase } = estado;
  let repeticion = false;
  let mensaje = null;

  if (!esPlancha) {
    fase = 'ARRIBA';
    mensaje = 'Colócate en plancha de perfil';
  } else if (angulo > UMBRAL_ANGULO_ARRIBA) {
    if (fase === 'ABAJO') repeticion = true;
    fase = 'ARRIBA';
  } else if (angulo < UMBRAL_ANGULO_ABAJO && fase === 'ARRIBA') {
    fase = 'ABAJO';
  }

  return resultado(estado, { fase, suavizado: angulo, mensaje }, repeticion);
}

export function detectarJumpingJack(landmarks, estado, ahoraMs = Date.now()) {
  const visiblesBrazos = [11, 12, 15, 16];
  if (!esVisible(landmarks, visiblesBrazos, UMBRAL_VISIBILIDAD)) {
    return resultado(estado, {}, false);
  }

  const shoulderIzq = landmarks[11];
  const shoulderDer = landmarks[12];
  const wristIzq = landmarks[15];
  const wristDer = landmarks[16];
  const hipIzq = landmarks[23];
  const hipDer = landmarks[24];

  const anchoHombros = Math.max(Math.abs(shoulderDer.x - shoulderIzq.x), 0.0001);
  const anchoCaderas = Math.max(Math.abs(hipDer.x - hipIzq.x), 0.0001);
  const separacionMuñecas = Math.abs(wristDer.x - wristIzq.x) / anchoHombros;
  const yHombro = (shoulderIzq.y + shoulderDer.y) / 2;
  const yMuñeca = (wristIzq.y + wristDer.y) / 2;

  const brazosArriba = yMuñeca < yHombro - 0.05 && separacionMuñecas > 0.9;
  const brazosAbajo = yMuñeca > yHombro && separacionMuñecas < 1.2;

  const tobillosVisibles = esVisible(landmarks, [27, 28], UMBRAL_VISIBILIDAD);
  const separacionTobillos = tobillosVisibles
    ? Math.abs(landmarks[28].x - landmarks[27].x) / anchoCaderas
    : null;
  const piernasAbiertas = separacionTobillos == null || separacionTobillos > 1.4;
  const piernasJuntas = separacionTobillos == null || separacionTobillos < 1.2;

  let { fase } = estado;
  let repeticion = false;

  if (fase === 'ABAJO' && brazosArriba && piernasAbiertas) {
    fase = 'ARRIBA';
    repeticion = true;
  } else if (fase === 'ARRIBA' && brazosAbajo && piernasJuntas) {
    fase = 'ABAJO';
  }

  return resultado(estado, { fase, mensaje: null }, repeticion);
}

export function detectarZancada(landmarks, estado) {
  const lado = ladoMasFlexionado(landmarks, LADOS_SENTADILLA);
  if (!lado) return resultado(estado, {}, false);

  const [cadera, rodilla, tobillo] = lado.indices.map((i) => landmarks[i]);
  const angulo = suavizar(estado.suavizado, calculateAngle(cadera, rodilla, tobillo));
  const caderaY = (landmarks[23].y + landmarks[24].y) / 2;

  let { fase, baseY } = estado;
  let repeticion = false;
  let mensaje = null;

  if (angulo > UMBRAL_ANGULO_ARRIBA) {
    baseY = baseY == null ? caderaY : suavizar(baseY, caderaY, ALPHA_BASE);
    if (fase === 'ABAJO') repeticion = true;
    fase = 'ARRIBA';
  } else if (fase === 'ARRIBA' && angulo < UMBRAL_ANGULO_ABAJO) {
    const descendioCadera = baseY == null || caderaY > baseY + UMBRAL_DESCENSO_CADERA;
    if (descendioCadera) {
      fase = 'ABAJO';
    } else {
      mensaje = 'Da un paso más largo y baja la rodilla';
    }
  }

  return resultado(estado, { fase, suavizado: angulo, baseY, mensaje }, repeticion);
}

export function detectarPlancha(landmarks, estado) {
  const lado = mejorLado(landmarks, LADOS_PLANCHA);
  if (!lado) return resultado(estado, { mensaje: 'Colócate de perfil' }, false);

  const [hombro, cadera, tobillo] = lado.indices.map((i) => landmarks[i]);
  const angulo = suavizar(estado.suavizado, calculateAngle(hombro, cadera, tobillo));
  const horizontal =
    Math.abs(hombro.x - tobillo.x) > 0.2 && Math.abs(hombro.y - tobillo.y) < 0.25;

  let mensaje = null;
  if (!horizontal) {
    mensaje = 'Ponte en plancha de perfil';
  } else if (angulo < UMBRAL_ALINEACION_PLANCHA) {
    mensaje = 'Alinea el cuerpo: no dejes caer la cadera';
  }

  return resultado(estado, { suavizado: angulo, mensaje }, false);
}

export function detectarRodillasAltas(landmarks, estado) {
  if (!esVisible(landmarks, [23, 24, 25, 26], UMBRAL_VISIBILIDAD)) {
    return resultado(estado, {}, false);
  }

  const caderaY = (landmarks[23].y + landmarks[24].y) / 2;
  const enAlto =
    landmarks[25].y < caderaY - UMBRAL_RODILLA_ALTA ||
    landmarks[26].y < caderaY - UMBRAL_RODILLA_ALTA;

  let { fase } = estado;
  let repeticion = false;

  if (enAlto) {
    if (fase === 'ABAJO') {
      fase = 'ARRIBA';
      repeticion = true;
    }
  } else {
    fase = 'ABAJO';
  }

  return resultado(estado, { fase, mensaje: null }, repeticion);
}

export function detectarPuenteGluteo(landmarks, estado) {
  const lado = mejorLado(landmarks, LADOS_TORSO);
  if (!lado) {
    return resultado(estado, { mensaje: 'Acuéstate boca arriba de perfil' }, false);
  }

  const [hombro, cadera] = lado.indices.map((i) => landmarks[i]);
  const horizontal = cuerpoHorizontal(hombro, cadera);

  let { fase } = estado;
  let repeticion = false;
  let mensaje = null;

  if (!horizontal) {
    fase = 'ABAJO';
    mensaje = 'Acuéstate boca arriba de perfil';
  } else {
    const caderaArriba = cadera.y < hombro.y - UMBRAL_TORSO_ARRIBA;
    if (caderaArriba) {
      if (fase === 'ABAJO') {
        fase = 'ARRIBA';
        repeticion = true;
      }
    } else if (cadera.y > hombro.y - 0.01) {
      fase = 'ABAJO';
    }
  }

  return resultado(estado, { fase, mensaje }, repeticion);
}

export function detectarAbdominal(landmarks, estado) {
  const lado = mejorLado(landmarks, LADOS_TORSO);
  if (!lado) {
    return resultado(estado, { mensaje: 'Acuéstate boca arriba de perfil' }, false);
  }

  const [hombro, cadera] = lado.indices.map((i) => landmarks[i]);
  const horizontal = cuerpoHorizontal(hombro, cadera);

  let { fase } = estado;
  let repeticion = false;
  let mensaje = null;

  if (!horizontal) {
    fase = 'ABAJO';
    mensaje = 'Acuéstate boca arriba de perfil';
  } else {
    const torsoArriba = hombro.y < cadera.y - UMBRAL_TORSO_ARRIBA;
    if (torsoArriba) {
      if (fase === 'ABAJO') {
        fase = 'ARRIBA';
        repeticion = true;
      }
    } else if (hombro.y > cadera.y - 0.01) {
      fase = 'ABAJO';
    }
  }

  return resultado(estado, { fase, mensaje }, repeticion);
}

export function detectarMountainClimber(landmarks, estado) {
  const visibles = [11, 12, 23, 24, 25, 26, 27, 28];
  if (!esVisible(landmarks, visibles, UMBRAL_VISIBILIDAD)) {
    return resultado(estado, { mensaje: 'Colócate en plancha de perfil' }, false);
  }

  const hombro = {
    x: (landmarks[11].x + landmarks[12].x) / 2,
    y: (landmarks[11].y + landmarks[12].y) / 2,
  };
  const cadera = {
    x: (landmarks[23].x + landmarks[24].x) / 2,
    y: (landmarks[23].y + landmarks[24].y) / 2,
  };
  const horizontal =
    Math.abs(hombro.x - cadera.x) > UMBRAL_CUERPO_HORIZONTAL &&
    Math.abs(hombro.y - cadera.y) < 0.2;

  if (!horizontal) {
    return resultado(
      estado,
      { mensaje: 'Ponte en plancha de perfil', ladoActivo: null },
      false
    );
  }

  const anguloI = suavizar(
    estado.anguloI,
    calculateAngle(landmarks[23], landmarks[25], landmarks[27])
  );
  const anguloD = suavizar(
    estado.anguloD,
    calculateAngle(landmarks[24], landmarks[26], landmarks[28])
  );

  const izquierdaActiva =
    anguloI < UMBRAL_RODILLA_ESCALADOR && anguloD > UMBRAL_PIERNA_EXTENDIDA;
  const derechaActiva =
    anguloD < UMBRAL_RODILLA_ESCALADOR && anguloI > UMBRAL_PIERNA_EXTENDIDA;

  let { ladoActivo } = estado;
  let repeticion = false;
  let mensaje = null;

  if (izquierdaActiva) {
    if (ladoActivo !== 'IZQ') {
      repeticion = true;
      ladoActivo = 'IZQ';
    }
  } else if (derechaActiva) {
    if (ladoActivo !== 'DER') {
      repeticion = true;
      ladoActivo = 'DER';
    }
  } else if (
    anguloI > UMBRAL_PIERNA_EXTENDIDA &&
    anguloD > UMBRAL_PIERNA_EXTENDIDA
  ) {
    ladoActivo = null;
  } else {
    ladoActivo = null;
    mensaje = 'Alterna las rodillas y estira la otra pierna';
  }

  return resultado(estado, { anguloI, anguloD, ladoActivo, mensaje }, repeticion);
}

export function detectarPlanchaLateral(landmarks, estado) {
  const lado = mejorLado(landmarks, LADOS_PLANCHA);
  if (!lado) {
    return resultado(estado, { mensaje: 'Colócate de perfil' }, false);
  }

  const [hombro, cadera, tobillo] = lado.indices.map((i) => landmarks[i]);
  const angulo = suavizar(estado.suavizado, calculateAngle(hombro, cadera, tobillo));
  const horizontal =
    Math.abs(hombro.x - tobillo.x) > 0.2 && Math.abs(hombro.y - tobillo.y) < 0.25;

  let mensaje = null;
  if (!horizontal) {
    mensaje = 'Ponte de perfil en plancha lateral';
  } else if (angulo < UMBRAL_ALINEACION_PLANCHA) {
    mensaje = 'Sube la cadera y alinea el cuerpo';
  }

  return resultado(estado, { suavizado: angulo, mensaje }, false);
}

export function detectarSuperman(landmarks, estado) {
  const visibles = [11, 12, 15, 16, 23, 24, 27, 28];
  if (!esVisible(landmarks, visibles, UMBRAL_VISIBILIDAD)) {
    return resultado(estado, { mensaje: 'Acuéstate boca abajo de perfil' }, false);
  }

  const hombro = {
    x: (landmarks[11].x + landmarks[12].x) / 2,
    y: (landmarks[11].y + landmarks[12].y) / 2,
  };
  const cadera = {
    x: (landmarks[23].x + landmarks[24].x) / 2,
    y: (landmarks[23].y + landmarks[24].y) / 2,
  };
  const muneca = {
    x: (landmarks[15].x + landmarks[16].x) / 2,
    y: (landmarks[15].y + landmarks[16].y) / 2,
  };
  const tobillo = {
    x: (landmarks[27].x + landmarks[28].x) / 2,
    y: (landmarks[27].y + landmarks[28].y) / 2,
  };

  const horizontal =
    Math.abs(hombro.x - cadera.x) > UMBRAL_CUERPO_HORIZONTAL &&
    Math.abs(hombro.y - cadera.y) < 0.18;
  if (!horizontal) {
    return resultado(estado, { mensaje: 'Acuéstate boca abajo de perfil' }, false);
  }

  const brazosAdelante = muneca.x < hombro.x - 0.05;
  const piernasAtras = tobillo.x > cadera.x + 0.05;
  if (!brazosAdelante || !piernasAtras) {
    return resultado(
      estado,
      { mensaje: 'Estira brazos adelante y piernas atrás' },
      false
    );
  }

  const brazosArriba = muneca.y < hombro.y - UMBRAL_SUPERMAN;
  const piernasArriba = tobillo.y < cadera.y - UMBRAL_SUPERMAN;

  let mensaje = null;
  if (!brazosArriba && !piernasArriba) {
    mensaje = 'Levanta brazos y piernas';
  } else if (!brazosArriba) {
    mensaje = 'Sube más los brazos';
  } else if (!piernasArriba) {
    mensaje = 'Sube más las piernas';
  }

  return resultado(estado, { mensaje }, false);
}

export const DETECTORES = {
  SENTADILLAS: detectarSentadilla,
  FLEXIONES: detectarFlexion,
  JUMPING_JACKS: detectarJumpingJack,
  ZANCADAS: detectarZancada,
  PLANCHA: detectarPlancha,
  RODILLAS_ALTAS: detectarRodillasAltas,
  PUENTE_GLUTEO: detectarPuenteGluteo,
  ABDOMINALES: detectarAbdominal,
  MOUNTAIN_CLIMBER: detectarMountainClimber,
  PLANCHA_LATERAL: detectarPlanchaLateral,
  SUPERMAN: detectarSuperman,
};
