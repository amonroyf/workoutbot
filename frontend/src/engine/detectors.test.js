import { describe, it, expect } from 'vitest';
import {
  detectarSentadilla,
  detectarFlexion,
  detectarJumpingJack,
  crearEstadoDetector,
  suavizar,
  DETECTORES,
} from './detectors';

function landmarks() {
  return Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, visibility: 1 }));
}

function conPuntos(overrides) {
  const base = landmarks();
  for (const [indice, punto] of Object.entries(overrides)) {
    base[Number(indice)] = { ...base[Number(indice)], ...punto };
  }
  return base;
}

function alimentar(detector, lms, estado, veces, ahora = 0) {
  let actual = estado;
  let repeticiones = 0;
  for (let i = 0; i < veces; i++) {
    const r = detector(lms, actual, ahora + i * 16);
    actual = r.estado;
    if (r.repeticion) repeticiones++;
  }
  return { estado: actual, repeticiones };
}

describe('suavizar (EMA)', () => {
  it('devuelve el valor nuevo si no hay previo', () => {
    expect(suavizar(null, 100)).toBe(100);
  });

  it('se acerca al nuevo valor sin saltar de golpe', () => {
    expect(suavizar(0, 100, 0.5)).toBe(50);
  });
});

const SENTADILLA_ARRIBA = {
  23: { x: 0.5, y: 0.4 },
  24: { x: 0.5, y: 0.4 },
  25: { x: 0.5, y: 0.6 },
  26: { x: 0.5, y: 0.6 },
  27: { x: 0.5, y: 0.8 },
  28: { x: 0.5, y: 0.8 },
};
const SENTADILLA_ABAJO = {
  23: { x: 0.5, y: 0.5 },
  24: { x: 0.5, y: 0.5 },
  25: { x: 0.5, y: 0.65 },
  26: { x: 0.5, y: 0.65 },
  27: { x: 0.7, y: 0.6 },
  28: { x: 0.7, y: 0.6 },
};

describe('detectarSentadilla', () => {
  it('calibra la cadera de pie y no cuenta solo flexionar', () => {
    let e = crearEstadoDetector();
    e = alimentar(detectarSentadilla, conPuntos(SENTADILLA_ARRIBA), e, 3).estado;
    expect(e.baseY).toBeCloseTo(0.4, 2);

    const r = alimentar(detectarSentadilla, conPuntos(SENTADILLA_ABAJO), e, 4);
    expect(r.estado.fase).toBe('ABAJO');
    expect(r.repeticiones).toBe(0);
  });

  it('cuenta una repeticion al subir tras bajar la cadera', () => {
    let e = crearEstadoDetector();
    e = alimentar(detectarSentadilla, conPuntos(SENTADILLA_ARRIBA), e, 3).estado;
    e = alimentar(detectarSentadilla, conPuntos(SENTADILLA_ABAJO), e, 4).estado;
    const r = alimentar(detectarSentadilla, conPuntos(SENTADILLA_ARRIBA), e, 8);
    expect(r.repeticiones).toBe(1);
    expect(r.estado.fase).toBe('ARRIBA');
  });

  it('no cuenta flexionar rodillas sin bajar la cadera', () => {
    let e = crearEstadoDetector();
    e = alimentar(detectarSentadilla, conPuntos(SENTADILLA_ARRIBA), e, 3).estado;

    const sinDescenso = {
      ...SENTADILLA_ABAJO,
      23: { x: 0.5, y: 0.4 },
      24: { x: 0.5, y: 0.4 },
    };
    const r = alimentar(detectarSentadilla, conPuntos(sinDescenso), e, 6);
    expect(r.repeticiones).toBe(0);
    expect(r.estado.fase).toBe('ARRIBA');
    expect(r.estado.mensaje).toBe('Baja más la cadera');
  });

  it('rechaza la repeticion si se queda sentado mas de 2s', () => {
    let e = crearEstadoDetector();
    e = alimentar(detectarSentadilla, conPuntos(SENTADILLA_ARRIBA), e, 3, 0).estado;
    e = alimentar(detectarSentadilla, conPuntos(SENTADILLA_ABAJO), e, 4, 0).estado;
    expect(e.fase).toBe('ABAJO');

    e = alimentar(detectarSentadilla, conPuntos(SENTADILLA_ABAJO), e, 1, 2500).estado;
    expect(e.sentado).toBe(true);

    const r = alimentar(detectarSentadilla, conPuntos(SENTADILLA_ARRIBA), e, 8, 3000);
    expect(r.repeticiones).toBe(0);
  });

  it('ignora landmarks con baja visibilidad', () => {
    const lms = conPuntos(SENTADILLA_ABAJO);
    lms[26].visibility = 0.1;
    lms[28].visibility = 0.1;
    const r = detectarSentadilla(lms, crearEstadoDetector(), 0);
    expect(r.repeticion).toBe(false);
  });
});

