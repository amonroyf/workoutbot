import React, { useCallback, useEffect, useRef, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import { useWorkoutStore } from './store/workoutStore';
import { avanzarCircuito } from './engine/circuito';
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
  const [estadoGuardado, setEstadoGuardado] = useState('idle'); // 'idle' | 'guardando' | 'exito'
  const [pendientesSync, setPendientesSync] = useState(0);
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

  // Al abrir la app o recuperar conexión: vacía la cola offline antes de
  // pedir el progreso al servidor, para que el resultado ya la incluya.
  const sincronizarPendientesAhora = useCallback(async () => {
    const actual = auth.currentUser;
    if (!actual) return;
    try {
      const pendientes = await listarGuardadosPendientes();
      setPendientesSync(pendientes.length);
      if (pendientes.length === 0) return;

      track('workout_sync_retry', { pendientes: pendientes.length });
      const token = await actual.getIdToken();
      const resultado = await sincronizarPendientes({
        listar: listarGuardadosPendientes,
        eliminar: eliminarGuardadoPendiente,
        enviar: async (registro) => {
          const res = await fetch('/api/v1/workout/finish', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(registro.cuerpo),
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json().catch(() => ({}));
          if (data.resumen) setResumen(data.resumen);
        },
      });
      setPendientesSync(resultado.pendientes);
      if (resultado.enviados > 0) await cargarResumen();
    } catch (err) {
      console.error('No se pudo sincronizar el guardado local:', err);
    }
  }, [cargarResumen]);

  useEffect(() => {
    if (!user) return;
    sincronizarPendientesAhora();
  }, [user, sincronizarPendientesAhora]);

  // Recupera la conexión: manda lo que había quedado en la cola local.
  useEffect(() => {
    const sincronizar = () => sincronizarPendientesAhora();
    window.addEventListener('online', sincronizar);
    return () => window.removeEventListener('online', sincronizar);
  }, [sincronizarPendientesAhora]);

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

  // Guardado offline-first: si el POST falla (sin internet, WiFi glacil), el
  // cuerpo viaja a una cola local (IndexedDB) y se sincroniza solo después.
  // El usuario SIEMPRE ve su resumen, calculado localmente en el store.
  const guardarEntrenamiento = useCallback(async () => {
    const actual = auth.currentUser || user;
    if (!actual) return;

    setEstadoGuardado('guardando');
    const estado = useWorkoutStore.getState();
    const total = calcularTotal(estado.totales);

    const cuerpo = {
      score: total,
      total_reps: total,
      perfectas: estado.perfectas,
      mejor_combo: estado.mejorCombo,
      duracion_sec: duracionClase(estado.claseActual),
      clase_id: estado.claseActual.id,
      clase_nombre: estado.claseActual.nombre,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    track('class_complete', {
      clase_id: cuerpo.clase_id,
      clase_nombre: cuerpo.clase_nombre,
      repeticiones: total,
      perfectas: estado.perfectas,
      duracion_sec: cuerpo.duracion_sec,
      mejor_combo: estado.mejorCombo,
    });

    try {
      const token = await actual.getIdToken();
      const res = await fetch('/api/v1/workout/finish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(cuerpo),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (data.resumen) {
        setResumen(data.resumen);
        setResumenActual(data.resumen);
      }
      setEstadoGuardado('exito');
    } catch (err) {
      console.error('Sin conexión: el entrenamiento quedó en cola local.', err);
      track('workout_save_error', { detalle: resumirError(err) });
      try {
        await encolarGuardado(cuerpo);
        const pendientes = await listarGuardadosPendientes();
        setPendientesSync(pendientes.length);
      } catch (errCola) {
        console.error('No se pudo encolar el guardado local:', errCola);
        setPendientesSync((n) => n + 1);
      }
      // Optimistic UI: directo al resumen, la cola se vacía sola al volver.
      setEstadoGuardado('exito');
    }
  }, [user]);

  useEffect(() => {
    if (faseActual === 'FIN' && estadoGuardado === 'idle' && user) {
      guardarEntrenamiento();
    }
  }, [faseActual, estadoGuardado, user, guardarEntrenamiento]);

  // Sincronización de tiempo real: atrapa el throttling del navegador en
  // segundo plano. Al volver, el reloj se adelanta el tiempo "robado" sin
  // pausar ni interrumpir al usuario.
  useEffect(() => {
    const sincronizar = () => {
      if (document.hidden) return;
      useWorkoutStore.getState().sincronizarReloj();
    };
    document.addEventListener('visibilitychange', sincronizar);
    window.addEventListener('focus', sincronizar);
    window.addEventListener('pageshow', sincronizar);
    return () => {
      document.removeEventListener('visibilitychange', sincronizar);
      window.removeEventListener('focus', sincronizar);
      window.removeEventListener('pageshow', sincronizar);
    };
  }, []);

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
        <SummaryScreen
          resumen={resumenActual}
          cargando={cargandoResumen}
          pendienteSync={pendientesSync}
        />
      )}
      <ConsentimientoAnalitica onAceptar={alAceptarAnalitica} />
    </div>
  );
}
