import React from 'react';
import { useWorkoutStore } from '../store/workoutStore';
import { calcularTotal } from '../engine/score';
import { esDeTiempo, nombreEjercicio } from '../engine/ejercicios';
import { diferenciaReps, textoComparacion } from '../engine/progreso';

const COLORES = ['text-green-400', 'text-blue-400', 'text-red-400', 'text-yellow-400', 'text-purple-400'];

export default function SummaryScreen({ resumen }) {
  const {
    faseActual,
    totales,
    claseActual,
    iniciarRutina,
    detenerRutina,
    perfectas,
    mejorCombo,
  } = useWorkoutStore();

  if (faseActual !== 'FIN') return null;

  const total = calcularTotal(totales);
  const delta = diferenciaReps(resumen);
  const comparacion = textoComparacion(resumen);

  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center overflow-y-auto bg-black/70 px-6 py-6 text-center text-white">
      <p className="text-sm font-bold uppercase tracking-[0.3em] text-green-400">
        {claseActual.nombre}
      </p>
      <h1 className="mb-4 text-4xl font-black md:text-5xl">¡Clase completada!</h1>

      {resumen && (
        <div className="mb-4 w-full max-w-sm rounded-2xl border border-white/15 bg-white/10 p-4 text-left">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">Racha</p>
              <p className="text-2xl font-black text-orange-300">
                {resumen.racha} {resumen.racha === 1 ? 'día' : 'días'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">
                Semana
              </p>
              <p className="text-2xl font-black text-green-300">
                {resumen.dias_semana}/{resumen.meta_semanal}
              </p>
            </div>
          </div>
          <div className="mt-3 flex justify-between">
            {resumen.semana.map((dia) => (
              <div key={dia.fecha} className="flex flex-col items-center gap-1" title={dia.fecha}>
                <span
                  className={`h-3 w-3 rounded-full ${
                    dia.hecha ? 'bg-green-400' : 'bg-white/20'
                  } ${dia.hoy ? 'ring-2 ring-white/70' : ''}`}
                />
                <span
                  className={`text-[10px] font-bold ${
                    dia.hoy ? 'text-white' : 'text-white/40'
                  }`}
                >
                  {dia.etiqueta}
                </span>
              </div>
            ))}
          </div>
          <p
            className={`mt-3 text-sm font-semibold ${
              delta > 0 ? 'text-green-300' : delta < 0 ? 'text-yellow-300' : 'text-white/70'
            }`}
          >
            {comparacion}
          </p>
        </div>
      )}

      <div className="mb-4 grid w-full max-w-sm grid-cols-2 gap-2 text-left">
        <div className="rounded-xl bg-white/10 p-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">
            Mejor combo
          </p>
          <p className="text-2xl font-black text-orange-300">{mejorCombo}</p>
        </div>
        <div className="rounded-xl bg-white/10 p-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">Perfectas</p>
          <p className="text-2xl font-black text-green-300">{perfectas}</p>
        </div>
      </div>

      <div className="mb-5 space-y-2 text-xl">
        {Object.entries(totales).map(([ejercicio, reps], i) => (
          <p key={ejercicio}>
            {nombreEjercicio(ejercicio)}:{' '}
            <span className={`font-bold ${COLORES[i % COLORES.length]}`}>
              {esDeTiempo(ejercicio) ? 'sostenida' : reps}
            </span>
          </p>
        ))}
        <p className="mt-3 border-t border-white/30 pt-3 text-3xl">
          Total reps: <span className="font-black text-yellow-400">{total}</span>
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => iniciarRutina(claseActual.id)}
          className="rounded bg-green-500 px-5 py-3 text-lg font-bold transition hover:bg-green-600"
        >
          Repetir clase
        </button>
        <button
          onClick={detenerRutina}
          className="rounded bg-gray-600 px-5 py-3 text-lg font-bold transition hover:bg-gray-700"
        >
          Volver
        </button>
      </div>
    </div>
  );
}
