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

export function esVisible(landmarks, indices, umbral = 0.5) {
  return indices.every(
    (i) => landmarks[i] && (landmarks[i].visibility ?? 1) > umbral
  );
}
