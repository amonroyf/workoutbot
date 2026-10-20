import React, { useCallback, useEffect, useRef, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { useWorkoutStore } from './store/workoutStore';
import { calcularTotal } from './engine/score';
import { CLASES, duracionClase, formatearDuracion, resumenSecciones } from './engine/clases';
import { nombreEjercicio } from './engine/ejercicios';
import { cargarPlan, claseParaFecha, guardarPlan as persistirPlan } from './engine/plan';
import { esPrimeraVez, guiaVista, marcarGuiaVista } from './engine/primeraVez';
import CameraFeed from './components/CameraFeed';
import WorkoutUI from './components/WorkoutUI';
import SummaryScreen from './components/SummaryScreen';
import LoginScreen from './components/LoginScreen';
import PlanSemanal from './components/PlanSemanal';
import GuiaPrimeraVez from './components/GuiaPrimeraVez';
import { Esqueleto, EsqueletoTarjeta } from './components/Esqueleto';
import Icono from './components/Icono';
import { useEntrenadorVoz } from './hooks/useEntrenadorVoz';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resumen, setResumen] = useState(null);
  const [resumenActual, setResumenActual] = useState(null);
  const [verDetalle, setVerDetalle] = useState(false);
  const [cargandoResumen, setCargandoResumen] = useState(false);
  const [guiaVisible, setGuiaVisible] = useState(() => !guiaVista());
  const [plan, setPlan] = useState(() => cargarPlan(undefined, auth.currentUser?.uid));
  const faseActual = useWorkoutStore((state) => state.faseActual);
  const iniciarRutina = useWorkoutStore((state) => state.iniciarRutina);
  const claseActual = useWorkoutStore((state) => state.claseActual);
  const claseSeleccionadaId = useWorkoutStore((state) => state.claseSeleccionadaId);
  const errorCamara = useWorkoutStore((state) => state.errorCamara);
  const camaraActiva = useWorkoutStore((state) => state.camaraActiva);
  const reintentoCamara = useWorkoutStore((state) => state.reintentoCamara);
  const setReintentoCamara = useWorkoutStore((state) => state.setReintentoCamara);
  const resumenClase = resumenSecciones(claseActual);
  const seleccionarClase = useWorkoutStore((state) => state.seleccionarClase);
  const enviadoRef = useRef(false);

  useEntrenadorVoz(resumenActual);

  const cargarResumen = useCallback(async () => {
    const actual = auth.currentUser;
    if (!actual) return;
    setCargandoResumen(true);
    try {
      const token = await actual.getToken();
      const res = await fetch('/api/v1/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.resumen) setResumen(data.resumen);
    } catch (err) {
      console.error('No se pudo cargar el progreso:', err);
    } finally {
      setCargandoResumen(false);
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
    setCargandoResumen(true);
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
      })
      .finally(() => setCargandoResumen(false));
  }, [faseActual, user]);

  if (loading) {
    return (
      <div className="flex h-dvh w-full items-center justify-center bg-fondo text-2xl text-tinta-100">
        Cargando...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="relative h-dvh w-full overflow-hidden bg-fondo">
        <LoginScreen />
      </div>
    );
  }

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-fondo">
      <CameraFeed />
      {faseActual === 'CALIBRACION' && (
        <>
          <div className="pointer-events-none absolute inset-0 z-[5] bg-gradient-to-b from-fondo/80 via-fondo/50 to-fondo/85" />
          <div className="absolute inset-0 z-10 flex flex-col items-center overflow-y-auto overscroll-contain px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-[calc(1.5rem+env(safe-area-inset-top))] text-center text-tinta-100">
          <p className="text-xl mb-1 text-tinta-300">Hola, {user.displayName}</p>
          {errorCamara && (
            <div className="mt-2 flex w-full max-w-md items-start gap-2 rounded-panel border border-error-500/40 bg-tinta-900/90 p-3 text-left">
              <Icono nombre="alerta" tamano={16} className="mt-0.5 shrink-0 text-error-300" />
              <p className="flex-1 text-xs text-tinta-200">{errorCamara}</p>
              <button
                type="button"
                onClick={() => setReintentoCamara(reintentoCamara + 1)}
                className="flex min-h-9 shrink-0 items-center gap-1 rounded-boton bg-marca-500 px-3 text-xs font-bold text-black transition hover:bg-marca-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta-100"
              >
                <Icono nombre="reproducir" tamano={14} />
                Reintentar
              </button>
            </div>
          )}
          {!camaraActiva && !errorCamara && (
            <div className="mt-2 flex w-full max-w-md items-center gap-2 rounded-panel border border-linea bg-tinta-900/80 p-3 text-left text-xs text-tinta-300">
              <Icono nombre="camara" tamano={16} className="text-marca-400" />
              Activando cámara
              <Esqueleto className="h-2 w-12" redondeado="rounded-chip" />
            </div>
          )}
          {cargandoResumen && !resumen && (
            <div className="mt-2 flex items-center gap-2">
              <Esqueleto className="h-7 w-24" redondeado="rounded-chip" />
              <Esqueleto className="h-7 w-24" redondeado="rounded-chip" />
            </div>
          )}
          {resumen && (
            <div className="mt-1 flex flex-col items-center">
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="flex items-center gap-1 rounded-chip bg-racha-500/20 px-3 py-1 text-racha-300">
                  <Icono nombre="fuego" tamano={14} />
                  Racha {resumen.racha} {resumen.racha === 1 ? 'día' : 'días'}
                </span>
                <span className="flex items-center gap-1 rounded-chip bg-marca-500/20 px-3 py-1 text-marca-300">
                  <Icono nombre="check" tamano={14} />
                  Semana {resumen.dias_semana}/{resumen.meta_semanal}
                </span>
              </div>
              <div className="mt-2 flex gap-2">
                {resumen.semana.map((dia) => (
                  <div key={dia.fecha} className="flex flex-col items-center gap-1" title={dia.fecha}>
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        dia.hecha ? 'bg-marca-400' : 'bg-tinta-700'
                      } ${dia.hoy ? 'ring-2 ring-tinta-100' : ''}`}
                    />
                    <span
                      className={`text-[10px] font-bold ${
                        dia.hoy ? 'text-tinta-100' : 'text-tinta-500'
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

          {guiaVisible && esPrimeraVez(resumen) && (
            <GuiaPrimeraVez
              onCerrar={() => {
                marcarGuiaVista();
                setGuiaVisible(false);
              }}
            />
          )}

          <p className="mt-3 text-lg font-semibold text-tinta-100">Elige tu clase</p>

          <div className="mt-3 flex w-full max-w-md snap-x gap-2 overflow-x-auto pb-1">
            {CLASES.map((clase) => {
              const activa = clase.id === claseSeleccionadaId;
              return (
                <button
                  key={clase.id}
                  onClick={() => seleccionarClase(clase.id)}
                  aria-pressed={activa}
                  className={`min-w-[112px] shrink-0 snap-start rounded-boton border-2 p-2 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta-100 ${
                    activa
                      ? 'border-marca-400 bg-marca-500/20'
                      : 'border-linea bg-tinta-900/60 hover:bg-tinta-800/60'
                  }`}
                >
                  <span className="block text-sm font-black leading-tight text-tinta-100">
                    {clase.nombre}
                  </span>
                  <span className="mt-1 block text-[11px] text-tinta-300">
                    {formatearDuracion(duracionClase(clase))}
                  </span>
                  <span className="block text-[11px] text-tinta-400">
                    {clase.formato === 'completa' ? 'Completa' : 'Exprés'} · {clase.nivel}
                    {clase.equipamiento
                      ? ` · ${clase.equipamiento === 'ninguno' ? 'Sin equipo' : clase.equipamiento}`
                      : ''}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-3 w-full max-w-md rounded-ficha border border-linea bg-panel p-3 text-left">
            <p className="text-xs font-bold text-marca-400">Antes de empezar</p>
            <p className="mt-1 text-base font-black text-tinta-100">{claseActual.nombre}</p>
            <p className="text-sm text-tinta-300">{claseActual.descripcion}</p>
            <p className="mt-1 text-xs text-tinta-400">
              {claseActual.formato === 'completa' ? 'Clase completa' : 'Exprés'} ·{' '}
              {claseActual.nivel} · {formatearDuracion(duracionClase(claseActual))} ·{' '}
              {claseActual.equipamiento
                ? claseActual.equipamiento === 'ninguno'
                  ? 'Sin equipo'
                  : claseActual.equipamiento
                : 'No requiere equipo'}
            </p>
            {resumenClase && (
              <p className="mt-1 text-xs text-tinta-400">
                Movimientos clave:{' '}
                {[...new Set(resumenClase.flatMap((seccion) => seccion.ejercicios))]
                  .slice(0, 6)
                  .map(nombreEjercicio)
                  .join(' · ')}
              </p>
            )}
            <p className="mt-1 text-xs text-tinta-400">
              Si te cuesta: apóyate en una silla o una pared, o haz menos repeticiones.
            </p>
            <button
              type="button"
              onClick={() => setVerDetalle(!verDetalle)}
              aria-expanded={verDetalle}
              className="mt-1 flex min-h-11 items-center gap-1 text-sm font-bold text-marca-300 underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta-100"
            >
              <Icono nombre={verDetalle ? 'chevronAbajo' : 'chevronDerecha'} tamano={16} />
              {verDetalle ? 'Ocultar el detalle de la clase' : 'Ver el detalle de la clase'}
            </button>

            {verDetalle && (
              <div className="mt-1 space-y-2 border-t border-linea pt-2">
                {resumenClase ? (
                  <>
                    {resumenClase.map((seccion, i) => (
                      <div key={seccion.id}>
                        <p className="text-sm font-bold text-tinta-100">
                          {i + 1}. {seccion.nombre} · {formatearDuracion(seccion.duracion)}
                          {seccion.rondas > 1 ? ` · ${seccion.rondas} rondas` : ''}
                        </p>
                        <p className="text-xs text-tinta-400">
                          {seccion.ejercicios.map(nombreEjercicio).join(' · ')}
                        </p>
                      </div>
                    ))}
                    <p className="text-xs text-tinta-500">
                      {claseActual.bloques.length} ejercicios en {claseActual.secciones.length}{' '}
                      secciones
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-tinta-400">
                    {claseActual.bloques.length} ejercicios:{' '}
                    {claseActual.bloques
                      .map((bloque) => nombreEjercicio(bloque.ejercicio))
                      .join(' · ')}
                  </p>
                )}
              </div>
            )}
          </div>

          <p className="mt-2 max-w-md text-xs text-tinta-500">
            El entrenador te guía por voz y te corrige la postura. Toca la demo para verla en
            grande.
          </p>

          <button
            onClick={() => iniciarRutina(claseSeleccionadaId)}
            className="mt-4 flex min-h-14 w-full max-w-md items-center justify-center gap-2 rounded-ficha bg-marca-500 px-8 text-2xl font-black text-black transition hover:bg-marca-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta-100"
          >
            <Icono nombre="reproducir" tamano={22} />
            Empezar clase
          </button>
          </div>
        </>
      )}
      <WorkoutUI />
      <SummaryScreen resumen={resumenActual} cargando={cargandoResumen} />
    </div>
  );
}
