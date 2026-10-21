function documentoActual() {
  return typeof document !== 'undefined' ? document : null;
}

export function esPantallaCompleta(doc = documentoActual()) {
  if (!doc) return false;
  return Boolean(doc.fullscreenElement || doc.webkitFullscreenElement);
}

export function puedeEntrarEnPantallaCompleta(doc = documentoActual()) {
  if (!doc) return false;
  const elemento = doc.documentElement;
  return Boolean(elemento?.requestFullscreen || elemento?.webkitRequestFullscreen);
}

export async function solicitarPantallaCompleta(doc = documentoActual()) {
  if (!doc) return false;
  const elemento = doc.documentElement;
  const pedir = elemento?.requestFullscreen || elemento?.webkitRequestFullscreen;
  if (!pedir) return false;

  try {
    const resultado = pedir.call(elemento);
    if (resultado && typeof resultado.catch === 'function') await resultado;
    return true;
  } catch (error) {
    console.warn('No se pudo activar la pantalla completa:', error);
    return false;
  }
}

export function esIos(nav = typeof navigator !== 'undefined' ? navigator : null) {
  if (!nav) return false;
  const agente = nav.userAgent || '';
  return /iPad|iPhone|iPod/.test(agente) || (nav.platform === 'MacIntel' && nav.maxTouchPoints > 1);
}

export async function salirDePantallaCompleta(doc = documentoActual()) {
  if (!doc || !esPantallaCompleta(doc)) return false;
  const salir = doc.exitFullscreen || doc.webkitExitFullscreen;
  if (!salir) return false;

  try {
    const resultado = salir.call(doc);
    if (resultado && typeof resultado.catch === 'function') await resultado;
    return true;
  } catch (error) {
    console.warn('No se pudo salir de la pantalla completa:', error);
    return false;
  }
}
