import { useEffect, useRef, useState, useCallback } from 'react';
import { PoseLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { obtenerDetector, crearEstadoDetector } from '../engine/detectors';
import { crearFiltrosLandmarks, filtrarLandmarks, reiniciarFiltros } from '../engine/filters';
import { UMBRAL_SCORE_PERFECTO } from '../engine/forma';
import { calculateAngle, detectarOrientacion } from '../engine/angles';
import { MODELOS_POSE, elegirModeloPose, modelosParaIntentar } from '../engine/modeloPose';
import { EJERCICIOS_CATALOGO } from '../engine/ejercicios';
import { useWorkoutStore } from '../store/workoutStore';

const POSE_CONNECTIONS = [
  [11, 13], [13, 15], [12, 14], [14, 16], [11, 12],
  [11, 23], [12, 24], [23, 24], [23, 25], [25, 27],
  [24, 26], [26, 28],
];

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
  if (!regla) return '#fbbf24';
  if (regla.condicion === 'menor_o_igual') return angulo <= regla.umbral ? '#4ade80' : '#fbbf24';
  return angulo >= regla.umbral ? '#4ade80' : '#f87171';
}

function obtenerAnguloVisible(landmarks, lados) {
  if (!lados) return null;
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
  return { angulo: Math.round(angulo), vertice: b };
}

// CONSTANTES DE DEFENSA CONTRA FALSOS POSITIVOS
export const COOLDOWN_MINIMO_MS = 250;
const DEBOUNCE_FASE_MS = 100; // Tiempo (ms) que debe sostener la postura para validar

