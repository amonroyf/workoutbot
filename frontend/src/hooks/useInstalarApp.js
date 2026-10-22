import { useCallback, useEffect, useState } from 'react';
import { track } from '../engine/analytics';

const CLAVE_DESCARTADA = 'workoutbot:instalar:descartada';

function enModoInstalado() {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

function esIos() {
  if (typeof navigator === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent || '');
}

function leerDescartada() {
  try {
    return globalThis.localStorage?.getItem(CLAVE_DESCARTADA) === '1';
  } catch {
    return false;
  }
}

export function useInstalarApp() {
  const [evento, setEvento] = useState(null);
  const [instalada, setInstalada] = useState(enModoInstalado);
  const [descartada, setDescartada] = useState(leerDescartada);

  useEffect(() => {
    const alPoderInstalar = (event) => {
      event.preventDefault();
      setEvento(event);
    };
    const alInstalar = () => {
      setInstalada(true);
      setEvento(null);
      track('app_installed');
    };
    const media = window.matchMedia?.('(display-mode: standalone)');
    const alCambiarModo = () => setInstalada(enModoInstalado());

    window.addEventListener('beforeinstallprompt', alPoderInstalar);
    window.addEventListener('appinstalled', alInstalar);
    media?.addEventListener?.('change', alCambiarModo);

    return () => {
      window.removeEventListener('beforeinstallprompt', alPoderInstalar);
      window.removeEventListener('appinstalled', alInstalar);
      media?.removeEventListener?.('change', alCambiarModo);
    };
  }, []);

  const instalar = useCallback(async () => {
    if (!evento) return false;
    track('install_prompt', { plataforma: esIos() ? 'ios' : 'android' });
    try {
      await evento.prompt();
      const eleccion = await evento.userChoice;
      track('install_choice', { resultado: eleccion.outcome });
      return eleccion.outcome === 'accepted';
    } catch {
      return false;
    } finally {
      setEvento(null);
    }
  }, [evento]);

  const descartar = useCallback(() => {
    setDescartada(true);
    try {
      globalThis.localStorage?.setItem(CLAVE_DESCARTADA, '1');
    } catch {
      // Sin almacenamiento, solo se oculta durante esta sesión.
    }
  }, []);

  return {
    puedeInstalar: Boolean(evento) && !instalada && !descartada,
    instalada,
    esIos: esIos(),
    instalar,
    descartar,
  };
}
