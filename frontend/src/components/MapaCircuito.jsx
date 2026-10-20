import React, { Fragment } from 'react';
import { useWorkoutStore } from '../store/workoutStore';
import { estacionesCircuito } from '../engine/circuito';

const ESTILOS = {
  completado: 'border-green-400 bg-green-500 text-black',
  actual: 'border-green-400 bg-green-500/25 text-white shadow-[0_0_18px_rgba(74,222,128,0.55)]',
  pendiente: 'border-white/30 bg-white/10 text-white/50',
};

export default function MapaCircuito() {
  const faseActual = useWorkoutStore((s) => s.faseActual);
  const ejercicioActual = useWorkoutStore((s) => s.ejercicioActual);
  const estaciones = estacionesCircuito({ faseActual, ejercicioActual });

  return (
    <div className="mt-3 flex items-start" aria-label="Mapa del circuito">
      {estaciones.map((estacion, i) => (
        <Fragment key={estacion.ejercicio}>
          {i > 0 && (
            <div
              className={`mt-4 h-0.5 flex-1 rounded-full ${
                estaciones[i - 1].estado === 'completado' ? 'bg-green-400' : 'bg-white/20'
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
              className={`w-full truncate text-center text-[9px] font-bold uppercase ${
                estacion.estado === 'pendiente' ? 'text-white/40' : 'text-white/90'
              }`}
            >
              {estacion.ejercicio.replace('_', ' ')}
            </span>
          </div>
        </Fragment>
      ))}
    </div>
  );
}
