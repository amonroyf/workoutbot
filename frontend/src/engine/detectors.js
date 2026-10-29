import { calculateAngle, distancia, esVisible, normalizarLandmarks, distanciaHorizontal } from './angles';
import { OneEuroFilter } from './filters';
import { calcularScoreForma } from './forma';
import { EJERCICIOS_CATALOGO } from './ejercicios';

// UMBRALES GLOBALES REDUCIDOS PARA RESISTIR OCLUSIÓN Y MOTION BLUR
export const UMBRAL_VISIBILIDAD = 0.35; 
export const UMBRAL_VALGO_RODILLA = 0.75; 
export const UMBRAL_ANGULO_ARRIBA = 160;
export const UMBRAL_ANGULO_ABAJO = 90; // Profundidad estricta
export const UMBRAL_ZONA_BAJA = 100;
export const UMBRAL_DESCENSO_CADERA = 0.03;
export const UMBRAL_VERTICALIDAD_PLANCHA = 0.55;
export const TIEMPO_SENTADO_MS = 2000;

const LADOS_SENTADILLA = [[23, 25, 27], [24, 26, 28]];
const LADOS_FLEXION = [[11, 13, 15], [12, 14, 16]];
const LADOS_PLANCHA = [[11, 23, 27], [12, 24, 28]];
const LADOS_TORSO = [[11, 23, 25], [12, 24, 26]];

export const UMBRAL_RODILLA_ALTA = 0.03;
export const UMBRAL_TORSO_ARRIBA = 0.04;
export const UMBRAL_CUERPO_HORIZONTAL = 0.1;
export const UMBRAL_ALINEACION_PLANCHA = 155; // Mayor exigencia en rectitud
export const UMBRAL_RODILLA_ESCALADOR = 120;
export const UMBRAL_PIERNA_EXTENDIDA = 150;
export const UMBRAL_SUPERMAN = 0.03;
export const UMBRAL_ROTACION_TORSO = 0.3;
export const UMBRAL_ROTACION_TORSO_NEUTRO = 0.1;
export const UMBRAL_TORSO_VERTICAL = 0.1;
export const UMBRAL_RODILLA_90_ALTA = 110;
export const UMBRAL_RODILLA_90_BAJA = 70;
export const UMBRAL_CUELLO_INCLINACION = 0.14;
export const UMBRAL_CUELLO_NEUTRO = 0.05;
export const UMBRAL_DESNIVEL_HOMBROS = 0.08;
export const UMBRAL_CODO_ESTIRADO = 150; // Más exigente
export const UMBRAL_ALTURA_CUELLO_MIN = 0.22;
export const UMBRAL_GOLPE_CODO = 150; // Extensión total
export const UMBRAL_GOLPE_Y = 0.15;
export const UMBRAL_PATADA = 0.04;
export const UMBRAL_PRESS_ARRIBA = 0.5;
export const UMBRAL_PRESS_ABAJO = 0.2;
export const UMBRAL_REMO_JALADO = 0.4;
export const UMBRAL_REMO_EXTENDIDO = 0.55;
export const UMBRAL_BISAGRA = 0.35;
export const UMBRAL_BISAGRA_ARRIBA = 0.15;

export function crearEstadoDetector() {
  return {
    fase: 'ARRIBA',
    baseY: null,
    baseX: null,
    tiempoZonaBajaMs: null,
    sentado: false,
    mensaje: null,
    anguloI: null,
    anguloD: null,
    ladoActivo: null,
    scoreForma: null,
    progresoFase: 0,
    filtroBase: new OneEuroFilter({ minCutoff: 0.5, beta: 0.01 }),
    filtroAux: new OneEuroFilter({ minCutoff: 0.5, beta: 0.01 }),
  };
}

function visibilidad(landmarks, indices) {
  return Math.min(...indices.map((i) => landmarks[i]?.visibility ?? 1));
}

// NUEVO: PARCHE DE OCLUSIÓN (Degradación elegante por promedio)
function mejorLado(landmarks, lados, umbral = UMBRAL_VISIBILIDAD) {
  const validos = lados
    .map((indices) => {
      const visibilidades = indices.map((i) => landmarks[i]?.visibility ?? 0);
      const minVis = Math.min(...visibilidades);
      const avgVis = visibilidades.reduce((a, b) => a + b, 0) / visibilidades.length;
      return { indices, minVis, avgVis };
    })
    .filter((lado) => lado.minVis > umbral || lado.avgVis > 0.6)
    .sort((a, b) => b.avgVis - a.avgVis);
  return validos[0] || null;
}

function ladoMasFlexionado(landmarks, lados, umbral = UMBRAL_VISIBILIDAD) {
  const validos = lados
    .map((indices) => {
      const visibilidades = indices.map((i) => landmarks[i]?.visibility ?? 0);
      const avgVis = visibilidades.reduce((a, b) => a + b, 0) / visibilidades.length;
      const [a, b, c] = indices.map((i) => landmarks[i]);
      return { indices, avgVis, angulo: calculateAngle(a, b, c) };
    })
    .filter((lado) => lado.avgVis > umbral)
    .sort((a, b) => a.angulo - b.angulo);
  return validos[0] || null;
}

function cuerpoHorizontal(hombro, cadera) {
  return (
    Math.abs(hombro.x - cadera.x) > UMBRAL_CUERPO_HORIZONTAL &&
    Math.abs(hombro.y - cadera.y) < 0.25
  );
}

