import React, { useState } from 'react';
import { signInWithPopup, signInWithRedirect } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import Icono from './Icono';
import Marca from './Marca';
import { track } from '../engine/analytics';

const FALLBACK_POPUP = new Set([
  'auth/popup-blocked',
  'auth/operation-not-supported-in-this-environment',
]);

function esWebview() {
  const ua = navigator.userAgent || '';
  return /FBAN|FBAV|Instagram|WhatsApp|Line\/|MicroMessenger|; wv\)/i.test(ua);
}

function mensajeDeError(codigo) {
  switch (codigo) {
    case 'auth/popup-blocked':
      return 'Tu navegador bloqueó la ventana de Google. Intentémoslo de otra forma.';
    case 'auth/popup-closed-by-user':
      return 'Cerraste la ventana de Google. Puedes intentarlo de nuevo.';
    case 'auth/unauthorized-domain':
      return 'Este dominio todavía no está autorizado para iniciar sesión.';
    case 'auth/network-request-failed':
      return 'No hay conexión con Google. Revisa tu internet e inténtalo otra vez.';
    default:
      return 'No pudimos iniciar sesión. Revisa tu conexión e inténtalo de nuevo.';
  }
}

export default function LoginScreen() {
  const [error, setError] = useState(null);
  const [copiado, setCopiado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const webview = esWebview();

  const copiarLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiado(true);
    } catch {
      setError('No pudimos copiar el link. Copia la dirección desde el menú del navegador.');
    }
  };

  const handleLogin = async () => {
    setError(null);
    setCargando(true);
    track('login_click', { metodo: 'google' });

    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      if (FALLBACK_POPUP.has(err.code)) {
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch {
          // Si el redirect tampoco funciona, mostramos una salida clara.
        }
      }
      setError(mensajeDeError(err.code));
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="absolute inset-0 z-10 overflow-y-auto bg-fondo text-tinta-100">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_50%_0%,rgba(34,197,94,0.16),transparent_70%)]" />

      <main className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-[calc(1.5rem+env(safe-area-inset-top))]">
        <header className="flex items-center justify-between">
          <Marca />
          <span className="rounded-chip border border-linea px-2.5 py-1 text-[10px] font-bold text-tinta-400">
            Gratis por ahora
          </span>
        </header>

        <div className="flex flex-1 flex-col justify-center py-8">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-marca-400">
            Entrena en casa
          </p>
          <h1 className="mt-2 text-4xl font-black leading-[1.05]">
            Tu entrenador
            <br />
            <span className="text-marca-400">en la cámara.</span>
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-tinta-300">
            Clases cortas, voz que te guía y conteo de repeticiones. Sin equipo.
            Sin gimnasio. Sin videos guardados.
          </p>

          <ul className="mt-5 space-y-2 text-sm text-tinta-300">
            <li className="flex items-center gap-2">
              <Icono nombre="reloj" tamano={16} className="text-marca-400" />
              Clases de 2 a 15 minutos
            </li>
            <li className="flex items-center gap-2">
              <Icono nombre="camara" tamano={16} className="text-marca-400" />
              La cámara procesa todo en tu dispositivo
            </li>
            <li className="flex items-center gap-2">
              <Icono nombre="check" tamano={16} className="text-marca-400" />
              Tu progreso queda guardado en tu cuenta
            </li>
          </ul>

          {webview && (
            <div className="mt-5 rounded-panel border border-aviso-400/40 bg-aviso-500/10 p-3 text-left">
              <p className="text-xs font-bold text-aviso-300">
                Estás dentro de una app (WhatsApp, Instagram o similar)
              </p>
              <p className="mt-1 text-xs leading-relaxed text-tinta-300">
                Google puede bloquear el inicio de sesión aquí. Toca los tres
                puntos del navegador y elige <strong>Abrir en Chrome</strong> o{' '}
                <strong>Abrir en Safari</strong>.
              </p>
              <button
                type="button"
                onClick={copiarLink}
                className="mt-2 min-h-9 rounded-boton border border-linea px-3 text-[11px] font-bold text-tinta-200 hover:bg-tinta-900"
              >
                {copiado ? 'Link copiado' : 'Copiar link'}
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleLogin}
            disabled={cargando}
            className="mt-6 flex min-h-14 w-full items-center justify-center gap-3 rounded-ficha bg-tinta-100 px-8 text-base font-bold text-tinta-950 transition hover:bg-tinta-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-wait disabled:opacity-70"
          >
            {cargando ? (
              'Conectando con Google...'
            ) : (
              <>
                <svg className="h-6 w-6" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continuar con Google
              </>
            )}
          </button>

          {error ? (
            <p className="mt-4 flex items-start gap-2 text-sm text-error-300" role="alert">
              <Icono nombre="alerta" tamano={16} className="mt-0.5 shrink-0" />
              {error}
            </p>
          ) : (
            <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[11px] text-tinta-500">
              <Icono nombre="info" tamano={13} />
              Solo usamos la cámara para la pose. Tu video no se guarda.
            </p>
          )}
        </div>

        <footer className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-tinta-500">
          <a className="hover:text-tinta-200" href="/privacidad">
            Privacidad
          </a>
          <span aria-hidden="true">·</span>
          <a className="hover:text-tinta-200" href="/terminos">
            Términos
          </a>
          <span aria-hidden="true">·</span>
          <span>Hecho en Colombia</span>
        </footer>
      </main>
    </div>
  );
}
