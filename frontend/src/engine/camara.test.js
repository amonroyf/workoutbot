import { describe, it, expect } from 'vitest';
import {
  CLAVE_CAMARA,
  guardarCamaraHabilitada,
  leerCamaraHabilitada,
} from './camara';

function memoria() {
  const datos = new Map();
  return {
    getItem: (clave) => (datos.has(clave) ? datos.get(clave) : null),
    setItem: (clave, valor) => datos.set(clave, valor),
  };
}

describe('leerCamaraHabilitada', () => {
  it('activa la camara por defecto', () => {
    expect(leerCamaraHabilitada(memoria())).toBe(true);
  });

  it('recuerda cuando la camara se apago', () => {
    const storage = memoria();
    guardarCamaraHabilitada(false, storage);
    expect(storage.getItem(CLAVE_CAMARA)).toBe('0');
    expect(leerCamaraHabilitada(storage)).toBe(false);
  });

  it('vuelve a activarla cuando se guarda true', () => {
    const storage = memoria();
    guardarCamaraHabilitada(false, storage);
    guardarCamaraHabilitada(true, storage);
    expect(storage.getItem(CLAVE_CAMARA)).toBe('1');
    expect(leerCamaraHabilitada(storage)).toBe(true);
  });

  it('no falla si el almacenamiento no existe', () => {
    expect(leerCamaraHabilitada(null)).toBe(true);
    expect(guardarCamaraHabilitada(false, null)).toBe(false);
  });
});