function resultado(estado, cambios, repeticion = false) {
  const merged = { ...estado, ...cambios };
  if (cambios.progresoFase === undefined) {
    merged.progresoFase = merged.fase === 'ABAJO' ? 1 : 0;
  }
  return { estado: merged, repeticion };
}

// ----------------------------------------------------------------------
// DETECTORES DE TREN INFERIOR
// ----------------------------------------------------------------------

export function detectarSentadilla(landmarks, estado, ahoraMs = Date.now()) {
  const lado = mejorLado(landmarks, LADOS_SENTADILLA);
  if (!lado) return resultado(estado, { mensaje: 'Encuadra tus rodillas y pies' }, false);

  const normalizados = normalizarLandmarks(landmarks) || landmarks;
  const [cadera, rodilla, tobillo] = lado.indices.map((i) => normalizados[i]);
  const angulo = calculateAngle(cadera, rodilla, tobillo);
  const indiceCadera = lado.indices[0];
  const caderaY = landmarks[indiceCadera].y;

  // NUEVA FÍSICA: Control de "Buenos Días"
  const hombroTop = normalizados[indiceCadera === 23 ? 11 : 12];
  const inclinacionTorso = Math.abs(hombroTop.x - cadera.x);
  const pechoCaido = inclinacionTorso > 0.45; // 45 grados max

  const ambosLadosVisibles =
    (landmarks[25]?.visibility ?? 1) > UMBRAL_VISIBILIDAD &&
    (landmarks[26]?.visibility ?? 1) > UMBRAL_VISIBILIDAD &&
    (landmarks[27]?.visibility ?? 1) > UMBRAL_VISIBILIDAD &&
    (landmarks[28]?.visibility ?? 1) > UMBRAL_VISIBILIDAD;

  const sepRodillas = ambosLadosVisibles ? distanciaHorizontal(normalizados[25], normalizados[26]) : 0;
  const sepTobillos = ambosLadosVisibles ? distanciaHorizontal(normalizados[27], normalizados[28]) : 1;
  const rodillasColapsadas = ambosLadosVisibles && sepRodillas < sepTobillos * UMBRAL_VALGO_RODILLA;

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

  // Castigos de postura
  if (pechoCaido) {
    mensaje = 'Saca el pecho y mantén la espalda recta';
    scoreForma = scoreForma != null ? Math.min(scoreForma, 40) : 40;
  } else if (angulo < 150 && rodillasColapsadas) {
    mensaje = 'Abre las rodillas hacia afuera';
    scoreForma = scoreForma != null ? Math.min(scoreForma, 60) : 60;
  }

  const progresoFase = Math.max(0, Math.min(1, (UMBRAL_ANGULO_ARRIBA - angulo) / (UMBRAL_ANGULO_ARRIBA - UMBRAL_ANGULO_ABAJO)));
  return resultado(estado, { fase, baseY, sentado, tiempoZonaBajaMs, mensaje, scoreForma, progresoFase }, repeticion);
}

export function detectarZancada(landmarks, estado, ahoraMs = Date.now()) {
  const lado = ladoMasFlexionado(landmarks, LADOS_SENTADILLA);
  if (!lado) return resultado(estado, {}, false);
  const normalizados = normalizarLandmarks(landmarks) || landmarks;
  const [cadera, rodilla, tobillo] = lado.indices.map((i) => normalizados[i]);
  const angulo = calculateAngle(cadera, rodilla, tobillo);
  const caderaY = landmarks[lado.indices[0]].y;

  // NUEVA FÍSICA: Inclinación en zancada
  const hombroTop = normalizados[lado.indices[0] === 23 ? 11 : 12];
  const inclinacionTorso = Math.abs(hombroTop.x - cadera.x);
  const pechoCaido = inclinacionTorso > 0.35;

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

  if (pechoCaido) mensaje = 'Espalda recta, no te inclines al frente';

  const progresoFase = Math.max(0, Math.min(1, (UMBRAL_ANGULO_ARRIBA - angulo) / (UMBRAL_ANGULO_ARRIBA - UMBRAL_ANGULO_ABAJO)));
  return resultado(estado, { fase, baseY, mensaje, progresoFase }, repeticion);
}

export function detectarCalfRaise(landmarks, estado, ahoraMs = Date.now()) {
  if (!esVisible(landmarks, [27, 28], UMBRAL_VISIBILIDAD)) {
    return resultado(estado, { mensaje: 'Muestra pies y tobillos en la cámara' }, false);
  }
  
  // NUEVA FÍSICA: Ya no usa la cadera, establece una Y base relativa al suelo para los tobillos.
  const tobilloY = (landmarks[27].y + landmarks[28].y) / 2;
  let { fase, baseY } = estado;
  let repeticion = false;
  let mensaje = null;

  if (fase === 'ABAJO') {
    baseY = baseY == null ? tobilloY : estado.filtroBase.filter(tobilloY, ahoraMs);
  }

  // El tobillo sube físicamente en la pantalla (la Y se reduce)
  const elevacion = baseY != null ? (baseY - tobilloY) : 0;
  const subido = elevacion > 0.04;

  if (subido) {
    if (fase === 'ABAJO') {
      fase = 'ARRIBA';
      repeticion = true;
    }
  } else if (elevacion < 0.01) {
    fase = 'ABAJO';
  }

  return resultado(estado, { fase, baseY, mensaje }, repeticion);
}

