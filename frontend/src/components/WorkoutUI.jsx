import React from 'react';
import { useWorkoutStore } from '../store/workoutStore';
import { progresoCircuito, EJERCICIOS } from '../engine/circuito';

export default function WorkoutUI() {
  const {
    faseActual,
    tiempoRestante,
    repeticiones,
    combo,
    ejercicioActual,
    mensajeForma,
    subtitulo,
    pausado,
    pausadoPor,
    vozActiva,
    togglePausa,
    setVozActiva,
  } = useWorkoutStore();

  if (faseActual !== 'TRABAJO' && faseActual !== 'DESCANSO') return null;

  const progreso = progresoCircuito(useWorkoutStore.getState());
  const indice = EJERCICIOS.indexOf(ejercicioActual);
  const siguiente = EJERCICIOS[indice + 1];
  const texto = subtitulo || mensajeForma;
  const esCorreccion = Boolean(mensajeForma) && (!subtitulo || subtitulo === mensajeForma);

  return (
    <div className="absolute inset-0 z-10 text-white">
      <div className="absolute top-0 left-0 right-0 p-4">
        <div className="flex justify-between text-xs font-semibold uppercase tracking-widest text-white/80 mb-1">
          <span>
            {faseActual === 'TRABAJO' ? 'Trabajo' : 'Descanso'} · Ejercicio {indice + 1} de{' '}
            {EJERCICIOS.length}
          </span>
          <span>{Math.round(progreso * 100)}%</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full rounded-full bg-green-400 transition-all duration-300"
            style={{ width: `${progreso * 100}%` }}
          />
        </div>
      </div>

      <div className="absolute top-24 right-4 flex flex-col items-end gap-2">
        <button
          onClick={togglePausa}
          className="rounded-lg bg-white/20 px-4 py-2 text-sm font-bold backdrop-blur hover:bg-white/30"
        >
          {pausado ? 'Seguir' : 'Pausa'}
        </button>
        <button
          onClick={() => setVozActiva(!vozActiva)}
          className="rounded-lg bg-white/20 px-4 py-2 text-sm font-bold backdrop-blur hover:bg-white/30"
        >
          {vozActiva ? 'Voz on' : 'Voz off'}
        </button>
      </div>

      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <p className="mb-2 text-2xl font-semibold uppercase tracking-widest">
          {ejercicioActual.replace('_', ' ')}
        </p>
        <h1
          className={`text-8xl font-black md:text-9xl ${
            faseActual === 'DESCANSO' ? 'text-yellow-400' : 'text-white'
          }`}
        >
          {tiempoRestante}
        </h1>

        {faseActual === 'TRABAJO' ? (
          <div className="mt-4 flex items-center gap-4">
            <p className="text-3xl">Reps: {repeticiones}</p>
            {combo >= 3 && (
              <span className="rounded-full bg-orange-500 px-3 py-1 text-lg font-black">
                Combo x{combo}
              </span>
            )}
          </div>
        ) : (
          <div className="mt-4">
            <p className="text-3xl text-yellow-300">¡Descansa!</p>
            {siguiente && (
              <p className="mt-2 text-lg text-white/70">
                Sigue: {siguiente.replace('_', ' ')}
              </p>
            )}
          </div>
        )}

        {texto && (
          <p
            className={`mt-6 max-w-xl rounded-lg px-4 py-2 text-lg font-semibold ${
              esCorreccion ? 'bg-yellow-500/90 text-black' : 'bg-black/60 text-white'
            }`}
          >
            {texto}
          </p>
        )}
      </div>

      {pausado && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-black/75 px-6 text-center">
          <p className="text-6xl font-black">PAUSA</p>
          <p className="text-xl text-white/80">
            {pausadoPor === 'faltaPose'
              ? 'No te veo. Vuelve al cuadro de la cámara.'
              : 'Respira. Sigue cuando estés listo.'}
          </p>
          <button
            onClick={togglePausa}
            className="rounded-lg bg-green-500 px-8 py-3 text-2xl font-bold hover:bg-green-600"
          >
            Seguir
          </button>
        </div>
      )}
    </div>
  );
}
