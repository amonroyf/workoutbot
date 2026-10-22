import {
  getAnalytics,
  isSupported,
  logEvent,
  setAnalyticsCollectionEnabled,
} from 'firebase/analytics';
import app from '../firebase';

const CLAVE_CONSENTIMIENTO = 'workoutbot:analytics:consent';
const MEDICION_ID = import.meta.env.VITE_FIREBASE_MEASUREMENT_ID;

let analytics = null;
let inicializando = null;
let consentimiento = leerConsentimientoGuardado();

function leerConsentimientoGuardado() {
  try {
    return globalThis.localStorage?.getItem(CLAVE_CONSENTIMIENTO) || null;
  } catch {
    return null;
  }
}

export function leerConsentimiento() {
  return consentimiento;
}

export function tieneConsentimiento() {
  return consentimiento === 'si';
}

function borrarCookiesDeAnalitica() {
  if (typeof document === 'undefined') return;
  const nombres = document.cookie
    .split(';')
    .map((cookie) => cookie.split('=')[0]?.trim())
    .filter((nombre) => nombre === '_ga' || nombre?.startsWith('_ga_'));

  for (const nombre of nombres) {
    document.cookie = `${nombre}=; Max-Age=0; path=/; SameSite=Lax`;
    document.cookie = `${nombre}=; Max-Age=0; path=/; domain=.${location.hostname}; SameSite=Lax`;
  }
}

export function guardarConsentimiento(permitido) {
  consentimiento = permitido ? 'si' : 'no';
  try {
    globalThis.localStorage?.setItem(CLAVE_CONSENTIMIENTO, consentimiento);
  } catch {
    // Si el almacenamiento no está disponible, la decisión dura solo esta sesión.
  }

  if (!permitido) {
    if (analytics) setAnalyticsCollectionEnabled(analytics, false);
    borrarCookiesDeAnalitica();
    return;
  }

  iniciarAnalytics().then((instancia) => {
    if (!instancia) return;
    setAnalyticsCollectionEnabled(instancia, true);
    logEvent(instancia, 'consent_update', { granted: true });
  });
}

export function iniciarAnalytics() {
  if (!tieneConsentimiento() || !MEDICION_ID) return Promise.resolve(null);
  if (analytics) return Promise.resolve(analytics);
  if (inicializando) return inicializando;

  inicializando = (async () => {
    try {
      if (await isSupported()) {
        analytics = getAnalytics(app);
      }
    } catch (err) {
      console.warn('No se pudo iniciar la analítica:', err);
    }
    return analytics;
  })();

  return inicializando;
}

export function track(evento, parametros = {}) {
  if (!tieneConsentimiento()) return;
  if (import.meta.env.DEV) console.debug('[analytics]', evento, parametros);

  iniciarAnalytics()
    .then((instancia) => {
      if (instancia) logEvent(instancia, evento, parametros);
    })
    .catch(() => {
      // La analítica nunca debe romper la experiencia.
    });
}
