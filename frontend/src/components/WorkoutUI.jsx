import React from 'react';
import { useWorkoutStore } from '../store/workoutStore';
import { progresoCircuito, progresoSecciones } from '../engine/circuito';
import { duracionClase, formatearDuracion } from '../engine/clases';
import { obtenerDemo } from '../engine/demos';
import { esDeTiempo, nombreEjercicio, modificacionesEjercicio } from '../engine/ejercicios';
import { UMBRAL_SCORE_PERFECTO } from '../engine/forma';
import { useMusica } from '../hooks/useMusica';
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
    scoreForma,
    subtitulo,
    pausado,
    pausadoPor,
    vozActiva,
    musicaActiva,
    avisoMusica,
    faseRepeticion,
    flashPerfecta,
    demoAbierta,
    demoEjercicio,
    togglePausa,
    setVozActiva,
    setMusicaActiva,
    abrirDemo,
    cerrarDemo,
  } = useWorkoutStore();

  useMusica();

  if (faseActual !== 'TRABAJO' && faseActual !== 'DESCANSO') return null;

  const progreso = progresoCircuito(useWorkoutStore.getState(), claseActual);
  const seccionesProgreso = progresoSecciones(useWorkoutStore.getState(), claseActual);
  const seccionActualProgreso =
    seccionesProgreso?.find((seccion) => seccion.estado === 'actual') || null;
  const restanteSeccion = seccionActualProgreso
    ? seccionActualProgreso.duracion - seccionActualProgreso.transcurrido
    : 0;
  const totalBloques = claseActual.bloques.length;
  const siguiente = claseActual.bloques[bloqueActual + 1]?.ejercicio;
  const texto = subtitulo || mensajeForma;
  const esCorreccion = Boolean(mensajeForma) && (!subtitulo || subtitulo === mensajeForma);
  const ejercicioDemo = demoEjercicio || (faseActual === 'DESCANSO' ? siguiente : ejercicioActual);
  const demoVisible = obtenerDemo(ejercicioDemo);
  const modificaciones = modificacionesEjercicio(ejercicioDemo);
  const esTiempo = esDeTiempo(ejercicioActual);
  const bloque = claseActual.bloques?.[bloqueActual] || null;
  const esCompleta = Boolean(bloque?.seccionNombre);
  const colorScore =
    scoreForma >= UMBRAL_SCORE_PERFECTO
      ? 'bg-green-400 text-black'
      : scoreForma >= 65
        ? 'bg-yellow-400 text-black'
        : 'bg-red-400 text-white';

  const abrirDemoActual = () => {
    abrirDemo(faseActual === 'DESCANSO' ? siguiente : ejercicioActual);
  };

  return (
    <div className="absolute inset-0 z-10 text-white">
      <div className="absolute top-0 left-0 right-0 p-4">
        <div className="mb-1 flex items-baseline justify-between gap-3 text-xs font-semibold text-white/75">
          <span>
            {faseActual === 'TRABAJO' ? 'Trabajo' : 'Descanso'} ·{' '}
            {esCompleta ? bloque.seccionNombre : `Ejercicio ${bloqueActual + 1} de ${totalBloques}`}
            {esCompleta && bloque.totalRondas > 1
              ? ` · Ronda ${bloque.ronda} de ${bloque.totalRondas}`
              : ''}
          </span>
          <span className="shrink-0">
            {esCompleta ? `Faltan ${formatearDuracion(restanteSeccion)} en esta sección · ` : ''}
            {Math.round(progreso * 100)}%
          </span>
        </div>
        {avisoMusica && (
          <p className="mt-1 text-xs font-semibold text-yellow-300">{avisoMusica}</p>
        )}
        {seccionesProgreso ? (
          <div className="mt-2 flex h-2 w-full overflow-hidden rounded-full bg-white/20">
            {seccionesProgreso.map((seccion) => {
              const ancho = (seccion.duracion / duracionClase(claseActual)) * 100;
              const avance = seccion.duracion > 0 ? seccion.transcurrido / seccion.duracion : 0;
              const color =
                seccion.estado === 'completado'
                  ? 'bg-green-400'
                  : seccion.estado === 'actual'
                    ? 'bg-green-300'
                    : 'bg-white/10';
              return (
                <div key={seccion.id} className="relative h-full" style={{ width: `${ancho}%` }}>
                  <div
                    className={`h-full ${color} transition-all duration-300`}
                    style={{ width: `${avance * 100}%` }}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-3 w-full overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-green-400 transition-all duration-300"
              style={{ width: `${progreso * 100}%` }}
            />
          </div>
        )}
        <MapaCircuito />
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center gap-2 border-t border-white/10 bg-black/70 px-3 py-2 backdrop-blur-md">
        <button
          onClick={togglePausa}
          className="min-h-11 flex-1 rounded-xl bg-green-500 px-4 text-base font-black text-black transition hover:bg-green-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {pausado ? 'Seguir' : 'Pausa'}
        </button>
        <button
          onClick={() => setVozActiva(!vozActiva)}
          aria-pressed={vozActiva}
          className="min-h-11 rounded-xl border border-white/20 bg-white/10 px-3 text-sm font-semibold text-white transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Voz: {vozActiva ? 'sí' : 'no'}
        </button>
        <button
          onClick={() => setMusicaActiva(!musicaActiva)}
          aria-pressed={musicaActiva}
          className="min-h-11 rounded-xl border border-white/20 bg-white/10 px-3 text-sm font-semibold text-white transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Música: {musicaActiva ? 'sí' : 'no'}
        </button>
        <button
          onClick={abrirDemoActual}
          className="min-h-11 rounded-xl border border-white/20 bg-white/10 px-3 text-sm font-semibold text-white transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Cómo se hace
        </button>
      </div>

      <div className="flex h-full flex-col items-center justify-center px-6 pb-28 text-center">
        <p className="mb-1 text-2xl font-bold">{nombreEjercicio(ejercicioActual)}</p>
        {esCompleta && (
          <p className="mb-2 text-xs font-semibold text-white/60">
            {bloque.seccionNombre}
            {bloque.totalRondas > 1 ? ` · Ronda ${bloque.ronda} de ${bloque.totalRondas}` : ''}
          </p>
        )}
        <h1
          className={`text-7xl font-black md:text-9xl ${
            faseActual === 'DESCANSO' ? 'text-yellow-400' : 'text-white'
          }`}
        >
          {tiempoRestante}
        </h1>

        {siguiente && (
          <p className="mt-2 text-sm text-white/70">
            {faseActual === 'TRABAJO' ? 'Siguiente' : 'Sigue'}: {nombreEjercicio(siguiente)}
          </p>
        )}

        {faseActual === 'TRABAJO' ? (
          esTiempo ? (
            <div className="mt-3 flex flex-col items-center gap-2">
              <p className="text-3xl font-black text-green-300">Sostén</p>
              <p className="text-sm text-white/70">Mantén la posición</p>
              {scoreForma != null && (
                <span className={`rounded-full px-4 py-1 text-sm font-black ${colorScore}`}>
                  Forma {scoreForma}%
                </span>
              )}
            </div>
          ) : (
            <div className="mt-3 flex items-center gap-4">
              <div className="text-left">
                <p className="text-2xl font-bold">Repeticiones: {repeticiones}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  {scoreForma != null && (
                    <span className={`rounded-full px-3 py-1 text-sm font-black ${colorScore}`}>
                      Forma {scoreForma}%
                    </span>
                  )}
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
            <p className="text-2xl font-bold text-yellow-300">¡Descansa!</p>
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
        className="absolute bottom-20 right-3 z-20 flex flex-col items-center rounded-2xl border border-white/15 bg-black/55 p-1.5 backdrop-blur-md transition hover:bg-black/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <DemoEjercicio ejercicio={ejercicioDemo} esquina />
        <span className="mt-1 text-[10px] font-bold text-white/70">
          {faseActual === 'DESCANSO' ? 'Después' : 'Ahora'}
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
          <div className="mt-2 grid gap-1 text-left text-xs">
            <p className="text-white/80">
              <span className="font-bold text-green-300">Más fácil:</span> {modificaciones.facil}
            </p>
            <p className="text-white/80">
              <span className="font-bold text-yellow-300">Más fuerte:</span> {modificaciones.fuerte}
            </p>
          </div>
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
