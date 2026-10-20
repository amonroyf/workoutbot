import React, { Fragment } from 'react';
import { useWorkoutStore } from '../store/workoutStore';
import { estacionesCircuito, estacionesSeccion } from '../engine/circuito';
import { nombreEjercicio } from '../engine/ejercicios';

const ESTILOS = {
  completado: 'border-marca-400 bg-marca-500 text-black',
  actual: 'border-marca-400 bg-marca-500/25 text-tinta-100 shadow-[0_0_18px_rgba(74,222,128,0.35)]',
  pendiente: 'border-linea bg-tinta-800/60 text-tinta-400',
};

export default function MapaCircuito() {
  const faseActual = useWorkoutStore((s) => s.faseActual);
  const ejercicioActual = useWorkoutStore((s) => s.ejercicioActual);
  const bloqueActual = useWorkoutStore((s) => s.bloqueActual);
  const claseActual = useWorkoutStore((s) => s.claseActual);
  const estado = { faseActual, ejercicioActual, bloqueActual };
  const secciones = estacionesSeccion(estado, claseActual);

  if (secciones) {
    return (
      <div className="mt-3 flex items-start" aria-label="Secciones de la clase">
        {secciones.map((seccion, i) => (
          <Fragment key={seccion.id}>
            {i > 0 && (
              <div
                className={`mt-4 h-0.5 w-4 flex-none rounded-full ${
                  secciones[i - 1].estado === 'completado' ? 'bg-marca-400' : 'bg-tinta-700'
                }`}
              />
            )}
            <div className="flex min-w-0 flex-1 flex-col items-center gap-1 px-0.5">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-black ${
                  ESTILOS[seccion.estado]
                }`}
              >
                {seccion.estado === 'completado' ? 'OK' : i + 1}
              </div>
              <span
                title={seccion.nombre}
                className={`w-full truncate text-center text-[10px] font-semibold ${
                  seccion.estado === 'pendiente' ? 'text-tinta-500' : 'text-tinta-200'
                }`}
              >
                {seccion.nombreCorto}
              </span>
              {seccion.estado === 'actual' && seccion.totalRondas > 1 && (
                <span className="text-[9px] font-semibold text-marca-300">
                  Ronda {seccion.ronda} de {seccion.totalRondas}
                </span>
              )}
            </div>
          </Fragment>
        ))}
      </div>
    );
  }

  const estaciones = estacionesCircuito(estado, claseActual);

  return (
    <div className="mt-3 flex items-start" aria-label="Mapa de la clase">
      {estaciones.map((estacion, i) => (
        <Fragment key={`${estacion.ejercicio}-${i}`}>
          {i > 0 && (
            <div
              className={`mt-4 h-0.5 flex-1 rounded-full ${
                estaciones[i - 1].estado === 'completado' ? 'bg-marca-400' : 'bg-tinta-700/60'
              }`}
            />
          )}
          <div className="flex w-20 flex-col items-center gap-1">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-black ${
                ESTILOS[estacion.estado]
              }`}
            >
              {estacion.estado === 'completado' ? 'OK' : i + 1}
            </div>
            <span
              title={nombreEjercicio(estacion.ejercicio)}
              className={`w-full truncate text-center text-[10px] font-semibold ${
                estacion.estado === 'pendiente' ? 'text-tinta-500' : 'text-tinta-200'
              }`}
            >
              {nombreEjercicio(estacion.ejercicio)}
            </span>
          </div>
        </Fragment>
      ))}
    </div>
  );
}
