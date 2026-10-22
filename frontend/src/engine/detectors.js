import { calculateAngle, distancia, esVisible, normalizarLandmarks } from './angles';
import { OneEuroFilter } from './filters';
import { calcularScoreForma } from './forma';

export const UMBRAL_VISIBILIDAD = 0.5;
export const UMBRAL_ANGULO_ARRIBA = 160;
export const UMBRAL_ANGULO_ABAJO = 100;
export const UMBRAL_ZONA_BAJA = 115;
export const UMBRAL_DESCENSO_CADERA = 0.03;
export const UMBRAL_VERTICALIDAD_PLANCHA = 0.55;
export const TIEMPO_SENTADO_MS = 2000;

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

// Escritorio: la cámara solo necesita ver hombros y cabeza; las piernas
// pueden quedar debajo del escritorio.
export const UMBRAL_BRAZOS_ARRIBA = 0.05;
export const UMBRAL_BRAZOS_NIVEL = 0.01;
export const UMBRAL_BRAZOS_ABAJO = 0.06;
export const UMBRAL_APERTURA_ABIERTO = 1.3;
export const UMBRAL_APERTURA_CERRADO = 0.95;
export const UMBRAL_ROTACION_TORSO = 0.3;
export const UMBRAL_ROTACION_TORSO_NEUTRO = 0.1;
export const UMBRAL_INCLINACION_CUELLO = 0.02;
export const UMBRAL_INCLINACION_CUELLO_NEUTRO = 0.008;
export const UMBRAL_DESVIO_NARIZ = 0.3;
export const UMBRAL_NARIZ_BAJA = 0.15;

