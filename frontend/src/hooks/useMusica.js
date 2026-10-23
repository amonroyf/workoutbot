import { useEffect, useRef } from 'react';
import { useWorkoutStore } from '../store/workoutStore';
import { MotorMusica, bpmSeccion } from '../engine/musica';
import { intensidadEjercicio } from '../engine/ejercicios';

export function useMusica() {
  const musicaActiva = useWorkoutStore((s) => s.musicaActiva);
  const faseActual = useWorkoutStore((s) => s.faseActual);
  const bloqueActual = useWorkoutStore((s) => s.bloqueActual);
  const claseActual = useWorkoutStore((s) => s.claseActual);
  const motorRef = useRef(null);
  const bloque = claseActual.bloques?.[bloqueActual];
  const seccionId = bloque?.seccionId;
  const arquetipo = claseActual?.arquetipo;
  const intensidad = bloque?.intensidad || intensidadEjercicio(bloque?.ejercicio);

  useEffect(() => {
    if (!motorRef.current) motorRef.current = new MotorMusica();
    const motor = motorRef.current;

    if (!musicaActiva || faseActual === 'CALIBRACION' || faseActual === 'FIN') {
      motor.detener();
      return undefined;
    }

    const bpm = bpmSeccion(seccionId, intensidad, arquetipo);
    if (motor.contexto) {
      motor.cambiarArquetipo(arquetipo);
      motor.cambiarBpm(bpm);
    } else {
      const ok = motor.iniciar(bpm, arquetipo);
      useWorkoutStore
        .getState()
        .setAvisoMusica(ok ? null : 'No se pudo activar la música en este navegador.');
    }
    return undefined;
  }, [musicaActiva, faseActual, seccionId, intensidad, arquetipo, claseActual]);

  useEffect(
    () => () => {
      motorRef.current?.detener();
    },
    []
  );
}
