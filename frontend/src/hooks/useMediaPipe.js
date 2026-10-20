import { useEffect, useRef, useState, useCallback } from 'react';
import { PoseLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { DETECTORES, crearEstadoDetector } from '../engine/detectors';
import {
  crearFiltrosLandmarks,
  filtrarLandmarks,
  reiniciarFiltros,
} from '../engine/filters';
import { UMBRAL_SCORE_PERFECTO } from '../engine/forma';
import {
  MODELOS_POSE,
  elegirModeloPose,
  modelosParaIntentar,
} from '../engine/modeloPose';
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
  const [modeloPose] = useState(() => elegirModeloPose());
  const [modeloActivo, setModeloActivo] = useState(null);
  const poseLandmarker = useRef(null);
  const filtrosLandmarks = useRef(crearFiltrosLandmarks());
  const estadoDetector = useRef(crearEstadoDetector());
  const ejercicioEnCurso = useRef(null);
  const ultimaRepMs = useRef(0);
  const mensajeActual = useRef(null);
  const ultimaPoseMs = useRef(0);
  const faseAnterior = useRef(useWorkoutStore.getState().faseActual);
  const animFrameRef = useRef(null);
  const registrarRepeticion = useWorkoutStore((state) => state.registrarRepeticion);
  const setMensajeForma = useWorkoutStore((state) => state.setMensajeForma);
  const setScoreForma = useWorkoutStore((state) => state.setScoreForma);

  useEffect(() => {
    let cancelado = false;

    const initModel = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );

        for (const id of modelosParaIntentar(modeloPose)) {
          for (const delegate of ['GPU', 'CPU']) {
            try {
              const landmarker = await PoseLandmarker.createFromOptions(vision, {
                baseOptions: {
                  modelAssetPath: MODELOS_POSE[id].url,
                  delegate,
                },
                runningMode: 'VIDEO',
                numPoses: 1,
              });

              if (cancelado) {
                landmarker.close();
                return;
              }

              poseLandmarker.current = landmarker;
              setModeloActivo(id);
              setIsLoaded(true);
              return;
            } catch (err) {
              console.warn(`No se pudo cargar pose ${id}/${delegate}:`, err);
            }
          }
        }
      } catch (err) {
        console.error('No se pudo inicializar MediaPipe:', err);
      }
    };

    initModel();

    return () => {
      cancelado = true;
      poseLandmarker.current?.close();
      poseLandmarker.current = null;
    };
  }, [modeloPose]);

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
        reiniciarFiltros(filtrosLandmarks.current);
        setScoreForma(null);
      }

      const resultado = detector(landmarks, estadoDetector.current, ahoraMs);
      estadoDetector.current = resultado.estado;

      useWorkoutStore.getState().setFaseRepeticion(resultado.estado.fase);
      actualizarMensaje(resultado.estado.mensaje);
      setScoreForma(resultado.estado.scoreForma ?? null);

      if (resultado.repeticion && ahoraMs - ultimaRepMs.current >= COOLDOWN_REP_MS) {
        ultimaRepMs.current = ahoraMs;
        const score = resultado.estado.scoreForma;
        const perfecta =
          !resultado.estado.mensaje &&
          (score == null || score >= UMBRAL_SCORE_PERFECTO);
        registrarRepeticion(perfecta);
      }
    },
    [registrarRepeticion, actualizarMensaje, setScoreForma]
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
      const landmarks = filtrarLandmarks(
        results.landmarks[0],
        filtrosLandmarks.current,
        ahora
      );
      const ctx = canvasRef.current.getContext('2d');
      drawSkeleton(ctx, landmarks, canvasRef.current.width, canvasRef.current.height);

      const actual = useWorkoutStore.getState();
      if (actual.faseActual === 'TRABAJO' && !actual.pausado) {
        procesarEjercicio(landmarks, actual.ejercicioActual, ahora);
      } else if (actual.faseActual !== 'TRABAJO' && ejercicioEnCurso.current !== null) {
        ejercicioEnCurso.current = null;
        estadoDetector.current = crearEstadoDetector();
        reiniciarFiltros(filtrosLandmarks.current);
        actualizarMensaje(null);
        setScoreForma(null);
        actual.setFaseRepeticion('ARRIBA');
      }
    }

    if (activo && !estado.pausado && ultimaPoseMs.current > 0 && sinPoseMs > 2000) {
      estado.pausar('faltaPose');
    }

    animFrameRef.current = requestAnimationFrame(detectFrame);
  }, [videoRef, canvasRef, drawSkeleton, procesarEjercicio, actualizarMensaje, setScoreForma]);

  useEffect(() => {
    if (isLoaded) {
      animFrameRef.current = requestAnimationFrame(detectFrame);
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isLoaded, detectFrame]);

  return { isLoaded, modeloActivo };
}
