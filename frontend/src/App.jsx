import React, { useCallback, useEffect, useRef, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import { useWorkoutStore } from './store/workoutStore';
import { calcularTotal } from './engine/score';
import { duracionClase } from './engine/clases';
import { cargarPlan, claseParaFecha, guardarPlan as persistirPlan } from './engine/plan';
import { esPrimeraVez, guiaVista, marcarGuiaVista } from './engine/primeraVez';
import {
  esIos,
  puedeEntrarEnPantallaCompleta,
  solicitarPantallaCompleta,
} from './engine/pantallaCompleta';
import CameraFeed from './components/CameraFeed';
import WorkoutUI from './components/WorkoutUI';
import SummaryScreen from './components/SummaryScreen';
import LoginScreen from './components/LoginScreen';
import PantallaInicio from './components/PantallaInicio';
import ConsentimientoAnalitica from './components/ConsentimientoAnalitica';
import { useEntrenadorVoz } from './hooks/useEntrenadorVoz';
import { track } from './engine/analytics';

function resumirError(error) {
  return String(error?.message || error || 'Error desconocido').slice(0, 120);
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resumen, setResumen] = useState(null);
  const [resumenActual, setResumenActual] = useState(null);
  const [cargandoResumen, setCargandoResumen] = useState(false);
  const [guiaVisible, setGuiaVisible] = useState(() => !guiaVista());
  const [plan, setPlan] = useState(() => cargarPlan(undefined, auth.currentUser?.uid));
  const faseActual = useWorkoutStore((state) => state.faseActual);
  const iniciarRutina = useWorkoutStore((state) => state.iniciarRutina);
  const claseActual = useWorkoutStore((state) => state.claseActual);
  const errorCamara = useWorkoutStore((state) => state.errorCamara);
  const camaraActiva = useWorkoutStore((state) => state.camaraActiva);
  const reintentoCamara = useWorkoutStore((state) => state.reintentoCamara);
  const setReintentoCamara = useWorkoutStore((state) => state.setReintentoCamara);
  const seleccionarClase = useWorkoutStore((state) => state.seleccionarClase);
  const soportaPantallaCompleta = puedeEntrarEnPantallaCompleta() && !esIos();
  const enviadoRef = useRef(false);
  const abiertoRef = useRef(false);
  const ultimoErrorCamaraRef = useRef(null);

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
      track('stats_load_error', { detalle: resumirError(err) });
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

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      if (!u) abiertoRef.current = false;
    });
    return unsub;
  }, []);

  useEffect(() => {
    const id = setTimeout(() => setLoading(false), 6000);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!user || abiertoRef.current) return;
    abiertoRef.current = true;
    track('app_open', { pantalla: 'inicio' });
    track('login', { metodo: 'google' });
  }, [user]);

  useEffect(() => {
    if (!errorCamara) {
      ultimoErrorCamaraRef.current = null;
      return;
    }
    if (ultimoErrorCamaraRef.current === errorCamara) return;
    ultimoErrorCamaraRef.current = errorCamara;
    track('camera_error', { detalle: resumirError(errorCamara) });
  }, [errorCamara]);

  const guardarPlanSemanal = useCallback(
    (nuevo) => {
      const normalizado = persistirPlan(nuevo, undefined, user?.uid);
      setPlan(normalizado);
      track('plan_update', {
        dias: normalizado.dias.length,
        objetivo: normalizado.objetivo,
      });
    },
    [user]
  );

  const elegirClase = useCallback(
    (claseId) => {
      seleccionarClase(claseId);
      track('class_select', { clase_id: claseId });
    },
    [seleccionarClase]
  );

  const handleEmpezarClase = useCallback(() => {
    const clase = useWorkoutStore.getState().claseActual;
    track('class_start', {
      clase_id: clase.id,
      clase_nombre: clase.nombre,
      duracion_sec: duracionClase(clase),
      formato: clase.formato,
    });
    solicitarPantallaCompleta();
    iniciarRutina(clase.id);
  }, [iniciarRutina]);

  const handleSalir = useCallback(async () => {
    track('logout');
    useWorkoutStore.getState().detenerRutina();
    await signOut(auth);
  }, []);

  const alAceptarAnalitica = useCallback(() => {
    track('app_open', { pantalla: 'inicio' });
    track('login', { metodo: 'google' });
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
        track('class_complete', {
          clase_id: estado.claseActual.id,
          clase_nombre: estado.claseActual.nombre,
          repeticiones: total,
          perfectas: estado.perfectas,
          duracion_sec: duracionClase(estado.claseActual),
          mejor_combo: estado.mejorCombo,
        });
        if (data.resumen) {
          setResumen(data.resumen);
          setResumenActual(data.resumen);
        }
      })
      .catch((err) => {
        console.error('No se pudo guardar el entrenamiento:', err);
        track('workout_save_error', { detalle: resumirError(err) });
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

  const mostrarGuia = guiaVisible && esPrimeraVez(resumen);

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-fondo">
      <CameraFeed />
      {faseActual === 'CALIBRACION' && (
        <PantallaInicio
          user={user}
          plan={plan}
          resumen={resumen}
          cargandoResumen={cargandoResumen}
          claseActual={claseActual}
          errorCamara={errorCamara}
          camaraActiva={camaraActiva}
          onReintentarCamara={() => setReintentoCamara(reintentoCamara + 1)}
          onEmpezar={handleEmpezarClase}
          onSeleccionarClase={elegirClase}
          onGuardarPlan={guardarPlanSemanal}
          onSalir={handleSalir}
          mostrarGuia={mostrarGuia}
          onCerrarGuia={() => {
            marcarGuiaVista();
            setGuiaVisible(false);
          }}
          soportaPantallaCompleta={soportaPantallaCompleta}
        />
      )}
      <WorkoutUI />
      <SummaryScreen resumen={resumenActual} cargando={cargandoResumen} />
      <ConsentimientoAnalitica onAceptar={alAceptarAnalitica} />
    </div>
  );
}
