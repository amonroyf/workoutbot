export const CLAVE_CAMARA = 'workoutbot:camara:v1';

function almacenamientoPorDefecto() {
  try {
    return globalThis.localStorage;
  } catch {
    return null;
  }
}

export function leerCamaraHabilitada(storage = almacenamientoPorDefecto()) {
  try {
    return storage?.getItem(CLAVE_CAMARA) !== '0';
  } catch {
    return true;
  }
}

export function guardarCamaraHabilitada(valor, storage = almacenamientoPorDefecto()) {
  try {
    storage?.setItem(CLAVE_CAMARA, valor ? '1' : '0');
  } catch {
    return Boolean(valor);
  }
  return Boolean(valor);
}
