import { useEffect, useRef, useState, useCallback } from 'react';
import { PoseLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { obtenerDetector, crearEstadoDetector } from '../engine/detectors';
import {
  crearFiltrosLandmarks,
  filtrarLandmarks,
  reiniciarFiltros,
} from '../engine/filters';
import { UMBRAL_SCORE_PERFECTO } from '../engine/forma';
import { calculateAngle } from '../engine/angles';
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

// Articulaciones monitoreadas por ejercicio: [a, vertice, c]
const LADOS_ANGULOS = {
  SENTADILLAS: [[23, 25, 27], [24, 26, 28]],
  SENTADILLA_SUMO: [[23, 25, 27], [24, 26, 28]],
  ZANCADAS: [[23, 25, 27], [24, 26, 28]],
  WALL_SIT: [[23, 25, 27], [24, 26, 28]],
  FLEXIONES: [[11, 13, 15], [12, 14, 16]],
  FLEXION_DIAMANTE: [[11, 13, 15], [12, 14, 16]],
  PRESS_HOMBRO: [[11, 13, 15], [12, 14, 16]],
  REMO: [[11, 13, 15], [12, 14, 16]],
  PLANCHA: [[11, 23, 27], [12, 24, 28]],
  PLANCHA_LATERAL: [[11, 23, 27], [12, 24, 28]],
  PESO_MUERTO: [[11, 23, 25], [12, 24, 26]],
};

const RANGOS_OBJETIVO = {
  SENTADILLAS: { umbral: 100, condicion: 'menor_o_igual' },
  SENTADILLA_SUMO: { umbral: 100, condicion: 'menor_o_igual' },
  ZANCADAS: { umbral: 100, condicion: 'menor_o_igual' },
  WALL_SIT: { umbral: 110, condicion: 'menor_o_igual' },
  FLEXIONES: { umbral: 100, condicion: 'menor_o_igual' },
  FLEXION_DIAMANTE: { umbral: 100, condicion: 'menor_o_igual' },
  PLANCHA: { umbral: 150, condicion: 'mayor_o_igual' },
  PLANCHA_LATERAL: { umbral: 150, condicion: 'mayor_o_igual' },
  PESO_MUERTO: { umbral: 140, condicion: 'menor_o_igual' },
};

function colorPorAngulo(ejercicio, angulo) {
  const regla = RANGOS_OBJETIVO[ejercicio];
  if (!regla) return '#fbbf24'; // Color de aviso (amarillo) por defecto

  if (regla.condicion === 'menor_o_igual') {
    return angulo <= regla.umbral ? '#4ade80' : '#fbbf24'; // Verde si alcanza profundidad
  }
  return angulo >= regla.umbral ? '#4ade80' : '#f87171'; // Verde si está alineado, rojo si se cae
}

function obtenerAnguloVisible(landmarks, lados) {
  if (!lados) return null;
  // Filtramos el lado más visible hacia la cámara
  const validos = lados
    .map((indices) => {
      const vis = Math.min(...indices.map((i) => landmarks[i]?.visibility ?? 1));
      return { indices, vis };
    })
    .filter((l) => l.vis > 0.5)
    .sort((a, b) => b.vis - a.vis);

  if (validos.length === 0) return null;
  const [a, b, c] = validos[0].indices.map((i) => landmarks[i]);
  const angulo = calculateAngle(a, b, c);
  return { angulo: Math.round(angulo), vertice: b }; // ángulo y vértice central (ej: rodilla)
}

export const COOLDOWN_REP_MS = 300;

export function useMediaPipe(videoRef, canvasRef, habilitada = true) {
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
    if (!habilitada) {
      setIsLoaded(false);
      poseLandmarker.current?.close();
      poseLandmarker.current = null;
      return undefined;
    }

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
  }, [modeloPose, habilitada]);

  const drawSkeleton = useCallback((ctx, landmarks, width, height, ejercicio) => {
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;

    // 1. Esqueleto base
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

    // 2. Overlay biomecánico
    if (ejercicio && LADOS_ANGULOS[ejercicio]) {
      const overlay = obtenerAnguloVisible(landmarks, LADOS_ANGULOS[ejercicio]);
      if (overlay) {
        const { angulo, vertice } = overlay;
        const x = vertice.x * width;
        const y = vertice.y * height;

        // Evaluar el color dinámico según el progreso
        const color = colorPorAngulo(ejercicio, angulo);

        // Fondo del badge oscuro translúcido
        ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
        ctx.beginPath();
        ctx.roundRect(x + 12, y - 12, 42, 24, 6);
        ctx.fill();

        // Texto del ángulo dinámico
        ctx.font = '900 13px system-ui';
        ctx.fillStyle = color;
        ctx.fillText(`${angulo}°`, x + 16, y + 5);

        // Efecto de resplandor (Halo) cuando el rango es perfecto
        if (color === '#4ade80') {
          ctx.beginPath();
          ctx.arc(x, y, 14, 0, 2 * Math.PI);
          ctx.fillStyle = 'rgba(74, 222, 128, 0.35)';
          ctx.fill();
        }

        // Nodo de la articulación principal
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#ffffff';
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
      const detector = obtenerDetector(ejercicio);
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
    if (!habilitada) return;

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
      const actual = useWorkoutStore.getState();
      if (actual.faseActual === 'TRABAJO' && !actual.pausado) {
        drawSkeleton(ctx, landmarks, canvasRef.current.width, canvasRef.current.height, actual.ejercicioActual);
        procesarEjercicio(landmarks, actual.ejercicioActual, ahora);
      } else {
        // En descanso mostramos el esqueleto limpio
        drawSkeleton(ctx, landmarks, canvasRef.current.width, canvasRef.current.height, null);
      }

      if (actual.faseActual !== 'TRABAJO' && ejercicioEnCurso.current !== null) {
        ejercicioEnCurso.current = null;
        estadoDetector.current = crearEstadoDetector();
        reiniciarFiltros(filtrosLandmarks.current);
        actualizarMensaje(null);
        setScoreForma(null);
        actual.setFaseRepeticion('ARRIBA');
      }
    }

    if (
      activo &&
      !estado.pausado &&
      estado.camaraHabilitada &&
      ultimaPoseMs.current > 0 &&
      sinPoseMs > 2000
    ) {
      estado.pausar('faltaPose');
    }

    animFrameRef.current = requestAnimationFrame(detectFrame);
  }, [
    videoRef,
    canvasRef,
    habilitada,
    drawSkeleton,
    procesarEjercicio,
    actualizarMensaje,
    setScoreForma,
  ]);

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
