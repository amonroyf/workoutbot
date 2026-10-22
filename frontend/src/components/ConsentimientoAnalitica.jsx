import React, { useState } from 'react';
import Icono from './Icono';
import { guardarConsentimiento, leerConsentimiento } from '../engine/analytics';

export default function ConsentimientoAnalitica({ onAceptar }) {
  const [visible, setVisible] = useState(() => leerConsentimiento() === null);

  if (!visible) return null;

  const decidir = (permitido) => {
    guardarConsentimiento(permitido);
    setVisible(false);
    if (permitido) onAceptar?.();
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
      <section
        aria-label="Preferencias de analítica"
        className="pointer-events-auto mx-auto w-full max-w-md rounded-ficha border border-linea bg-tinta-900 p-4 text-left shadow-flotante"
      >
        <div className="flex items-start gap-2">
          <Icono nombre="info" tamano={18} className="mt-0.5 shrink-0 text-marca-400" />
          <div>
            <p className="text-sm font-black text-tinta-100">¿Nos ayudas a mejorar?</p>
            <p className="mt-1 text-xs leading-relaxed text-tinta-300">
              Usamos estadísticas anónimas para saber qué clases funcionan. Nunca
              guardamos tu cámara ni tu video.
            </p>
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => decidir(false)}
            className="min-h-11 flex-1 rounded-boton border border-linea text-sm font-bold text-tinta-300 transition hover:bg-tinta-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta-100"
          >
            Ahora no
          </button>
          <button
            type="button"
            onClick={() => decidir(true)}
            className="min-h-11 flex-1 rounded-boton bg-marca-500 text-sm font-black text-black transition hover:bg-marca-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta-100"
          >
            Permitir
          </button>
        </div>

        <a
          href="/privacidad"
          className="mt-2 inline-flex min-h-8 items-center text-[11px] font-bold text-tinta-400 underline underline-offset-2 hover:text-tinta-200"
        >
          Leer la política de privacidad
        </a>
      </section>
    </div>
  );
}
