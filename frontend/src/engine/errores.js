import { track } from './analytics';

const MAX_CARACTERES = 180;
const MAX_RECIENTES = 20;
const recientes = new Map();

function resumir(valor) {
  if (valor == null) return '';
  const texto = String(valor)
    .replace(/\s+/g, ' ')
    .replace(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi, '[email]')
    .replace(/[A-Za-z0-9_-]{32,}/g, '[dato]')
    .trim();
  return texto.length > MAX_CARACTERES
    ? `${texto.slice(0, MAX_CARACTERES)}…`
    : texto;
}

function esDeExtension(origen) {
  return /^(chrome|moz|safari-web)-extension:\/\//i.test(origen || '');
}

function registrar(tipo, mensaje, origen = '') {
  const clave = `${tipo}:${mensaje}:${origen}`;
  const ahora = Date.now();
  const anterior = recientes.get(clave);

  if (anterior && ahora - anterior < 10000) return;
  if (recientes.size >= MAX_RECIENTES) {
    recientes.delete(recientes.keys().next().value);
  }
  recientes.set(clave, ahora);

  track('app_error', {
    tipo,
    mensaje: resumir(mensaje),
    origen: resumir(origen),
  });
}

export function instalarCapturaErrores() {
  if (typeof window === 'undefined') return;
  if (window.__workoutbotErroresInstalados) return;
  window.__workoutbotErroresInstalados = true;

  window.addEventListener('error', (event) => {
    if (!event.message) return;
    if (esDeExtension(event.filename)) return;
    registrar('javascript', event.message, event.filename);
  });

  window.addEventListener('unhandledrejection', (event) => {
    const razon = event.reason;
    registrar('promesa', razon?.message || razon || 'Promesa rechazada sin detalle');
  });
}
