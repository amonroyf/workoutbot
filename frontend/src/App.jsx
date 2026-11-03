import React, { useCallback, useEffect, useState } from 'react';
import { useWorkoutStore } from './store/workoutStore';
import { calcularTotal } from './engine/score';
import { duracionClase } from './engine/clases';
import { cargarPlan, claseParaFecha, guardarPlan as persistirPlan } from './engine/plan';
import { esPrimeraVez, guiaVista, marcarGuiaVista, marcarOnboardingVisto, onboardingVisto } from './engine/primeraVez';
import { esIos, puedeEntrarEnPantallaCompleta, solicitarPantallaCompleta } from './engine/pantallaCompleta';
import Onboarding from './components/Onboarding';
import ConsentimientoAnalitica from './components/ConsentimientoAnalitica';
import MainLayout from './components/MainLayout';
import SummaryScreen from './components/SummaryScreen';
import { track } from './engine/analytics';
import { cargarResumenLocal, guardarEntrenamientoLocal } from './engine/progresoLocal';

export default function App() {
  const [resumen, setResumen] = useState(cargarResumenLocal);
  const [resumenActual, setResumenActual] = useState(null);
  const [guiaVisible, setGuiaVisible] = useState(() => !guiaVista());
  const [onboardingVisible, setOnboardingVisible] = useState(() => !onboardingVisto());
  const [estadoGuardado, setEstadoGuardado] = useState('idle');
  const [plan, setPlan] = useState(() => cargarPlan());

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

  useEffect(() => {
    if (faseActual !== 'CALIBRACION') return;
    const clase = claseParaFecha(plan);
    if (clase) seleccionarClase(clase.id);
  }, [plan, faseActual, seleccionarClase]);

  useEffect(() => { track('app_open', { pantalla: 'inicio' }); }, []);

  const guardarPlanSemanal = useCallback((nuevo) => {
    const normalizado = persistirPlan(nuevo);
    setPlan(normalizado);
    track('plan_update', { dias: normalizado.dias.length, objetivo: normalizado.objetivo });
  }, []);

  const elegirClase = useCallback((claseId) => {
    seleccionarClase(claseId);
    track('class_select', { clase_id: claseId });
  }, [seleccionarClase]);

  const handleEmpezarClase = useCallback(() => {
    const clase = useWorkoutStore.getState().claseActual;
    track('class_start', { clase_id: clase.id, duracion_sec: duracionClase(clase) });
    solicitarPantallaCompleta();
    iniciarRutina(clase.id, resumen?.ultima || resumenActual?.ultima || null);
  }, [iniciarRutina, camaraHabilitada, resumen, resumenActual]);

  const handleSalir = useCallback(() => {
    track('data_reset');
    useWorkoutStore.getState().detenerRutina();
    localStorage.clear();
    window.location.reload();
  }, []);

  const completarOnboarding = useCallback(() => {
    marcarOnboardingVisto();
    marcarGuiaVista();
    setGuiaVisible(false);
    setOnboardingVisible(false);
  }, []);

  useEffect(() => {
    if (faseActual !== 'FIN') setEstadoGuardado('idle');
  }, [faseActual]);

  useEffect(() => {
    if (faseActual === 'FIN' && estadoGuardado === 'idle') {
      setEstadoGuardado('guardando');
      const estado = useWorkoutStore.getState();
      const total = calcularTotal(estado.totales);
      const cuerpo = {
        total_reps: total,
        perfectas: estado.perfectas,
        mejor_combo: estado.mejorCombo,
        duracion_sec: duracionClase(estado.claseActual),
      };
      
      const nuevoResumen = guardarEntrenamientoLocal(cuerpo);
      setResumen(nuevoResumen);
      setResumenActual(nuevoResumen);
      setEstadoGuardado('exito');
      track('class_complete', { repeticiones: total });
    }
  }, [faseActual, estadoGuardado]);

  const mostrarGuia = guiaVisible && esPrimeraVez(resumen);
  const mostrarOnboarding = faseActual === 'CALIBRACION' && onboardingVisible && esPrimeraVez(resumen);

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-fondo">
      {mostrarOnboarding && (
        <Onboarding plan={plan} onGuardarPlan={guardarPlanSemanal} onTerminar={completarOnboarding} onSaltar={() => setOnboardingVisible(false)} onSinCamara={() => setCamaraHabilitada(false)} />
      )}
      <MainLayout
        resumen={resumen}
        resumenActual={resumenActual}
        cargandoResumen={false}
        plan={plan}
        onGuardarPlan={guardarPlanSemanal}
        onSeleccionarClase={elegirClase}
        onEmpezar={handleEmpezarClase}
        onActivarCamara={() => setCamaraHabilitada(true)}
        onDesactivarCamara={() => setCamaraHabilitada(false)}
        onReintentarCamara={() => setReintentoCamara(reintentoCamara + 1)}
        onSalida={handleSalir}
        errorCamara={errorCamara}
        camaraActiva={camaraActiva}
        camaraHabilitada={camaraHabilitada}
        soportaPantallaCompleta={soportaPantallaCompleta}
        claseActual={claseActual}
        mostrarGuia={mostrarGuia}
        onCerrarGuia={() => { marcarGuiaVista(); setGuiaVisible(false); }}
      />
      {estadoGuardado === 'exito' && (
        <SummaryScreen resumen={resumenActual} cargando={false} pendienteSync={0} />
      )}
      <ConsentimientoAnalitica onAceptar={() => track('analytics_accepted')} />
    </div>
  );
}

