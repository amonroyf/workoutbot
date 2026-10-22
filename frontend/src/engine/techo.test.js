import { describe, it, expect } from 'vitest';
import {
  actualizarJuegoTecho,
  crearJuegoTecho,
  reintentarTecho,
  segundosSobrevividos,
  ALTURA_TECHO_INICIO,
  CABEZA_Y,
  GROSOR_TECHO,
  UMBRAL_SOSTEN,
  VELOCIDAD_CAIDA,
} from './techo';

const SCORE_BUENO = UMBRAL_SOSTEN + 15;
const SCORE_MALO = UMBRAL_SOSTEN - 25;

function correr(msTotal, scoreForma, pasoMs = 50) {
  let estado = crearJuegoTecho();
  let aplasto = false;
  for (let t = 0; t <= msTotal; t += pasoMs) {
    const r = actualizarJuegoTecho(estado, scoreForma, t);
    estado = r.estado;
    aplasto = aplasto || r.aplasto;
  }
  return { estado, aplasto };
}

describe('actualizarJuegoTecho', () => {
  it('sostiene el techo mientras la forma supera el umbral', () => {
    const { estado, aplasto } = correr(2000, SCORE_BUENO);
    expect(estado.altura).toBe(ALTURA_TECHO_INICIO);
    expect(estado.aplastado).toBe(false);
    expect(aplasto).toBe(false);
    expect(estado.sobrevividoMs).toBe(2000);
  });

  it('cae cuando la forma baja del umbral', () => {
    const { estado } = correr(1000, SCORE_MALO);
    expect(estado.altura).toBeGreaterThan(ALTURA_TECHO_INICIO + VELOCIDAD_CAIDA * 0.9);
    expect(estado.altura).toBeLessThan(ALTURA_TECHO_INICIO + VELOCIDAD_CAIDA * 1.1);
  });

  it('cae igual si no hay pose visible', () => {
    const { estado } = correr(1000, null);
    expect(estado.altura).toBeGreaterThan(ALTURA_TECHO_INICIO);
    expect(estado.scoreSuavizado).toBeNull();
  });

  it('un solo frame con mala forma no aplasta (score suavizado)', () => {
    let estado = correr(2000, SCORE_BUENO).estado;
    expect(estado.altura).toBe(ALTURA_TECHO_INICIO);

    const r = actualizarJuegoTecho(estado, 0, 2100);
    expect(r.aplasto).toBe(false);
    expect(r.estado.altura).toBe(ALTURA_TECHO_INICIO + (VELOCIDAD_CAIDA * 100) / 1000);
  });

  it('aplasta cuando el techo llega a la cabeza', () => {
    const { estado, aplasto } = correr(9000, SCORE_MALO);
    expect(aplasto).toBe(true);
    expect(estado.aplastado).toBe(true);
    expect(estado.altura + GROSOR_TECHO).toBeGreaterThanOrEqual(CABEZA_Y);
    expect(estado.mejorMs).toBeGreaterThan(0);
  });

  it('no sigue simulando después del aplasto', () => {
    const { estado } = correr(9000, SCORE_MALO);
    const r = actualizarJuegoTecho(estado, SCORE_BUENO, estado.ultimoMs + 16);
    expect(r.aplasto).toBe(false);
    expect(r.estado.sobrevividoMs).toBe(estado.sobrevividoMs);
  });

  it('recorta saltos de tiempo gigantes (pestaña en segundo plano)', () => {
    // Primer frame: el juego recién arranca, dt es 0.
    const base = actualizarJuegoTecho(crearJuegoTecho(), SCORE_MALO, 0).estado;
    // Vuelve tras 5s de pestaña oculta: solo se cuenta un salto de 100ms.
    const r = actualizarJuegoTecho(base, SCORE_MALO, 5000);
    expect(r.estado.altura).toBeCloseTo(ALTURA_TECHO_INICIO + VELOCIDAD_CAIDA * 0.1, 6);
    // Sigue avanzando a ritmo normal tras el salto.
    const r2 = actualizarJuegoTecho(r.estado, SCORE_MALO, 5060);
    expect(r2.estado.altura).toBeCloseTo(
      ALTURA_TECHO_INICIO + VELOCIDAD_CAIDA * 0.1 + VELOCIDAD_CAIDA * 0.06,
      6
    );
  });
});

describe('reintentarTecho', () => {
  it('reinicia la altura y suma intentos conservando la mejor marca', () => {
    const { estado } = correr(9000, SCORE_MALO);
    const mejor = estado.mejorMs;

    const reiniciado = reintentarTecho(estado, 20000);
    expect(reiniciado.altura).toBe(ALTURA_TECHO_INICIO);
    expect(reiniciado.aplastado).toBe(false);
    expect(reiniciado.intentos).toBe(2);
    expect(reiniciado.sobrevividoMs).toBe(0);
    expect(reiniciado.mejorMs).toBe(mejor);
  });

});

describe('segundosSobrevividos', () => {
  it('redondea hacia abajo el tiempo sobrevivido', () => {
    expect(segundosSobrevividos({ sobrevividoMs: 2380 })).toBe(2);
    expect(segundosSobrevividos({ sobrevividoMs: 2000 })).toBe(2);
    expect(segundosSobrevividos({ sobrevividoMs: 1999 })).toBe(1);
  });
});