export function useMediaPipe(videoRef, canvasRef, habilitada = true) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [modeloPose] = useState(() => elegirModeloPose());
  const landmarkerRef = useRef(null);
  const ultimoTimestampRef = useRef(-1);
  const filtrosLandmarks = useRef(crearFiltrosLandmarks());
  const estadoDetector = useRef(crearEstadoDetector());
  const ejercicioEnCurso = useRef(null);
  const mensajeActual = useRef(null);
  const ultimaPoseMs = useRef(0);
  const faseAnterior = useRef(useWorkoutStore.getState().faseActual);
  const animFrameRef = useRef(null);

  // Refuerzos anti-glitch
  const ultimaRepMs = useRef(0);
  const fasePendiente = useRef(null);
  const inicioFasePendienteMs = useRef(0);

  const registrarRepeticion = useWorkoutStore((state) => state.registrarRepeticion);
  const setMensajeForma = useWorkoutStore((state) => state.setMensajeForma);
  const setScoreForma = useWorkoutStore((state) => state.setScoreForma);
  const setProgresoFase = useWorkoutStore((state) => state.setProgresoFase);
  const setAdvertenciaCamara = useWorkoutStore((state) => state.setAdvertenciaCamara);

  const drawSkeleton = useCallback((ctx, landmarks, width, height, ejercicio) => {
    ctx.clearRect(0, 0, width, height);
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 8;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
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
    if (ejercicio && LADOS_ANGULOS[ejercicio]) {
      const overlay = obtenerAnguloVisible(landmarks, LADOS_ANGULOS[ejercicio]);
      if (overlay) {
        const { angulo, vertice } = overlay;
        const x = vertice.x * width;
        const y = vertice.y * height;
        const color = colorPorAngulo(ejercicio, angulo);

        ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
        ctx.beginPath();
        ctx.roundRect(x + 12, y - 12, 42, 24, 6);
        ctx.fill();

        ctx.font = '900 13px system-ui';
        ctx.fillStyle = color;
        ctx.fillText(`${angulo}°`, x + 16, y + 5);

        if (color === '#4ade80') {
          ctx.beginPath();
          ctx.arc(x, y, 14, 0, 2 * Math.PI);
          ctx.fillStyle = 'rgba(74, 222, 128, 0.35)';
          ctx.fill();
        }
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

  const actualizarMensaje = useCallback((mensaje) => {
    if (mensaje !== mensajeActual.current) {
      mensajeActual.current = mensaje;
      setMensajeForma(mensaje);
    }
  }, [setMensajeForma]);

  const procesarEjercicio = useCallback((landmarks, ejercicio, ahoraMs) => {
    const detector = obtenerDetector(ejercicio);
    if (!detector) return;

    // Hard-Reset al cambiar de ejercicio
    if (ejercicioEnCurso.current !== ejercicio) {
      ejercicioEnCurso.current = ejercicio;
      estadoDetector.current = crearEstadoDetector();
      reiniciarFiltros(filtrosLandmarks.current);
      setScoreForma(null);
      setProgresoFase(0);
      fasePendiente.current = null;
    }

    const resultado = detector(landmarks, estadoDetector.current, ahoraMs);
    estadoDetector.current = resultado.estado;
    useWorkoutStore.getState().setFaseRepeticion(resultado.estado.fase);
    actualizarMensaje(resultado.estado.mensaje);
    setScoreForma(resultado.estado.scoreForma ?? null);
    setProgresoFase(resultado.estado.progresoFase ?? 0);

    // Sistema de Debounce (Validación Continua Bidireccional)
    if (resultado.repeticion) {
      fasePendiente.current = 'VALIDANDO';
      inicioFasePendienteMs.current = ahoraMs;
    }

    if (fasePendiente.current === 'VALIDANDO') {
      // Si el usuario rompe la postura antes de tiempo (vuelve a bajar/romper la línea), se anula
      if (resultado.estado.fase === 'ABAJO') {
        fasePendiente.current = null;
      } else if (ahoraMs - inicioFasePendienteMs.current >= DEBOUNCE_FASE_MS) {
        // El usuario sostuvo la fase. Evaluamos cooldown dinámico basado en Tempo
        const tempo = EJERCICIOS_CATALOGO[ejercicio]?.tempo || [1.5, 1];
        const tiempoRepEsperadoMs = (tempo[0] + tempo[1]) * 1000;
        // Permite ir hasta un 40% más rápido que la voz, limitando spam imposible
        const cooldownDinamicoMs = Math.max(COOLDOWN_MINIMO_MS, tiempoRepEsperadoMs * 0.6);

        if (ahoraMs - ultimaRepMs.current >= cooldownDinamicoMs) {
          ultimaRepMs.current = ahoraMs;
          const score = resultado.estado.scoreForma;
          const perfecta = !resultado.estado.mensaje && (score == null || score >= UMBRAL_SCORE_PERFECTO);
          registrarRepeticion(perfecta);
        }
        // Limpiamos el candidato tras evaluar (éxito o rechazo por velocidad)
        fasePendiente.current = null;
      }
    }
  }, [registrarRepeticion, actualizarMensaje, setScoreForma, setProgresoFase]);

  useEffect(() => {
    if (!habilitada) {
      setIsLoaded(false);
      if (landmarkerRef.current) {
        landmarkerRef.current.close();
        landmarkerRef.current = null;
      }
      return;
    }
    let activo = true;
    const inicializar = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.12/wasm'
        );
        const modelos = modelosParaIntentar(modeloPose).map((id) => MODELOS_POSE[id].url);

        for (const modelUrl of modelos) {
          for (const delegate of ['GPU', 'CPU']) {
            try {
              const landmarker = await PoseLandmarker.createFromOptions(vision, {
                baseOptions: { modelAssetPath: modelUrl, delegate },
                runningMode: 'VIDEO',
                numPoses: 1,
              });
              if (activo) {
                landmarkerRef.current = landmarker;
                setIsLoaded(true);
              } else {
                landmarker.close();
              }
              return;
            } catch (e) {
              console.warn('Fallo cargando modelo', modelUrl, delegate, e);
            }
          }
        }
      } catch (error) {
        console.error('Error inicializando MediaPipe:', error);
      }
    };
    inicializar();

    return () => {
      activo = false;
      if (landmarkerRef.current) {
        landmarkerRef.current.close();
        landmarkerRef.current = null;
      }
    };
  }, [modeloPose, habilitada]);

  const detectFrame = useCallback(() => {
    if (!habilitada || !landmarkerRef.current) {
      animFrameRef.current = requestAnimationFrame(detectFrame);
      return;
    }

    const video = videoRef.current;
    if (video && video.readyState >= 2 && video.videoWidth > 0) {
      const ahora = performance.now();
      let ts = Math.round(ahora);
      if (ts <= ultimoTimestampRef.current) ts = ultimoTimestampRef.current + 1;
      ultimoTimestampRef.current = ts;

      try {
        const results = landmarkerRef.current.detectForVideo(video, ts);
        const landmarks = results.landmarks;

        const estado = useWorkoutStore.getState();
        if (faseAnterior.current !== estado.faseActual) {
          faseAnterior.current = estado.faseActual;
          if (estado.faseActual === 'TRABAJO') ultimaPoseMs.current = ahora;
        }

        const hayPose = landmarks && landmarks.length > 0;
        if (hayPose) {
          ultimaPoseMs.current = ahora;
          const orientacionUsuario = detectarOrientacion(landmarks[0]);
          const ejercicioObjetivo =
            estado.faseActual === 'DESCANSO'
              ? estado.claseActual.bloques[estado.bloqueActual + 1]?.ejercicio
              : estado.ejercicioActual;
          const vistaOptima = ejercicioObjetivo
            ? EJERCICIOS_CATALOGO[ejercicioObjetivo]?.vista
            : null;

          if (estado.advertenciaCamara === 'faltaPose') setAdvertenciaCamara(null);
          if (vistaOptima && orientacionUsuario === vistaOptima && estado.advertenciaCamara === 'orientacion') {
            setAdvertenciaCamara(null);
          }
          if (vistaOptima && orientacionUsuario && vistaOptima !== orientacionUsuario && estado.faseActual === 'TRABAJO') {
            setAdvertenciaCamara('orientacion');
          }

          const landmarksFiltrados = filtrarLandmarks(landmarks[0], filtrosLandmarks.current, ahora);
          const ctx = canvasRef.current?.getContext('2d');

          if (ctx) {
            if (estado.faseActual === 'TRABAJO' && !estado.pausado) {
              drawSkeleton(ctx, landmarksFiltrados, canvasRef.current.width, canvasRef.current.height, estado.ejercicioActual);
              procesarEjercicio(landmarksFiltrados, estado.ejercicioActual, ahora);
            } else {
              drawSkeleton(ctx, landmarksFiltrados, canvasRef.current.width, canvasRef.current.height, null);
            }
          }

          if (estado.faseActual !== 'TRABAJO' && ejercicioEnCurso.current !== null) {
            ejercicioEnCurso.current = null;
            estadoDetector.current = crearEstadoDetector();
            reiniciarFiltros(filtrosLandmarks.current);
            actualizarMensaje(null);
            setScoreForma(null);
            setProgresoFase(0);
            fasePendiente.current = null;
            estado.setFaseRepeticion('ARRIBA');
          }
        }

        const activo = estado.faseActual === 'TRABAJO' || estado.faseActual === 'DESCANSO';
        const sinPoseMs = ahora - ultimaPoseMs.current;
        if (activo && estado.camaraHabilitada && ultimaPoseMs.current > 0 && sinPoseMs > 2000) {
          setAdvertenciaCamara('faltaPose');
        }
      } catch (err) {
        console.error('Error procesando frame:', err);
      }
    }

    animFrameRef.current = requestAnimationFrame(detectFrame);
  }, [habilitada, videoRef, drawSkeleton, procesarEjercicio, actualizarMensaje, setScoreForma]);

  useEffect(() => {
    if (isLoaded) {
      animFrameRef.current = requestAnimationFrame(detectFrame);
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isLoaded, detectFrame]);

  return { isLoaded, modeloActivo: modeloPose };
}