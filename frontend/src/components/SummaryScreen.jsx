import React from 'react';
import { useWorkoutStore } from '../store/workoutStore';
import { calcularTotal, calcularSegundos, separarTotales } from '../engine/score';
import { esDeTiempo, nombreEjercicio } from '../engine/ejercicios';
import { formatearDuracion } from '../engine/clases';
import { diferenciaReps, textoComparacion } from '../engine/progreso';
import { Esqueleto, EsqueletoTarjeta } from './Esqueleto';
import Icono from './Icono';

function valorDe(ejercicio, reps, segundos) {
  if (esDeTiempo(ejercicio)) return `${segundos[ejercicio] || 0} s`;
  return `${reps[ejercicio] || 0}`;
}

export default function SummaryScreen({ resumen, cargando = false }) {
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
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center overflow-y-auto overscroll-contain bg-fondo/80 px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-[calc(1.5rem+env(safe-area-inset-top))] text-center text-tinta-100">
      <p className="text-sm font-semibold text-marca-400">{claseActual.nombre}</p>
      <h1 className="mb-4 mt-1 text-3xl font-black md:text-4xl">Clase completada</h1>

      {cargando && !resumen && (
        <div className="mb-4 w-full max-w-sm space-y-3 text-left">
          <EsqueletoTarjeta />
          <Esqueleto className="h-24 w-full" redondeado="rounded-ficha" />
        </div>
      )}

      {resumen && (
        <div className="mb-4 w-full max-w-sm rounded-ficha border border-linea bg-tinta-800/60 p-4 text-left">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-tinta-400">Racha</p>
              <p className="text-2xl font-black text-racha-300">
                {resumen.racha} {resumen.racha === 1 ? 'día' : 'días'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-tinta-400">Semana</p>
              <p className="text-2xl font-black text-marca-300">
                {resumen.dias_semana}/{resumen.meta_semanal}
              </p>
            </div>
          </div>
          <div className="mt-3 flex justify-between">
            {resumen.semana.map((dia) => (
              <div key={dia.fecha} className="flex flex-col items-center gap-1" title={dia.fecha}>
                <span
                  className={`h-3 w-3 rounded-full ${
                    dia.hecha ? 'bg-marca-400' : 'bg-tinta-700/60'
                  } ${dia.hoy ? 'ring-2 ring-tinta-100/70' : ''}`}
                />
                <span
                  className={`text-[10px] font-bold ${
                    dia.hoy ? 'text-tinta-100' : 'text-tinta-500'
                  }`}
                >
                  {dia.etiqueta}
                </span>
              </div>
            ))}
          </div>
          <p
            className={`mt-3 text-sm font-semibold ${
              delta > 0 ? 'text-marca-300' : delta < 0 ? 'text-aviso-300' : 'text-tinta-300'
            }`}
          >
            {comparacion}
          </p>
        </div>
      )}

      <div className="mb-4 grid w-full max-w-sm grid-cols-2 gap-2 text-left">
        <div className="rounded-panel bg-tinta-800/60 p-3">
          <p className="text-xs text-tinta-400">Mejor combo</p>
          <p className="text-2xl font-black text-racha-300">{mejorCombo}</p>
        </div>
        <div className="rounded-panel bg-tinta-800/60 p-3">
          <p className="text-xs text-tinta-400">Repeticiones perfectas</p>
          <p className="text-2xl font-black text-marca-300">{perfectas}</p>
        </div>
      </div>

      <div className="w-full max-w-sm space-y-3 text-left">
        {grupos.map((grupo) => (
          <div key={grupo.id} className="rounded-panel border border-linea bg-tinta-900/60 p-3">
            <p className="mb-1.5 text-sm font-bold text-tinta-100">{grupo.nombre}</p>
            <ul className="space-y-0.5">
              {grupo.ejercicios.map((ejercicio) => (
                <li key={ejercicio} className="flex justify-between text-sm text-tinta-200">
                  <span>{nombreEjercicio(ejercicio)}</span>
                  <span className="font-bold text-tinta-100">{valorDe(ejercicio, reps, segundos)}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-4 w-full max-w-sm space-y-1 border-t border-linea pt-3 text-left">
        <p className="flex justify-between text-sm">
          <span className="text-tinta-300">Repeticiones totales</span>
          <span className="font-black text-aviso-300">{totalReps}</span>
        </p>
        {totalSegundos > 0 && (
          <p className="flex justify-between text-sm">
            <span className="text-tinta-300">Tiempo sostenido</span>
            <span className="font-black text-aviso-300">{formatearDuracion(totalSegundos)}</span>
          </p>
        )}
      </div>

      <div className="mt-5 flex w-full max-w-sm gap-3">
        <button
          onClick={() => iniciarRutina(claseActual.id)}
          className="flex min-h-14 flex-1 items-center justify-center gap-2 rounded-ficha bg-marca-500 px-5 text-lg font-bold text-black transition hover:bg-marca-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta-100"
        >
          <Icono nombre="reproducir" tamano={18} />
          Repetir clase
        </button>
        <button
          onClick={detenerRutina}
          className="flex min-h-14 flex-1 items-center justify-center gap-2 rounded-ficha border border-linea bg-tinta-800/60 px-5 text-lg font-bold text-tinta-100 transition hover:bg-tinta-700/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta-100"
        >
          <Icono nombre="casa" tamano={18} />
          Volver
        </button>
      </div>
    </div>
  );
}
