import { useCallback, useEffect, useRef } from 'react';
import { useWorkoutStore } from '../store/workoutStore';
import { obtenerFrase } from '../engine/voz';
import { guionDemo } from '../engine/demos';
import { modificacionesEjercicio, nombreEjercicio } from '../engine/ejercicios';
import { textoNarrado } from '../engine/progreso';
import { UMBRAL_SCORE_PERFECTO } from '../engine/forma';
import {
  ajustarVoz,
  esEnFuego,
  mereceEuforia,
  UMBRAL_COMBO_FUEGO,
} from '../engine/personalidad';

const MS_ENTRE_ANIMO = 16000;
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

export function useEntrenadorVoz(resumen = null) {
  const combo = useWorkoutStore((s) => s.combo);
  const scoreForma = useWorkoutStore((s) => s.scoreForma);
  const faseActual = useWorkoutStore((s) => s.faseActual);
  const ejercicioActual = useWorkoutStore((s) => s.ejercicioActual);
  const repeticiones = useWorkoutStore((s) => s.repeticiones);
  const tiempoRestante = useWorkoutStore((s) => s.tiempoRestante);
  const mensajeForma = useWorkoutStore((s) => s.mensajeForma);
  const pausado = useWorkoutStore((s) => s.pausado);
  const vozActiva = useWorkoutStore((s) => s.vozActiva);
  const demoAbierta = useWorkoutStore((s) => s.demoAbierta);
  const demoEjercicio = useWorkoutStore((s) => s.demoEjercicio);
  const bloqueActual = useWorkoutStore((s) => s.bloqueActual);
  const claseActual = useWorkoutStore((s) => s.claseActual);

  const rotacion = useRef(0);
  const ultimaCorreccion = useRef(0);
  const ultimaVoz = useRef(Date.now());
  const ultimaRep = useRef(Date.now());
  const avisoAtasco = useRef(false);
  const narradoRef = useRef(false);
  const comboRef = useRef(combo);
  const scoreRef = useRef(scoreForma);
  comboRef.current = combo;
  scoreRef.current = scoreForma;
  const bloque = claseActual.bloques?.[bloqueActual] || null;
  const prev = useRef({
    fase: faseActual,
    ejercicio: ejercicioActual,
    reps: repeticiones,
    restante: tiempoRestante,
    mensaje: mensajeForma,
    pausado,
    demo: demoAbierta,
    bloque: bloqueActual,
    seccion: bloque?.seccionId ?? null,
    ronda: bloque?.ronda ?? null,
    combo: 0,
    score: null,
  });

  const hablar = useCallback(
    (texto, { interrumpir = false, rate = 1, pitch = 1, climax = false } = {}) => {
      if (!texto || !puedeHablar() || !useWorkoutStore.getState().vozActiva) return;

      const sintesis = window.speechSynthesis;
      if (interrumpir) sintesis.cancel();

      // On Fire mode: when combo >= 5, heighten vocal intensity (rate + pitch)
      const { enFuego, rate: rateFinal, pitch: pitchFinal } = ajustarVoz({
        rate,
        pitch,
        combo: comboRef.current,
        climax,
      });

      const utterance = new SpeechSynthesisUtterance(texto);
      utterance.lang = 'es-CO';
      utterance.rate = rateFinal;
      utterance.pitch = pitchFinal;
      const voz = elegirVoz();
      if (voz) utterance.voice = voz;

      utterance.onerror = () => {};

      ultimaVoz.current = Date.now();
      sintesis.speak(utterance);
      return enFuego;
    },
    []
  );

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
      bloque: bloqueActual,
      seccion: bloque?.seccionId ?? null,
      ronda: bloque?.ronda ?? null,
      combo: comboRef.current,
      score: scoreRef.current,
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

    const anunciarBloque = () => {
      if (bloque && bloque.seccionId !== antes.seccion) {
        const evento =
          bloque.seccionTipo === 'activacion'
            ? 'ACTIVACION'
            : bloque.seccionTipo === 'enfriamiento'
              ? 'ENFRIAMIENTO'
              : 'SECCION';
        hablar(
          `${obtenerFrase(evento, rotacion.current++)} ${bloque.pistaVoz || ''}`.trim()
        );
        return;
      }

      if (bloque?.totalRondas > 1 && bloque.ronda !== antes.ronda) {
        const evento = bloque.ronda === bloque.totalRondas ? 'ULTIMA_RONDA' : 'RONDA';
        hablar(
          `${obtenerFrase(evento, rotacion.current++)} ${bloque.pistaVoz || ''}`.trim()
        );
        return;
      }

      hablar(bloque?.pistaVoz || obtenerFrase('TRABAJO', rotacion.current++, ejercicioActual));
    };

    if (antes.fase !== faseActual) {
      if (faseActual === 'TRABAJO') {
        const primerBloque = antes.fase === 'CALIBRACION';
        if (primerBloque) {
          hablar(obtenerFrase('INICIO', rotacion.current++));
          const pista =
            bloque?.pistaVoz || obtenerFrase('TRABAJO', rotacion.current, ejercicioActual);
          setTimeout(() => {
            if (useWorkoutStore.getState().faseActual === 'TRABAJO') {
              hablar(pista);
            }
          }, 1600);
        } else {
          anunciarBloque();
        }
        ultimaRep.current = Date.now();
        avisoAtasco.current = false;
      } else if (faseActual === 'DESCANSO') {
        const siguiente = claseActual.bloques[bloqueActual + 1];
        const pistaSiguiente = siguiente
          ? `Sigue ${nombreEjercicio(siguiente.ejercicio)}. ${siguiente.pistaVoz || ''}`.trim()
          : '';
        hablar(`${obtenerFrase('DESCANSO', rotacion.current++)} ${pistaSiguiente}`.trim());
      } else if (faseActual === 'FIN') {
        hablar(obtenerFrase('FIN', rotacion.current++), { interrumpir: true });
      }
      return;
    }

    if (antes.bloque !== bloqueActual && faseActual === 'TRABAJO' && !pausado) {
      anunciarBloque();
      ultimaRep.current = Date.now();
      avisoAtasco.current = false;
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
      } else if (
        mereceEuforia({
          score: scoreRef.current,
          combo: comboRef.current,
          umbralPerfecto: UMBRAL_SCORE_PERFECTO,
        })
      ) {
        // Repetición perfecta durante racha: activar modo On Fire
        hablar(obtenerFrase('ON_FIRE', rotacion.current++), { interrumpir: true });
      }
    }

    // Anunciar On Fire cuando el combo cruza el umbral
    if (antes.combo < UMBRAL_COMBO_FUEGO && esEnFuego(comboRef.current)) {
      hablar(obtenerFrase('ON_FIRE', rotacion.current++), { interrumpir: true });
    }

    if (
      bloque?.trabajo >= 30 &&
      tiempoRestante === Math.ceil(bloque.trabajo / 2) &&
      antes.restante !== tiempoRestante
    ) {
      const evento = bloque.seccionTipo === 'enfriamiento' ? 'RESPIRACION' : 'MITAD';
      hablar(obtenerFrase(evento, rotacion.current++), { interrumpir: true });
      return;
    }

    if (tiempoRestante === 3 && antes.restante !== 3) {
      // Euforia final: el instructor levanta la voz cuando quedar solo 3 segundos
      hablar(obtenerFrase('ULTIMOS_SEGUNDOS', rotacion.current++), { interrumpir: true, climax: true });
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
    bloqueActual,
    claseActual,
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
        // Alternativa concreta del ejercicio actual, no solo una frase genérica
        const facil = modificacionesEjercicio(estado.ejercicioActual).facil;
        hablar(`${obtenerFrase('ATASCADO', rotacion.current++)} Versión fácil: ${facil}.`);
        return;
      }

      if (ahora - ultimaVoz.current >= MS_ENTRE_ANIMO) {
        hablar(obtenerFrase('ANIMO', rotacion.current++));
      }
    }, INTERVALO_APOYO_MS);

    return () => clearInterval(id);
  }, [vozActiva, hablar]);

  useEffect(() => {
    if (faseActual !== 'FIN') {
      narradoRef.current = false;
      return undefined;
    }
    if (!vozActiva || !resumen?.ultima || narradoRef.current) return undefined;

    narradoRef.current = true;
    const texto = textoNarrado(resumen);
    const id = setTimeout(() => {
      if (useWorkoutStore.getState().faseActual === 'FIN') {
        hablar(texto, { rate: 0.98 });
      }
    }, 3800);

    return () => clearTimeout(id);
  }, [faseActual, resumen, vozActiva, hablar]);

  useEffect(() => {
    if (!vozActiva && puedeHablar()) {
      window.speechSynthesis.cancel();
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
