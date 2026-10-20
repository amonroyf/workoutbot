import { useEffect, useRef } from 'react';
import { useWorkoutStore } from '../store/workoutStore';
import { MotorMusica, bpmSeccion } from '../engine/musica';

export function useMusica() {
  const musicaActiva = useWorkoutStore((s) => s.musicaActiva);
  const faseActual = useWorkoutStore((s) => s.faseActual);
  const bloqueActual = useWorkoutStore((s) => s.bloqueActual);
  const claseActual = useWorkoutStore((s) => s.claseActual);
  const motorRef = useRef(null);
  const bloque = claseActual.bloques?.[bloqueActual];
  const seccionId = bloque?.seccionId;

  useEffect(() => {
    if (!motorRef.current) motorRef.current = new MotorMusica();
    const motor = motorRef.current;

    if (!musicaActiva || faseActual === 'CALIBRACION' || faseActual === 'FIN') {
      motor.detener();
      return undefined;
    }

    const bpm = bpmSeccion(seccionId);
    if (motor.contexto) {
      motor.cambiarBpm(bpm);
    } else {
      const ok = motor.iniciar(bpm);
      useWorkoutStore
        .getState()
        .setAvisoMusica(ok ? null : 'No se pudo activar la música en este navegador.');
    }
    return undefined;
  }, [musicaActiva, faseActual, seccionId, claseActual]);

  useEffect(
    () => () => {
      motorRef.current?.detener();
    },
    []
  );
}
