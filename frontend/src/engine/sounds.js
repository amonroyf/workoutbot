let audioCtx = null;

function getContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

const ESCALA_COMBO = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99, 880.0];

export function playRep(combo = 0, perfecta = false) {
  const ctx = getContext();
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  const notaIdx = Math.min(combo, ESCALA_COMBO.length - 1);
  const freqBase = ESCALA_COMBO[notaIdx];

  osc.type = 'sine';
  osc.frequency.setValueAtTime(freqBase, t);
  osc.frequency.exponentialRampToValueAtTime(freqBase * 1.05, t + 0.12);

  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(perfecta ? 0.35 : 0.22, t + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + (perfecta ? 0.25 : 0.14));

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(t);
  osc.stop(t + (perfecta ? 0.26 : 0.15));

  if (perfecta) {
    const oscHarm = ctx.createOscillator();
    const gainHarm = ctx.createGain();
    oscHarm.type = 'triangle';
    oscHarm.frequency.setValueAtTime(freqBase * 2, t + 0.03);
    gainHarm.gain.setValueAtTime(0.0001, t + 0.03);
    gainHarm.gain.exponentialRampToValueAtTime(0.18, t + 0.05);
    gainHarm.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
    oscHarm.connect(gainHarm);
    gainHarm.connect(ctx.destination);
    oscHarm.start(t + 0.03);
    oscHarm.stop(t + 0.29);
  }
}

export function playAlert() {
  const ctx = getContext();
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(140, t);
  osc.frequency.exponentialRampToValueAtTime(90, t + 0.18);

  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.2, t + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(t);
  osc.stop(t + 0.22);
}

export function playCountdownPip(segundoRestante) {
  const ctx = getContext();
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  const esFinal = segundoRestante === 1;
  const freq = esFinal ? 880 : 540;

  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, t);

  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.25, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + (esFinal ? 0.2 : 0.08));

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(t);
  osc.stop(t + (esFinal ? 0.22 : 0.09));
}

export function playSideSwitch() {
  const ctx = getContext();
  const t = ctx.currentTime;

  [587.33, 880.0].forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const delay = idx * 0.12;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t + delay);

    gain.gain.setValueAtTime(0.0001, t + delay);
    gain.gain.exponentialRampToValueAtTime(0.28, t + delay + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + delay + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t + delay);
    osc.stop(t + delay + 0.26);
  });
}

export function playStart() {
  const ctx = getContext();
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.setValueAtTime(440, t);
  osc.frequency.exponentialRampToValueAtTime(880, t + 0.25);
  gain.gain.setValueAtTime(0.25, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
  osc.start(t);
  osc.stop(t + 0.36);
}

export function playWhistle() {
  const ctx = getContext();
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.setValueAtTime(1200, t);
  osc.frequency.setValueAtTime(1200, t + 0.15);
  osc.frequency.setValueAtTime(800, t + 0.2);
  gain.gain.setValueAtTime(0.18, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.38);
  osc.start(t);
  osc.stop(t + 0.4);
}

export function playCoin() {
  // alias for compatibility
}
