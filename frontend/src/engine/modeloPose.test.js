import { describe, it, expect } from 'vitest';
import {
  MODELOS_POSE,
  elegirModeloPose,
  modelosParaIntentar,
  normalizarModelo,
} from './modeloPose';

describe('elegirModeloPose', () => {
  it('usa lite en moviles de gama baja', () => {
    expect(
      elegirModeloPose({ movil: true, hardwareConcurrency: 4, deviceMemory: 4 })
    ).toBe('lite');
  });

  it('usa full en moviles de gama alta', () => {
    expect(
      elegirModeloPose({ movil: true, hardwareConcurrency: 8, deviceMemory: 8 })
    ).toBe('full');
  });

  it('usa heavy en escritorio potente', () => {
    expect(
      elegirModeloPose({ movil: false, hardwareConcurrency: 12, deviceMemory: 8 })
    ).toBe('heavy');
  });

  it('usa full en escritorio medio', () => {
    expect(
      elegirModeloPose({ movil: false, hardwareConcurrency: 4, deviceMemory: 4 })
    ).toBe('full');
  });

  it('usa lite en equipos limitados', () => {
    expect(
      elegirModeloPose({ movil: false, hardwareConcurrency: 2, deviceMemory: 2 })
    ).toBe('lite');
  });

  it('respeta el override manual', () => {
    expect(
      elegirModeloPose({
        movil: true,
        hardwareConcurrency: 2,
        deviceMemory: 2,
        override: 'heavy',
      })
    ).toBe('heavy');
  });
});

describe('normalizarModelo', () => {
  it('acepta ids validos sin importar mayusculas', () => {
    expect(normalizarModelo('FULL')).toBe('full');
  });

  it('rechaza ids desconocidos', () => {
    expect(normalizarModelo('ultra')).toBe(null);
  });
});

describe('modelosParaIntentar', () => {
  it('baja de heavy a full y lite', () => {
    expect(modelosParaIntentar('heavy')).toEqual(['heavy', 'full', 'lite']);
  });

  it('baja de full a lite', () => {
    expect(modelosParaIntentar('full')).toEqual(['full', 'lite']);
  });

  it('usa lite como ultimo respaldo', () => {
    expect(modelosParaIntentar('desconocido')).toEqual(['lite']);
  });
});

describe('MODELOS_POSE', () => {
  it('define las tres variantes con su URL', () => {
    expect(Object.keys(MODELOS_POSE).sort()).toEqual(['full', 'heavy', 'lite']);
    for (const modelo of Object.values(MODELOS_POSE)) {
      expect(modelo.url).toContain(`pose_landmarker_${modelo.id}`);
    }
  });
});
