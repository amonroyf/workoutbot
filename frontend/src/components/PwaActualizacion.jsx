import React, { useEffect, useRef } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import Icono from './Icono';
import { track } from '../engine/analytics';

export default function PwaActualizacion() {
  const intervaloRef = useRef(null);
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registro) {
      if (!registro) return;
      clearInterval(intervaloRef.current);
      intervaloRef.current = setInterval(() => {
        registro.update().catch(() => {});
      }, 60 * 60 * 1000);
    },
  });

  useEffect(() => () => clearInterval(intervaloRef.current), []);

  useEffect(() => {
    if (needRefresh) track('pwa_update_available');
  }, [needRefresh]);

  useEffect(() => {
    if (!offlineReady) return undefined;
    const id = setTimeout(() => setOfflineReady(false), 5000);
    return () => clearTimeout(id);
  }, [offlineReady, setOfflineReady]);

  if (!needRefresh && !offlineReady) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[70] px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
      aria-live="polite"
    >
      <div className="pointer-events-auto mx-auto w-full max-w-md rounded-ficha border border-linea bg-tinta-900 p-3 text-left shadow-flotante">
        {needRefresh ? (
          <div className="flex items-start gap-2">
            <Icono nombre="rayo" tamano={18} className="mt-0.5 shrink-0 text-marca-400" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black text-tinta-100">Hay una versión nueva</p>
              <p className="mt-0.5 text-xs text-tinta-300">
                Actualiza para seguir entrenando con la última versión.
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    track('pwa_update_applied');
                    updateServiceWorker(true);
                  }}
                  className="min-h-10 flex-1 rounded-boton bg-marca-500 px-3 text-xs font-black text-black transition hover:bg-marca-400"
                >
                  Actualizar
                </button>
                <button
                  type="button"
                  onClick={() => setNeedRefresh(false)}
                  className="min-h-10 rounded-boton border border-linea px-3 text-xs font-bold text-tinta-300 transition hover:bg-tinta-800"
                >
                  Después
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Icono nombre="check" tamano={18} className="shrink-0 text-marca-400" />
            <p className="flex-1 text-xs font-bold text-tinta-200">
              Lista para abrir sin conexión.
            </p>
            <button
              type="button"
              onClick={() => setOfflineReady(false)}
              aria-label="Cerrar"
              className="flex h-9 w-9 items-center justify-center rounded-boton text-tinta-400 hover:bg-tinta-800"
            >
              <Icono nombre="cerrar" tamano={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
