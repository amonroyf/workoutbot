import { useCallback, useEffect, useRef } from 'react';
import { useWorkoutStore } from '../store/workoutStore';
import { obtenerFrase } from '../engine/voz';
import { guionDemo } from '../engine/demos';

const MS_ENTRE_ANIMO = 9000;
const MS_ENTRE_CORRECCION = 3500;
const MS_ATASCADO = 12000;
const INTERVALO_APOYO_MS = 3000;

function puedeHablar() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

function elegirVoz() {
  const voces = window.speechSynthesis.getVoices();
  return (
    voces.find((v) => v.lang === 'es-CO') ||
    voces.find((v) => v.lang && v.lang.toLowerCase().startsWith('es')) ||
    null
  );
}

export function useEntrenadorVoz() {
  const faseActual = useWorkoutStore((s) => s.faseActual);
  const ejercicioActual = useWorkoutStore((s) => s.ejercicioActual);
  const repeticiones = useWorkoutStore((s) => s.repeticiones);
  const tiempoRestante = useWorkoutStore((s) => s.tiempoRestante);
  const mensajeForma = useWorkoutStore((s) => s.mensajeForma);
  const pausado = useWorkoutStore((s) => s.pausado);
  const vozActiva = useWorkoutStore((s) => s.vozActiva);
  const demoAbierta = useWorkoutStore((s) => s.demoAbierta);
  const demoEjercicio = useWorkoutStore((s) => s.demoEjercicio);

  const rotacion = useRef(0);
  const ultimaCorreccion = useRef(0);
  const ultimaVoz = useRef(Date.now());
  const ultimaRep = useRef(Date.now());
  const avisoAtasco = useRef(false);
  const prev = useRef({
    fase: faseActual,
    ejercicio: ejercicioActual,
    reps: repeticiones,
    restante: tiempoRestante,
    mensaje: mensajeForma,
    pausado,
    demo: demoAbierta,
  });

  const hablar = useCallback((texto, { interrumpir = false, rate = 1, pitch = 1 } = {}) => {
    if (!texto || !puedeHablar() || !useWorkoutStore.getState().vozActiva) return;

    const sintesis = window.speechSynthesis;
    if (interrumpir) sintesis.cancel();

    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'es-CO';
    utterance.rate = rate;
    utterance.pitch = pitch;
    const voz = elegirVoz();
    if (voz) utterance.voice = voz;

    utterance.onstart = () => useWorkoutStore.getState().setSubtitulo(texto);
    utterance.onend = () => {
      const estado = useWorkoutStore.getState();
      if (estado.subtitulo === texto) estado.setSubtitulo(null);
    };
    utterance.onerror = utterance.onend;

    ultimaVoz.current = Date.now();
    sintesis.speak(utterance);
  }, []);

  useEffect(() => {
    const antes = prev.current;
    prev.current = {
      fase: faseActual,
      ejercicio: ejercicioActual,
      reps: repeticiones,
      restante: tiempoRestante,
      mensaje: mensajeForma,
      pausado,
      demo: demoAbierta,
    };

    if (!vozActiva) return;

    if (antes.demo !== demoAbierta) {
      if (demoAbierta) {
        hablar(guionDemo(demoEjercicio || ejercicioActual), { interrumpir: true, rate: 0.95 });
      } else if (!pausado) {
        hablar(obtenerFrase('REANUDA', rotacion.current++));
      }
      return;
    }

    if (antes.fase !== faseActual) {
      if (faseActual === 'TRABAJO') {
        if (antes.fase === 'CALIBRACION') {
          hablar(obtenerFrase('INICIO', rotacion.current++));
          const ejercicio = ejercicioActual;
          setTimeout(() => {
            if (useWorkoutStore.getState().faseActual === 'TRABAJO') {
              hablar(obtenerFrase('TRABAJO', rotacion.current++, ejercicio));
            }
          }, 1600);
        } else {
          hablar(obtenerFrase('TRABAJO', rotacion.current++, ejercicioActual));
        }
        ultimaRep.current = Date.now();
        avisoAtasco.current = false;
      } else if (faseActual === 'DESCANSO') {
        hablar(obtenerFrase('DESCANSO', rotacion.current++));
      } else if (faseActual === 'FIN') {
        hablar(obtenerFrase('FIN', rotacion.current++), { interrumpir: true });
      }
      return;
    }

    if (antes.pausado !== pausado) {
      hablar(obtenerFrase(pausado ? 'PAUSA' : 'REANUDA', rotacion.current++));
      ultimaRep.current = Date.now();
      return;
    }

    if (pausado || faseActual !== 'TRABAJO') return;

    if (repeticiones > antes.reps) {
      ultimaRep.current = Date.now();
      avisoAtasco.current = false;
      if (repeticiones > 0 && repeticiones % 10 === 0) {
        hablar(obtenerFrase('HITO', rotacion.current++));
      }
    }

    if (tiempoRestante === 3 && antes.restante !== 3) {
      hablar(obtenerFrase('ULTIMOS_SEGUNDOS', rotacion.current++), { interrumpir: true });
      return;
    }

    if (mensajeForma && mensajeForma !== antes.mensaje) {
      const ahora = Date.now();
      if (ahora - ultimaCorreccion.current >= MS_ENTRE_CORRECCION) {
        ultimaCorreccion.current = ahora;
        hablar(mensajeForma, { interrumpir: true });
      }
    }
  }, [
    faseActual,
    ejercicioActual,
    repeticiones,
    tiempoRestante,
    mensajeForma,
    pausado,
    vozActiva,
    demoAbierta,
    demoEjercicio,
    hablar,
  ]);

  useEffect(() => {
    if (!vozActiva) return undefined;

    const id = setInterval(() => {
      const estado = useWorkoutStore.getState();
      if (!estado.vozActiva || estado.faseActual !== 'TRABAJO' || estado.pausado) return;
      if (!puedeHablar()) return;

      const sintesis = window.speechSynthesis;
      if (sintesis.speaking || sintesis.pending) return;

      const ahora = Date.now();
      if (!avisoAtasco.current && ahora - ultimaRep.current >= MS_ATASCADO) {
        avisoAtasco.current = true;
        hablar(obtenerFrase('ATASCADO', rotacion.current++));
        return;
      }

      if (ahora - ultimaVoz.current >= MS_ENTRE_ANIMO) {
        hablar(obtenerFrase('ANIMO', rotacion.current++));
      }
    }, INTERVALO_APOYO_MS);

    return () => clearInterval(id);
  }, [vozActiva, hablar]);

  useEffect(() => {
    if (!vozActiva && puedeHablar()) {
      window.speechSynthesis.cancel();
      useWorkoutStore.getState().setSubtitulo(null);
    }
  }, [vozActiva]);

  useEffect(() => {
    const alOcultar = () => {
      if (document.hidden) useWorkoutStore.getState().pausar('manual');
    };
    document.addEventListener('visibilitychange', alOcultar);
    return () => document.removeEventListener('visibilitychange', alOcultar);
  }, []);
}
