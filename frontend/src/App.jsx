import React, { useCallback, useEffect, useRef, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { useWorkoutStore } from './store/workoutStore';
import { calcularTotal } from './engine/score';
import { CLASES, duracionClase, formatearDuracion } from './engine/clases';
import { nombreEjercicio } from './engine/ejercicios';
import CameraFeed from './components/CameraFeed';
import WorkoutUI from './components/WorkoutUI';
import SummaryScreen from './components/SummaryScreen';
import LoginScreen from './components/LoginScreen';
import { useEntrenadorVoz } from './hooks/useEntrenadorVoz';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resumen, setResumen] = useState(null);
  const [resumenActual, setResumenActual] = useState(null);
  const faseActual = useWorkoutStore((state) => state.faseActual);
  const iniciarRutina = useWorkoutStore((state) => state.iniciarRutina);
  const claseActual = useWorkoutStore((state) => state.claseActual);
  const claseSeleccionadaId = useWorkoutStore((state) => state.claseSeleccionadaId);
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
          <p className="mt-2 text-lg font-semibold">Elige tu clase</p>

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
                  <span className="block text-xs font-black uppercase leading-tight">
                    {clase.nombre}
                  </span>
                  <span className="mt-1 block text-[10px] text-white/70">
                    {formatearDuracion(duracionClase(clase))}
                  </span>
                  <span className="block text-[10px] uppercase tracking-wide text-white/50">
                    {clase.nivel}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-3 max-w-md text-sm text-white/70">
            <p>{claseActual.descripcion}</p>
            <p className="mt-1">
              {claseActual.bloques.length} ejercicios:{' '}
              {claseActual.bloques.map((bloque) => nombreEjercicio(bloque.ejercicio)).join(' · ')}
            </p>
            <p className="mt-1">El entrenador te guía por voz y corrige tu postura.</p>
            <p>La demo va en la esquina; tócala para verla en grande.</p>
          </div>

          <button
            onClick={() => iniciarRutina(claseSeleccionadaId)}
            className="mt-5 px-8 py-4 bg-green-500 text-2xl font-bold rounded hover:bg-green-600 transition"
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