export function crearEstadoDetector() {
  return {
    fase: 'ARRIBA',
    baseY: null,
    tiempoZonaBajaMs: null,
    sentado: false,
    mensaje: null,
    anguloI: null,
    anguloD: null,
    ladoActivo: null,
    scoreForma: null,
    filtroBase: new OneEuroFilter({ minCutoff: 0.5, beta: 0.01 }),
  };
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

  const normalizados = normalizarLandmarks(landmarks) || landmarks;
  const [cadera, rodilla, tobillo] = lado.indices.map((i) => normalizados[i]);
  const angulo = calculateAngle(cadera, rodilla, tobillo);
  const caderaY = (landmarks[23].y + landmarks[24].y) / 2;

  let { fase, baseY, sentado, tiempoZonaBajaMs, scoreForma } = estado;
  let repeticion = false;
  let mensaje = null;

  if (angulo > UMBRAL_ANGULO_ARRIBA) {
    baseY = baseY == null ? caderaY : estado.filtroBase.filter(caderaY, ahoraMs);

    if (fase === 'ABAJO' && !sentado) repeticion = true;
    fase = 'ARRIBA';
    sentado = false;
    tiempoZonaBajaMs = null;
  } else if (fase === 'ARRIBA' && angulo < UMBRAL_ANGULO_ABAJO) {
    const descendioCadera = baseY == null || caderaY > baseY + UMBRAL_DESCENSO_CADERA;
    if (descendioCadera) {
      fase = 'ABAJO';
      tiempoZonaBajaMs = ahoraMs;
      scoreForma = calcularScoreForma('SENTADILLAS', landmarks);
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
    { fase, baseY, sentado, tiempoZonaBajaMs, mensaje, scoreForma },
    repeticion
  );
}

export function detectarFlexion(landmarks, estado, ahoraMs = Date.now()) {
  const ladoBrazo = mejorLado(landmarks, LADOS_FLEXION);
  if (!ladoBrazo) return resultado(estado, {}, false);

  const normalizados = normalizarLandmarks(landmarks) || landmarks;
  const [hombro, codo, muneca] = ladoBrazo.indices.map((i) => normalizados[i]);
  const angulo = calculateAngle(hombro, codo, muneca);

  let esPlancha = true;
  const ladoPlancha = mejorLado(landmarks, LADOS_PLANCHA);
  if (ladoPlancha) {
    const [h, c] = ladoPlancha.indices.map((i) => landmarks[i]);
    const largo = distancia(h, c) || 0.0001;
    esPlancha = Math.abs(h.y - c.y) / largo < UMBRAL_VERTICALIDAD_PLANCHA;
  }

  let { fase, scoreForma } = estado;
  let repeticion = false;
  let mensaje = null;

  if (!esPlancha) {
    fase = 'ARRIBA';
    scoreForma = null;
    mensaje = 'Colócate en plancha de perfil';
  } else if (angulo > UMBRAL_ANGULO_ARRIBA) {
    if (fase === 'ABAJO') repeticion = true;
    fase = 'ARRIBA';
  } else if (angulo < UMBRAL_ANGULO_ABAJO && fase === 'ARRIBA') {
    fase = 'ABAJO';
    scoreForma = calcularScoreForma('FLEXIONES', landmarks);
  }

  return resultado(estado, { fase, mensaje, scoreForma }, repeticion);
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

export function detectarZancada(landmarks, estado, ahoraMs = Date.now()) {
  const lado = ladoMasFlexionado(landmarks, LADOS_SENTADILLA);
  if (!lado) return resultado(estado, {}, false);

  const normalizados = normalizarLandmarks(landmarks) || landmarks;
  const [cadera, rodilla, tobillo] = lado.indices.map((i) => normalizados[i]);
  const angulo = calculateAngle(cadera, rodilla, tobillo);
  const caderaY = (landmarks[23].y + landmarks[24].y) / 2;

  let { fase, baseY } = estado;
  let repeticion = false;
  let mensaje = null;

  if (angulo > UMBRAL_ANGULO_ARRIBA) {
    baseY = baseY == null ? caderaY : estado.filtroBase.filter(caderaY, ahoraMs);
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

  return resultado(estado, { fase, baseY, mensaje }, repeticion);
}

export function detectarPlancha(landmarks, estado) {
  const lado = mejorLado(landmarks, LADOS_PLANCHA);
  if (!lado) return resultado(estado, { mensaje: 'Colócate de perfil' }, false);

  const [hombro, cadera, tobillo] = lado.indices.map((i) => landmarks[i]);
  const normalizados = normalizarLandmarks(landmarks) || landmarks;
  const [hombroN, caderaN, tobilloN] = lado.indices.map((i) => normalizados[i]);
  const angulo = calculateAngle(hombroN, caderaN, tobilloN);
  const horizontal =
    Math.abs(hombro.x - tobillo.x) > 0.2 && Math.abs(hombro.y - tobillo.y) < 0.25;
  const scoreForma = horizontal && angulo >= UMBRAL_ALINEACION_PLANCHA
    ? calcularScoreForma('PLANCHA', landmarks)
    : null;

  let mensaje = null;
  if (!horizontal) {
    mensaje = 'Ponte en plancha de perfil';
  } else if (angulo < UMBRAL_ALINEACION_PLANCHA) {
    mensaje = 'Alinea el cuerpo: no dejes caer la cadera';
  }

  return resultado(estado, { mensaje, scoreForma }, false);
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

  const normalizados = normalizarLandmarks(landmarks) || landmarks;
  const anguloI = calculateAngle(normalizados[23], normalizados[25], normalizados[27]);
  const anguloD = calculateAngle(normalizados[24], normalizados[26], normalizados[28]);

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
  const normalizados = normalizarLandmarks(landmarks) || landmarks;
  const [hombroN, caderaN, tobilloN] = lado.indices.map((i) => normalizados[i]);
  const angulo = calculateAngle(hombroN, caderaN, tobilloN);
  const horizontal =
    Math.abs(hombro.x - tobillo.x) > 0.2 && Math.abs(hombro.y - tobillo.y) < 0.25;
  const scoreForma = horizontal && angulo >= UMBRAL_ALINEACION_PLANCHA
    ? calcularScoreForma('PLANCHA_LATERAL', landmarks)
    : null;

  let mensaje = null;
  if (!horizontal) {
    mensaje = 'Ponte de perfil en plancha lateral';
  } else if (angulo < UMBRAL_ALINEACION_PLANCHA) {
    mensaje = 'Sube la cadera y alinea el cuerpo';
  }

  return resultado(estado, { mensaje, scoreForma }, false);
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

  const brazosExtendidos = Math.abs(muneca.x - hombro.x) > 0.05;
  const piernasExtendidas = Math.abs(tobillo.x - cadera.x) > 0.05;
  if (!brazosExtendidos || !piernasExtendidas) {
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

function centroY(landmarks, indices) {
  return indices.reduce((total, i) => total + landmarks[i].y, 0) / indices.length;
}

// Círculos de brazos: cuenta cuando las muñecas pasan por encima de los
// hombros y regresan (una vuelta completa).
export function detectarCirculosBrazos(landmarks, estado) {
  const visibles = [11, 12, 15, 16];
  if (!esVisible(landmarks, visibles, UMBRAL_VISIBILIDAD)) {
    return resultado(estado, { mensaje: 'Muestra hombros y brazos en la cámara' }, false);
  }

  const hombroY = centroY(landmarks, [11, 12]);
  const munecaY = centroY(landmarks, [15, 16]);

  let { fase } = estado;
  let repeticion = false;

  if (munecaY < hombroY - UMBRAL_BRAZOS_ARRIBA) {
    if (fase === 'ABAJO') repeticion = true;
    fase = 'ARRIBA';
  } else if (munecaY > hombroY + UMBRAL_BRAZOS_NIVEL) {
    fase = 'ABAJO';
  }

  return resultado(estado, { fase, mensaje: null }, repeticion);
}

// Elevaciones laterales: cuenta cuando las muñecas suben al nivel de los
// hombros. Solo tren superior, no exige piernas.
export function detectarElevacionBrazos(landmarks, estado) {
  const visibles = [11, 12, 15, 16];
  if (!esVisible(landmarks, visibles, UMBRAL_VISIBILIDAD)) {
    return resultado(estado, { mensaje: 'Muestra hombros y brazos en la cámara' }, false);
  }

  const hombroY = centroY(landmarks, [11, 12]);
  const munecaY = centroY(landmarks, [15, 16]);

  let { fase } = estado;
  let repeticion = false;

  if (munecaY < hombroY + UMBRAL_BRAZOS_NIVEL) {
    if (fase === 'ABAJO') repeticion = true;
    fase = 'ARRIBA';
  } else if (munecaY > hombroY + UMBRAL_BRAZOS_ABAJO) {
    fase = 'ABAJO';
  }

  return resultado(estado, { fase, mensaje: null }, repeticion);
}

// Apertura de pecho: compara la separación de muñecas contra el ancho de
// hombros. Abre y cierra; una rep por abertura.
export function detectarAperturaPecho(landmarks, estado) {
  const visibles = [11, 12, 15, 16];
  if (!esVisible(landmarks, visibles, UMBRAL_VISIBILIDAD)) {
    return resultado(estado, { mensaje: 'Muestra hombros y brazos en la cámara' }, false);
  }

  const anchoHombros = Math.max(Math.abs(landmarks[12].x - landmarks[11].x), 0.0001);
  const separacionMuñecas =
    Math.abs(landmarks[16].x - landmarks[15].x) / anchoHombros;

  let { fase } = estado;
  let repeticion = false;

  if (separacionMuñecas > UMBRAL_APERTURA_ABIERTO) {
    if (fase === 'CERRADO') repeticion = true;
    fase = 'ABIERTO';
  } else if (separacionMuñecas < UMBRAL_APERTURA_CERRADO) {
    fase = 'CERRADO';
  }

  return resultado(estado, { fase, mensaje: null }, repeticion);
}

// Rotación de torso: alterna la nariz a cada lado del centro de hombros.
// Sentado frente a la cámara, la pierna no entra en juego.
export function detectarRotacionTorso(landmarks, estado) {
  const visibles = [0, 11, 12];
  if (!esVisible(landmarks, visibles, UMBRAL_VISIBILIDAD)) {
    return resultado(estado, { mensaje: 'Muestra tu rostro y hombros en la cámara' }, false);
  }

  const centroX = (landmarks[11].x + landmarks[12].x) / 2;
  const anchoHombros = Math.max(Math.abs(landmarks[12].x - landmarks[11].x), 0.0001);
  const desvio = (landmarks[0].x - centroX) / anchoHombros;

  let { ladoActivo } = estado;
  let repeticion = false;
  let mensaje = null;

  if (desvio < -UMBRAL_ROTACION_TORSO) {
    if (ladoActivo !== 'IZQ') {
      repeticion = ladoActivo === 'DER';
      ladoActivo = 'IZQ';
    }
  } else if (desvio > UMBRAL_ROTACION_TORSO) {
    if (ladoActivo !== 'DER') {
      repeticion = ladoActivo === 'IZQ';
      ladoActivo = 'DER';
    }
  } else if (Math.abs(desvio) < UMBRAL_ROTACION_TORSO_NEUTRO) {
    ladoActivo = null;
  } else {
    mensaje = 'Vuelve al centro entre cada giro';
  }

  return resultado(estado, { ladoActivo, mensaje }, repeticion);
}

// Estiramiento de cuello: alterna inclinaciones hacia cada hombro.
// Usa el desnivel entre orejas; si no se ven, recurre a la nariz.
export function detectarEstiramientoCuello(landmarks, estado) {
  if (!esVisible(landmarks, [11, 12], UMBRAL_VISIBILIDAD)) {
    return resultado(estado, { mensaje: 'Muestra tus hombros en la cámara' }, false);
  }

  const hombroY = centroY(landmarks, [11, 12]);
  const anchoHombros = Math.max(Math.abs(landmarks[12].x - landmarks[11].x), 0.0001);
  const orejaI = landmarks[7];
  const orejaD = landmarks[8];
  const orejasVisibles =
    (orejaI?.visibility ?? 0) > UMBRAL_VISIBILIDAD &&
    (orejaD?.visibility ?? 0) > UMBRAL_VISIBILIDAD;

  let lado = null;
  if (orejasVisibles) {
    const desnivel = orejaI.y - orejaD.y;
    if (desnivel > UMBRAL_INCLINACION_CUELLO) lado = 'IZQ';
    else if (desnivel < -UMBRAL_INCLINACION_CUELLO) lado = 'DER';
  } else {
    const nariz = landmarks[0];
    if (nariz && (nariz.visibility ?? 1) > UMBRAL_VISIBILIDAD) {
      const desvio = (nariz.x - (landmarks[11].x + landmarks[12].x) / 2) / anchoHombros;
      const baja = nariz.y > hombroY - UMBRAL_NARIZ_BAJA;
      if (baja && desvio < -UMBRAL_DESVIO_NARIZ) lado = 'IZQ';
      else if (baja && desvio > UMBRAL_DESVIO_NARIZ) lado = 'DER';
    }
  }

  let { ladoActivo } = estado;
  let repeticion = false;

  if (lado) {
    if (ladoActivo !== lado) {
      repeticion = ladoActivo != null;
      ladoActivo = lado;
    }
  } else {
    ladoActivo = null;
  }

  return resultado(estado, { ladoActivo, mensaje: null }, repeticion);
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
  CIRCULOS_BRAZOS: detectarCirculosBrazos,
  ELEVACIONES_LATERALES: detectarElevacionBrazos,
  APERTURA_PECHO: detectarAperturaPecho,
  ROTACION_TORSO: detectarRotacionTorso,
  ESTIRAMIENTO_CUELLO: detectarEstiramientoCuello,
};
