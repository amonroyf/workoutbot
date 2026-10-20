export const MODELOS_POSE = Object.freeze({
  lite: Object.freeze({
    id: 'lite',
    url: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
  }),
  full: Object.freeze({
    id: 'full',
    url: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task',
  }),
  heavy: Object.freeze({
    id: 'heavy',
    url: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/1/pose_landmarker_heavy.task',
  }),
});

const RESPALDO = Object.freeze({
  heavy: ['heavy', 'full', 'lite'],
  full: ['full', 'lite'],
  lite: ['lite'],
});

export function normalizarModelo(modelo) {
  const id = String(modelo || '').toLowerCase();
  return MODELOS_POSE[id] ? id : null;
}

export function modelosParaIntentar(modelo) {
  return [...(RESPALDO[normalizarModelo(modelo)] || RESPALDO.lite)];
}

export function detectarDispositivo() {
  if (typeof navigator === 'undefined') {
    return { movil: false, hardwareConcurrency: 0, deviceMemory: 0, override: null };
  }

  return {
    movil: /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || ''),
    hardwareConcurrency: navigator.hardwareConcurrency || 0,
    deviceMemory: navigator.deviceMemory || 0,
    override: leerOverride(),
  };
}

export function elegirModeloPose(dispositivo = detectarDispositivo()) {
  const override = normalizarModelo(dispositivo?.override);
  if (override) return override;

  const nucleos = Number(dispositivo?.hardwareConcurrency) || 0;
  const memoria = Number(dispositivo?.deviceMemory) || 0;
  const movil = Boolean(dispositivo?.movil);

  if (movil) {
    if (nucleos >= 8 && memoria >= 8) return 'full';
    return 'lite';
  }

  if (nucleos >= 8 && (memoria === 0 || memoria >= 8)) return 'heavy';
  if (nucleos >= 4) return 'full';
  return 'lite';
}

function leerOverride() {
  try {
    const params = new URLSearchParams(globalThis.location?.search || '');
    const desdeUrl = params.get('pose');
    if (desdeUrl) return desdeUrl;
    return globalThis.localStorage?.getItem('workoutbot:pose-model') || null;
  } catch {
    return null;
  }
}
