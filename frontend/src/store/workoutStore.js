import { create } from 'zustand';
import { playStart, playWhistle, playCoin } from '../engine/sounds';
import {
  estadoInicialCircuito,
  avanzarCircuito,
  totalesVacios,
} from '../engine/circuito';

const INTERVALO_TICK_MS = 250;

function reproducirSonido(nombre) {
  if (nombre === 'inicio') playStart();
  else if (nombre === 'silbato') playWhistle();
}

export const useWorkoutStore = create((set, get) => ({
  faseActual: 'CALIBRACION',
  ejercicioActual: 'SENTADILLAS',
  tiempoRestante: 0,
  repeticiones: 0,
  combo: 0,
  totales: totalesVacios(),
  finFaseEn: null,
  timerRef: null,
  mensajeForma: null,
  subtitulo: null,
  vozActiva: true,
  pausado: false,
  pausadoPor: null,
  pausadoEn: null,
  faseRepeticion: 'ARRIBA',
  perfectas: 0,
  flashPerfecta: 0,
  demoAbierta: false,
  demoEjercicio: null,
  pausadoAntesDemo: false,
  pausadoPorAntesDemo: null,

  iniciarRutina: () => {
    clearInterval(get().timerRef);
    playStart();

    const base = estadoInicialCircuito(Date.now());
    set({
      ...base,
      mensajeForma: null,
      subtitulo: null,
      pausado: false,
      pausadoPor: null,
      pausadoEn: null,
      faseRepeticion: 'ARRIBA',
      perfectas: 0,
      flashPerfecta: 0,
      demoAbierta: false,
      demoEjercicio: null,
      pausadoAntesDemo: false,
      pausadoPorAntesDemo: null,
    });

    const interval = setInterval(() => {
      const actual = get();
      if (actual.pausado) return;

      const resultado = avanzarCircuito(actual, Date.now());
      if (!resultado) return;

      set(resultado.estado);
      if (resultado.estado.faseActual) set({ faseRepeticion: 'ARRIBA' });
      reproducirSonido(resultado.sonido);

      if (resultado.estado.faseActual === 'FIN') {
        clearInterval(get().timerRef);
      }
    }, INTERVALO_TICK_MS);

    set({ timerRef: interval });
  },

  registrarRepeticion: (perfecta = false) => {
    playCoin();
    set((estado) => ({
      repeticiones: estado.repeticiones + 1,
      combo: estado.combo + 1,
      perfectas: estado.perfectas + (perfecta ? 1 : 0),
      flashPerfecta: estado.flashPerfecta + (perfecta ? 1 : 0),
    }));
  },

  setFaseRepeticion: (faseRepeticion) => set({ faseRepeticion }),

  abrirDemo: (ejercicio) => {
    const { faseActual, ejercicioActual, pausado, pausadoPor, pausadoEn } = get();
    if (faseActual !== 'TRABAJO' && faseActual !== 'DESCANSO') return;
    set({
      demoAbierta: true,
      demoEjercicio: ejercicio || ejercicioActual,
      pausadoAntesDemo: pausado,
      pausadoPorAntesDemo: pausadoPor,
      pausado: true,
      pausadoPor: 'demo',
      pausadoEn: pausadoEn ?? Date.now(),
      faseRepeticion: 'ARRIBA',
    });
  },

  cerrarDemo: () => {
    const { pausadoAntesDemo, pausadoPorAntesDemo } = get();
    set({
      demoAbierta: false,
      demoEjercicio: null,
      pausadoAntesDemo: false,
      pausadoPorAntesDemo: null,
      pausadoPor: pausadoAntesDemo ? pausadoPorAntesDemo : 'demo',
    });
    if (!pausadoAntesDemo) get().reanudar();
  },

  setMensajeForma: (mensaje) => set({ mensajeForma: mensaje }),

  setSubtitulo: (subtitulo) => set({ subtitulo }),

  setVozActiva: (vozActiva) => set({ vozActiva }),

  pausar: (por = 'manual') => {
    const { pausado, faseActual } = get();
    if (pausado || (faseActual !== 'TRABAJO' && faseActual !== 'DESCANSO')) return;
    set({ pausado: true, pausadoPor: por, pausadoEn: Date.now() });
  },

  reanudar: () => {
    const { pausado, pausadoEn, finFaseEn } = get();
    if (!pausado) return;
    const delta = pausadoEn == null ? 0 : Date.now() - pausadoEn;
    set({
      pausado: false,
      pausadoPor: null,
      pausadoEn: null,
      finFaseEn: finFaseEn == null ? null : finFaseEn + delta,
    });
  },

  togglePausa: () => {
    if (get().pausado) get().reanudar();
    else get().pausar('manual');
  },

  detenerRutina: () => {
    clearInterval(get().timerRef);
    set({
      faseActual: 'CALIBRACION',
      ejercicioActual: 'SENTADILLAS',
      tiempoRestante: 0,
      repeticiones: 0,
      combo: 0,
      totales: totalesVacios(),
      finFaseEn: null,
      timerRef: null,
      mensajeForma: null,
      subtitulo: null,
      pausado: false,
      pausadoPor: null,
      pausadoEn: null,
      faseRepeticion: 'ARRIBA',
      perfectas: 0,
      flashPerfecta: 0,
      demoAbierta: false,
      demoEjercicio: null,
      pausadoAntesDemo: false,
      pausadoPorAntesDemo: null,
    });
  },
}));
