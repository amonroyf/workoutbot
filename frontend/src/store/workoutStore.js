import { create } from 'zustand';
import {
  playStart,
  playWhistle,
  playRep,
  playAlert,
  playCountdownPip,
  playSideSwitch,
} from '../engine/sounds';
import { estadoInicialCircuito, avanzarCircuito, totalesVacios } from '../engine/circuito';
import { CLASE_INICIAL, obtenerClase } from '../engine/clases';
import { guardarCamaraHabilitada, leerCamaraHabilitada } from '../engine/camara';

const INTERVALO_TICK_MS = 250;

function reproducirSonido(nombre) {
  if (nombre === 'inicio') playStart();
  else if (nombre === 'silbato') playWhistle();
  else if (nombre === 'cambio_lado') playSideSwitch();
}

export const useWorkoutStore = create((set, get) => ({
  faseActual: 'CALIBRACION',
  claseActual: CLASE_INICIAL,
  claseSeleccionadaId: CLASE_INICIAL.id,
  bloqueActual: 0,
  ejercicioActual: CLASE_INICIAL.bloques[0].ejercicio,
  tiempoRestante: 0,
  repeticiones: 0,
  combo: 0,
  mejorCombo: 0,
  totales: totalesVacios(CLASE_INICIAL),
  finFaseEn: null,
  timerRef: null,
  mensajeForma: null,
  scoreForma: null,
  progresoFase: 0,
  ritmoAnterior: 0,
  mitadCompletada: false,
  advertenciaCamara: null,
  sonidosActivos: true,
  musicaActiva: false,
  avisoMusica: null,
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
  errorCamara: null,
  reintentoCamara: 0,
  camaraActiva: false,
  camaraHabilitada: leerCamaraHabilitada(),
  facingMode: 'user',

  toggleFacingMode: () =>
    set((state) => ({
      facingMode: state.facingMode === 'user' ? 'environment' : 'user',
    })),
  setCamaraActiva: (camaraActiva) => set({ camaraActiva }),
  setErrorCamara: (errorCamara) => set({ errorCamara }),
  setReintentoCamara: (reintentoCamara) => set({ reintentoCamara }),
  setCamaraHabilitada: (valor) => {
    const habilitada = Boolean(valor);
    guardarCamaraHabilitada(habilitada);
    set({
      camaraHabilitada: habilitada,
      camaraActiva: habilitada ? get().camaraActiva : false,
      errorCamara: null,
    });
    if (!habilitada && get().pausadoPor === 'faltaPose') get().reanudar();
  },
  seleccionarClaseDinamica: (clase) =>
    set({
      claseActual: clase,
      claseSeleccionadaId: clase.id,
      bloqueActual: 0,
      ejercicioActual: clase.bloques[0]?.ejercicio,
      totales: totalesVacios(clase),
    }),
  seleccionarClase: (claseId) => {
    if (get().faseActual !== 'CALIBRACION') return;
    const clase = obtenerClase(claseId);
    if (!clase) return;
    set({
      claseActual: clase,
      claseSeleccionadaId: clase.id,
      bloqueActual: 0,
      ejercicioActual: clase.bloques[0].ejercicio,
      totales: totalesVacios(clase),
    });
  },

  iniciarRutina: (claseId, historialAnterior = null) => {
    clearInterval(get().timerRef);
    if (get().sonidosActivos) playStart();
    const clase = obtenerClase(claseId) || get().claseActual || CLASE_INICIAL;
    const base = estadoInicialCircuito(Date.now(), clase);
    let ritmo = 0;
    if (historialAnterior && historialAnterior.duracion_sec > 0) {
      ritmo = historialAnterior.total_reps / historialAnterior.duracion_sec;
    }
    set({
      ...base,
      claseActual: clase,
      claseSeleccionadaId: clase.id,
      mensajeForma: null,
      scoreForma: null,
      progresoFase: 0,
      ritmoAnterior: ritmo,
      mitadCompletada: false,
      advertenciaCamara: null,
      pausado: false,
      pausadoPor: null,
      pausadoEn: null,
      faseRepeticion: 'ARRIBA',
      perfectas: 0,
      mejorCombo: 0,
      flashPerfecta: 0,
      demoAbierta: false,
      demoEjercicio: null,
      pausadoAntesDemo: false,
      pausadoPorAntesDemo: null,
    });

    let ultimoSegundoPip = null;

    const interval = setInterval(() => {
      const actual = get();
      if (actual.pausado) return;
      const resultado = avanzarCircuito(actual, Date.now(), actual.claseActual);

      if (
        actual.sonidosActivos &&
        actual.tiempoRestante <= 3 &&
        actual.tiempoRestante > 0 &&
        actual.tiempoRestante !== ultimoSegundoPip
      ) {
        ultimoSegundoPip = actual.tiempoRestante;
        playCountdownPip(actual.tiempoRestante);
      }

      if (!resultado) return;

      set(resultado.estado);
      if (resultado.estado.faseActual) set({ faseRepeticion: 'ARRIBA' });
      if (actual.sonidosActivos) reproducirSonido(resultado.sonido);
      if (resultado.estado.faseActual === 'FIN') {
        clearInterval(get().timerRef);
      }
    }, INTERVALO_TICK_MS);

    set({ timerRef: interval });
  },

  registrarRepeticion: (perfecta = false) => {
    const combo = get().combo + 1;
    if (get().sonidosActivos) {
      playRep(combo, perfecta);
    }
    set((estado) => ({
      repeticiones: estado.repeticiones + 1,
      combo,
      mejorCombo: Math.max(estado.mejorCombo, combo),
      perfectas: estado.perfectas + (perfecta ? 1 : 0),
      flashPerfecta: estado.flashPerfecta + (perfecta ? 1 : 0),
    }));
  },

  quitarRepeticion: () =>
    set((estado) => ({
      repeticiones: Math.max(0, estado.repeticiones - 1),
      combo: 0,
    })),

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

  setMensajeForma: (mensaje) => {
    if (mensaje && mensaje !== get().mensajeForma && get().sonidosActivos) {
      playAlert();
    }
    set({ mensajeForma: mensaje });
  },

  setScoreForma: (scoreForma) => set({ scoreForma }),

  setAdvertenciaCamara: (advertenciaCamara) => {
    if (advertenciaCamara && advertenciaCamara !== get().advertenciaCamara && get().sonidosActivos) {
      playAlert();
    }
    set({ advertenciaCamara });
  },

  setProgresoFase: (progresoFase) => set({ progresoFase }),
  setRitmoAnterior: (ritmo) => set({ ritmoAnterior: ritmo }),
  setSonidosActivos: (sonidosActivos) => set({ sonidosActivos }),
  setMusicaActiva: (musicaActiva) => set({ musicaActiva }),
  setAvisoMusica: (avisoMusica) => set({ avisoMusica }),

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
    const clase = get().claseActual || CLASE_INICIAL;
    set({
      faseActual: 'CALIBRACION',
      bloqueActual: 0,
      ejercicioActual: clase.bloques[0].ejercicio,
      tiempoRestante: 0,
      repeticiones: 0,
      combo: 0,
      mejorCombo: 0,
      totales: totalesVacios(clase),
      finFaseEn: null,
      timerRef: null,
      mensajeForma: null,
      scoreForma: null,
      progresoFase: 0,
      ritmoAnterior: 0,
      mitadCompletada: false,
      advertenciaCamara: null,
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
