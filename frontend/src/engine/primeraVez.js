export const CLAVE_GUIA = 'workoutbot:guia:v1';

export const PASOS_PRIMERA_VEZ = Object.freeze([
  Object.freeze({
    icono: 'camara',
    titulo: 'Deja la cámara a la vista',
    texto: 'Te vemos para contar las repeticiones y avisarte si la postura se daña.',
  }),
  Object.freeze({
    icono: 'rayo',
    titulo: 'Elige tu clase',
    texto: 'Arranca por una corta. La de 45 minutos es la clase completa.',
  }),
  Object.freeze({
    icono: 'voz',
    titulo: 'Sigue al entrenador',
    texto: 'Te guía con voz: qué sigue, en qué ronda vas y cuándo descansas.',
  }),
]);

function almacenamientoPorDefecto() {
  try {
    return globalThis.localStorage;
  } catch {
    return null;
  }
}

export function esPrimeraVez(resumen) {
  if (!resumen) return true;
  const racha = Number(resumen.racha) || 0;
  return racha === 0 && !resumen.ultima;
}

export function guiaVista(storage = almacenamientoPorDefecto()) {
  if (!storage) return false;
  try {
    return storage.getItem(CLAVE_GUIA) === '1';
  } catch {
    return false;
  }
}

export function marcarGuiaVista(storage = almacenamientoPorDefecto()) {
  if (!storage) return false;
  try {
    storage.setItem(CLAVE_GUIA, '1');
  } catch {
    return false;
  }
  return true;
}
