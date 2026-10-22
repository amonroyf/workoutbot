// Minijuego somatosensorial: un techo virtual cae y el usuario lo sostiene
// con la postura (scoreForma del detector). Si la forma baja, el techo
// desciende hasta aplastar al stickman. Lógica pura, sin canvas, para
// probarla con tests; el componente MinijuegoTecho solo dibuja.

export const UMBRAL_SOSTEN = 65; // score mínimo para sostener el techo
export const SUAVIZADO_SCORE = 0.25; // peso del score nuevo (anti-parpadeo)
export const VELOCIDAD_CAIDA = 0.045; // unidades de altura por segundo sin soporte
export const ALTURA_TECHO_INICIO = 0.12; // posición inicial del techo
export const GROSOR_TECHO = 0.06; // grosor del techo en la misma escala
export const CABEZA_Y = 0.4; // tope de la cabeza del stickman
export const TIEMPO_APLASTADO_MS = 1400;

export function crearJuegoTecho() {
  return {
    scoreSuavizado: null,
    altura: ALTURA_TECHO_INICIO,
    aplastado: false,
    inicioMs: null,
    ultimoMs: null,
    sobrevividoMs: 0,
    mejorMs: 0,
    intentos: 1,
  };
}

export function actualizarJuegoTecho(estado, scoreForma, ahoraMs) {
  if (estado.aplastado) {
    return { estado, aplasto: false };
  }

  const inicioMs = estado.inicioMs == null ? ahoraMs : estado.inicioMs;
  const dtMs =
    estado.ultimoMs == null ? 0 : Math.min(100, Math.max(0, ahoraMs - estado.ultimoMs));
  const previo = estado.scoreSuavizado == null ? scoreForma : estado.scoreSuavizado;
  const score =
    scoreForma == null ? null : scoreForma * SUAVIZADO_SCORE + previo * (1 - SUAVIZADO_SCORE);
  const sostiene = score != null && score >= UMBRAL_SOSTEN;

  const altura = sostiene
    ? estado.altura
    : Math.min(CABEZA_Y, estado.altura + (VELOCIDAD_CAIDA * dtMs) / 1000);
  const sobrevividoMs = estado.sobrevividoMs + dtMs;
  const aplasto = altura + GROSOR_TECHO >= CABEZA_Y;

  return {
    estado: {
      ...estado,
      scoreSuavizado: score,
      altura,
      aplastado: aplasto || estado.aplastado,
      inicioMs,
      ultimoMs: ahoraMs,
      sobrevividoMs,
      mejorMs: Math.max(estado.mejorMs, sobrevividoMs),
    },
    aplasto,
  };
}

export function reintentarTecho(estado, ahoraMs) {
  return {
    ...estado,
    altura: ALTURA_TECHO_INICIO,
    aplastado: false,
    inicioMs: ahoraMs,
    ultimoMs: ahoraMs,
    sobrevividoMs: 0,
    intentos: estado.intentos + 1,
  };
}

export function segundosSobrevividos(estado) {
  return Math.floor(estado.sobrevividoMs / 1000);
}
