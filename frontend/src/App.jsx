import React, { useCallback, useEffect, useRef, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { useWorkoutStore } from './store/workoutStore';
import { calcularTotal } from './engine/score';
import { CLASES, duracionClase, formatearDuracion, resumenSecciones } from './engine/clases';
import { nombreEjercicio } from './engine/ejercicios';
import { cargarPlan, claseParaFecha, guardarPlan as persistirPlan } from './engine/plan';
import CameraFeed from './components/CameraFeed';
import WorkoutUI from './components/WorkoutUI';
import SummaryScreen from './components/SummaryScreen';
import LoginScreen from './components/LoginScreen';
import PlanSemanal from './components/PlanSemanal';
import { useEntrenadorVoz } from './hooks/useEntrenadorVoz';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resumen, setResumen] = useState(null);
  const [resumenActual, setResumenActual] = useState(null);
  const [verDetalle, setVerDetalle] = useState(false);
  const [plan, setPlan] = useState(() => cargarPlan(undefined, auth.currentUser?.uid));
  const faseActual = useWorkoutStore((state) => state.faseActual);
  const iniciarRutina = useWorkoutStore((state) => state.iniciarRutina);
  const claseActual = useWorkoutStore((state) => state.claseActual);
  const claseSeleccionadaId = useWorkoutStore((state) => state.claseSeleccionadaId);
  const resumenClase = resumenSecciones(claseActual);
  const seleccionarClase = useWorkoutStore((state) => state.seleccionarClase);
  const enviadoRef = useRef(false);

  useEntrenadorVoz(resumenActual);

  const cargarResumen = useCallback(async () => {
    const actual = auth.currentUser;
    if (!actual) return;
    try {
      const token = await actual.getIdToken();
      const res = await fetch('/api/v1/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.resumen) setResumen(data.resumen);
    } catch (err) {
      console.error('No se pudo cargar el progreso:', err);
    }
  }, []);

  useEffect(() => {
    if (user) cargarResumen();
  }, [user, cargarResumen]);

  useEffect(() => {
    if (faseActual === 'TRABAJO' || faseActual === 'CALIBRACION') {
      setResumenActual(null);
    }
  }, [faseActual]);

  useEffect(() => {
    if (faseActual !== 'CALIBRACION') return;
    const clase = claseParaFecha(plan);
    if (clase) seleccionarClase(clase.id);
  }, [plan, faseActual, seleccionarClase]);

  useEffect(() => {
    if (!user) return;
    setPlan(cargarPlan(undefined, user.uid));
  }, [user]);

  const guardarPlanSemanal = useCallback(
    (nuevo) => {
      setPlan(persistirPlan(nuevo, undefined, user?.uid));
    },
    [user]
  );

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (faseActual !== 'FIN') {
      enviadoRef.current = false;
      return;
    }
    if (!user || enviadoRef.current) return;

    enviadoRef.current = true;
    const estado = useWorkoutStore.getState();
    const total = calcularTotal(estado.totales);

    auth.currentUser
      .getIdToken()
      .then((token) =>
        fetch('/api/v1/workout/finish', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            score: total,
            total_reps: total,
            perfectas: estado.perfectas,
            mejor_combo: estado.mejorCombo,
            duracion_sec: duracionClase(estado.claseActual),
            clase_id: estado.claseActual.id,
            clase_nombre: estado.claseActual.nombre,
          }),
        })
      )
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.resumen) {
          setResumen(data.resumen);
          setResumenActual(data.resumen);
        }
      })
      .catch((err) => {
        console.error('No se pudo guardar el entrenamiento:', err);
      });
  }, [faseActual, user]);

  if (loading) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center text-white text-2xl">
        Cargando...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="relative w-full h-screen bg-black overflow-hidden">
        <LoginScreen />
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <CameraFeed />
      {faseActual === 'CALIBRACION' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10 px-6 text-center">
          <p className="text-xl mb-1 text-gray-300">Hola, {user.displayName}</p>
          {resumen && (
            <div className="mt-1 flex flex-col items-center">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide">
                <span className="rounded-full bg-orange-500/20 px-3 py-1 text-orange-300">
                  Racha {resumen.racha} {resumen.racha === 1 ? 'día' : 'días'}
                </span>
                <span className="rounded-full bg-green-500/20 px-3 py-1 text-green-300">
                  Semana {resumen.dias_semana}/{resumen.meta_semanal}
                </span>
              </div>
              <div className="mt-2 flex gap-2">
                {resumen.semana.map((dia) => (
                  <div key={dia.fecha} className="flex flex-col items-center gap-1" title={dia.fecha}>
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        dia.hecha ? 'bg-green-400' : 'bg-white/20'
                      } ${dia.hoy ? 'ring-2 ring-white/70' : ''}`}
                    />
                    <span
                      className={`text-[9px] font-bold ${
                        dia.hoy ? 'text-white' : 'text-white/40'
                      }`}
                    >
                      {dia.etiqueta}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <PlanSemanal plan={plan} resumen={resumen} onGuardar={guardarPlanSemanal} />

          <p className="mt-3 text-lg font-semibold">Elige tu clase</p>

          <div className="mt-3 flex w-full max-w-md snap-x gap-2 overflow-x-auto pb-1">
            {CLASES.map((clase) => {
              const activa = clase.id === claseSeleccionadaId;
              return (
                <button
                  key={clase.id}
                  onClick={() => seleccionarClase(clase.id)}
                  className={`min-w-[108px] shrink-0 snap-start rounded-lg border-2 p-2 text-left transition ${
                    activa
                      ? 'border-green-400 bg-green-500/20'
                      : 'border-white/20 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <span className="block text-sm font-black leading-tight">
                    {clase.nombre}
                  </span>
                  <span className="mt-1 block text-[11px] text-white/70">
                    {formatearDuracion(duracionClase(clase))}
                  </span>
                  <span className="block text-[11px] text-white/50">
                    {clase.formato === 'completa' ? 'Completa' : 'Exprés'} · {clase.nivel}
                    {clase.equipamiento
                      ? ` · ${clase.equipamiento === 'ninguno' ? 'Sin equipo' : clase.equipamiento}`
                      : ''}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-3 w-full max-w-md rounded-xl border border-white/10 bg-white/5 p-3 text-left">
            <p className="text-xs font-bold text-green-400">Antes de empezar</p>
            <p className="mt-1 text-base font-black text-white">{claseActual.nombre}</p>
            <p className="text-sm text-white/70">{claseActual.descripcion}</p>
            <p className="mt-1 text-xs text-white/60">
              {claseActual.formato === 'completa' ? 'Clase completa' : 'Exprés'} ·{' '}
              {claseActual.nivel} · {formatearDuracion(duracionClase(claseActual))} ·{' '}
              {claseActual.equipamiento
                ? claseActual.equipamiento === 'ninguno'
                  ? 'Sin equipo'
                  : claseActual.equipamiento
                : 'No requiere equipo'}
            </p>
            {resumenClase && (
              <p className="mt-1 text-xs text-white/60">
                Movimientos clave:{' '}
                {[...new Set(resumenClase.flatMap((seccion) => seccion.ejercicios))]
                  .slice(0, 6)
                  .map(nombreEjercicio)
                  .join(' · ')}
              </p>
            )}
            <p className="mt-1 text-xs text-white/60">
              Si te cuesta: apóyate en una silla o una pared, o haz menos repeticiones.
            </p>
            <button
              type="button"
              onClick={() => setVerDetalle(!verDetalle)}
              aria-expanded={verDetalle}
              className="mt-1 min-h-11 text-sm font-bold text-green-300 underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {verDetalle ? 'Ocultar el detalle de la clase' : 'Ver el detalle de la clase'}
            </button>

            {verDetalle && (
              <div className="mt-1 space-y-2 border-t border-white/10 pt-2">
                {resumenClase ? (
                  <>
                    {resumenClase.map((seccion, i) => (
                      <div key={seccion.id}>
                        <p className="text-sm font-bold text-white">
                          {i + 1}. {seccion.nombre} · {formatearDuracion(seccion.duracion)}
                          {seccion.rondas > 1 ? ` · ${seccion.rondas} rondas` : ''}
                        </p>
                        <p className="text-xs text-white/60">
                          {seccion.ejercicios.map(nombreEjercicio).join(' · ')}
                        </p>
                      </div>
                    ))}
                    <p className="text-xs text-white/50">
                      {claseActual.bloques.length} ejercicios en {claseActual.secciones.length}{' '}
                      secciones
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-white/60">
                    {claseActual.bloques.length} ejercicios:{' '}
                    {claseActual.bloques
                      .map((bloque) => nombreEjercicio(bloque.ejercicio))
                      .join(' · ')}
                  </p>
                )}
              </div>
            )}
          </div>

          <p className="mt-2 max-w-md text-xs text-white/50">
            El entrenador te guía por voz y te corrige la postura. Toca la demo para verla en
            grande.
          </p>

          <button
            onClick={() => iniciarRutina(claseSeleccionadaId)}
            className="mt-4 min-h-14 w-full max-w-md rounded-2xl bg-green-500 px-8 text-2xl font-black text-black transition hover:bg-green-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Empezar clase
          </button>
        </div>
      )}
      <WorkoutUI />
      <SummaryScreen resumen={resumenActual} />
    </div>
  );
}