export function detectarLateralLegRaise(landmarks, estado) {
  const lado = mejorLado(landmarks, LADOS_SENTADILLA);
  if (!lado) return resultado(estado, { mensaje: 'Ponte de frente o perfil claro' }, false);
  
  const [cadera, , tobillo] = lado.indices.map((i) => landmarks[i]);
  const largoPierna = distancia(cadera, tobillo);
  
  // NUEVA FÍSICA: Altura relativa al largo de la pierna
  const alturaRequerida = cadera.y - (largoPierna * 0.4); 
  const subida = tobillo.y < alturaRequerida;
  
  let { fase } = estado;
  let repeticion = false;

  if (subida) {
    if (fase === 'ABAJO') {
      fase = 'ARRIBA';
      repeticion = true;
    }
  } else if (tobillo.y > cadera.y - 0.1) {
    fase = 'ABAJO';
  }
  return resultado(estado, { fase, mensaje: null }, repeticion);
}

// ----------------------------------------------------------------------
// DETECTORES DE TREN SUPERIOR Y COMBAT
// ----------------------------------------------------------------------

export function detectarFlexion(landmarks, estado, ahoraMs = Date.now()) {
  const ladoBrazo = mejorLado(landmarks, LADOS_FLEXION);
  if (!ladoBrazo) return resultado(estado, {}, false);

  const normalizados = normalizarLandmarks(landmarks) || landmarks;
  const [hombro, codo, muneca] = ladoBrazo.indices.map((i) => normalizados[i]);
  const angulo = calculateAngle(hombro, codo, muneca);
  
  const ladoPlancha = mejorLado(landmarks, LADOS_PLANCHA);
  let esPlancha = false;
  if (ladoPlancha) {
    const [h, c] = ladoPlancha.indices.map((i) => landmarks[i]);
    const largo = distancia(h, c) || 0.0001;
    esPlancha = Math.abs(h.y - c.y) / largo < UMBRAL_VERTICALIDAD_PLANCHA;
  }

  let { fase, scoreForma } = estado;
  let repeticion = false;
  let mensaje = null;

  // NUEVA FÍSICA: Hombro debe bajar al nivel del codo para validar
  const hombroRaw = landmarks[ladoBrazo.indices[0]];
  const codoRaw = landmarks[ladoBrazo.indices[1]];
  const profundidadSuficiente = hombroRaw.y > codoRaw.y - 0.05 || angulo < 90;

  if (!esPlancha) {
    fase = 'ARRIBA';
    scoreForma = null;
    mensaje = 'Alinea el cuerpo en plancha';
  } else if (angulo > UMBRAL_ANGULO_ARRIBA) {
    if (fase === 'ABAJO') repeticion = true;
    fase = 'ARRIBA';
  } else if (profundidadSuficiente && fase === 'ARRIBA') {
    fase = 'ABAJO';
    scoreForma = calcularScoreForma('FLEXIONES', landmarks);
  } else if (fase === 'ARRIBA' && angulo < 130 && !profundidadSuficiente) {
    mensaje = 'Baja más el pecho';
  }

  const progresoFase = Math.max(0, Math.min(1, (UMBRAL_ANGULO_ARRIBA - angulo) / (UMBRAL_ANGULO_ARRIBA - 90)));
  return resultado(estado, { fase, mensaje, scoreForma, progresoFase }, repeticion);
}

export function detectarPressHombro(landmarks, estado) {
  const visibles = [11, 12, 13, 14, 15, 16];
  if (!esVisible(landmarks, visibles, UMBRAL_VISIBILIDAD)) {
    return resultado(estado, { mensaje: 'Muestra hombros, codos y manos' }, false);
  }

  const normalizados = normalizarLandmarks(landmarks) || landmarks;
  const anguloI = calculateAngle(normalizados[11], normalizados[13], normalizados[15]);
  const anguloD = calculateAngle(normalizados[12], normalizados[14], normalizados[16]);
  const promedioCodos = (anguloI + anguloD) / 2;
  
  const hombroY = (landmarks[11].y + landmarks[12].y) / 2;
  const munecaY = (landmarks[15].y + landmarks[16].y) / 2;
  const anchoHombros = Math.max(Math.abs(landmarks[12].x - landmarks[11].x), 0.0001);
  const relativo = (hombroY - munecaY) / anchoHombros;
  
  // NUEVA FÍSICA: Controlar que los codos no caigan excesivamente
  const codoY = (landmarks[13].y + landmarks[14].y) / 2;
  const codosCaidos = codoY > hombroY + 0.15;

  let { fase } = estado;
  let repeticion = false;
  let mensaje = null;

  if (relativo > UMBRAL_PRESS_ARRIBA) {
    if (promedioCodos < 135) {
      mensaje = 'Estira más los brazos hacia arriba';
    } else {
      if (fase === 'ABAJO') repeticion = true;
      fase = 'ARRIBA';
    }
  } else if (relativo < UMBRAL_PRESS_ABAJO) {
    fase = 'ABAJO';
    if (codosCaidos) mensaje = 'No dejes caer los codos por debajo del pecho';
  }

  return resultado(estado, { fase, mensaje }, repeticion);
}

