export const BPM_POR_SECCION = Object.freeze({
  activacion: 116,
  bloque: 128,
  pico: 152,
  recuperacion: 112,
  core: 118,
  enfriamiento: 92,
});

// BPM de referencia por arquetipo (cuando no hay sección específica).
export const BPM_POR_ARQUETIPO = Object.freeze({
  fuerza: 128,
  hiit: 156,
  combat: 144,
  core: 118,
});

// BPM por intensidad para clases sin secciones.
export const BPM_POR_INTENCIDAD = Object.freeze({
  suave: 104,
  media: 126,
  alta: 152,
});

export const BPM_POR_DEFECTO = 126;

export function bpmSeccion(seccionId, intensidad = '', arquetipo = '') {
  const porSeccion = BPM_POR_SECCION[seccionId];
  if (porSeccion) return porSeccion;
  const porArquetipo = BPM_POR_ARQUETIPO[arquetipo];
  if (porArquetipo) return porArquetipo;
  const porIntensidad = BPM_POR_INTENCIDAD[intensidad];
  return porIntensidad || BPM_POR_DEFECTO;
}

// Escalas por semitonos desde la raíz.
const MENOR = [0, 2, 3, 5, 7, 8, 10];
const MENOR_PENTA = [0, 3, 5, 7, 10];
const DORICO = [0, 2, 3, 5, 7, 9, 10];

// Patrones de 16 pasos por compás (4/4, semicorcheas). '-' es silencio.
const _ = null;
function pasos(...indices) {
  const fila = new Array(16).fill(_);
  for (const indice of indices) fila[indice] = true;
  return fila;
}

// Carácter musical por arquetipo: onda, escala, raíz (Hz) y patrón.
export const MUSICA_POR_ARQUETIPO = Object.freeze({
  fuerza: {
    onda: 'sawtooth',
    escala: MENOR,
    raiz: 55,
    corte: 1200,
    bombo: pasos(0, 4, 8, 12),
    caja: pasos(8),
    charles: pasos(2, 6, 10, 14),
    bajo: [0, _, 0, _, 3, _, 3, _, 5, _, 5, _, 3, _, _, _],
    lead: [0, _, 3, _, 7, _, 3, _, 10, _, 7, _, 3, _, 5, _],
  },
  hiit: {
    onda: 'square',
    escala: MENOR_PENTA,
    raiz: 73.42,
    corte: 2200,
    bombo: pasos(0, 4, 8, 12),
    caja: pasos(4, 12),
    charles: pasos(0, 2, 4, 6, 8, 10, 12, 14),
    bajo: [0, _, 0, 0, 3, _, 3, 3, 5, _, 5, 5, 7, _, 7, 7],
    lead: [12, _, 7, 3, 12, _, 7, 3, 15, _, 10, 7, 12, _, 10, 7],
  },
  combat: {
    onda: 'sawtooth',
    escala: DORICO,
    raiz: 55,
    corte: 1600,
    bombo: pasos(0, 3, 8, 11),
    caja: pasos(4, 12),
    charles: pasos(0, 2, 4, 6, 8, 10, 12, 14),
    bajo: [0, _, 0, 3, _, 5, _, 3, 0, _, 0, 7, _, 5, _, 3],
    lead: [0, 3, 0, 5, 3, 7, 3, 5, 0, 3, 0, 7, 10, 7, 5, 3],
  },
  core: {
    onda: 'sine',
    escala: MENOR_PENTA,
    raiz: 65.41,
    corte: 900,
    bombo: pasos(0, 8),
    caja: pasos(),
    charles: pasos(4, 12),
    bajo: [0, _, _, _, 5, _, _, _, 3, _, _, _, 5, _, _, _],
    lead: [7, _, _, _, 10, _, _, _, 7, _, 5, _, 3, _, _, _],
  },
});

// Pistas instrumentales CC0 (dominio público) empaquetadas en /public/musica.
// Provenencia y licencia: public/musica/CREDITOS.json
export const PISTAS_POR_ARQUETIPO = Object.freeze({
  fuerza: '/musica/fuerza.mp3',
  hiit: '/musica/hiit.mp3',
  combat: '/musica/combat.mp3',
  core: '/musica/core.mp3',
});

