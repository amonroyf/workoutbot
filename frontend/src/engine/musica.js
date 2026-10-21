export const BPM_POR_SECCION = Object.freeze({
  calentamiento: 116,
  fuerza: 128,
  metabolico: 150,
  core: 120,
  enfriamiento: 92,
});

// BPM por intensidad para el formato 'express' (clases sin secciones)
export const BPM_POR_INTENCIDAD = Object.freeze({
  suave: 104,
  media: 126,
  alta: 152,
});

export const BPM_POR_DEFECTO = 126;

export function bpmSeccion(seccionId, intensidad = '') {
  const porSeccion = BPM_POR_SECCION[seccionId];
  if (porSeccion) return porSeccion;
  const porIntensidad = BPM_POR_INTENCIDAD[intensidad];
  return porIntensidad || BPM_POR_DEFECTO;
}

export class MotorMusica {
  constructor() {
    this.contexto = null;
    this.ganancia = null;
    this.timer = null;
    this.bpm = 126;
    this.volumen = 0.16;
  }

  _pulso(tipo) {
    const ctx = this.contexto;
    if (!ctx || ctx.state === 'suspended') return;

    const ahora = ctx.currentTime;
    const oscilador = ctx.createOscillator();
    const ganancia = ctx.createGain();

    if (tipo === 'bajo') {
      oscilador.type = 'sine';
      oscilador.frequency.setValueAtTime(120, ahora);
      oscilador.frequency.exponentialRampToValueAtTime(45, ahora + 0.12);
      ganancia.gain.setValueAtTime(0.0001, ahora);
      ganancia.gain.exponentialRampToValueAtTime(0.55, ahora + 0.01);
      ganancia.gain.exponentialRampToValueAtTime(0.0001, ahora + 0.18);
    } else {
      oscilador.type = 'triangle';
      oscilador.frequency.setValueAtTime(6500, ahora);
      ganancia.gain.setValueAtTime(0.0001, ahora);
      ganancia.gain.exponentialRampToValueAtTime(0.07, ahora + 0.005);
      ganancia.gain.exponentialRampToValueAtTime(0.0001, ahora + 0.05);
    }

    oscilador.connect(ganancia);
    ganancia.connect(this.ganancia);
    oscilador.start(ahora);
    oscilador.stop(ahora + 0.2);
  }

  _programar() {
    if (!this.contexto) return;

    const intervalo = 60000 / this.bpm;
    this.timer = setInterval(() => {
      if (!this.contexto) return;
      this._pulso('bajo');
      setTimeout(() => this._pulso('hat'), intervalo / 2);
    }, intervalo);
  }

  iniciar(bpm) {
    if (typeof window === 'undefined') return false;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return false;

    this.detener();
    this.contexto = new Ctx();
    this.ganancia = this.contexto.createGain();
    this.ganancia.gain.value = this.volumen;
    this.ganancia.connect(this.contexto.destination);
    this.bpm = bpm;
    if (this.contexto.state === 'suspended') this.contexto.resume();
    this._programar();
    return true;
  }

  cambiarBpm(bpm) {
    this.bpm = bpm;
    if (this.timer) {
      clearInterval(this.timer);
      this._programar();
    }
  }

  bajarVolumen() {
    if (this.ganancia) this.ganancia.gain.value = this.volumen * 0.35;
  }

  subirVolumen() {
    if (this.ganancia) this.ganancia.gain.value = this.volumen;
  }

  detener() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    if (this.contexto) {
      this.contexto.close();
      this.contexto = null;
      this.ganancia = null;
    }
  }
}
