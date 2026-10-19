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
    });

    const interval = setInterval(() => {
      const actual = get();
      if (actual.pausado) return;

      const resultado = avanzarCircuito(actual, Date.now());
      if (!resultado) return;

      set(resultado.estado);
      reproducirSonido(resultado.sonido);

      if (resultado.estado.faseActual === 'FIN') {
        clearInterval(get().timerRef);
      }
    }, INTERVALO_TICK_MS);

    set({ timerRef: interval });
  },

  registrarRepeticion: () => {
    playCoin();
    set({ repeticiones: get().repeticiones + 1, combo: get().combo + 1 });
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
    });
  },
}));