export function detectarGolpeDirecto(landmarks, estado) {
  const visibles = [11, 12, 13, 14, 15, 16];
  if (!esVisible(landmarks, visibles, UMBRAL_VISIBILIDAD)) {
    return resultado(estado, { mensaje: 'Muestra hombros y brazos' }, false);
  }
  const normalizados = normalizarLandmarks(landmarks) || landmarks;
  const anguloI = calculateAngle(normalizados[11], normalizados[13], normalizados[15]);
  const anguloD = calculateAngle(normalizados[12], normalizados[14], normalizados[16]);
  
  const hombroYI = landmarks[11].y;
  const hombroYD = landmarks[12].y;
  
  // NUEVA FÍSICA: Verificación estricta de Guardia
  const guardiaD = landmarks[16].y < hombroYD + 0.2; // Mano inactiva protege la cara
  const guardiaI = landmarks[15].y < hombroYI + 0.2;

  const extI = anguloI > UMBRAL_GOLPE_CODO && landmarks[15].y < hombroYI + UMBRAL_GOLPE_Y;
  const extD = anguloD > UMBRAL_GOLPE_CODO && landmarks[16].y < hombroYD + UMBRAL_GOLPE_Y;

  let { ladoActivo } = estado;
  let repeticion = false;
  let mensaje = null;

  if (extI && !extD) {
    if (!guardiaD) mensaje = 'Mantén la mano derecha arriba (guardia)';
    else if (ladoActivo !== 'IZQ') {
      repeticion = true;
      ladoActivo = 'IZQ';
    }
  } else if (extD && !extI) {
    if (!guardiaI) mensaje = 'Mantén la mano izquierda arriba (guardia)';
    else if (ladoActivo !== 'DER') {
      repeticion = true;
      ladoActivo = 'DER';
    }
  } else if (!extI && !extD) {
    ladoActivo = null;
  }

  return resultado(estado, { ladoActivo, mensaje }, repeticion);
}

export function detectarPatadaFrontal(landmarks, estado) {
  const visibles = [23, 24, 25, 26, 27, 28];
  if (!esVisible(landmarks, visibles, UMBRAL_VISIBILIDAD)) {
    return resultado(estado, { mensaje: 'Muestra piernas y cadera' }, false);
  }
  const caderaY = (landmarks[23].y + landmarks[24].y) / 2;
  
  const normalizados = normalizarLandmarks(landmarks) || landmarks;
  const anguloI = calculateAngle(normalizados[23], normalizados[25], normalizados[27]);
  const anguloD = calculateAngle(normalizados[24], normalizados[26], normalizados[28]);

  // NUEVA FÍSICA: No solo subir pie, debe haber extensión de rodilla (>130°)
  const activaI = landmarks[27].y < caderaY + UMBRAL_PATADA && anguloI > 130;
  const activaD = landmarks[28].y < caderaY + UMBRAL_PATADA && anguloD > 130;
  
  // Guardias
  const manosArriba = (landmarks[15]?.y ?? 0) < caderaY - 0.2 && (landmarks[16]?.y ?? 0) < caderaY - 0.2;

  let { ladoActivo } = estado;
  let repeticion = false;
  let mensaje = null;

  if (activaI && !activaD) {
    if (!manosArriba) mensaje = 'Mantén la guardia alta al patear';
    else if (ladoActivo !== 'IZQ') { repeticion = true; ladoActivo = 'IZQ'; }
  } else if (activaD && !activaI) {
    if (!manosArriba) mensaje = 'Mantén la guardia alta al patear';
    else if (ladoActivo !== 'DER') { repeticion = true; ladoActivo = 'DER'; }
  } else if (!activaI && !activaD) {
    ladoActivo = null;
  }

  return resultado(estado, { ladoActivo, mensaje }, repeticion);
}

// ----------------------------------------------------------------------
// DETECTORES DE CARDIO Y CORE
// ----------------------------------------------------------------------

