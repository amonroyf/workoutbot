import React from 'react';
import { PASOS_PRIMERA_VEZ } from '../engine/primeraVez';
import Icono from './Icono';

export default function GuiaPrimeraVez({ onCerrar }) {
  return (
    <section
      aria-label="Tu primera clase"
      className="mt-3 w-full max-w-md rounded-ficha border border-linea bg-panel p-4 text-left shadow-flotante"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-marca-400">Primera vez por aquí</p>
          <h2 className="mt-1 text-lg font-black text-tinta-100">Tu primera clase en 3 pasos</h2>
        </div>
        <button
          type="button"
          onClick={onCerrar}
          className="min-h-11 rounded-boton border border-linea px-3 text-sm font-semibold text-tinta-300 transition hover:bg-tinta-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Entendido
        </button>
      </div>

      <ol className="mt-3 space-y-2.5">
        {PASOS_PRIMERA_VEZ.map((paso, i) => (
          <li key={paso.titulo} className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-boton bg-marca-500/15 text-marca-400">
              <Icono nombre={paso.icono} tamano={18} />
            </span>
            <span>
              <span className="block text-sm font-bold text-tinta-100">
                {i + 1}. {paso.titulo}
              </span>
              <span className="block text-xs text-tinta-400">{paso.texto}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