function frecuencia(raiz, escala, grado, octava = 0) {
  const n = escala.length;
  const indice = ((grado % n) + n) % n;
  const vuelta = Math.floor(grado / n);
  const semitonos = escala[indice] + 12 * (vuelta + octava);
  return raiz * 2 ** (semitonos / 12);
}

export class MotorMusica {
  constructor() {
    this.contexto = null;
    this.maestro = null;
    this.timer = null;
    this.ruido = null;
    this.bpm = BPM_POR_DEFECTO;
    this.arquetipo = 'fuerza';
    this.patron = MUSICA_POR_ARQUETIPO.fuerza;
    this.volumen = 0.16;
    this.volumenPista = 0.6;
    this.paso = 0;
    this.proximo = 0;
    this.pistaBuffer = null;
    this.pistaFuente = null;
    this.pistaUrl = null;
    this.usandoPista = false;
  }

  _crearRuido() {
    const ctx = this.contexto;
    const duracion = 0.3;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * duracion, ctx.sampleRate);
    const datos = buffer.getChannelData(0);
    for (let i = 0; i < datos.length; i += 1) {
      datos[i] = Math.random() * 2 - 1;
    }
    this.ruido = buffer;
  }

  _bombo(t) {
    const ctx = this.contexto;
    const osc = ctx.createOscillator();
    const gan = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(135, t);
    osc.frequency.exponentialRampToValueAtTime(42, t + 0.12);
    gan.gain.setValueAtTime(0.0001, t);
    gan.gain.exponentialRampToValueAtTime(0.9, t + 0.008);
    gan.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    osc.connect(gan);
    gan.connect(this.maestro);
    osc.start(t);
    osc.stop(t + 0.25);
  }

  _caja(t) {
    const ctx = this.contexto;
    const fuente = ctx.createBufferSource();
    fuente.buffer = this.ruido;
    const filtro = ctx.createBiquadFilter();
    filtro.type = 'highpass';
    filtro.frequency.value = 1600;
    const gan = ctx.createGain();
    gan.gain.setValueAtTime(0.0001, t);
    gan.gain.exponentialRampToValueAtTime(0.5, t + 0.005);
    gan.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);
    fuente.connect(filtro);
    filtro.connect(gan);
    gan.connect(this.maestro);
    fuente.start(t);
    fuente.stop(t + 0.15);
  }

  _charles(t) {
    const ctx = this.contexto;
    const fuente = ctx.createBufferSource();
    fuente.buffer = this.ruido;
    const filtro = ctx.createBiquadFilter();
    filtro.type = 'highpass';
    filtro.frequency.value = 7000;
    const gan = ctx.createGain();
    gan.gain.setValueAtTime(0.0001, t);
    gan.gain.exponentialRampToValueAtTime(0.16, t + 0.004);
    gan.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
    fuente.connect(filtro);
    filtro.connect(gan);
    gan.connect(this.maestro);
    fuente.start(t);
    fuente.stop(t + 0.05);
  }

  _nota(t, freq, duracion, tipo, pico = 0.22) {
    const ctx = this.contexto;
    const osc = ctx.createOscillator();
    const filtro = ctx.createBiquadFilter();
    const gan = ctx.createGain();
    osc.type = tipo;
    osc.frequency.value = freq;
    filtro.type = 'lowpass';
    filtro.frequency.value = this.patron.corte;
    gan.gain.setValueAtTime(0.0001, t);
    gan.gain.exponentialRampToValueAtTime(pico, t + 0.01);
    gan.gain.exponentialRampToValueAtTime(0.0001, t + duracion);
    osc.connect(filtro);
    filtro.connect(gan);
    gan.connect(this.maestro);
    osc.start(t);
    osc.stop(t + duracion + 0.02);
  }

  _programarPaso(t, corchea) {
    const patron = this.patron;
    if (patron.bombo[this.paso]) this._bombo(t);
    if (patron.caja[this.paso]) this._caja(t);
    if (patron.charles[this.paso]) this._charles(t);

    const notaBajo = patron.bajo[this.paso];
    if (notaBajo != null) {
      this._nota(t, frecuencia(patron.raiz, patron.escala, notaBajo, 0), corchea * 1.8, patron.onda, 0.16);
    }
    const notaLead = patron.lead[this.paso];
    if (notaLead != null) {
      this._nota(t, frecuencia(patron.raiz, patron.escala, notaLead, 1), corchea * 0.9, patron.onda, 0.08);
    }
  }

  _tick() {
    const ctx = this.contexto;
    if (!ctx || this.usandoPista) return;
    const corchea = 60 / this.bpm / 4;
    while (this.proximo < ctx.currentTime + 0.12) {
      this._programarPaso(this.proximo, corchea);
      this.paso = (this.paso + 1) % 16;
      this.proximo += corchea;
    }
  }

  async _cargarPista(url) {
    if (!this.contexto || !url) return;
    this.pistaUrl = url;
    try {
      const respuesta = await fetch(url);
      if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
      const datos = await respuesta.arrayBuffer();
      const buffer = await this.contexto.decodeAudioData(datos);
      if (!this.contexto || this.pistaUrl !== url) return;
      this.pistaBuffer = buffer;
      this._reproducirPista();
    } catch {
      // Sin pista: seguimos con el motor generado.
    }
  }

  _reproducirPista() {
    if (!this.pistaBuffer || !this.contexto) return;
    this._detenerPista();
    const fuente = this.contexto.createBufferSource();
    fuente.buffer = this.pistaBuffer;
    fuente.loop = true;
    fuente.connect(this.maestro);
    fuente.start();
    this.pistaFuente = fuente;
    this.usandoPista = true;
    if (this.maestro) this.maestro.gain.value = this.volumenPista;
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  _detenerPista() {
    if (this.pistaFuente) {
      try {
        this.pistaFuente.stop();
      } catch {
        // ya estaba detenida
      }
      this.pistaFuente = null;
    }
    this.usandoPista = false;
  }

  _arrancarReloj() {
    if (this.timer) clearInterval(this.timer);
    this.paso = 0;
    this.proximo = this.contexto.currentTime + 0.08;
    this.timer = setInterval(() => this._tick(), 25);
    this._tick();
  }

  aplicaArquetipo(arquetipo) {
    this.arquetipo = arquetipo;
    this.patron = MUSICA_POR_ARQUETIPO[arquetipo] || MUSICA_POR_ARQUETIPO.fuerza;
    const url = PISTAS_POR_ARQUETIPO[arquetipo] || null;
    if (url !== this.pistaUrl) {
      this.pistaBuffer = null;
      this._detenerPista();
      if (url) this._cargarPista(url);
    }
  }

  iniciar(bpm, arquetipo = 'fuerza') {
    if (typeof window === 'undefined') return false;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return false;

    this.detener();
    this.contexto = new Ctx();
    this.maestro = this.contexto.createGain();
    this.maestro.gain.value = this.volumen;
    this.maestro.connect(this.contexto.destination);
    this.bpm = bpm;
    this.aplicaArquetipo(arquetipo);
    this._crearRuido();
    if (this.contexto.state === 'suspended') this.contexto.resume();
    this._arrancarReloj();
    return true;
  }

  cambiarBpm(bpm) {
    if (bpm === this.bpm) return;
    this.bpm = bpm;
  }

  cambiarArquetipo(arquetipo) {
    if (arquetipo === this.arquetipo) return;
    this.aplicaArquetipo(arquetipo);
  }

  _volumenBase() {
    return this.usandoPista ? this.volumenPista : this.volumen;
  }

  bajarVolumen() {
    if (this.maestro) this.maestro.gain.value = this._volumenBase() * 0.35;
  }

  subirVolumen() {
    if (this.maestro) this.maestro.gain.value = this._volumenBase();
  }

  detener() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this._detenerPista();
    this.pistaBuffer = null;
    this.pistaUrl = null;
    if (this.contexto) {
      this.contexto.close();
      this.contexto = null;
      this.maestro = null;
      this.ruido = null;
    }
  }
}
