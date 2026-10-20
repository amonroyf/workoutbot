import React from 'react';
import { useWorkoutStore } from '../store/workoutStore';
import { progresoCircuito } from '../engine/circuito';
import { obtenerDemo } from '../engine/demos';
import { esDeTiempo, nombreEjercicio } from '../engine/ejercicios';
import MapaCircuito from './MapaCircuito';
import DemoEjercicio from './DemoEjercicio';

function AnilloRep({ fase }) {
  const radio = 24;
  const circunferencia = 2 * Math.PI * radio;
  const avance = fase === 'ABAJO' ? 1 : 0;

  return (
    <div className="relative h-16 w-16">
      <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90">
        <circle
          cx="32"
          cy="32"
          r={radio}
          fill="none"
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="5"
        />
        <circle
          cx="32"
          cy="32"
          r={radio}
          fill="none"
          stroke="#4ade80"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circunferencia}
          strokeDashoffset={circunferencia * (1 - avance)}
          className="transition-all duration-300 ease-out"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black uppercase tracking-wide">
        {fase}
      </span>
    </div>
  );
}

export default function WorkoutUI() {
  const {
    faseActual,
    tiempoRestante,
    repeticiones,
    combo,
    claseActual,
    bloqueActual,
    ejercicioActual,
    mensajeForma,
    subtitulo,
    pausado,
    pausadoPor,
    vozActiva,
    faseRepeticion,
    flashPerfecta,
    demoAbierta,
    demoEjercicio,
    togglePausa,
    setVozActiva,
    abrirDemo,
    cerrarDemo,
  } = useWorkoutStore();

  if (faseActual !== 'TRABAJO' && faseActual !== 'DESCANSO') return null;

  const progreso = progresoCircuito(useWorkoutStore.getState(), claseActual);
  const totalBloques = claseActual.bloques.length;
  const siguiente = claseActual.bloques[bloqueActual + 1]?.ejercicio;
  const texto = subtitulo || mensajeForma;
  const esCorreccion = Boolean(mensajeForma) && (!subtitulo || subtitulo === mensajeForma);
  const ejercicioDemo = demoEjercicio || (faseActual === 'DESCANSO' ? siguiente : ejercicioActual);
  const demoVisible = obtenerDemo(ejercicioDemo);
  const esTiempo = esDeTiempo(ejercicioActual);

  const abrirDemoActual = () => {
    abrirDemo(faseActual === 'DESCANSO' ? siguiente : ejercicioActual);
  };

  return (
    <div className="absolute inset-0 z-10 text-white">
      <div className="absolute top-0 left-0 right-0 p-4">
        <div className="flex justify-between text-xs font-semibold uppercase tracking-widest text-white/80 mb-1">
          <span>
            {faseActual === 'TRABAJO' ? 'Trabajo' : 'Descanso'} · Ejercicio {bloqueActual + 1} de{' '}
            {totalBloques}
          </span>
          <span>{Math.round(progreso * 100)}%</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full rounded-full bg-green-400 transition-all duration-300"
            style={{ width: `${progreso * 100}%` }}
          />
        </div>
        <MapaCircuito />
      </div>

      <div className="absolute top-32 right-4 flex flex-col items-end gap-2">
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
        <button
          onClick={abrirDemoActual}
          className="rounded-lg bg-green-500/90 px-4 py-2 text-sm font-bold backdrop-blur hover:bg-green-500"
        >
          ¿Cómo se hace?
        </button>
      </div>

      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <p className="mb-2 text-2xl font-semibold uppercase tracking-widest">
          {nombreEjercicio(ejercicioActual)}
        </p>
        <h1
          className={`text-7xl font-black md:text-9xl ${
            faseActual === 'DESCANSO' ? 'text-yellow-400' : 'text-white'
          }`}
        >
          {tiempoRestante}
        </h1>

        {faseActual === 'TRABAJO' ? (
          esTiempo ? (
            <div className="mt-3 flex flex-col items-center">
              <p className="text-3xl font-black text-green-300">Sostén</p>
              <p className="text-sm text-white/70">Mantén la posición</p>
            </div>
          ) : (
            <div className="mt-3 flex items-center gap-4">
              <div className="text-left">
                <p className="text-3xl">Reps: {repeticiones}</p>
                <div className="mt-1 flex items-center gap-2">
                  {combo >= 3 && (
                    <span className="rounded-full bg-orange-500 px-3 py-1 text-sm font-black">
                      Combo x{combo}
                    </span>
                  )}
                  {flashPerfecta > 0 && (
                    <span
                      key={flashPerfecta}
                      className="perfecta-flash rounded-full bg-green-400 px-3 py-1 text-sm font-black text-black"
                    >
                      ¡PERFECTA!
                    </span>
                  )}
                </div>
              </div>
              <AnilloRep fase={faseRepeticion} />
            </div>
          )
        ) : (
          <div className="mt-2 flex flex-col items-center">
            <p className="text-3xl text-yellow-300">¡Descansa!</p>
            {siguiente && (
              <p className="text-lg text-white/70">Sigue: {nombreEjercicio(siguiente)}</p>
            )}
          </div>
        )}

        {texto && (
          <p
            className={`mt-4 max-w-xl rounded-lg px-4 py-2 text-lg font-semibold ${
              esCorreccion ? 'bg-yellow-500/90 text-black' : 'bg-black/60 text-white'
            }`}
          >
            {texto}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={abrirDemoActual}
        aria-label={`Ver demostración de ${nombreEjercicio(ejercicioDemo)}`}
        className="absolute bottom-4 left-4 z-20 flex flex-col items-center rounded-2xl border border-white/15 bg-black/55 p-1.5 backdrop-blur-md transition hover:bg-black/70"
      >
        <DemoEjercicio ejercicio={ejercicioDemo} esquina />
        <span className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-white/70">
          {faseActual === 'DESCANSO' ? 'Sigue' : 'Ahora'}
        </span>
      </button>

      {pausado && !demoAbierta && (
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

      {demoAbierta && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-3 bg-black/90 px-6 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-green-400">Así se hace</p>
          <p className="text-3xl font-black">{demoVisible.nombre}</p>
          <DemoEjercicio ejercicio={ejercicioDemo} />
          <ul className="space-y-1">
            {demoVisible.pistas.map((pista) => (
              <li key={pista} className="text-base text-white/80">
                {pista}
              </li>
            ))}
          </ul>
          <button
            onClick={cerrarDemo}
            className="mt-2 rounded-lg bg-green-500 px-8 py-3 text-xl font-bold hover:bg-green-600"
          >
            Listo, sigo
          </button>
        </div>
      )}
    </div>
  );
}
