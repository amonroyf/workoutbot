import React from 'react';
import { useWorkoutStore } from '../store/workoutStore';
import { progresoCircuito, progresoSecciones } from '../engine/circuito';
import { duracionClase, formatearReloj } from '../engine/clases';
import { obtenerDemo } from '../engine/demos';
import {
  consignaEjercicio,
  esDeTiempo,
  nombreEjercicio,
  modificacionesEjercicio,
} from '../engine/ejercicios';
import { UMBRAL_SCORE_PERFECTO } from '../engine/forma';
import { useMusica } from '../hooks/useMusica';
import Icono from './Icono';
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
  const consigna = consignaEjercicio(ejercicioActual);
  const bloque = claseActual.bloques?.[bloqueActual] || null;
  const esCompleta = Boolean(bloque?.seccionNombre);
  const colorScore =
    scoreForma >= UMBRAL_SCORE_PERFECTO
      ? 'bg-marca-400 text-black'
      : scoreForma >= 65
        ? 'bg-aviso-400 text-black'
        : 'bg-error-400 text-tinta-100';

  const abrirDemoActual = () => {
    abrirDemo(faseActual === 'DESCANSO' ? siguiente : ejercicioActual);
  };

  return (
    <div className="absolute inset-0 z-10 text-tinta-100">
      <div className="absolute top-0 left-0 right-0 px-4 pb-2 pt-[calc(1rem+env(safe-area-inset-top))]">
        <div className="mb-1 flex items-center gap-2 text-xs font-semibold">
          <span
            className={`shrink-0 rounded-chip px-2 py-0.5 text-[10px] font-bold ${
              faseActual === 'TRABAJO'
                ? 'bg-marca-500/20 text-marca-300'
                : 'bg-aviso-500/20 text-aviso-300'
            }`}
          >
            {faseActual === 'TRABAJO' ? 'Trabajo' : 'Descanso'}
          </span>
          <span className="min-w-0 flex-1 truncate text-tinta-200">
            {esCompleta
              ? `${bloque.seccionNombre}${
                  bloque.totalRondas > 1 ? ` · Ronda ${bloque.ronda} de ${bloque.totalRondas}` : ''
                }`
              : `Ejercicio ${bloqueActual + 1} de ${totalBloques}`}
          </span>
          <span className="shrink-0 tabular-nums text-tinta-300">
            {esCompleta ? formatearReloj(restanteSeccion) : `${Math.round(progreso * 100)}%`}
          </span>
        </div>
        {avisoMusica && (
          <p className="mt-1 text-xs font-semibold text-aviso-300">{avisoMusica}</p>
        )}
        {seccionesProgreso ? (
          <div className="mt-2 flex h-2 w-full overflow-hidden rounded-full bg-tinta-700/60">
            {seccionesProgreso.map((seccion) => {
              const ancho = (seccion.duracion / duracionClase(claseActual)) * 100;
              const avance = seccion.duracion > 0 ? seccion.transcurrido / seccion.duracion : 0;
              const color =
                seccion.estado === 'completado'
                  ? 'bg-marca-400'
                  : seccion.estado === 'actual'
                    ? 'bg-marca-500/40'
                    : 'bg-tinta-800/60';
              const relleno =
                seccion.estado === 'actual'
                  ? 'bg-marca-300'
                  : seccion.estado === 'completado'
                    ? 'bg-marca-400'
                    : 'bg-transparent';
              return (
                <div key={seccion.id} className="relative h-full" style={{ width: `${ancho}%` }}>
                  <div className={`h-full ${color}`} />
                  <div
                    className={`absolute inset-y-0 left-0 ${relleno} transition-all duration-300`}
                    style={{ width: `${avance * 100}%` }}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-3 w-full overflow-hidden rounded-full bg-tinta-700/60">
            <div
              className="h-full rounded-full bg-marca-400 transition-all duration-300"
              style={{ width: `${progreso * 100}%` }}
            />
          </div>
        )}
        <MapaCircuito />
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center gap-2 border-t border-linea bg-tinta-950/85 px-3 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 backdrop-blur-md">
        <button
          onClick={togglePausa}
          className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-boton bg-marca-500 px-4 text-base font-black text-black transition hover:bg-marca-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta-100"
        >
          <Icono nombre={pausado ? 'reproducir' : 'pausa'} tamano={18} />
          {pausado ? 'Seguir' : 'Pausa'}
        </button>
        <button
          onClick={() => setVozActiva(!vozActiva)}
          aria-pressed={vozActiva}
          aria-label={vozActiva ? 'Silenciar la voz' : 'Activar la voz'}
          title={vozActiva ? 'Silenciar la voz' : 'Activar la voz'}
          className="flex min-h-11 items-center gap-1.5 rounded-boton border border-linea bg-tinta-800/70 px-3 text-sm font-semibold transition hover:bg-tinta-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta-100"
        >
          <Icono nombre="voz" tamano={16} className={vozActiva ? 'text-marca-300' : 'text-tinta-500'} />
          <span className={vozActiva ? 'text-marca-300' : 'text-tinta-400'}>Voz</span>
        </button>
        <button
          onClick={() => setMusicaActiva(!musicaActiva)}
          aria-pressed={musicaActiva}
          aria-label={musicaActiva ? 'Apagar la música' : 'Encender la música'}
          title={musicaActiva ? 'Apagar la música' : 'Encender la música'}
          className="flex min-h-11 items-center gap-1.5 rounded-boton border border-linea bg-tinta-800/70 px-3 text-sm font-semibold transition hover:bg-tinta-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta-100"
        >
          <Icono nombre="musica" tamano={16} className={musicaActiva ? 'text-marca-300' : 'text-tinta-500'} />
          <span className={musicaActiva ? 'text-marca-300' : 'text-tinta-400'}>Música</span>
        </button>
        <button
          onClick={abrirDemoActual}
          aria-label="Cómo se hace este ejercicio"
          title="Cómo se hace este ejercicio"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-boton border border-linea bg-tinta-800/70 text-tinta-200 transition hover:bg-tinta-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta-100"
        >
          <Icono nombre="ayuda" tamano={18} />
        </button>
      </div>

      <div className="flex h-full flex-col items-center justify-center px-6 pb-36 pt-24 text-center">
        <p className="mb-1 text-2xl font-bold">{nombreEjercicio(ejercicioActual)}</p>
        {esCompleta && (
          <p className="mb-2 text-xs font-semibold text-tinta-400">
            {bloque.seccionNombre}
            {bloque.totalRondas > 1 ? ` · Ronda ${bloque.ronda} de ${bloque.totalRondas}` : ''}
          </p>
        )}
        <h1
          className={`text-7xl font-black md:text-9xl ${
            faseActual === 'DESCANSO' ? 'text-aviso-400' : 'text-tinta-100'
          }`}
        >
          {tiempoRestante}
        </h1>

        {siguiente && (
          <p className="mt-2 text-sm text-tinta-300">
            {faseActual === 'TRABAJO' ? 'Siguiente' : 'Sigue'}: {nombreEjercicio(siguiente)}
          </p>
        )}

        {faseActual === 'TRABAJO' ? (
          esTiempo ? (
            <div className="mt-3 flex flex-col items-center gap-2">
              <p className="text-3xl font-black text-marca-300">{consigna.consigna}</p>
              <p className="text-sm text-tinta-300">{consigna.consignaAyuda}</p>
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
                    <span className="rounded-full bg-racha-500 px-3 py-1 text-sm font-black">
                      Combo x{combo}
                    </span>
                  )}
                  {flashPerfecta > 0 && (
                    <span
                      key={flashPerfecta}
                      className="perfecta-flash rounded-full bg-marca-400 px-3 py-1 text-sm font-black text-black"
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
            <p className="text-2xl font-bold text-aviso-300">¡Descansa!</p>
          </div>
        )}

        {texto && (
          <p
            className={`mt-4 max-w-xl rounded-boton px-4 py-2 text-lg font-semibold ${
              esCorreccion ? 'bg-aviso-500/90 text-black' : 'bg-tinta-950/80 text-tinta-100'
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
        className="absolute bottom-[calc(5rem+env(safe-area-inset-bottom))] right-3 z-20 flex flex-col items-center rounded-ficha border border-linea bg-tinta-950/70 p-1.5 backdrop-blur-md transition hover:bg-tinta-950/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta-100"
      >
        <DemoEjercicio ejercicio={ejercicioDemo} pequena />
        <span className="mt-1 text-[10px] font-bold text-tinta-300">
          {faseActual === 'DESCANSO' ? 'Después' : 'Ahora'}
        </span>
      </button>

      {pausado && !demoAbierta && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 overflow-y-auto bg-tinta-950/85 px-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-[calc(1.5rem+env(safe-area-inset-top))] text-center">
          <p className="text-6xl font-black">PAUSA</p>
          <p className="text-xl text-tinta-200">
            {pausadoPor === 'faltaPose'
              ? 'No te veo. Vuelve al cuadro de la cámara.'
              : 'Respira. Sigue cuando estés listo.'}
          </p>
          <button
            onClick={togglePausa}
            className="rounded-boton bg-marca-500 px-8 py-3 text-2xl font-bold hover:bg-marca-600"
          >
            Seguir
          </button>
        </div>
      )}

      {demoAbierta && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-3 overflow-y-auto bg-tinta-950/95 px-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-[calc(1.5rem+env(safe-area-inset-top))] text-center">
          <p className="text-sm font-bold text-marca-400">Así se hace</p>
          <p className="text-3xl font-black">{demoVisible.nombre}</p>
          <DemoEjercicio ejercicio={ejercicioDemo} />
          <ul className="space-y-1">
            {demoVisible.pistas.map((pista) => (
              <li key={pista} className="text-base text-tinta-200">
                {pista}
              </li>
            ))}
          </ul>
          <div className="mt-2 grid gap-1 text-left text-xs">
            <p className="text-tinta-200">
              <span className="font-bold text-marca-300">Más fácil:</span> {modificaciones.facil}
            </p>
            <p className="text-tinta-200">
              <span className="font-bold text-aviso-300">Más fuerte:</span> {modificaciones.fuerte}
            </p>
          </div>
          <button
            onClick={cerrarDemo}
            className="mt-2 rounded-boton bg-marca-500 px-8 py-3 text-xl font-bold hover:bg-marca-600"
          >
            Listo, sigo
          </button>
        </div>
      )}
    </div>
  );
}