const FLEXION_PLANCHA_ABAJO = {
  11: { x: 0.5, y: 0.5 },
  12: { x: 0.5, y: 0.5 },
  23: { x: 0.6, y: 0.52 },
  24: { x: 0.6, y: 0.52 },
  27: { x: 0.8, y: 0.55 },
  28: { x: 0.8, y: 0.55 },
  13: { x: 0.5, y: 0.65 },
  14: { x: 0.5, y: 0.65 },
  15: { x: 0.7, y: 0.6 },
  16: { x: 0.7, y: 0.6 },
};
const FLEXION_PLANCHA_ARRIBA = {
  ...FLEXION_PLANCHA_ABAJO,
  15: { x: 0.5, y: 0.8 },
  16: { x: 0.5, y: 0.8 },
};

describe('detectarFlexion', () => {
  it('pasa a ABAJO flexionando el codo en plancha', () => {
    const r = alimentar(detectarFlexion, conPuntos(FLEXION_PLANCHA_ABAJO), crearEstadoDetector(), 4);
    expect(r.estado.fase).toBe('ABAJO');
    expect(r.repeticiones).toBe(0);
  });

  it('cuenta una repeticion al extender el codo', () => {
    let e = alimentar(detectarFlexion, conPuntos(FLEXION_PLANCHA_ABAJO), crearEstadoDetector(), 4).estado;
    const r = alimentar(detectarFlexion, conPuntos(FLEXION_PLANCHA_ARRIBA), e, 8);
    expect(r.repeticiones).toBe(1);
    expect(r.estado.fase).toBe('ARRIBA');
  });

  it('no cuenta si el cuerpo no esta en plancha (de pie)', () => {
    const dePie = conPuntos({
      11: { x: 0.5, y: 0.3 },
      12: { x: 0.5, y: 0.3 },
      23: { x: 0.5, y: 0.6 },
      24: { x: 0.5, y: 0.6 },
      27: { x: 0.5, y: 0.9 },
      28: { x: 0.5, y: 0.9 },
      13: { x: 0.5, y: 0.45 },
      14: { x: 0.5, y: 0.45 },
      15: { x: 0.5, y: 0.6 },
      16: { x: 0.5, y: 0.6 },
    });
    const r = alimentar(detectarFlexion, dePie, crearEstadoDetector(), 6);
    expect(r.repeticiones).toBe(0);
    expect(r.estado.mensaje).toBe('Colócate en plancha de perfil');
  });
});

const JJ_ARRIBA = {
  11: { x: 0.4, y: 0.5 },
  12: { x: 0.6, y: 0.5 },
  15: { x: 0.2, y: 0.3 },
  16: { x: 0.8, y: 0.3 },
  23: { x: 0.45, y: 0.6 },
  24: { x: 0.55, y: 0.6 },
  27: { x: 0.1, y: 0.9 },
  28: { x: 0.9, y: 0.9 },
};
const JJ_ABAJO = {
  11: { x: 0.4, y: 0.5 },
  12: { x: 0.6, y: 0.5 },
  15: { x: 0.45, y: 0.7 },
  16: { x: 0.55, y: 0.7 },
  23: { x: 0.45, y: 0.6 },
  24: { x: 0.55, y: 0.6 },
  27: { x: 0.48, y: 0.9 },
  28: { x: 0.52, y: 0.9 },
};

describe('detectarJumpingJack', () => {
  it('pasa a ABAJO con brazos abajo y piernas juntas', () => {
    const r = detectarJumpingJack(conPuntos(JJ_ABAJO), crearEstadoDetector(), 0);
    expect(r.estado.fase).toBe('ABAJO');
    expect(r.repeticion).toBe(false);
  });

  it('cuenta una repeticion con brazos arriba y piernas abiertas', () => {
    let e = detectarJumpingJack(conPuntos(JJ_ABAJO), crearEstadoDetector(), 0).estado;
    const r = detectarJumpingJack(conPuntos(JJ_ARRIBA), e, 100);
    expect(r.repeticion).toBe(true);
    expect(r.estado.fase).toBe('ARRIBA');
  });

  it('no cuenta si los brazos suben pero las piernas siguen juntas', () => {
    let e = detectarJumpingJack(conPuntos(JJ_ABAJO), crearEstadoDetector(), 0).estado;
    const brazosArribaPiernasJuntas = conPuntos({
      ...JJ_ARRIBA,
      27: { x: 0.48, y: 0.9 },
      28: { x: 0.52, y: 0.9 },
    });
    const r = detectarJumpingJack(brazosArribaPiernasJuntas, e, 100);
    expect(r.repeticion).toBe(false);
  });
});

describe('DETECTORES', () => {
  it('mapea los tres ejercicios', () => {
    expect(Object.keys(DETECTORES)).toEqual([
      'SENTADILLAS',
      'FLEXIONES',
      'JUMPING_JACKS',
    ]);
  });
});
