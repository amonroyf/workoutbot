import {
  calculateAngle,
  esVisible,
  normalizarLandmarks,
} from './angles';

export const UMBRAL_SCORE_PERFECTO = 85;

const INDICES = Object.freeze({
  sentadilla: [11, 12, 23, 24, 25, 26, 27, 28],
  sumo: [11, 12, 23, 24, 25, 26, 27, 28],
  flexion: [11, 12, 13, 14, 15, 16, 23, 24, 27, 28],
  plancha: [11, 12, 23, 24, 27, 28],
  pared: [11, 12, 23, 24, 25, 26, 27, 28],
});

const TIPOS = Object.freeze({
  SENTADILLAS: 'sentadilla',
  SENTADILLA_SUMO: 'sumo',
  FLEXIONES: 'flexion',
  FLEXION_DIAMANTE: 'flexion',
  PLANCHA: 'plancha',
  PLANCHA_LATERAL: 'plancha',
  WALL_SIT: 'pared',
});

function puntoMedio(a, b) {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
  };
}

function vector(a, b) {
  return { x: b.x - a.x, y: b.y - a.y };
}

function promedio(valores) {
  return valores.reduce((total, valor) => total + valor, 0) / valores.length;
}

function limitar(valor, minimo = 0, maximo = 1) {
  return Math.min(maximo, Math.max(minimo, valor));
}

export function similitudCoseno(a, b) {
  const largoA = Math.hypot(a.x, a.y);
  const largoB = Math.hypot(b.x, b.y);
  if (largoA < 1e-6 || largoB < 1e-6) return 0;
  return (a.x * b.x + a.y * b.y) / (largoA * largoB);
}

function scoreParalelo(a, b) {
  return limitar(similitudCoseno(a, b));
}

function scoreAngulo(angulo, ideal, tolerancia) {
  return limitar(1 - Math.abs(angulo - ideal) / tolerancia);
}

function porcentaje(score) {
  return Math.round(limitar(score) * 100);
}

function scoreSentadilla(n, sumo = false) {
  const hombro = puntoMedio(n[11], n[12]);
  const cadera = puntoMedio(n[23], n[24]);
  const torso = vector(hombro, cadera);
  const musloI = vector(n[23], n[25]);
  const musloD = vector(n[24], n[26]);
  const piernaI = vector(n[25], n[27]);
  const piernaD = vector(n[26], n[28]);

  const profundidad = scoreAngulo(
    promedio([
      calculateAngle(n[23], n[25], n[27]),
      calculateAngle(n[24], n[26], n[28]),
    ]),
    95,
    55
  );
  const torsoArriba = scoreParalelo(torso, { x: 0, y: 1 });
  const simetriaPiernas = scoreParalelo(piernaI, piernaD);

  if (sumo) {
    return porcentaje(0.5 * profundidad + 0.3 * torsoArriba + 0.2 * simetriaPiernas);
  }

  const simetriaMuslos = scoreParalelo(musloI, musloD);
  return porcentaje(
    0.45 * profundidad +
      0.25 * torsoArriba +
      0.2 * simetriaMuslos +
      0.1 * simetriaPiernas
  );
}

function scoreFlexion(n) {
  const hombro = puntoMedio(n[11], n[12]);
  const cadera = puntoMedio(n[23], n[24]);
  const tobillo = puntoMedio(n[27], n[28]);
  const torso = vector(hombro, cadera);
  const pierna = vector(cadera, tobillo);

  const codo = scoreAngulo(
    promedio([
      calculateAngle(n[11], n[13], n[15]),
      calculateAngle(n[12], n[14], n[16]),
    ]),
    90,
    60
  );
  const linea = scoreParalelo(torso, pierna);
  const horizontal = limitar(Math.abs(similitudCoseno(torso, { x: 1, y: 0 })));
  const simetriaBrazo = scoreParalelo(
    vector(n[11], n[13]),
    vector(n[12], n[14])
  );
  const simetriaAntebrazo = scoreParalelo(
    vector(n[13], n[15]),
    vector(n[14], n[16])
  );

  return porcentaje(
    0.35 * codo +
      0.25 * linea +
      0.2 * horizontal +
      0.1 * simetriaBrazo +
      0.1 * simetriaAntebrazo
  );
}

function scorePlancha(n) {
  const hombro = puntoMedio(n[11], n[12]);
  const cadera = puntoMedio(n[23], n[24]);
  const tobillo = puntoMedio(n[27], n[28]);
  const torso = vector(hombro, cadera);
  const pierna = vector(cadera, tobillo);

  const linea = scoreParalelo(torso, pierna);
  const horizontal = limitar(Math.abs(similitudCoseno(torso, { x: 1, y: 0 })));
  const simetria = scoreParalelo(
    vector(n[11], n[23]),
    vector(n[12], n[24])
  );

  return porcentaje(0.55 * linea + 0.3 * horizontal + 0.15 * simetria);
}

// Wall sit: rodillas a 90 grados, torso vertical y piernas simétricas.
function scorePared(n) {
  const hombro = puntoMedio(n[11], n[12]);
  const cadera = puntoMedio(n[23], n[24]);
  const torso = vector(hombro, cadera);

  const rodillas = scoreAngulo(
    promedio([
      calculateAngle(n[23], n[25], n[27]),
      calculateAngle(n[24], n[26], n[28]),
    ]),
    90,
    30
  );
  const torsoVertical = scoreParalelo(torso, { x: 0, y: 1 });
  const simetria = scoreParalelo(vector(n[23], n[25]), vector(n[24], n[26]));

  return porcentaje(0.5 * rodillas + 0.35 * torsoVertical + 0.15 * simetria);
}

export function calcularScoreForma(ejercicio, landmarks) {
  const tipo = TIPOS[ejercicio];
  if (!tipo) return null;
  if (!Array.isArray(landmarks) || !esVisible(landmarks, INDICES[tipo])) {
    return null;
  }

  const normalizados = normalizarLandmarks(landmarks);
  if (!normalizados) return null;

  if (tipo === 'sentadilla') return scoreSentadilla(normalizados);
  if (tipo === 'sumo') return scoreSentadilla(normalizados, true);
  if (tipo === 'flexion') return scoreFlexion(normalizados);
  if (tipo === 'pared') return scorePared(normalizados);
  return scorePlancha(normalizados);
}
