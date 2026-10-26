import React from 'react';
import { Route, Switch, useLocation } from 'wouter';
import { useWorkoutStore } from '../store/workoutStore';
import NavegacionInferior from './NavegacionInferior';
import WorkoutUI from './WorkoutUI';
import SummaryScreen from './SummaryScreen';
import PantallaInicioWrapper from '../screens/PantallaInicioWrapper';
import PantallaActividad from '../screens/PantallaActividad';
import PantallaPerfil from '../screens/PantallaPerfil';

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

  // Secuestro de pantalla (Kiosk Mode): mientras entrena, no hay pestañas.
  if (faseActual === 'TRABAJO' || faseActual === 'DESCANSO' || faseActual === 'CAMBIO_LADO') {
    return <WorkoutUI />;
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