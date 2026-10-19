import React from 'react';
import { useWorkoutStore } from '../store/workoutStore';
import { calcularTotal } from '../engine/score';

export default function SummaryScreen() {
  const { faseActual, totales, iniciarRutina, detenerRutina } = useWorkoutStore();

  if (faseActual !== 'FIN') return null;

  const total = calcularTotal(totales);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10 bg-black/70">
      <h1 className="text-6xl font-black mb-8">¡Circuito Completado!</h1>
      <div className="text-3xl space-y-4 mb-8">
        <p>Sentadillas: <span className="font-bold text-green-400">{totales.SENTADILLAS}</span></p>
        <p>Flexiones: <span className="font-bold text-blue-400">{totales.FLEXIONES}</span></p>
        <p>Jumping Jacks: <span className="font-bold text-red-400">{totales.JUMPING_JACKS}</span></p>
        <p className="text-4xl mt-6 border-t border-white/30 pt-4">
          Total: <span className="font-black text-yellow-400">{total}</span>
        </p>
      </div>
      <div className="flex gap-4">
        <button
          onClick={iniciarRutina}
          className="px-8 py-4 bg-green-500 text-2xl font-bold rounded hover:bg-green-600 transition"
        >
          Repetir Circuito
        </button>
        <button
          onClick={detenerRutina}
          className="px-8 py-4 bg-gray-600 text-2xl font-bold rounded hover:bg-gray-700 transition"
        >
          Volver
        </button>
      </div>
    </div>
  );
}