export function detectarJumpingJack(landmarks, estado) {
  const visiblesBrazos = [11, 12, 15, 16];
  if (!esVisible(landmarks, visiblesBrazos, UMBRAL_VISIBILIDAD)) {
    return resultado(estado, { mensaje: 'Aléjate para verte completo' }, false);
  }

  const anchoHombros = Math.max(Math.abs(landmarks[12].x - landmarks[11].x), 0.0001);
  const sepMunecas = Math.abs(landmarks[16].x - landmarks[15].x) / anchoHombros;
  const yHombro = (landmarks[11].y + landmarks[12].y) / 2;
  const yMuneca = (landmarks[15].y + landmarks[16].y) / 2;
  
  const brazosArriba = yMuneca < yHombro - 0.05 && sepMunecas > 1.2;
  const brazosAbajo = yMuneca > yHombro && sepMunecas < 1.2;

  let piernasAbiertas = false;
  let piernasJuntas = false;
  
  // PARCHE DE OCLUSIÓN: Uso de rodillas como fallback.
  if (esVisible(landmarks, [27, 28], UMBRAL_VISIBILIDAD)) {
    const sepTobillos = Math.abs(landmarks[28].x - landmarks[27].x);
    piernasAbiertas = sepTobillos > 0.15;
    piernasJuntas = sepTobillos < 0.1;
  } else if (esVisible(landmarks, [25, 26], UMBRAL_VISIBILIDAD)) {
    const sepRodillas = Math.abs(landmarks[26].x - landmarks[25].x);
    piernasAbiertas = sepRodillas > 0.12;
    piernasJuntas = sepRodillas < 0.08;
  } else {
    piernasAbiertas = brazosArriba;
    piernasJuntas = brazosAbajo;
  }

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

export function detectarPlancha(landmarks, estado) {
  const lado = mejorLado(landmarks, LADOS_PLANCHA);
  if (!lado) return resultado(estado, { mensaje: 'Ponte de perfil' }, false);
  
  const [hombro, cadera, tobillo] = lado.indices.map((i) => landmarks[i]);
  const normalizados = normalizarLandmarks(landmarks) || landmarks;
  const [hombroN, caderaN, tobilloN] = lado.indices.map((i) => normalizados[i]);
  const angulo = calculateAngle(hombroN, caderaN, tobilloN);
  
  const horizontal = Math.abs(hombro.x - tobillo.x) > 0.2 && Math.abs(hombro.y - tobillo.y) < 0.25;
  
  // NUEVA FÍSICA: Penalizar cadera caída (ángulo < 155) Y cadera levantada en pirámide (> 205 o inverso)
  // CalculateAngle da valor absoluto de 0 a 180. Evaluaremos desviación de 180.
  const desviacionRecta = Math.abs(180 - angulo);
  const caderaArriba = cadera.y < ((hombro.y + tobillo.y) / 2) - 0.1; // Pico piramidal 

  const scoreForma = horizontal && desviacionRecta <= 25 && !caderaArriba
    ? calcularScoreForma('PLANCHA', landmarks)
    : null;

  let mensaje = null;
  if (!horizontal) {
    mensaje = 'Ponte en plancha de perfil';
  } else if (caderaArriba) {
    mensaje = 'Baja la cadera, alinea el cuerpo recto';
  } else if (desviacionRecta > 25) {
    mensaje = 'No dejes caer la cadera, abdomen firme';
  }

  return resultado(estado, { mensaje, scoreForma }, false);
}

export function detectarDeadBug(landmarks, estado) {
  // NUEVA FÍSICA: Exige vista de perfil y rigidez.
  const lado = mejorLado(landmarks, LADOS_TORSO);
  if (!lado) return resultado(estado, { mensaje: 'Acuéstate de perfil' }, false);
  
  const hombro = landmarks[11];
  const cadera = landmarks[23];
  const horizontal = Math.abs(hombro.x - cadera.x) > UMBRAL_CUERPO_HORIZONTAL && Math.abs(hombro.y - cadera.y) < 0.15;
  
  if (!horizontal) return resultado(estado, { mensaje: 'Acuéstate boca arriba de perfil' }, false);

  // Brazos y piernas
  const brazoExtI = Math.abs(landmarks[15].y - landmarks[11].y) < 0.1; // paralelo al piso
  const piernaExtD = Math.abs(landmarks[28].y - landmarks[24].y) < 0.1;
  const cruceA = brazoExtI && piernaExtD;

  const brazoExtD = Math.abs(landmarks[16].y - landmarks[12].y) < 0.1;
  const piernaExtI = Math.abs(landmarks[27].y - landmarks[23].y) < 0.1;
  const cruceB = brazoExtD && piernaExtI;

  let { ladoActivo } = estado;
  let repeticion = false;

  if (cruceA) {
    if (ladoActivo !== 'A') { repeticion = true; ladoActivo = 'A'; }
  } else if (cruceB) {
    if (ladoActivo !== 'B') { repeticion = true; ladoActivo = 'B'; }
  } else {
    ladoActivo = null;
  }

  return resultado(estado, { ladoActivo, mensaje: null }, repeticion);
}

export function detectarShoulderTaps(landmarks, estado) {
  if (!esVisible(landmarks, [11, 12, 15, 16, 23, 24], UMBRAL_VISIBILIDAD)) {
    return resultado(estado, { mensaje: 'Colócate en plancha frente a la cámara' }, false);
  }
  
  const hombroI = landmarks[11]; const hombroD = landmarks[12];
  const munecaI = landmarks[15]; const munecaD = landmarks[16];
  
  const tocaD = Math.abs(munecaI.x - hombroD.x) < 0.08 && Math.abs(munecaI.y - hombroD.y) < 0.08;
  const tocaI = Math.abs(munecaD.x - hombroI.x) < 0.08 && Math.abs(munecaD.y - hombroI.y) < 0.08;

  // NUEVA FÍSICA: Control de balanceo de cadera
  const caderaCentroX = (landmarks[23].x + landmarks[24].x) / 2;
  let { ladoActivo, baseX } = estado;
  let repeticion = false;
  let mensaje = null;

  if (baseX == null) baseX = estado.filtroAux.filter(caderaCentroX, Date.now());
  const balanceo = Math.abs(baseX - caderaCentroX);
  
  if (balanceo > 0.05) mensaje = 'No balancees la cadera, aprieta el abdomen';

  if (tocaD && !tocaI) {
    if (ladoActivo !== 'DER') {
      if (balanceo <= 0.05) repeticion = true;
      ladoActivo = 'DER';
    }
  } else if (tocaI && !tocaD) {
    if (ladoActivo !== 'IZQ') {
      if (balanceo <= 0.05) repeticion = true;
      ladoActivo = 'IZQ';
    }
  } else if (!tocaD && !tocaI) {
    ladoActivo = null;
  }

  return resultado(estado, { ladoActivo, baseX, mensaje }, repeticion);
}

export function detectarMountainClimber(landmarks, estado) {
  const visibleIzq = esVisible(landmarks, [11, 23, 25], UMBRAL_VISIBILIDAD);
  const visibleDer = esVisible(landmarks, [12, 24, 26], UMBRAL_VISIBILIDAD);
  
  if (!visibleIzq && !visibleDer) {
    return resultado(estado, { mensaje: 'Colócate de perfil' }, false);
  }

  const hombroY = (landmarks[11].y + landmarks[12].y) / 2;
  const caderaY = (landmarks[23].y + landmarks[24].y) / 2;
  
  if (caderaY < hombroY - 0.15) {
    return resultado(estado, { mensaje: 'Baja la cadera para la plancha' }, false);
  }

  const normalizados = normalizarLandmarks(landmarks) || landmarks;
  const izqAvanza = normalizados[25].x < normalizados[23].x + 0.15;
  const derAvanza = normalizados[26].x < normalizados[24].x + 0.15;

  let { ladoActivo } = estado;
  let repeticion = false;
  let mensaje = null;

  if (izqAvanza) {
    if (ladoActivo !== 'IZQ') { repeticion = true; ladoActivo = 'IZQ'; }
  } else if (derAvanza) {
    if (ladoActivo !== 'DER') { repeticion = true; ladoActivo = 'DER'; }
  } else {
    ladoActivo = null;
  }
  return resultado(estado, { ladoActivo, mensaje }, repeticion);
}

export function detectarPosturaSilla(landmarks, estado) {
  if (!esVisible(landmarks, [0, 11, 12], UMBRAL_VISIBILIDAD)) {
    return resultado(estado, { mensaje: 'Siéntate frente a la cámara', scoreForma: null }, false);
  }
  
  const hombroIzq = landmarks[11];
  const hombroDer = landmarks[12];
  const nariz = landmarks[0];
  
  const anchoHombros = Math.max(Math.abs(hombroDer.x - hombroIzq.x), 0.0001);
  const centroHombrosY = (hombroIzq.y + hombroDer.y) / 2;
  
  // NUEVA FÍSICA: Usar relativos en lugar de estáticos absolutos
  const asimetria = Math.abs(hombroIzq.y - hombroDer.y) / anchoHombros;
  const elongacionCuello = (centroHombrosY - nariz.y) / anchoHombros;

  let mensaje = null;
  let penalizacion = 0;

  if (asimetria > UMBRAL_DESNIVEL_HOMBROS) {
    mensaje = 'Nivela ambos hombros';
    penalizacion += 25;
  } else if (elongacionCuello < UMBRAL_ALTURA_CUELLO_MIN) {
    mensaje = 'Abre el pecho y alarga la columna';
    penalizacion += 30;
  }

  const scoreForma = Math.max(20, Math.round(100 - penalizacion));
  return resultado(estado, { mensaje, scoreForma, fase: 'ARRIBA' }, false);
}

// ----------------------------------------------------------------------
// PASSTHROUGHS BÁSICOS MANTENIDOS PARA COMPATIBILIDAD
// ----------------------------------------------------------------------

export function detectarRodillasAltas(landmarks, estado) {
  if (!esVisible(landmarks, [23, 24, 25, 26], UMBRAL_VISIBILIDAD)) return resultado(estado, {}, false);
  const caderaY = (landmarks[23].y + landmarks[24].y) / 2;
  const enAlto = landmarks[25].y < caderaY - UMBRAL_RODILLA_ALTA || landmarks[26].y < caderaY - UMBRAL_RODILLA_ALTA;
  let { fase } = estado; let repeticion = false;
  if (enAlto) { if (fase === 'ABAJO') { fase = 'ARRIBA'; repeticion = true; } } else { fase = 'ABAJO'; }
  return resultado(estado, { fase, mensaje: null }, repeticion);
}

export function detectarRodillazo(landmarks, estado) {
  return detectarRodillasAltas(landmarks, estado); 
}

export function detectarPuenteGluteo(landmarks, estado) {
  const lado = mejorLado(landmarks, LADOS_TORSO);
  if (!lado) return resultado(estado, { mensaje: 'Acuéstate de perfil' }, false);
  const [hombro, cadera] = lado.indices.map((i) => landmarks[i]);
  if (!cuerpoHorizontal(hombro, cadera)) return resultado(estado, { mensaje: 'Acuéstate de perfil' }, false);
  const caderaArriba = cadera.y < hombro.y - UMBRAL_TORSO_ARRIBA;
  let { fase } = estado; let repeticion = false;
  if (caderaArriba) { if (fase === 'ABAJO') { fase = 'ARRIBA'; repeticion = true; } } else if (cadera.y > hombro.y - 0.01) { fase = 'ABAJO'; }
  return resultado(estado, { fase, mensaje: null }, repeticion);
}

export function detectarAbdominal(landmarks, estado) {
  const lado = mejorLado(landmarks, LADOS_TORSO);
  if (!lado) return resultado(estado, { mensaje: 'Acuéstate de perfil' }, false);
  const [hombro, cadera] = lado.indices.map((i) => landmarks[i]);
  if (!cuerpoHorizontal(hombro, cadera)) return resultado(estado, { mensaje: 'Acuéstate de perfil' }, false);
  const torsoArriba = hombro.y < cadera.y - UMBRAL_TORSO_ARRIBA;
  let { fase } = estado; let repeticion = false;
  if (torsoArriba) { if (fase === 'ABAJO') { fase = 'ARRIBA'; repeticion = true; } } else if (hombro.y > cadera.y - 0.01) { fase = 'ABAJO'; }
  return resultado(estado, { fase, mensaje: null }, repeticion);
}

export function detectarPlanchaLateral(landmarks, estado) {
  const lado = mejorLado(landmarks, LADOS_PLANCHA);
  if (!lado) return resultado(estado, { mensaje: 'Ponte de perfil' }, false);
  const [hombro, cadera, tobillo] = lado.indices.map((i) => landmarks[i]);
  const horizontal = Math.abs(hombro.x - tobillo.x) > 0.2 && Math.abs(hombro.y - tobillo.y) < 0.25;
  let mensaje = null;
  if (!horizontal) mensaje = 'Ponte de perfil en plancha lateral';
  return resultado(estado, { mensaje }, false);
}

export function detectarSuperman(landmarks, estado) {
  const visibleIzq = esVisible(landmarks, [11, 15, 23, 27], UMBRAL_VISIBILIDAD);
  const visibleDer = esVisible(landmarks, [12, 16, 24, 28], UMBRAL_VISIBILIDAD);
  if (!visibleIzq && !visibleDer) return resultado(estado, { mensaje: 'Acuéstate boca abajo de perfil' }, false);
  const hombroY = (landmarks[11].y + landmarks[12].y) / 2;
  const munecaY = (landmarks[15].y + landmarks[16].y) / 2;
  let mensaje = null;
  if (munecaY > hombroY - UMBRAL_SUPERMAN) mensaje = 'Sube más los brazos';
  return resultado(estado, { mensaje }, false);
}

export function detectarRotacionTorso(landmarks, estado) {
  if (!esVisible(landmarks, [0, 11, 12], UMBRAL_VISIBILIDAD)) return resultado(estado, { mensaje: 'Muestra rostro y hombros' }, false);
  const centroX = (landmarks[11].x + landmarks[12].x) / 2;
  const anchoHombros = Math.max(Math.abs(landmarks[12].x - landmarks[11].x), 0.0001);
  const desvio = (landmarks[0].x - centroX) / anchoHombros;
  let { ladoActivo } = estado; let repeticion = false; let mensaje = null;
  if (desvio < -UMBRAL_ROTACION_TORSO) { if (ladoActivo !== 'IZQ') { repeticion = ladoActivo === 'DER'; ladoActivo = 'IZQ'; } } 
  else if (desvio > UMBRAL_ROTACION_TORSO) { if (ladoActivo !== 'DER') { repeticion = ladoActivo === 'IZQ'; ladoActivo = 'DER'; } } 
  else if (Math.abs(desvio) < UMBRAL_ROTACION_TORSO_NEUTRO) { ladoActivo = null; } 
  else { mensaje = 'Vuelve al centro entre cada giro'; }
  return resultado(estado, { ladoActivo, mensaje }, repeticion);
}

export function detectarWallSit(landmarks, estado) {
  const lado = mejorLado(landmarks, LADOS_SENTADILLA);
  if (!lado) return resultado(estado, { mensaje: 'Ponte de perfil' }, false);
  const normalizados = normalizarLandmarks(landmarks) || landmarks;
  const [caderaN, rodillaN, tobilloN] = lado.indices.map((i) => normalizados[i]);
  const angulo = calculateAngle(caderaN, rodillaN, tobilloN);
  const indiceHombro = lado.indices[0] === 23 ? 11 : 12;
  const torsoVertical = Math.abs(landmarks[indiceHombro].x - landmarks[lado.indices[0]].x) < UMBRAL_TORSO_VERTICAL;
  let mensaje = null;
  if (angulo > UMBRAL_RODILLA_90_ALTA) mensaje = 'Baja más: rodillas a 90 grados';
  else if (angulo < UMBRAL_RODILLA_90_BAJA) mensaje = 'Sube un poco: rodillas a 90 grados';
  else if (!torsoVertical) mensaje = 'Espalda pegada a la pared';
  const scoreForma = mensaje ? 50 : 95;
  return resultado(estado, { mensaje, scoreForma, fase: 'ARRIBA' }, false);
}

export function detectarRemo(landmarks, estado) {
  if (!esVisible(landmarks, [11, 12, 15, 16], UMBRAL_VISIBILIDAD)) return resultado(estado, { mensaje: 'Muestra hombros y brazos' }, false);
  const anchoHombros = Math.max(Math.abs(landmarks[12].x - landmarks[11].x), 0.0001);
  const separacion = (Math.abs(landmarks[15].x - landmarks[11].x) / anchoHombros + Math.abs(landmarks[16].x - landmarks[12].x) / anchoHombros) / 2;
  let { fase } = estado; let repeticion = false;
  if (separacion < UMBRAL_REMO_JALADO) { if (fase === 'EXTENDIDO') repeticion = true; fase = 'JALADO'; } 
  else if (separacion > UMBRAL_REMO_EXTENDIDO) { fase = 'EXTENDIDO'; }
  return resultado(estado, { fase, mensaje: null }, repeticion);
}

export function detectarPesoMuerto(landmarks, estado) {
  const lado = mejorLado(landmarks, LADOS_TORSO);
  if (!lado) return resultado(estado, { mensaje: 'Ponte de perfil' }, false);
  const [hombro, cadera] = lado.indices.map((i) => landmarks[i]);
  const inclinacion = Math.abs(hombro.x - cadera.x) / (Math.abs(hombro.y - cadera.y) || 0.0001);
  let { fase } = estado; let repeticion = false;
  if (inclinacion > UMBRAL_BISAGRA) { fase = 'ABAJO'; } 
  else if (inclinacion < UMBRAL_BISAGRA_ARRIBA) { if (fase === 'ABAJO') repeticion = true; fase = 'ARRIBA'; }
  return resultado(estado, { fase, mensaje: null }, repeticion);
}

export function detectarEstiramientoCuello(landmarks, estado) {
  if (!esVisible(landmarks, [11, 12], UMBRAL_VISIBILIDAD)) return resultado(estado, { mensaje: 'Muestra rostro y hombros' }, false);
  const anchoHombros = Math.max(Math.abs(landmarks[12].x - landmarks[11].x), 0.0001);
  let inclinacion = 0;
  if (esVisible(landmarks, [7, 8], UMBRAL_VISIBILIDAD)) { inclinacion = (landmarks[7].y - landmarks[8].y) / anchoHombros; }
  let { ladoActivo } = estado; let repeticion = false;
  if (inclinacion < -UMBRAL_CUELLO_INCLINACION) { if (ladoActivo !== 'IZQ') { repeticion = ladoActivo === 'DER'; ladoActivo = 'IZQ'; } } 
  else if (inclinacion > UMBRAL_CUELLO_INCLINACION) { if (ladoActivo !== 'DER') { repeticion = ladoActivo === 'IZQ'; ladoActivo = 'DER'; } } 
  else if (Math.abs(inclinacion) < UMBRAL_CUELLO_NEUTRO) { ladoActivo = null; }
  return resultado(estado, { ladoActivo, mensaje: null }, repeticion);
}

export function detectarEstiramientoMuneca(landmarks, estado) {
  return resultado(estado, { fase: 'ARRIBA' }, false); // Solo de tiempo
}

export function detectarLegRaise(landmarks, estado) {
  if (!esVisible(landmarks, [23, 24, 27, 28], UMBRAL_VISIBILIDAD)) return resultado(estado, { mensaje: 'Acuéstate de perfil' }, false);
  const caderaY = (landmarks[23].y + landmarks[24].y) / 2;
  const tobilloY = (landmarks[27].y + landmarks[28].y) / 2;
  const subida = tobilloY < caderaY - 0.15;
  let { fase } = estado; let repeticion = false;
  if (subida) { if (fase === 'ABAJO') { fase = 'ARRIBA'; repeticion = true; } } else { fase = 'ABAJO'; }
  return resultado(estado, { fase, mensaje: null }, repeticion);
}

export const DETECTORES = {
  WALL_SIT: detectarWallSit,
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
  ROTACION_TORSO: detectarRotacionTorso,
  GOLPE_DIRECTO: detectarGolpeDirecto,
  RODILLAZO: detectarRodillazo,
  PATADA_FRONTAL: detectarPatadaFrontal,
  PRESS_HOMBRO: detectarPressHombro,
  REMO: detectarRemo,
  PESO_MUERTO: detectarPesoMuerto,
  GOOD_MORNING: detectarPesoMuerto,
  CALF_RAISE: detectarCalfRaise,
  SHOULDER_TAPS: detectarShoulderTaps,
  LATERAL_LEG_RAISE: detectarLateralLegRaise,
  LEG_RAISE: detectarLegRaise,
  ESTIRAMIENTO_CUELLO: detectarEstiramientoCuello,
  ESTIRAMIENTO_MUNECA: detectarEstiramientoMuneca,
  POSTURA_SILLA: detectarPosturaSilla,
  DEAD_BUG: detectarDeadBug,
};

const DETECTORES_POR_NOMBRE = {
  sentadilla: detectarSentadilla,
  flexion: detectarFlexion,
  jumping_jack: detectarJumpingJack,
  zancada: detectarZancada,
  rodillas_altas: detectarRodillasAltas,
  puente_gluteo: detectarPuenteGluteo,
  abdominal: detectarAbdominal,
  mountain_climber: detectarMountainClimber,
  rotacion_torso: detectarRotacionTorso,
  press_hombro: detectarPressHombro,
  remo: detectarRemo,
  peso_muerto: detectarPesoMuerto,
  good_morning: detectarPesoMuerto,
  calf_raise: detectarCalfRaise,
  shoulder_taps: detectarShoulderTaps,
  lateral_leg_raise: detectarLateralLegRaise,
  leg_raise: detectarLegRaise,
  golpe_directo: detectarGolpeDirecto,
  rodillazo: detectarRodillazo,
  patada_frontal: detectarPatadaFrontal,
  estiramiento_cuello: detectarEstiramientoCuello,
  estiramiento_muneca: detectarEstiramientoMuneca,
  postura_silla: detectarPosturaSilla,
};

export function obtenerDetector(ejercicioId) {
  const nombre = EJERCICIOS_CATALOGO[ejercicioId]?.detector;
  return DETECTORES[ejercicioId] || DETECTORES_POR_NOMBRE[nombre] || null;
}
