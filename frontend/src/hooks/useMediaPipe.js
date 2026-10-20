import { useEffect, useRef, useState, useCallback } from 'react';
import { PoseLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { DETECTORES, crearEstadoDetector } from '../engine/detectors';
import { useWorkoutStore } from '../store/workoutStore';

const POSE_CONNECTIONS = [
  [11, 13], [13, 15],
  [12, 14], [14, 16],
  [11, 12],
  [11, 23], [12, 24],
  [23, 24],
  [23, 25], [25, 27],
  [24, 26], [26, 28],
];

export const COOLDOWN_REP_MS = 300;

export function useMediaPipe(videoRef, canvasRef) {
  const [isLoaded, setIsLoaded] = useState(false);
  const poseLandmarker = useRef(null);
  const estadoDetector = useRef(crearEstadoDetector());
  const ejercicioEnCurso = useRef(null);
  const ultimaRepMs = useRef(0);
  const mensajeActual = useRef(null);
  const ultimaPoseMs = useRef(0);
  const faseAnterior = useRef(useWorkoutStore.getState().faseActual);
  const animFrameRef = useRef(null);
  const registrarRepeticion = useWorkoutStore((state) => state.registrarRepeticion);
  const setMensajeForma = useWorkoutStore((state) => state.setMensajeForma);

  useEffect(() => {
    const initModel = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );
      poseLandmarker.current = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numPoses: 1,
      });
      setIsLoaded(true);
    };
    initModel();
  }, []);

  const drawSkeleton = useCallback((ctx, landmarks, width, height) => {
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;

    for (const [i, j] of POSE_CONNECTIONS) {
      const a = landmarks[i];
      const b = landmarks[j];
      if (a && b && (a.visibility ?? 1) > 0.5 && (b.visibility ?? 1) > 0.5) {
        ctx.beginPath();
        ctx.moveTo(a.x * width, a.y * height);
        ctx.lineTo(b.x * width, b.y * height);
        ctx.stroke();
      }
    }
  }, []);

  const actualizarMensaje = useCallback(
    (mensaje) => {
      if (mensaje !== mensajeActual.current) {
        mensajeActual.current = mensaje;
        setMensajeForma(mensaje);
      }
    },
    [setMensajeForma]
  );

  const procesarEjercicio = useCallback(
    (landmarks, ejercicio, ahoraMs) => {
      const detector = DETECTORES[ejercicio];
      if (!detector) return;

      if (ejercicioEnCurso.current !== ejercicio) {
        ejercicioEnCurso.current = ejercicio;
        estadoDetector.current = crearEstadoDetector();
      }

      const resultado = detector(landmarks, estadoDetector.current, ahoraMs);
      estadoDetector.current = resultado.estado;

      useWorkoutStore.getState().setFaseRepeticion(resultado.estado.fase);
      actualizarMensaje(resultado.estado.mensaje);

      if (resultado.repeticion && ahoraMs - ultimaRepMs.current >= COOLDOWN_REP_MS) {
        ultimaRepMs.current = ahoraMs;
        registrarRepeticion(!resultado.estado.mensaje);
      }
    },
    [registrarRepeticion, actualizarMensaje]
  );

  const detectFrame = useCallback(() => {
    if (!poseLandmarker.current || !videoRef.current || !canvasRef.current) {
      animFrameRef.current = requestAnimationFrame(detectFrame);
      return;
    }

    const video = videoRef.current;
    if (video.readyState < 2) {
      animFrameRef.current = requestAnimationFrame(detectFrame);
      return;
    }

    const startTimeMs = performance.now();
    const results = poseLandmarker.current.detectForVideo(video, startTimeMs);

    const ahora = performance.now();
    const estado = useWorkoutStore.getState();

    if (faseAnterior.current !== estado.faseActual) {
      faseAnterior.current = estado.faseActual;
      if (estado.faseActual === 'TRABAJO') ultimaPoseMs.current = ahora;
    }

    const hayPose = results.landmarks && results.landmarks.length > 0;

    if (hayPose) {
      ultimaPoseMs.current = ahora;
      if (estado.pausado && estado.pausadoPor === 'faltaPose') estado.reanudar();
    }

    const activo = estado.faseActual === 'TRABAJO' || estado.faseActual === 'DESCANSO';
    const sinPoseMs = ahora - ultimaPoseMs.current;

    if (hayPose) {
      const landmarks = results.landmarks[0];
      const ctx = canvasRef.current.getContext('2d');
      drawSkeleton(ctx, landmarks, canvasRef.current.width, canvasRef.current.height);

      const actual = useWorkoutStore.getState();
      if (actual.faseActual === 'TRABAJO' && !actual.pausado) {
        procesarEjercicio(landmarks, actual.ejercicioActual, startTimeMs);
      } else if (actual.faseActual !== 'TRABAJO' && ejercicioEnCurso.current !== null) {
        ejercicioEnCurso.current = null;
        estadoDetector.current = crearEstadoDetector();
        actualizarMensaje(null);
        actual.setFaseRepeticion('ARRIBA');
      }
    }

    if (activo && !estado.pausado && ultimaPoseMs.current > 0 && sinPoseMs > 2000) {
      estado.pausar('faltaPose');
    }

    animFrameRef.current = requestAnimationFrame(detectFrame);
  }, [videoRef, canvasRef, drawSkeleton, procesarEjercicio, actualizarMensaje]);

  useEffect(() => {
    if (isLoaded) {
      animFrameRef.current = requestAnimationFrame(detectFrame);
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isLoaded, detectFrame]);

  return { isLoaded };
}
