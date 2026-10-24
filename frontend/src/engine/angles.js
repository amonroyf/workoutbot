export function calculateAngle(a, b, c) {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  if (angle > 180.0) {
    angle = 360.0 - angle;
  }
  return angle;
}

export function distancia(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function distanciaHorizontal(a, b) {
  return Math.abs(a.x - b.x);
}

export function esVisible(landmarks, indices, umbral = 0.5) {
  return indices.every(
    (i) => landmarks[i] && (landmarks[i].visibility ?? 1) > umbral
  );
}

export function detectarOrientacion(landmarks) {
  // Distancia horizontal entre hombros (11 izquierdo, 12 derecho):
  // amplia = de frente; casi nula (un hombro tapa al otro) = de perfil.
  if (!landmarks || !landmarks[11] || !landmarks[12]) return null;
  const separacionHombros = distanciaHorizontal(landmarks[11], landmarks[12]);
  return separacionHombros > 0.12 ? 'frontal' : 'perfil';
}

export function normalizarLandmarks(landmarks) {
  if (!Array.isArray(landmarks) || landmarks.length < 25) return null;

  const hombro = {
    x: (landmarks[11].x + landmarks[12].x) / 2,
    y: (landmarks[11].y + landmarks[12].y) / 2,
    z: ((landmarks[11].z ?? 0) + (landmarks[12].z ?? 0)) / 2,
  };
  const cadera = {
    x: (landmarks[23].x + landmarks[24].x) / 2,
    y: (landmarks[23].y + landmarks[24].y) / 2,
    z: ((landmarks[23].z ?? 0) + (landmarks[24].z ?? 0)) / 2,
  };
  const largo = distancia(hombro, cadera);
  if (!Number.isFinite(largo) || largo < 1e-6) return null;

  return landmarks.map((punto) => ({
    ...punto,
    x: (punto.x - cadera.x) / largo,
    y: (punto.y - cadera.y) / largo,
    z: ((punto.z ?? 0) - cadera.z) / largo,
  }));
}
