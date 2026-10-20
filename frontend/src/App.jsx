import React, { useEffect, useRef, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { useWorkoutStore } from './store/workoutStore';
import { calcularTotal } from './engine/score';
import CameraFeed from './components/CameraFeed';
import WorkoutUI from './components/WorkoutUI';
import SummaryScreen from './components/SummaryScreen';
import LoginScreen from './components/LoginScreen';
import { useEntrenadorVoz } from './hooks/useEntrenadorVoz';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const faseActual = useWorkoutStore((state) => state.faseActual);
  const iniciarRutina = useWorkoutStore((state) => state.iniciarRutina);
  const enviadoRef = useRef(false);

  useEntrenadorVoz();

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
    const total = calcularTotal(useWorkoutStore.getState().totales);

    auth.currentUser
      .getIdToken()
      .then((token) =>
        fetch('/api/v1/workout/finish', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ score: total, total_reps: total }),
        })
      )
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
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
          <p className="text-xl mb-4 text-gray-300">Hola, {user.displayName}</p>
          <div className="mb-6 space-y-1 text-white/70">
            <p className="text-lg font-semibold text-white">Clase de hoy</p>
            <p>3 ejercicios · 40s de trabajo · 20s de descanso</p>
            <p>El entrenador te guía por voz y corrige tu postura.</p>
            <p>Toca "¿Cómo se hace?" para ver la demostración.</p>
          </div>
          <button
            onClick={iniciarRutina}
            className="px-8 py-4 bg-green-500 text-2xl font-bold rounded hover:bg-green-600 transition"
          >
            Empezar Reto
          </button>
        </div>
      )}
      <WorkoutUI />
      <SummaryScreen />
    </div>
  );
}
