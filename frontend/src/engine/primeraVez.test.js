import { describe, it, expect } from 'vitest';
import {
  esPrimeraVez,
  guiaVista,
  marcarGuiaVista,
  PASOS_PRIMERA_VEZ,
  CLAVE_GUIA,
  CLAVE_ONBOARDING,
  marcarOnboardingVisto,
  onboardingVisto,
} from './primeraVez';

function memoria() {
  const datos = new Map();
  return {
    getItem: (clave) => (datos.has(clave) ? datos.get(clave) : null),
    setItem: (clave, valor) => datos.set(clave, valor),
  };
}

describe('esPrimeraVez', () => {
  it('es primera vez cuando no hay historial', () => {
    expect(esPrimeraVez(null)).toBe(true);
    expect(esPrimeraVez({ racha: 0 })).toBe(true);
    expect(esPrimeraVez({ racha: 0, ultima: null })).toBe(true);
  });

  it('deja de ser primera vez con historial', () => {
    expect(esPrimeraVez({ racha: 3, ultima: { total_reps: 40 } })).toBe(false);
    expect(esPrimeraVez({ racha: 0, ultima: { total_reps: 10 } })).toBe(false);
  });
});

describe('guiaVista', () => {
  it('recorda que la guia ya se vio', () => {
    const storage = memoria();
    expect(guiaVista(storage)).toBe(false);
    marcarGuiaVista(storage);
    expect(guiaVista(storage)).toBe(true);
    expect(storage.getItem(CLAVE_GUIA)).toBe('1');
  });

  it('no falla si el almacenamiento no existe', () => {
    expect(guiaVista(null)).toBe(false);
    expect(marcarGuiaVista(null)).toBe(false);
  });
});

describe('PASOS_PRIMERA_VEZ', () => {
  it('tiene tres pasos con icono y texto', () => {
    expect(PASOS_PRIMERA_VEZ).toHaveLength(3);
    for (const paso of PASOS_PRIMERA_VEZ) {
      expect(paso.icono.length).toBeGreaterThan(0);
      expect(paso.titulo.length).toBeGreaterThan(0);
      expect(paso.texto.length).toBeGreaterThan(0);
    }
  });
});

describe('onboardingVisto', () => {
  it('recuerda que el onboarding ya se vio', () => {
    const storage = memoria();
    expect(onboardingVisto(storage)).toBe(false);
    marcarOnboardingVisto(storage);
    expect(onboardingVisto(storage)).toBe(true);
    expect(storage.getItem(CLAVE_ONBOARDING)).toBe('1');
  });

  it('no falla si el almacenamiento no existe', () => {
    expect(onboardingVisto(null)).toBe(false);
    expect(marcarOnboardingVisto(null)).toBe(false);
  });
});
