// Personalidad del entrenador de voz: el tono y la velocidad reaccionan al
// esfuerzo del usuario (racha, repeticiones perfectas y momento del bloque).

export const UMBRAL_COMBO_FUEGO = 5;

export const RATE_MAX = 1.35;
export const PITCH_MAX = 1.5;

export const RATE_FUEGO = 0.05;
export const PITCH_FUEGO = 0.1;
export const RATE_CLIMAX = 0.08;
export const PITCH_CLIMAX = 0.15;

export function esEnFuego(combo) {
  return Number.isFinite(combo) && combo >= UMBRAL_COMBO_FUEGO;
}

function limitar(valor, maximo) {
  return Math.min(maximo, Math.max(0.1, valor));
}

/**
 * Calcula los parámetros de síntesis de voz según el estado del usuario.
 * - combo >= UMBRAL_COMBO_FUEGO: modo "On Fire" (más rápido y agudo).
 * - climax: el instructor levanta la voz en los últimos segundos.
 */
export function ajustarVoz(
  { rate = 1, pitch = 1, combo = 0, climax = false } = {}
) {
  const enFuego = esEnFuego(combo);

  let rateFinal = rate;
  let pitchFinal = pitch;

  if (enFuego) {
    rateFinal += RATE_FUEGO;
    pitchFinal += PITCH_FUEGO;
  }

  if (climax) {
    rateFinal += RATE_CLIMAX;
    pitchFinal += PITCH_CLIMAX;
  }

  return {
    enFuego,
    rate: limitar(rateFinal, RATE_MAX),
    pitch: limitar(pitchFinal, PITCH_MAX),
  };
}

/**
 * Decide si una repetición merece el grito de euforia: solo cuando la
 * forma es perfecta (score >= umbral) y ya hay racha.
 */
export function mereceEuforia({ score, combo, umbralPerfecto }) {
  if (score == null || !Number.isFinite(score)) return false;
  if (score < umbralPerfecto) return false;
  return esEnFuego(combo);
}
