import React from 'react';
import { useWorkoutStore } from '../store/workoutStore';
import { calcularTotal, calcularSegundos, separarTotales } from '../engine/score';
import { esDeTiempo, nombreEjercicio } from '../engine/ejercicios';
import { formatearDuracion } from '../engine/clases';
import { diferenciaReps, textoComparacion } from '../engine/progreso';

function valorDe(ejercicio, reps, segundos) {
  if (esDeTiempo(ejercicio)) return `${segundos[ejercicio] || 0} s`;
  return `${reps[ejercicio] || 0}`;
}

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

  const { reps, segundos } = separarTotales(totales);
  const totalReps = calcularTotal(totales);
  const totalSegundos = calcularSegundos(totales);
  const delta = diferenciaReps(resumen);
  const comparacion = textoComparacion(resumen);

  const grupos = claseActual.secciones
    ? claseActual.secciones.map((seccion, i) => ({
        id: seccion.id,
        nombre: seccion.nombre,
        ejercicios: [
          ...new Set(
            claseActual.bloques
              .filter((bloque) => bloque.seccionIndex === i)
              .map((bloque) => bloque.ejercicio)
          ),
        ],
      }))
    : [
        {
          id: 'clase',
          nombre: 'Ejercicios',
          ejercicios: [...new Set(claseActual.bloques.map((bloque) => bloque.ejercicio))],
        },
      ];

  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center overflow-y-auto bg-black/80 px-5 py-6 text-center text-white">
      <p className="text-sm font-semibold text-green-400">{claseActual.nombre}</p>
      <h1 className="mb-4 mt-1 text-3xl font-black md:text-4xl">Clase completada</h1>

      {resumen && (
        <div className="mb-4 w-full max-w-sm rounded-2xl border border-white/15 bg-white/10 p-4 text-left">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-white/60">Racha</p>
              <p className="text-2xl font-black text-orange-300">
                {resumen.racha} {resumen.racha === 1 ? 'día' : 'días'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/60">Semana</p>
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
          <p className="text-xs text-white/60">Mejor combo</p>
          <p className="text-2xl font-black text-orange-300">{mejorCombo}</p>
        </div>
        <div className="rounded-xl bg-white/10 p-3">
          <p className="text-xs text-white/60">Repeticiones perfectas</p>
          <p className="text-2xl font-black text-green-300">{perfectas}</p>
        </div>
      </div>

      <div className="w-full max-w-sm space-y-3 text-left">
        {grupos.map((grupo) => (
          <div key={grupo.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="mb-1.5 text-sm font-bold text-white">{grupo.nombre}</p>
            <ul className="space-y-0.5">
              {grupo.ejercicios.map((ejercicio) => (
                <li key={ejercicio} className="flex justify-between text-sm text-white/80">
                  <span>{nombreEjercicio(ejercicio)}</span>
                  <span className="font-bold text-white">{valorDe(ejercicio, reps, segundos)}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-4 w-full max-w-sm space-y-1 border-t border-white/20 pt-3 text-left">
        <p className="flex justify-between text-sm">
          <span className="text-white/70">Repeticiones totales</span>
          <span className="font-black text-yellow-300">{totalReps}</span>
        </p>
        {totalSegundos > 0 && (
          <p className="flex justify-between text-sm">
            <span className="text-white/70">Tiempo sostenido</span>
            <span className="font-black text-yellow-300">{formatearDuracion(totalSegundos)}</span>
          </p>
        )}
      </div>

      <div className="mt-5 flex w-full max-w-sm gap-3">
        <button
          onClick={() => iniciarRutina(claseActual.id)}
          className="flex-1 rounded-xl bg-green-500 px-5 py-3 text-lg font-bold text-black transition hover:bg-green-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Repetir clase
        </button>
        <button
          onClick={detenerRutina}
          className="flex-1 rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-lg font-bold text-white transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Volver
        </button>
      </div>
    </div>
  );
}
