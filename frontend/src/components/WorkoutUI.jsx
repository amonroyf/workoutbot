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
      className="relative drop-shadow-xl transition-all w-24 h-24 sm:w-28 sm:h-28"
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
            cx={fantasmaX}
            cy={fantasmaY}
            r={radioOrbe}
            fill={colorOrbe}
            className={claseOrbe}
            style={{ transformOrigin: `${fantasmaX}px ${fantasmaY}px` }}
          />
        )}
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-black uppercase tracking-widest text-white">
        {fase}
      </span>
    </div>
  );
}

export default function WorkoutUI() {
  // SELECTORES ATÓMICOS PARA EVITAR RE-RENDERS MASIVOS A 60FPS
  const faseActual = useWorkoutStore((s) => s.faseActual);
  const tiempoRestante = useWorkoutStore((s) => s.tiempoRestante);
  const repeticiones = useWorkoutStore((s) => s.repeticiones);
  const combo = useWorkoutStore((s) => s.combo);
  const claseActual = useWorkoutStore((s) => s.claseActual);
  const bloqueActual = useWorkoutStore((s) => s.bloqueActual);
  const ejercicioActual = useWorkoutStore((s) => s.ejercicioActual);
  const mensajeForma = useWorkoutStore((s) => s.mensajeForma);
  const scoreForma = useWorkoutStore((s) => s.scoreForma);
  const progresoFase = useWorkoutStore((s) => s.progresoFase);
  const pausado = useWorkoutStore((s) => s.pausado);
  const pausadoPor = useWorkoutStore((s) => s.pausadoPor);
  const sonidosActivos = useWorkoutStore((s) => s.sonidosActivos);
  const musicaActiva = useWorkoutStore((s) => s.musicaActiva);
  const avisoMusica = useWorkoutStore((s) => s.avisoMusica);
  const faseRepeticion = useWorkoutStore((s) => s.faseRepeticion);
  const flashPerfecta = useWorkoutStore((s) => s.flashPerfecta);
  const demoAbierta = useWorkoutStore((s) => s.demoAbierta);
  const demoEjercicio = useWorkoutStore((s) => s.demoEjercicio);
  const camaraHabilitada = useWorkoutStore((s) => s.camaraHabilitada);
  const ritmoAnterior = useWorkoutStore((s) => s.ritmoAnterior);
  const advertenciaCamara = useWorkoutStore((s) => s.advertenciaCamara);
  
  // Acciones (No causan re-render per se)
  const togglePausa = useWorkoutStore((s) => s.togglePausa);
  const setSonidosActivos = useWorkoutStore((s) => s.setSonidosActivos);
  const setMusicaActiva = useWorkoutStore((s) => s.setMusicaActiva);
  const abrirDemo = useWorkoutStore((s) => s.abrirDemo);
  const cerrarDemo = useWorkoutStore((s) => s.cerrarDemo);
  const setCamaraHabilitada = useWorkoutStore((s) => s.setCamaraHabilitada);
  const detenerRutina = useWorkoutStore((s) => s.detenerRutina);

  useMusica();

  if (faseActual !== 'TRABAJO' && faseActual !== 'DESCANSO' && faseActual !== 'CAMBIO_LADO') return null;

  const progreso = progresoCircuito(useWorkoutStore.getState(), claseActual);
  const seccionesProgreso = progresoSecciones(useWorkoutStore.getState(), claseActual);
  const seccionActualProgreso = seccionesProgreso?.find((seccion) => seccion.estado === 'actual') || null;
  const restanteSeccion = seccionActualProgreso ? seccionActualProgreso.duracion - seccionActualProgreso.transcurrido : 0;
  const totalBloques = claseActual.bloques.length;
  const siguiente = claseActual.bloques[bloqueActual + 1]?.ejercicio;

  const esCorreccion = Boolean(mensajeForma);
  const ejercicioDemo = demoEjercicio || (faseActual === 'DESCANSO' ? siguiente : ejercicioActual);
  const demoVisible = obtenerDemo(ejercicioDemo);
  const modificaciones = modificacionesEjercicio(ejercicioDemo);

  const ejercicioObjetivo = faseActual === 'DESCANSO' ? siguiente : ejercicioActual;
  const vistaOptima = ejercicioObjetivo ? EJERCICIOS_CATALOGO[ejercicioObjetivo]?.vista : null;
  
  const esTiempo = esDeTiempo(ejercicioActual);
  const ejercicioTempo = EJERCICIOS_CATALOGO[ejercicioActual]?.tempo || [2, 1];
  const consigna = consignaEjercicio(ejercicioActual);

  const bloque = claseActual.bloques?.[bloqueActual] || null;
  const esCompleta = Boolean(bloque?.seccionNombre);

  const arquetipo = obtenerArquetipo(claseActual.arquetipo);
  const gel = arquetipo?.color || '#ff6a2b';
  const colorAnillo = combo >= 5 ? '#f59e0b' : gel;

  const abrirDemoActual = (e) => {
    e.stopPropagation();
    abrirDemo(faseActual === 'DESCANSO' ? siguiente : ejercicioActual);
  };

  const handleAreaTacticaClick = () => {
    if (!demoAbierta) togglePausa();
  };

  return (
    <div style={estiloGel(claseActual.arquetipo)} className="fixed inset-0 z-10 flex flex-col text-tinta-100 overflow-hidden touch-none font-sans bg-fondo">
      
      {/* CÁMARA DE FONDO INMERSIVA */}
      <div className="absolute inset-0 z-0">
        <CameraFeed />
      </div>

      {/* SCRIMS CINEMATOGRÁFICOS */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-tinta-950 via-tinta-950/50 to-transparent z-0" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-tinta-950 via-tinta-950/70 to-transparent z-0" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 gel opacity-30 mix-blend-screen z-0" />

      {/* ZONA SUPERIOR: Progreso ultra limpio */}
      <div className="absolute top-0 left-0 right-0 px-4 pt-[calc(1rem+env(safe-area-inset-top))] z-20">
        <div className="flex items-center justify-between text-xs font-bold tracking-wide">
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full shadow-resplandor-exito ${faseActual === 'TRABAJO' ? 'bg-marca-400' : 'bg-aviso-400 animate-pulse'}`} />
            <span className="text-tinta-100 uppercase tracking-widest drop-shadow-md">{faseActual === 'TRABAJO' ? 'Trabajo' : 'Descanso'}</span>
          </div>
          <span className="tabular-nums text-tinta-100 drop-shadow-md">
            {esCompleta ? formatearReloj(restanteSeccion) : `${Math.round(progreso * 100)}%`}
          </span>
        </div>
        
        {seccionesProgreso ? (
          <div className="mt-3 flex h-1.5 w-full overflow-hidden rounded-full bg-tinta-900/80 backdrop-blur-sm shadow-inner">
            {seccionesProgreso.map((seccion) => {
              const ancho = (seccion.duracion / duracionClase(claseActual)) * 100;
              const avance = seccion.duracion > 0 ? seccion.transcurrido / seccion.duracion : 0;
              const activa = seccion.estado === 'actual';
              const completada = seccion.estado === 'completado';
              return (
                <div key={seccion.id} className="relative h-full border-r border-tinta-950" style={{ width: `${ancho}%` }}>
                  <div className="h-full" style={{ backgroundColor: activa || completada ? gel : 'transparent' }} />
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
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-tinta-900/80 backdrop-blur-sm shadow-inner">
            <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progreso * 100}%`, backgroundColor: gel }} />
          </div>
        )}

        <div className="mt-2 text-center text-sm font-semibold text-tinta-200 drop-shadow-md">
          {esCompleta ? `${bloque.seccionNombre} ${bloque.totalRondas > 1 ? `(${bloque.ronda}/${bloque.totalRondas})` : ''}` : `Ejercicio ${bloqueActual + 1} de ${totalBloques}`}
        </div>
        
        <div className="opacity-70 mt-1">
           <MapaCircuito />
        </div>
      </div>

      {/* ZONA CENTRAL: "HUD" Táctil. Clickeable para pausar */}
      <div 
        className="flex-1 flex flex-col items-center justify-center w-full z-10 cursor-pointer pt-[10dvh]"
        onClick={handleAreaTacticaClick}
      >
        <p className="mb-2 text-2xl md:text-3xl font-bold tracking-tight text-center text-white drop-shadow-md">
          {nombreEjercicio(ejercicioActual)}
        </p>

        {/* NÚMERO COLOSAL (Tiempo) */}
        <h1 className={`fuente-display font-black leading-none tabular-nums tracking-tighter drop-shadow-2xl text-[clamp(7rem,35vmin,200px)] ${faseActual === 'DESCANSO' ? 'text-aviso-400' : 'text-white'}`}>
          {tiempoRestante}
        </h1>

        {siguiente && (
          <p className="mt-2 text-sm md:text-base font-medium text-tinta-300 uppercase tracking-widest drop-shadow-md bg-tinta-900/40 px-4 py-1 rounded-full backdrop-blur-sm border border-white/10">
            Sigue: <span className="text-white">{nombreEjercicio(siguiente)}</span>
          </p>
        )}

        {/* FEEDBACK Y MÉTRICAS (Reps & Anillo) */}
        {faseActual === 'TRABAJO' && !esTiempo && (
          <div className="mt-8 flex items-center justify-center gap-6 pointer-events-none">
            
            <div className="flex flex-col items-end">
              <span className="text-sm font-bold text-tinta-300 uppercase tracking-widest drop-shadow-md">Reps</span>
              <p className="fuente-display font-black text-white text-6xl md:text-7xl tabular-nums leading-none shadow-flotante drop-shadow-lg">
                {repeticiones}
              </p>
            </div>
            
            <div className="relative shrink-0 flex items-center justify-center">
              <AnilloRep fase={faseRepeticion} progresoFase={progresoFase} color={colorAnillo} tempo={ejercicioTempo} ritmoFantasma={ritmoAnterior} repsActuales={repeticiones} />
              
              {combo >= 3 && (
                <span className="absolute -bottom-6 whitespace-nowrap rounded-chip bg-racha-500 px-3 py-1 text-xs font-black text-black shadow-foco">
                  {combo >= 5 ? <Icono nombre="fuego" tamano={12} className="inline" /> : null}
                  {combo >= 5 ? ' ON FIRE' : `x${combo} COMBO`}
                </span>
              )}

              {flashPerfecta > 0 && (
                <span key={flashPerfecta} className="perfecta-flash absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-black text-exito-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.9)] z-50">
                  ¡PERFECTA!
                </span>
              )}
            </div>

          </div>
        )}
        
        {faseActual === 'TRABAJO' && esTiempo && (
            <div className="mt-8 pointer-events-none text-center">
                 <p className="text-2xl md:text-3xl font-black text-marca-400 drop-shadow-md uppercase tracking-wider">{consigna.consigna}</p>
                 <p className="text-sm md:text-base text-tinta-200 drop-shadow-md mt-1">{consigna.consignaAyuda}</p>
            </div>
        )}

        {/* FEEDBACK DE POSTURA ESTRICTO (El "Espejo" en Rojo) */}
        {mensajeForma && (
          <div className="absolute top-[35dvh] left-1/2 -translate-x-1/2 w-11/12 max-w-md z-40 animate-pulse pointer-events-none">
            <p className="rounded-panel px-6 py-4 text-center text-lg md:text-xl font-black text-white border-2 border-error-500 bg-error-600/95 shadow-resplandor-error backdrop-blur-md">
              {mensajeForma.toUpperCase()}
            </p>
          </div>
        )}

        {/* ALERTAS DE CÁMARA */}
        {advertenciaCamara === 'faltaPose' && camaraHabilitada && !pausado && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 rounded-full bg-error-500/95 px-5 py-3 text-white shadow-resplandor-error animate-pulse pointer-events-none">
            <Icono nombre="camara" tamano={20} />
            <span className="text-sm font-bold tracking-wide">NO TE VEO. AJUSTA LA CÁMARA.</span>
          </div>
        )}

        {advertenciaCamara === 'orientacion' && camaraHabilitada && !pausado && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 rounded-full bg-aviso-500/95 px-5 py-3 text-black shadow-flotante animate-pulse pointer-events-none">
            <Icono nombre="alerta" tamano={20} />
            <span className="text-sm font-bold tracking-wide">PONTE DE {vistaOptima === 'perfil' ? 'LADO' : 'FRENTE'}</span>
          </div>
        )}

        {/* VIÑETA ROJA SANGRE (Inmersión de error) */}
        {esCorreccion && (
          <div className="pointer-events-none absolute inset-0 z-0 shadow-[inset_0_0_150px_rgba(220,38,38,0.4)] animate-pulse mix-blend-screen" />
        )}
      </div>

      {/* BOTÓN FLOTANTE DE DEMO */}
      <button
        type="button"
        onClick={abrirDemoActual}
        aria-label={`Ver demostración de ${nombreEjercicio(ejercicioDemo)}`}
        className="absolute bottom-[calc(7rem+env(safe-area-inset-bottom))] right-4 z-30 flex flex-col items-center rounded-ficha border border-white/20 bg-tinta-950/70 p-2 backdrop-blur-xl transition hover:bg-tinta-900 shadow-flotante"
      >
        <DemoEjercicio ejercicio={ejercicioDemo} pequena />
        <span className="mt-1 text-[10px] font-bold text-tinta-300 uppercase tracking-wider">
          Técnica
        </span>
      </button>

      {/* ZONA INFERIOR: Controles Minimalistas */}
      <div className="flex-shrink-0 relative z-30 flex items-center justify-between px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-4">
        
        {/* Play/Pause Secundario */}
        <button
          onClick={togglePausa}
          className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-tinta-950/70 backdrop-blur-xl transition hover:bg-tinta-900 text-white shadow-flotante"
        >
          <Icono nombre={pausado ? 'reproducir' : 'pausa'} tamano={24} />
        </button>

        {/* Controles de Audio */}
        <div className="flex gap-3">
          <button
            onClick={() => setSonidosActivos(!sonidosActivos)}
            className={`flex h-14 w-14 items-center justify-center rounded-full border border-white/20 backdrop-blur-xl transition shadow-flotante ${
              sonidosActivos ? 'bg-marca-500/40 text-marca-300 border-marca-500/50' : 'bg-tinta-950/70 text-tinta-400'
            }`}
          >
            <Icono nombre="voz" tamano={22} />
          </button>
          <button
            onClick={() => setMusicaActiva(!musicaActiva)}
            className={`flex h-14 w-14 items-center justify-center rounded-full border border-white/20 backdrop-blur-xl transition shadow-flotante ${
              musicaActiva ? 'bg-marca-500/40 text-marca-300 border-marca-500/50' : 'bg-tinta-950/70 text-tinta-400'
            }`}
          >
            <Icono nombre="musica" tamano={22} />
          </button>
        </div>
      </div>

      {/* OVERLAYS A PANTALLA COMPLETA (Demo / Pausa) */}
      {pausado && !demoAbierta && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-6 overflow-y-auto bg-tinta-950/90 backdrop-blur-lg px-6 py-12 text-center text-white">
          <h2 className="fuente-display text-7xl font-black tracking-tighter">PAUSA</h2>
          <p className="text-lg text-tinta-300 max-w-xs">Toca la pantalla o presiona el botón para continuar sudando.</p>
          
          <button
            onClick={togglePausa}
            className="mt-4 rounded-ficha bg-marca-500 px-12 py-4 text-2xl font-black text-black shadow-[0_0_30px_rgba(255,106,43,0.5)] transition hover:scale-105"
          >
            Seguir
          </button>
          
          {pausadoPor === 'faltaPose' && (
            <button
              onClick={() => setCamaraHabilitada(false)}
              className="mt-4 text-sm font-bold text-aviso-400 hover:text-aviso-300 underline underline-offset-4 transition"
            >
              Continuar sin cámara
            </button>
          )}

          <button
            onClick={detenerRutina}
            className="absolute top-[env(safe-area-inset-top)] left-4 p-4 text-sm font-bold text-tinta-400 hover:text-white transition flex items-center gap-2"
          >
            <Icono nombre="cerrar" tamano={16} /> Finalizar
          </button>
        </div>
      )}

      {demoAbierta && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-4 overflow-y-auto bg-tinta-950/95 backdrop-blur-xl px-6 py-8 text-center text-white">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-marca-400">Técnica Correcta</p>
          <h2 className="fuente-display text-4xl font-black">{demoVisible.nombre}</h2>
          
          <div className="w-full max-w-sm aspect-square bg-tinta-900/60 rounded-ficha border border-white/10 p-2 shadow-flotante">
             <DemoEjercicio ejercicio={ejercicioDemo} />
          </div>

          <ul className="space-y-2 mt-4 max-w-sm">
            {demoVisible.pistas.map((pista, i) => (
              <li key={i} className="text-base md:text-lg font-medium text-tinta-200">{pista}</li>
            ))}
          </ul>

          <div className="mt-4 flex flex-col gap-2 text-sm text-left bg-tinta-900/60 p-5 rounded-panel border border-white/10 max-w-sm w-full">
            <p><span className="font-black text-marca-400">FÁCIL:</span> {modificaciones.facil}</p>
            <p><span className="font-black text-aviso-400">DIFÍCIL:</span> {modificaciones.fuerte}</p>
          </div>

          <button
            onClick={cerrarDemo}
            className="mt-6 rounded-boton bg-marca-500 px-10 py-4 text-lg font-black text-black shadow-flotante hover:bg-marca-400 transition"
          >
            Entendido, a darle
          </button>
        </div>
      )}
    </div>
  );
}
