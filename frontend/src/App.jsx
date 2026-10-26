import React, { useCallback, useEffect, useRef, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import { useWorkoutStore } from './store/workoutStore';
import { calcularTotal } from './engine/score';
import { duracionClase } from './engine/clases';
import { cargarPlan, claseParaFecha, guardarPlan as persistirPlan } from './engine/plan';
import {
  esPrimeraVez,
  guiaVista,
  marcarGuiaVista,
  marcarOnboardingVisto,
  onboardingVisto,
} from './engine/primeraVez';
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
import Onboarding from './components/Onboarding';
import ConsentimientoAnalitica from './components/ConsentimientoAnalitica';
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
  const [onboardingVisible, setOnboardingVisible] = useState(() => !onboardingVisto());
  const [resumenIntentado, setResumenIntentado] = useState(false);
  const [estadoGuardado, setEstadoGuardado] = useState('idle'); // 'idle' | 'guardando' | 'error' | 'exito'
  const [plan, setPlan] = useState(() => cargarPlan(undefined, auth.currentUser?.uid));
  const faseActual = useWorkoutStore((state) => state.faseActual);
  const iniciarRutina = useWorkoutStore((state) => state.iniciarRutina);
  const claseActual = useWorkoutStore((state) => state.claseActual);
  const errorCamara = useWorkoutStore((state) => state.errorCamara);
  const camaraActiva = useWorkoutStore((state) => state.camaraActiva);
  const camaraHabilitada = useWorkoutStore((state) => state.camaraHabilitada);
  const setCamaraHabilitada = useWorkoutStore((state) => state.setCamaraHabilitada);
  const reintentoCamara = useWorkoutStore((state) => state.reintentoCamara);
  const setReintentoCamara = useWorkoutStore((state) => state.setReintentoCamara);
  const seleccionarClase = useWorkoutStore((state) => state.seleccionarClase);
  const soportaPantallaCompleta = puedeEntrarEnPantallaCompleta() && !esIos();
  const abiertoRef = useRef(false);
  const ultimoErrorCamaraRef = useRef(null);

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
      setResumenIntentado(true);
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
      con_camara: camaraHabilitada,
    });
    solicitarPantallaCompleta();
    iniciarRutina(clase.id, resumen?.ultima || resumenActual?.ultima || null);
  }, [iniciarRutina, camaraHabilitada]);

  const handleSalir = useCallback(async () => {
    track('logout');
    useWorkoutStore.getState().detenerRutina();
    await signOut(auth);
  }, []);

  const completarOnboarding = useCallback(() => {
    marcarOnboardingVisto();
    marcarGuiaVista();
    setGuiaVisible(false);
    setOnboardingVisible(false);
  }, []);

  const saltarOnboarding = useCallback(() => {
    marcarOnboardingVisto();
    setOnboardingVisible(false);
  }, []);

  const activarCamara = useCallback(() => {
    track('camera_on');
    setCamaraHabilitada(true);
  }, [setCamaraHabilitada]);

  const desactivarCamara = useCallback(() => {
    track('camera_off');
    setCamaraHabilitada(false);
  }, [setCamaraHabilitada]);

  const alAceptarAnalitica = useCallback(() => {
    track('app_open', { pantalla: 'inicio' });
    track('login', { metodo: 'google' });
  }, []);

  // Reset del estado de guardado al salir de la fase FIN
  useEffect(() => {
    if (faseActual !== 'FIN') {
      setEstadoGuardado('idle');
    }
  }, [faseActual]);

  const guardarEntrenamiento = useCallback(async () => {
    const actual = auth.currentUser || user;
    if (!actual) return;

    setEstadoGuardado('guardando');
    setCargandoResumen(true);
    const estado = useWorkoutStore.getState();
    const total = calcularTotal(estado.totales);

    try {
      const token = await actual.getIdToken();
      const zonaHoraria = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const res = await fetch('/api/v1/workout/finish', {
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
          timezone: zonaHoraria,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

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
      setEstadoGuardado('exito');
    } catch (err) {
      console.error('No se pudo guardar el entrenamiento:', err);
      track('workout_save_error', { detalle: resumirError(err) });
      setEstadoGuardado('error');
    } finally {
      setCargandoResumen(false);
    }
  }, [user]);

  useEffect(() => {
    if (faseActual === 'FIN' && estadoGuardado === 'idle' && user) {
      guardarEntrenamiento();
    }
  }, [faseActual, estadoGuardado, user, guardarEntrenamiento]);

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
  const mostrarOnboarding =
    faseActual === 'CALIBRACION' &&
    onboardingVisible &&
    resumenIntentado &&
    esPrimeraVez(resumen);

  if (faseActual === 'FIN' && estadoGuardado === 'error') {
    return (
      <div className="flex h-dvh w-full flex-col items-center justify-center bg-fondo px-6 text-center text-tinta-100">
        <Icono nombre="alerta" tamano={48} className="mb-4 text-error-400" />
        <h2 className="text-3xl font-black">Error de conexión</h2>
        <p className="mt-3 max-w-sm text-sm text-tinta-300">
          No tienes internet en este momento. Tu entrenamiento está pausado y seguro.
        </p>
        <button
          onClick={guardarEntrenamiento}
          className="mt-6 min-h-14 rounded-ficha bg-marca-500 px-8 text-lg font-black text-black transition hover:bg-marca-400"
        >
          Reintentar guardado
        </button>
      </div>
    );
  }

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
          camaraHabilitada={camaraHabilitada}
          onReintentarCamara={() => setReintentoCamara(reintentoCamara + 1)}
          onActivarCamara={activarCamara}
          onDesactivarCamara={desactivarCamara}
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
      {mostrarOnboarding && (
        <Onboarding
          plan={plan}
          onGuardarPlan={guardarPlanSemanal}
          onTerminar={completarOnboarding}
          onSaltar={saltarOnboarding}
          onSinCamara={desactivarCamara}
        />
      )}
      <WorkoutUI />
      {estadoGuardado === 'exito' && (
        <SummaryScreen resumen={resumenActual} cargando={cargandoResumen} />
      )}
      <ConsentimientoAnalitica onAceptar={alAceptarAnalitica} />
    </div>
  );
}
