import React from 'react';
import { useWorkoutStore } from '../store/workoutStore';
import { calcularTotal } from '../engine/score';
import { esDeTiempo, nombreEjercicio } from '../engine/ejercicios';

const COLORES = ['text-green-400', 'text-blue-400', 'text-red-400', 'text-yellow-400', 'text-purple-400'];

export default function SummaryScreen() {
  const { faseActual, totales, claseActual, iniciarRutina, detenerRutina } = useWorkoutStore();

  if (faseActual !== 'FIN') return null;

  const total = calcularTotal(totales);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10 bg-black/70 px-6 text-center">
      <p className="text-sm font-bold uppercase tracking-[0.3em] text-green-400">
        {claseActual.nombre}
      </p>
      <h1 className="text-5xl font-black mb-6">¡Clase completada!</h1>
      <div className="text-2xl space-y-3 mb-6">
        {Object.entries(totales).map(([ejercicio, reps], i) => (
          <p key={ejercicio}>
            {nombreEjercicio(ejercicio)}:{' '}
            <span className={`font-bold ${COLORES[i % COLORES.length]}`}>
              {esDeTiempo(ejercicio) ? 'sostenida' : reps}
            </span>
          </p>
        ))}
        <p className="text-4xl mt-4 border-t border-white/30 pt-4">
          Total reps: <span className="font-black text-yellow-400">{total}</span>
        </p>
      </div>
      <div className="flex gap-4">
        <button
          onClick={() => iniciarRutina(claseActual.id)}
          className="px-6 py-3 bg-green-500 text-xl font-bold rounded hover:bg-green-600 transition"
        >
          Repetir clase
        </button>
        <button
          onClick={detenerRutina}
          className="px-6 py-3 bg-gray-600 text-xl font-bold rounded hover:bg-gray-700 transition"
        >
          Volver
        </button>
      </div>
    </div>
  );
}
