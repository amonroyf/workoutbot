import React, { useEffect, useState } from 'react';
import { useWorkoutStore } from '../store/workoutStore';
import { progresoCircuito, progresoSecciones } from '../engine/circuito';
import { duracionClase, formatearReloj, obtenerArquetipo } from '../engine/clases';
import { estiloGel } from '../theme';
import { obtenerDemo } from '../engine/demos';
import CameraFeed from './CameraFeed';
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
import MascotaVirtual from './MascotaVirtual';

function AnilloRep({ fase, progresoFase = 0, color = '#4ade80', tempo = [2, 1], ritmoFantasma = 0, repsActuales = 0 }) {
  const radio = 36;
  const circunferencia = 2 * Math.PI * radio;
  const avance = Math.max(0, Math.min(1, progresoFase));
  const [transcurrido, setTranscurrido] = useState(0);

  useEffect(() => {
    if (ritmoFantasma <= 0) return;
    let anim;
    const inicio = performance.now();
    const loop = (ahora) => {
      setTranscurrido((ahora - inicio) / 1000);
      anim = requestAnimationFrame(loop);
    };
    anim = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(anim);
  }, [ritmoFantasma]);

  const avanceFantasma = ritmoFantasma > 0 ? (transcurrido * ritmoFantasma) % 1 : 0;
  const anguloFantasma = avanceFantasma * 360 - 90;
  const fantasmaX = 44 + radio * Math.cos((anguloFantasma * Math.PI) / 180);
  const fantasmaY = 44 + radio * Math.sin((anguloFantasma * Math.PI) / 180);

  const repsEsperadas = transcurrido * ritmoFantasma;
  const repsReales = repsActuales + progresoFase;
  const delta = repsReales - repsEsperadas;

  let colorOrbe = 'rgba(255, 255, 255, 0.6)';
  let claseOrbe = 'scale-100 opacity-70 transition-all duration-300';
  let radioOrbe = '4';

  if (ritmoFantasma > 0 && transcurrido > 2) {
    if (delta < 0) {
      colorOrbe = '#ef4444';
      claseOrbe = 'drop-shadow-[0_0_12px_rgba(239,68,68,1)] animate-pulse scale-125 opacity-100 transition-all duration-200';
      radioOrbe = '5.5';
    } else if (delta < 0.6) {
      colorOrbe = '#f97316';
      claseOrbe = 'drop-shadow-[0_0_10px_rgba(249,115,22,0.85)] animate-pulse scale-110 opacity-90 transition-all duration-300';
      radioOrbe = '4.5';
    }
  }

  const scale = fase === 'ABAJO' ? 1.05 : 1;
  const opacidad = fase === 'ABAJO' ? 1 : 0.6;

  return (
    <div
      className="relative drop-shadow-xl transition-all w-[clamp(5rem,18vmin,6rem)] h-[clamp(5rem,18vmin,6rem)]"
      style={{
        transform: `scale(${scale})`,
        opacity: opacidad,
        transitionDuration: `${fase === 'ABAJO' ? tempo[0] : tempo[1]}s`,
      }}
    >
      <svg viewBox="0 0 88 88" className="h-full w-full -rotate-90">
        <circle cx="44" cy="44" r={radio} fill="none" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="10" />
        <circle
          cx="44"
          cy="44"
          r={radio}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circunferencia}
          strokeDashoffset={circunferencia * (1 - avance)}
          className="transition-all duration-100 ease-linear"
        />
        {ritmoFantasma > 0 && (
          <circle
            cx={fantasmaX} cy={fantasmaY} r={radioOrbe}
            fill={colorOrbe}
            className={claseOrbe}
            style={{ transformOrigin: `${fantasmaX}px ${fantasmaY}px` }}
          />
        )}
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[clamp(10px,2.5vmin,0.75rem)] font-black uppercase tracking-widest text-white">
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
    progresoFase,
    subtitulo,
    pausado,
    pausadoPor,
    sonidosActivos,
    musicaActiva,
    avisoMusica,
    faseRepeticion,
    flashPerfecta,
    demoAbierta,
    demoEjercicio,
    togglePausa,
    setSonidosActivos,
    setMusicaActiva,
    abrirDemo,
    cerrarDemo,
    camaraHabilitada,
    setCamaraHabilitada,
    ritmoAnterior,
    advertenciaCamara,
    detenerRutina,
  } = useWorkoutStore();

  useMusica();

  if (faseActual !== 'TRABAJO' && faseActual !== 'DESCANSO' && faseActual !== 'CAMBIO_LADO') return null;

  const progreso = progresoCircuito(useWorkoutStore.getState(), claseActual);
  const seccionesProgreso = progresoSecciones(useWorkoutStore.getState(), claseActual);
  const seccionActualProgreso =
    seccionesProgreso?.find((seccion) => seccion.estado === 'actual') || null;
  const restanteSeccion = seccionActualProgreso
    ? seccionActualProgreso.duracion - seccionActualProgreso.transcurrido
    : 0;
  const totalBloques = claseActual.bloques.length;
  const siguiente = claseActual.bloques[bloqueActual + 1]?.ejercicio;

  const esCorreccion = Boolean(mensajeForma);
  const ejercicioDemo = demoEjercicio || (faseActual === 'DESCANSO' ? siguiente : ejercicioActual);
  const demoVisible = obtenerDemo(ejercicioDemo);
  const modificaciones = modificacionesEjercicio(ejercicioDemo);

  const ejercicioObjetivo = faseActual === 'DESCANSO' ? siguiente : ejercicioActual;
  const vistaOptima = ejercicioObjetivo ? EJERCICIOS_CATALOGO[ejercicioObjetivo]?.vista : null;
  const mensajeVista =
    vistaOptima === 'perfil'
      ? 'Ubica la cámara de lado (perfil)'
      : vistaOptima === 'frontal'
        ? 'Ubica la cámara de frente'
        : null;

  const esTiempo = esDeTiempo(ejercicioActual);
  const ejercicioTempo = EJERCICIOS_CATALOGO[ejercicioActual]?.tempo || [2, 1];
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
  const colorAnillo = combo >= 5 ? '#f59e0b' : gel;

  const abrirDemoActual = () => {
    abrirDemo(faseActual === 'DESCANSO' ? siguiente : ejercicioActual);
  };

  return (
    <div style={estiloGel(claseActual.arquetipo)} className="fixed inset-0 z-10 flex flex-col justify-between text-tinta-100 overflow-hidden touch-none">
      <CameraFeed />

      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-tinta-950/90 via-tinta-950/50 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 gel opacity-50 mix-blend-screen" />

      <div className="flex-shrink-0 absolute top-0 left-0 right-0 px-4 pb-2 pt-[calc(1rem+env(safe-area-inset-top))] z-20">
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
                  bloque.totalRondas > 1 ? ` — Ronda ${bloque.ronda} de ${bloque.totalRondas}` : ''
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
          <div className="mt-4 flex h-4 w-full overflow-hidden rounded-full bg-tinta-800/80 shadow-inner">
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
          <div className="h-4 w-full overflow-hidden rounded-full bg-tinta-800/80 shadow-inner">
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
            Modo sin cámara - Toca para activar
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 w-full h-full relative z-20 mt-[20dvh]">
        <p className="mb-1 text-[clamp(1.25rem,4vmin,1.5rem)] font-bold text-center leading-tight">
          {nombreEjercicio(ejercicioActual)}
        </p>

        <h1
          className={`font-black leading-none tabular-nums tracking-tighter drop-shadow-2xl text-[clamp(5rem,28vmin,130px)] ${
            faseActual === 'DESCANSO' ? 'text-aviso-400' : 'text-white'
          }`}
        >
          {tiempoRestante}
        </h1>

        {siguiente && (
          <p className="mt-2 text-[clamp(0.75rem,2.5vmin,0.875rem)] text-tinta-300">
            {faseActual === 'TRABAJO' ? 'Siguiente' : 'Sigue'}: {nombreEjercicio(siguiente)}
          </p>
        )}

        {faseActual === 'TRABAJO' ? (
          esTiempo ? (
            <div className="mt-6 flex flex-col items-center gap-3 rounded-panel bg-tinta-950/60 p-[clamp(1rem,4vmin,1.5rem)] backdrop-blur-xl border border-white/10 shadow-2xl">
              <p className="text-[clamp(1.5rem,6vmin,2.25rem)] font-black text-marca-300">{consigna.consigna}</p>
              <p className="text-[clamp(0.875rem,3vmin,1rem)] text-tinta-200">{consigna.consignaAyuda}</p>
              {scoreForma != null && (
                <span className={`rounded-md px-4 py-2 text-[clamp(1rem,3.5vmin,1.125rem)] font-black uppercase tracking-wide ${colorScore}`}>
                  Forma {scoreForma}%
                </span>
              )}
            </div>
          ) : (
            <div className="mt-6 flex w-full max-w-sm items-center justify-between gap-4 rounded-panel bg-tinta-950/70 p-[clamp(1rem,4vmin,1.5rem)] backdrop-blur-xl border-2 border-white/10 relative shadow-2xl">
              <div className="flex flex-col items-start gap-1">
                <div className="flex items-baseline gap-2">
                  <p className="font-black text-white tabular-nums tracking-tighter leading-none text-[clamp(3.5rem,15vmin,6rem)]">
                    {repeticiones}
                  </p>
                  <span className="text-[clamp(0.8rem,3vmin,1.25rem)] font-bold text-tinta-400 uppercase tracking-widest">Reps</span>
                </div>
                {scoreForma != null && (
                  <span className={`px-2 py-1 rounded-md text-[clamp(10px,2.5vmin,14px)] font-black uppercase tracking-wider ${colorScore}`}>
                    Forma {scoreForma}%
                  </span>
                )}
              </div>

              <div className="flex flex-col items-center gap-2 shrink-0 relative">
                <div className="absolute -top-[clamp(4.5rem,15vmin,5.5rem)] z-50">
                  <MascotaVirtual racha={3} />
                </div>

                <AnilloRep fase={faseRepeticion} progresoFase={progresoFase} color={colorAnillo} tempo={ejercicioTempo} ritmoFantasma={ritmoAnterior} repsActuales={repeticiones} />

                {combo >= 3 && (
                  <span className="rounded-chip bg-racha-500 px-[clamp(0.5rem,2vmin,0.75rem)] py-[clamp(0.25rem,1vmin,0.375rem)] text-[clamp(9px,2vmin,12px)] font-black text-black shadow-foco">
                    {combo >= 5 ? <Icono nombre="fuego" tamano={12} className="inline" /> : null}
                    {combo >= 5 ? ' ON FIRE' : `x${combo} COMBO`}
                  </span>
                )}

                {flashPerfecta > 0 && (
                  <span
                    key={flashPerfecta}
                    className="perfecta-flash rounded-chip bg-marca-400 px-[clamp(0.5rem,2vmin,0.75rem)] py-[clamp(0.25rem,1vmin,0.375rem)] text-[clamp(9px,2vmin,12px)] font-black text-black shadow-foco absolute bottom-[-1.5rem]"
                  >
                    ¡PERFECTA!
                  </span>
                )}
              </div>
            </div>
          )
        ) : faseActual === 'CAMBIO_LADO' ? (
          <div className="mt-6 flex flex-col items-center">
            <p className="text-[clamp(1.5rem,6vmin,2.25rem)] font-black text-marca-400 drop-shadow-lg tracking-widest uppercase">¡Cambio de lado!</p>
          </div>
        ) : (
          <div className="mt-6 flex flex-col items-center">
            <p className="text-[clamp(1.5rem,6vmin,2.25rem)] font-black text-aviso-400 drop-shadow-lg tracking-widest uppercase">¡Descansa!</p>
          </div>
        )}

        {mensajeForma && (
          <div className="absolute top-[6dvh] left-1/2 -translate-x-1/2 w-11/12 max-w-sm z-40 animate-pulse pointer-events-none">
            <p className="rounded-panel px-5 py-3 text-center text-[clamp(0.875rem,3.5vmin,1.125rem)] font-black shadow-flotante border-2 border-aviso-400 bg-aviso-500/95 text-black">
              <Icono nombre="alerta" tamano={20} className="inline-block mr-2 -mt-1" />
              {mensajeForma}
            </p>
          </div>
        )}

        {advertenciaCamara === 'faltaPose' && camaraHabilitada && !pausado && (
          <div className="absolute top-[12dvh] left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 rounded-full bg-error-500/90 px-4 py-2 text-white shadow-flotante animate-pulse pointer-events-none">
            <Icono nombre="camara" tamano={18} />
            <span className="text-xs font-bold">No te veo. Ajusta el encuadre.</span>
          </div>
        )}

        {advertenciaCamara === 'orientacion' && camaraHabilitada && !pausado && (
          <div className="absolute top-[18dvh] left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 rounded-full bg-aviso-500/90 px-4 py-2 text-black shadow-flotante animate-pulse pointer-events-none">
            <Icono nombre="alerta" tamano={18} />
            <span className="text-xs font-bold">Ponte de {vistaOptima === 'perfil' ? 'lado' : 'frente'}.</span>
          </div>
        )}

        {esCorreccion && (
          <div className="pointer-events-none absolute inset-0 z-30 shadow-[inset_0_0_120px_rgba(248,113,113,0.5)] animate-pulse" />
        )}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-tinta-950/95 via-tinta-950/70 to-transparent z-10" />

      <div className="flex-shrink-0 relative z-30 flex items-center gap-2 px-3 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4">
        <button
          onClick={togglePausa}
          className="flex min-h-14 flex-1 items-center justify-center gap-2 rounded-ficha bg-marca-500 px-4 text-lg font-black text-black transition hover:bg-marca-400 shadow-flotante focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta-100"
        >
          <Icono nombre={pausado ? 'reproducir' : 'pausa'} tamano={22} />
          {pausado ? 'Seguir' : 'Pausa'}
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => setSonidosActivos(!sonidosActivos)}
            aria-pressed={sonidosActivos}
            aria-label={sonidosActivos ? 'Silenciar efectos' : 'Activar efectos'}
            title={sonidosActivos ? 'Silenciar efectos' : 'Activar efectos'}
            className={`flex h-14 w-14 items-center justify-center rounded-boton border border-white/10 backdrop-blur-md transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta-100 ${
              sonidosActivos ? 'bg-marca-500/20 text-marca-300' : 'bg-tinta-950/80 text-tinta-500'
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
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-4 overflow-y-auto bg-tinta-950/85 px-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-[calc(1.5rem+env(safe-area-inset-top))] text-center">
          <p className="text-6xl font-black">PAUSA</p>
          <p className="text-xl text-tinta-200">Respira. Sigue cuando estés listo.</p>
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
          <button
            type="button"
            onClick={detenerRutina}
            className="mt-6 min-h-11 rounded-boton border border-error-500/40 bg-error-500/10 px-6 text-sm font-bold text-error-400 transition hover:bg-error-500/20"
          >
            Abortar clase
          </button>
        </div>
      )}

      {demoAbierta && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-3 overflow-y-auto bg-tinta-950/95 px-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-[calc(1.5rem+env(safe-area-inset-top))] text-center">
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
