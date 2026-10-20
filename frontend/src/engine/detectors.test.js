import { describe, it, expect } from 'vitest';
import {
  detectarSentadilla,
  detectarFlexion,
  detectarJumpingJack,
  detectarZancada,
  detectarPlancha,
  detectarRodillasAltas,
  detectarPuenteGluteo,
  detectarAbdominal,
  detectarMountainClimber,
  detectarPlanchaLateral,
  detectarSuperman,
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

describe('detectarZancada', () => {
  it('cuenta una repeticion al subir tras bajar la cadera', () => {
    let e = alimentar(detectarZancada, conPuntos(SENTADILLA_ARRIBA), crearEstadoDetector(), 3).estado;
    e = alimentar(detectarZancada, conPuntos(SENTADILLA_ABAJO), e, 4).estado;
    expect(e.fase).toBe('ABAJO');

    const r = alimentar(detectarZancada, conPuntos(SENTADILLA_ARRIBA), e, 8);
    expect(r.repeticiones).toBe(1);
  });

  it('avisa si flexiona la rodilla sin bajar la cadera', () => {
    let e = alimentar(detectarZancada, conPuntos(SENTADILLA_ARRIBA), crearEstadoDetector(), 3).estado;
    const sinDescenso = {
      ...SENTADILLA_ABAJO,
      23: { x: 0.5, y: 0.4 },
      24: { x: 0.5, y: 0.4 },
    };
    const r = alimentar(detectarZancada, conPuntos(sinDescenso), e, 6);
    expect(r.repeticiones).toBe(0);
    expect(r.estado.mensaje).toBe('Da un paso más largo y baja la rodilla');
  });
});

const PLANCHA_FIRME = {
  11: { x: 0.34, y: 0.7 },
  12: { x: 0.34, y: 0.7 },
  23: { x: 0.55, y: 0.72 },
  24: { x: 0.55, y: 0.72 },
  27: { x: 0.85, y: 0.74 },
  28: { x: 0.85, y: 0.74 },
};

describe('detectarPlancha', () => {
  it('no cuenta repeticiones y valida la linea del cuerpo', () => {
    const r = alimentar(detectarPlancha, conPuntos(PLANCHA_FIRME), crearEstadoDetector(), 4);
    expect(r.repeticiones).toBe(0);
    expect(r.estado.mensaje).toBe(null);
  });

  it('avisa si la cadera se cae', () => {
    const caderaCaida = {
      ...PLANCHA_FIRME,
      23: { x: 0.55, y: 0.85 },
      24: { x: 0.55, y: 0.85 },
    };
    const r = alimentar(detectarPlancha, conPuntos(caderaCaida), crearEstadoDetector(), 1);
    expect(r.estado.mensaje).toBe('Alinea el cuerpo: no dejes caer la cadera');
  });

  it('pide perfil si no ve el cuerpo horizontal', () => {
    const dePie = conPuntos({
      11: { x: 0.5, y: 0.3 },
      12: { x: 0.5, y: 0.3 },
      23: { x: 0.5, y: 0.6 },
      24: { x: 0.5, y: 0.6 },
      27: { x: 0.5, y: 0.9 },
      28: { x: 0.5, y: 0.9 },
    });
    const r = alimentar(detectarPlancha, dePie, crearEstadoDetector(), 1);
    expect(r.estado.mensaje).toBe('Ponte en plancha de perfil');
  });
});

const RODILLAS_ABAJO = {
  23: { x: 0.45, y: 0.55 },
  24: { x: 0.55, y: 0.55 },
  25: { x: 0.47, y: 0.72 },
  26: { x: 0.53, y: 0.72 },
};
const RODILLA_IZQ_ARRIBA = {
  ...RODILLAS_ABAJO,
  25: { x: 0.44, y: 0.45 },
};
const RODILLA_DER_ARRIBA = {
  ...RODILLAS_ABAJO,
  26: { x: 0.56, y: 0.45 },
};

describe('detectarRodillasAltas', () => {
  it('cuenta cada rodilla que sube y baja', () => {
    let e = alimentar(detectarRodillasAltas, conPuntos(RODILLAS_ABAJO), crearEstadoDetector(), 1).estado;
    let r = alimentar(detectarRodillasAltas, conPuntos(RODILLA_IZQ_ARRIBA), e, 1);
    expect(r.repeticiones).toBe(1);

    r = alimentar(detectarRodillasAltas, conPuntos(RODILLA_IZQ_ARRIBA), r.estado, 3);
    expect(r.repeticiones).toBe(0);

    r = alimentar(detectarRodillasAltas, conPuntos(RODILLAS_ABAJO), r.estado, 1);
    r = alimentar(detectarRodillasAltas, conPuntos(RODILLA_DER_ARRIBA), r.estado, 1);
    expect(r.repeticiones).toBe(1);
  });

  it('ignora landmarks con baja visibilidad', () => {
    const lms = conPuntos(RODILLA_IZQ_ARRIBA);
    lms[25].visibility = 0.1;
    lms[26].visibility = 0.1;
    const r = detectarRodillasAltas(lms, crearEstadoDetector(), 0);
    expect(r.repeticion).toBe(false);
  });
});

const PUENTE_ABAJO = {
  11: { x: 0.3, y: 0.78 },
  12: { x: 0.3, y: 0.78 },
  23: { x: 0.55, y: 0.78 },
  24: { x: 0.55, y: 0.78 },
  25: { x: 0.65, y: 0.62 },
  26: { x: 0.65, y: 0.62 },
};
const PUENTE_ARRIBA = {
  ...PUENTE_ABAJO,
  23: { x: 0.55, y: 0.68 },
  24: { x: 0.55, y: 0.68 },
};

describe('detectarPuenteGluteo', () => {
  it('cuenta una repeticion al levantar la cadera', () => {
    let e = alimentar(detectarPuenteGluteo, conPuntos(PUENTE_ABAJO), crearEstadoDetector(), 1).estado;
    expect(e.fase).toBe('ABAJO');

    const r = alimentar(detectarPuenteGluteo, conPuntos(PUENTE_ARRIBA), e, 1);
    expect(r.repeticiones).toBe(1);
    expect(r.estado.fase).toBe('ARRIBA');
  });

  it('pide acostarse si el cuerpo esta vertical', () => {
    const dePie = conPuntos({
      11: { x: 0.5, y: 0.3 },
      12: { x: 0.5, y: 0.3 },
      23: { x: 0.5, y: 0.6 },
      24: { x: 0.5, y: 0.6 },
      25: { x: 0.5, y: 0.8 },
      26: { x: 0.5, y: 0.8 },
    });
    const r = alimentar(detectarPuenteGluteo, dePie, crearEstadoDetector(), 1);
    expect(r.estado.mensaje).toBe('Acuéstate boca arriba de perfil');
  });
});

const ABDOMINAL_ABAJO = {
  11: { x: 0.3, y: 0.8 },
  12: { x: 0.3, y: 0.8 },
  23: { x: 0.55, y: 0.8 },
  24: { x: 0.55, y: 0.8 },
  25: { x: 0.65, y: 0.65 },
  26: { x: 0.65, y: 0.65 },
};
const ABDOMINAL_ARRIBA = {
  ...ABDOMINAL_ABAJO,
  11: { x: 0.3, y: 0.7 },
  12: { x: 0.3, y: 0.7 },
};

describe('detectarAbdominal', () => {
  it('cuenta una repeticion al subir el torso', () => {
    let e = alimentar(detectarAbdominal, conPuntos(ABDOMINAL_ABAJO), crearEstadoDetector(), 1).estado;
    expect(e.fase).toBe('ABAJO');

    const r = alimentar(detectarAbdominal, conPuntos(ABDOMINAL_ARRIBA), e, 1);
    expect(r.repeticiones).toBe(1);
    expect(r.estado.fase).toBe('ARRIBA');
  });

  it('pide acostarse si el cuerpo esta vertical', () => {
    const dePie = conPuntos({
      11: { x: 0.5, y: 0.3 },
      12: { x: 0.5, y: 0.3 },
      23: { x: 0.5, y: 0.6 },
      24: { x: 0.5, y: 0.6 },
      25: { x: 0.5, y: 0.8 },
      26: { x: 0.5, y: 0.8 },
    });
    const r = alimentar(detectarAbdominal, dePie, crearEstadoDetector(), 1);
    expect(r.estado.mensaje).toBe('Acuéstate boca arriba de perfil');
  });
});

const ESCALADOR_BASE = {
  11: { x: 0.34, y: 0.7 },
  12: { x: 0.34, y: 0.72 },
  23: { x: 0.55, y: 0.72 },
  24: { x: 0.55, y: 0.74 },
  25: { x: 0.7, y: 0.76 },
  26: { x: 0.7, y: 0.78 },
  27: { x: 0.85, y: 0.78 },
  28: { x: 0.85, y: 0.8 },
};
const ESCALADOR_IZQ = {
  ...ESCALADOR_BASE,
  25: { x: 0.48, y: 0.8 },
  27: { x: 0.55, y: 0.86 },
};
const ESCALADOR_DER = {
  ...ESCALADOR_BASE,
  26: { x: 0.48, y: 0.82 },
  28: { x: 0.55, y: 0.88 },
};

describe('detectarMountainClimber', () => {
  it('cuenta cada rodilla que se lleva al pecho', () => {
    let e = alimentar(detectarMountainClimber, conPuntos(ESCALADOR_BASE), crearEstadoDetector(), 2).estado;
    expect(e.ladoActivo).toBe(null);

    let r = alimentar(detectarMountainClimber, conPuntos(ESCALADOR_IZQ), e, 4);
    expect(r.repeticiones).toBe(1);
    expect(r.estado.ladoActivo).toBe('IZQ');

    r = alimentar(detectarMountainClimber, conPuntos(ESCALADOR_IZQ), r.estado, 3);
    expect(r.repeticiones).toBe(0);

    r = alimentar(detectarMountainClimber, conPuntos(ESCALADOR_DER), r.estado, 4);
    expect(r.repeticiones).toBe(1);
    expect(r.estado.ladoActivo).toBe('DER');
  });

  it('no cuenta si las dos rodillas estan dobladas', () => {
    let e = alimentar(detectarMountainClimber, conPuntos(ESCALADOR_BASE), crearEstadoDetector(), 2).estado;
    const dosDobladas = {
      ...ESCALADOR_IZQ,
      26: { x: 0.48, y: 0.82 },
      28: { x: 0.55, y: 0.88 },
    };
    const r = alimentar(detectarMountainClimber, conPuntos(dosDobladas), e, 4);
    expect(r.repeticiones).toBe(0);
    expect(r.estado.mensaje).toBe('Alterna las rodillas y estira la otra pierna');
  });

  it('pide plancha de perfil si el cuerpo esta vertical', () => {
    const dePie = conPuntos({
      11: { x: 0.5, y: 0.3 },
      12: { x: 0.5, y: 0.3 },
      23: { x: 0.5, y: 0.6 },
      24: { x: 0.5, y: 0.6 },
    });
    const r = alimentar(detectarMountainClimber, dePie, crearEstadoDetector(), 1);
    expect(r.estado.mensaje).toBe('Ponte en plancha de perfil');
  });
});

const LATERAL_FIRME = {
  11: { x: 0.34, y: 0.6 },
  12: { x: 0.34, y: 0.62 },
  23: { x: 0.55, y: 0.66 },
  24: { x: 0.55, y: 0.68 },
  27: { x: 0.85, y: 0.78 },
  28: { x: 0.85, y: 0.8 },
};

describe('detectarPlanchaLateral', () => {
  it('no cuenta repeticiones y acepta la linea del cuerpo', () => {
    const r = alimentar(detectarPlanchaLateral, conPuntos(LATERAL_FIRME), crearEstadoDetector(), 2);
    expect(r.repeticiones).toBe(0);
    expect(r.estado.mensaje).toBe(null);
  });

  it('avisa si la cadera se cae', () => {
    const caderaCaida = {
      ...LATERAL_FIRME,
      23: { x: 0.55, y: 0.8 },
      24: { x: 0.55, y: 0.82 },
    };
    const r = alimentar(detectarPlanchaLateral, conPuntos(caderaCaida), crearEstadoDetector(), 2);
    expect(r.estado.mensaje).toBe('Sube la cadera y alinea el cuerpo');
  });

  it('pide perfil si el cuerpo esta vertical', () => {
    const dePie = conPuntos({
      11: { x: 0.5, y: 0.3 },
      12: { x: 0.5, y: 0.3 },
      23: { x: 0.5, y: 0.6 },
      24: { x: 0.5, y: 0.6 },
      27: { x: 0.5, y: 0.9 },
      28: { x: 0.5, y: 0.9 },
    });
    const r = alimentar(detectarPlanchaLateral, dePie, crearEstadoDetector(), 1);
    expect(r.estado.mensaje).toBe('Ponte de perfil en plancha lateral');
  });
});

const SUPERMAN_BASE = {
  11: { x: 0.36, y: 0.74 },
  12: { x: 0.36, y: 0.76 },
  15: { x: 0.16, y: 0.74 },
  16: { x: 0.16, y: 0.76 },
  23: { x: 0.55, y: 0.78 },
  24: { x: 0.55, y: 0.8 },
  27: { x: 0.85, y: 0.82 },
  28: { x: 0.85, y: 0.84 },
};
const SUPERMAN_ARRIBA = {
  ...SUPERMAN_BASE,
  15: { x: 0.16, y: 0.64 },
  16: { x: 0.16, y: 0.66 },
  27: { x: 0.85, y: 0.72 },
  28: { x: 0.85, y: 0.74 },
};

describe('detectarSuperman', () => {
  it('valida el cuerpo boca abajo con brazos y piernas arriba', () => {
    const r = alimentar(detectarSuperman, conPuntos(SUPERMAN_ARRIBA), crearEstadoDetector(), 2);
    expect(r.repeticiones).toBe(0);
    expect(r.estado.mensaje).toBe(null);
  });

  it('pide levantar brazos y piernas', () => {
    const r = alimentar(detectarSuperman, conPuntos(SUPERMAN_BASE), crearEstadoDetector(), 1);
    expect(r.estado.mensaje).toBe('Levanta brazos y piernas');
  });

  it('avisa si solo sube una parte del cuerpo', () => {
    const soloBrazos = {
      ...SUPERMAN_BASE,
      15: { x: 0.16, y: 0.64 },
      16: { x: 0.16, y: 0.66 },
    };
    let r = alimentar(detectarSuperman, conPuntos(soloBrazos), crearEstadoDetector(), 1);
    expect(r.estado.mensaje).toBe('Sube más las piernas');

    const soloPiernas = {
      ...SUPERMAN_BASE,
      27: { x: 0.85, y: 0.72 },
      28: { x: 0.85, y: 0.74 },
    };
    r = alimentar(detectarSuperman, conPuntos(soloPiernas), crearEstadoDetector(), 1);
    expect(r.estado.mensaje).toBe('Sube más los brazos');
  });

  it('pide acostarse de perfil si el cuerpo esta vertical', () => {
    const dePie = conPuntos({
      11: { x: 0.5, y: 0.3 },
      12: { x: 0.5, y: 0.3 },
      23: { x: 0.5, y: 0.6 },
      24: { x: 0.5, y: 0.6 },
    });
    const r = alimentar(detectarSuperman, dePie, crearEstadoDetector(), 1);
    expect(r.estado.mensaje).toBe('Acuéstate boca abajo de perfil');
  });
});

describe('DETECTORES', () => {
  it('mapea los ejercicios del catalogo', () => {
    expect(Object.keys(DETECTORES)).toEqual([
      'SENTADILLAS',
      'FLEXIONES',
      'JUMPING_JACKS',
      'ZANCADAS',
      'PLANCHA',
      'RODILLAS_ALTAS',
      'PUENTE_GLUTEO',
      'ABDOMINALES',
      'MOUNTAIN_CLIMBER',
      'PLANCHA_LATERAL',
      'SUPERMAN',
    ]);
  });
});
