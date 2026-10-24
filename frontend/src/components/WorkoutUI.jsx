import React from 'react';
import { useWorkoutStore } from '../store/workoutStore';
import { progresoCircuito, progresoSecciones } from '../engine/circuito';
import { duracionClase, formatearReloj, obtenerArquetipo } from '../engine/clases';
import { estiloGel } from '../theme';
import { obtenerDemo } from '../engine/demos';
import {
  consignaEjercicio,
  esDeTiempo,
  nombreEjercicio,
  modificacionesEjercicio,
  EJERCICIOS_CATALOGO,
} from '../engine/ejercicios';
import { UMBRAL_SCORE_PERFECTO } from '../engine/forma';
import { useMusica } from '../hooks/useMusica';
import Icono from './Icono';
import MapaCircuito from './MapaCircuito';
import DemoEjercicio from './DemoEjercicio';
import MinijuegoTecho from './MinijuegoTecho';
import MarcoEncuadre from './MarcoEncuadre';

function AnilloRep({ fase, color = '#4ade80' }) {
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
          stroke={color}
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
    registrarRepeticion,
    quitarRepeticion,
    camaraHabilitada,
    setCamaraHabilitada,
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

  // Orientación óptica recomendada para el ejercicio a punto de comenzar
  const ejercicioObjetivo = faseActual === 'DESCANSO' ? siguiente : ejercicioActual;
  const vistaOptima = ejercicioObjetivo ? EJERCICIOS_CATALOGO[ejercicioObjetivo]?.vista : null;
  const mensajeVista =
    vistaOptima === 'perfil'
      ? 'Ubica la cámara de lado (perfil)'
      : vistaOptima === 'frontal'
        ? 'Ubica la cámara de frente'
        : null;
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
  const arquetipo = obtenerArquetipo(claseActual.arquetipo);
  const gel = arquetipo?.color || '#ff6a2b';

  const abrirDemoActual = () => {
    abrirDemo(faseActual === 'DESCANSO' ? siguiente : ejercicioActual);
  };

  // Minijuego somatosensorial: el wall sit se juega sosteniendo un techo
  // virtual con la postura.
  const mostrarTecho =
    faseActual === 'TRABAJO' &&
    !pausado &&
    !demoAbierta &&
    camaraHabilitada &&
    ejercicioActual === 'WALL_SIT';

  return (
    <div style={estiloGel(claseActual.arquetipo)} className="absolute inset-0 z-10 text-tinta-100">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-tinta-950/90 via-tinta-950/50 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 gel opacity-50 mix-blend-screen" />
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
              const activa = seccion.estado === 'actual';
              const completada = seccion.estado === 'completado';
              return (
                <div key={seccion.id} className="relative h-full" style={{ width: `${ancho}%` }}>
                  <div
                    className="h-full"
                    style={{
                      backgroundColor: activa || completada ? gel : 'rgba(68,61,53,0.6)',
                      opacity: activa ? 0.4 : 1,
                    }}
                  />
                  <div
                    className="absolute inset-y-0 left-0 transition-all duration-300"
                    style={{
                      width: `${avance * 100}%`,
                      backgroundColor: gel,
                      opacity: completada ? 0.85 : 1,
                    }}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-3 w-full overflow-hidden rounded-full bg-tinta-700/60">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${progreso * 100}%`, backgroundColor: gel }}
            />
          </div>
        )}
        <MapaCircuito />
        {!camaraHabilitada && (
          <button
            type="button"
            onClick={() => setCamaraHabilitada(true)}
            className="mt-1 flex min-h-8 items-center gap-1 rounded-chip border border-aviso-400/40 bg-aviso-500/15 px-2.5 text-[10px] font-bold text-aviso-300"
          >
            <Icono nombre="camara" tamano={12} />
            Modo sin cámara · Toca para activar
          </button>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-30 flex items-center gap-2 px-3 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4">
        <button
          onClick={togglePausa}
          className="flex min-h-14 flex-1 items-center justify-center gap-2 rounded-ficha bg-marca-500 px-4 text-lg font-black text-black transition hover:bg-marca-400 shadow-flotante focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta-100"
        >
          <Icono nombre={pausado ? 'reproducir' : 'pausa'} tamano={22} />
          {pausado ? 'Seguir' : 'Pausa'}
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => setVozActiva(!vozActiva)}
            aria-pressed={vozActiva}
            aria-label={vozActiva ? 'Silenciar la voz' : 'Activar la voz'}
            title={vozActiva ? 'Silenciar la voz' : 'Activar la voz'}
            className={`flex h-14 w-14 items-center justify-center rounded-boton border border-white/10 backdrop-blur-md transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta-100 ${
              vozActiva ? 'bg-marca-500/20 text-marca-300' : 'bg-tinta-950/80 text-tinta-500'
            }`}
          >
            <Icono nombre="voz" tamano={20} />
          </button>
          <button
            onClick={() => setMusicaActiva(!musicaActiva)}
            aria-pressed={musicaActiva}
            aria-label={musicaActiva ? 'Apagar la música' : 'Encender la música'}
            title={musicaActiva ? 'Apagar la música' : 'Encender la música'}
            className={`flex h-14 w-14 items-center justify-center rounded-boton border border-white/10 backdrop-blur-md transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta-100 ${
              musicaActiva ? 'bg-marca-500/20 text-marca-300' : 'bg-tinta-950/80 text-tinta-500'
            }`}
          >
            <Icono nombre="musica" tamano={20} />
          </button>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-tinta-950/95 via-tinta-950/70 to-transparent z-10" />

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

        {mensajeVista && camaraHabilitada && (
          <div className="mt-3 inline-flex items-center justify-center gap-2 rounded-chip border border-marca-500/40 bg-marca-500/15 px-4 py-2 text-xs font-black tracking-wide text-marca-300 shadow-foco">
            <Icono nombre="camara" tamano={16} />
            {mensajeVista}
          </div>
        )}

        {faseActual === 'TRABAJO' ? (
          mostrarTecho ? (
            <div className="mt-3 w-full max-w-sm">
              <MinijuegoTecho />
              <p className="mt-1 text-xs font-semibold text-tinta-400">
                Mantén rodillas a 90° para frenar el techo
              </p>
            </div>
          ) : esTiempo ? (
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
            <div className="mt-3 flex items-center gap-4 rounded-panel bg-tinta-950/40 p-4 backdrop-blur-md border border-white/10 z-20 relative">
              <div className="text-left flex-1">
                <p className="text-sm font-bold text-tinta-300 uppercase tracking-widest">Repeticiones</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-black">{repeticiones}</p>
                  {scoreForma != null && (
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${colorScore}`}>
                      {scoreForma}% Forma
                    </span>
                  )}
                </div>

                <div className="mt-2 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={quitarRepeticion}
                    aria-label="Quitar una repetición"
                    className="flex h-10 w-10 items-center justify-center rounded-boton border border-white/10 bg-tinta-900/60 text-lg font-black text-tinta-200 transition hover:bg-tinta-800"
                  >
                    −1
                  </button>
                  <button
                    type="button"
                    onClick={() => registrarRepeticion(false)}
                    aria-label="Sumar una repetición"
                    className="flex h-10 w-10 items-center justify-center rounded-boton border border-marca-400/40 bg-marca-500/20 text-lg font-black text-marca-300 transition hover:bg-marca-500/40"
                  >
                    +1
                  </button>
                </div>
              </div>

              <div className="flex flex-col items-center gap-2 shrink-0">
                <AnilloRep fase={faseRepeticion} color={gel} />
                {combo >= 3 && (
                  <span className="rounded-full bg-racha-500 px-2 py-0.5 text-[10px] font-black text-black">
                    {combo >= 5 ? <Icono nombre="fuego" tamano={12} className="inline" /> : null}
                    {combo >= 5 ? ' ON FIRE' : `x${combo} COMBO`}
                  </span>
                )}
                {flashPerfecta > 0 && (
                  <span
                    key={flashPerfecta}
                    className="perfecta-flash rounded-full bg-marca-400 px-2 py-0.5 text-[10px] font-black text-black"
                  >
                    ¡PERFECTA!
                  </span>
                )}
              </div>
            </div>
          )
        ) : (
          <div className="mt-2 flex flex-col items-center">
            <p className="text-2xl font-bold text-aviso-300">¡Descansa!</p>
          </div>
        )}

        {texto && (
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-11/12 max-w-sm z-40 animate-pulse">
            <p
              className={`rounded-panel px-5 py-3 text-center text-lg font-black shadow-flotante border-2 ${
                esCorreccion
                  ? 'border-aviso-400 bg-aviso-500/95 text-black'
                  : 'border-tinta-600 bg-tinta-950/90 text-tinta-100'
              }`}
            >
              {esCorreccion && <Icono nombre="alerta" tamano={20} className="inline-block mr-2 -mt-1" />}
              {texto}
            </p>
          </div>
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
              ? 'No te veo. Ajusta el encuadre para seguir.'
              : pausadoPor === 'orientacion'
                ? 'Posición incorrecta.'
                : 'Respira. Sigue cuando estés listo.'}
          </p>

          {pausadoPor === 'faltaPose' && (
            <>
              <MarcoEncuadre className="h-36 w-full max-w-xs" />
              <p className="max-w-xs text-xs text-tinta-300">
                Que se vean cabeza, manos y pies. Deja unos 2 metros y pon luz
                de frente.
              </p>
            </>
          )}

          {pausadoPor === 'orientacion' && (
            <div className="flex flex-col items-center gap-2">
              <Icono nombre="camara" tamano={42} className="text-aviso-400" />
              <p className="max-w-xs text-sm text-tinta-200">
                {vistaOptima === 'perfil'
                  ? 'Este ejercicio requiere que te pongas de LADO a la cámara.'
                  : 'Este ejercicio requiere que mires de FRENTE a la cámara.'}
              </p>
              <p className="mt-2 text-xs font-bold text-marca-400">
                Gira tu cuerpo, el tiempo seguirá automáticamente.
              </p>
            </div>
          )}

          <button
            onClick={togglePausa}
            className="rounded-boton bg-marca-500 px-8 py-3 text-2xl font-bold hover:bg-marca-600"
          >
            Seguir
          </button>

          {pausadoPor === 'faltaPose' && (
            <button
              type="button"
              onClick={() => setCamaraHabilitada(false)}
              className="min-h-11 rounded-boton border border-linea px-5 text-sm font-bold text-tinta-300 hover:bg-tinta-900"
            >
              Seguir sin cámara
            </button>
          )}
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
