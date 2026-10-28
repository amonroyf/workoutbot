import React, { Suspense, lazy } from 'react';
import { Route, Switch, useLocation } from 'wouter';
import { useWorkoutStore } from '../store/workoutStore';
import NavegacionInferior from './NavegacionInferior';
import SummaryScreen from './SummaryScreen';
import PantallaInicioWrapper from '../screens/PantallaInicioWrapper';
import PantallaActividad from '../screens/PantallaActividad';
import PantallaPerfil from '../screens/PantallaPerfil';
import Icono from './Icono';

const WorkoutUI = lazy(() => import('./WorkoutUI'));

function PreparandoIA() {
  return (
    <div className="flex h-dvh w-full flex-col items-center justify-center bg-fondo text-tinta-100 gap-4">
      <Icono nombre="camara" tamano={48} className="text-marca-400 animate-pulse" />
      <h2 className="text-xl font-black">Preparando Inteligencia Artificial...</h2>
      <p className="text-sm text-tinta-400">Descargando modelo de postura</p>
    </div>
  );
}

export default function MainLayout({
  user,
  resumen,
  cargandoResumen,
  plan,
  onGuardarPlan,
  onSeleccionarClase,
  onEmpezar,
  onActivarCamara,
  onDesactivarCamara,
  onReintentarCamara,
  onSalida,
  errorCamara,
  camaraActiva,
  camaraHabilitada,
  soportaPantallaCompleta,
  claseActual,
}) {
  const faseActual = useWorkoutStore((s) => s.faseActual);

  if (faseActual === 'TRABAJO' || faseActual === 'DESCANSO' || faseActual === 'CAMBIO_LADO') {
    return (
      <Suspense fallback={<PreparandoIA />}>
        <WorkoutUI />
      </Suspense>
    );
  }

  return (
    <div className="relative flex h-dvh w-full flex-col overflow-hidden bg-fondo">
      <div className="flex-1 overflow-y-auto overscroll-contain pb-16">
        <Switch>
          <Route path="/">
            <PantallaInicioWrapper
              user={user}
              plan={plan}
              resumen={resumen}
              cargandoResumen={cargandoResumen}
              errorCamara={errorCamara}
              camaraActiva={camaraActiva}
              camaraHabilitada={camaraHabilitada}
              onReintentarCamara={onReintentarCamara}
              onActivarCamara={onActivarCamara}
              onDesactivarCamara={onDesactivarCamara}
              onEmpezar={onEmpezar}
              onSeleccionarClase={onSeleccionarClase}
              onGuardarPlan={onGuardarPlan}
              onSalida={onSalida}
              soportaPantallaCompleta={soportaPantallaCompleta}
              claseActual={claseActual}
            />
          </Route>
          <Route path="/actividad">
            <PantallaActividad
              resumen={resumen}
              cargandoResumen={cargandoResumen}
              plan={plan}
              onGuardarPlan={onGuardarPlan}
              claseActual={claseActual}
              onSeleccionarClase={onSeleccionarClase}
            />
          </Route>
          <Route path="/perfil">
            <PantallaPerfil user={user} onSalir={onSalida} />
          </Route>
        </Switch>
      </div>
      <NavegacionInferior />
    </div>
  );
}
