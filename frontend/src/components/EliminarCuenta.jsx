import React, { useState } from 'react';
import {
  GoogleAuthProvider,
  reauthenticateWithPopup,
  signOut,
} from 'firebase/auth';
import { auth } from '../firebase';
import { track } from '../engine/analytics';
import { useWorkoutStore } from '../store/workoutStore';
import Icono from './Icono';

const PALABRA = 'ELIMINAR';

function limpiarDatosLocales() {
  try {
    const claves = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const clave = localStorage.key(i);
      if (clave?.startsWith('workoutbot:')) claves.push(clave);
    }
    claves.forEach((clave) => localStorage.removeItem(clave));
  } catch {
    // Sin localStorage la cuenta igual se elimina en el servidor.
  }
}

function mensajeDeError(error) {
  if (error?.code === 'auth/popup-closed-by-user') {
    return 'Cerraste la ventana de Google. Intenta de nuevo.';
  }
  if (error?.code === 'auth/popup-blocked') {
    return 'El navegador bloqueó la ventana de Google. Habilita las ventanas emergentes para este sitio.';
  }
  if (error?.code === 'auth/network-request-failed') {
    return 'No hay conexión. Revisa tu internet e intenta de nuevo.';
  }
  if (error?.code === 'auth/requires-recent-login') {
    return 'Tu sesión es antigua. Vuelve a iniciar sesión con Google.';
  }
  return String(error?.message || 'No se pudo eliminar la cuenta. Intenta de nuevo.').slice(0, 140);
}

export default function EliminarCuenta({ onCerrar }) {
  const [confirmacion, setConfirmacion] = useState('');
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const puedeEliminar = confirmacion.trim().toUpperCase() === PALABRA && !enviando;

  const eliminar = async () => {
    if (!puedeEliminar) {
      setError(`Escribe ${PALABRA} para confirmar.`);
      return;
    }
    const actual = auth.currentUser;
    if (!actual) {
      setError('Tu sesión expiró. Vuelve a iniciar sesión.');
      return;
    }

    setEnviando(true);
    setError(null);
    let exito = false;
    try {
      const provider = new GoogleAuthProvider();
      await reauthenticateWithPopup(actual, provider);

      const token = await auth.currentUser.getIdToken(true);
      const res = await fetch('/api/v1/account', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        let mensaje = `HTTP ${res.status}`;
        try {
          const data = await res.json();
          if (data?.message) mensaje = data.message;
        } catch {
          // La respuesta no era JSON.
        }
        throw new Error(mensaje);
      }

      track('account_delete');
      limpiarDatosLocales();
      useWorkoutStore.getState().detenerRutina();
      exito = true;
      onCerrar();
      await signOut(auth);
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      if (!exito) setEnviando(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-tinta-950/85 p-3 sm:items-center"
      onClick={() => {
        if (!enviando) onCerrar();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Eliminar cuenta"
        className="w-full max-w-md rounded-ficha border border-error-500/30 bg-tinta-950 p-4 text-left shadow-flotante"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-error-500/15 text-error-300">
              <Icono nombre="alerta" tamano={18} />
            </span>
            <div>
              <p className="text-lg font-black text-tinta-100">Eliminar cuenta</p>
              <p className="text-[11px] text-error-300">Esta acción no se puede deshacer.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            disabled={enviando}
            aria-label="Cerrar"
            className="flex h-10 w-10 items-center justify-center rounded-boton border border-linea text-tinta-300 hover:bg-tinta-800 disabled:opacity-50"
          >
            <Icono nombre="cerrar" tamano={16} />
          </button>
        </div>

        <div className="mt-4 space-y-2 text-sm text-tinta-300">
          <p>Se borrarán de forma permanente:</p>
          <ul className="space-y-1 text-xs">
            <li className="flex gap-2">
              <Icono nombre="check" tamano={14} className="mt-0.5 shrink-0 text-error-400" />
              Tu cuenta de WorkoutBot y el acceso con Google.
            </li>
            <li className="flex gap-2">
              <Icono nombre="check" tamano={14} className="mt-0.5 shrink-0 text-error-400" />
              Tu historial, repeticiones, racha y progreso.
            </li>
            <li className="flex gap-2">
              <Icono nombre="check" tamano={14} className="mt-0.5 shrink-0 text-error-400" />
              Tu plan y preferencias guardadas en este dispositivo.
            </li>
          </ul>
          <p className="rounded-boton bg-tinta-900 p-2.5 text-[11px] text-tinta-400">
            El video de la cámara nunca se guarda ni se sube, así que no hay nada
            más que borrar.
          </p>
        </div>

        <label className="mt-4 block text-xs font-bold text-tinta-400">
          Escribe <span className="text-tinta-100">{PALABRA}</span> para confirmar
          <input
            value={confirmacion}
            onChange={(event) => {
              setConfirmacion(event.target.value);
              if (error) setError(null);
            }}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck="false"
            disabled={enviando}
            className="mt-1.5 min-h-12 w-full rounded-boton border border-linea bg-tinta-900 px-3 text-base font-black tracking-widest text-tinta-100 outline-none focus:border-error-400 disabled:opacity-60"
          />
        </label>

        {error && (
          <p role="alert" className="mt-2 text-xs font-bold text-error-300">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={eliminar}
          disabled={!puedeEliminar}
          className="mt-4 min-h-12 w-full rounded-boton bg-error-500 text-sm font-black text-white transition hover:bg-error-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {enviando ? 'Eliminando...' : 'Eliminar mi cuenta'}
        </button>
        <button
          type="button"
          onClick={onCerrar}
          disabled={enviando}
          className="mt-2 min-h-11 w-full rounded-boton text-xs font-bold text-tinta-400 hover:text-tinta-200 disabled:opacity-50"
        >
          Mejor no
        </button>
      </div>
    </div>
  );
}
