import { describe, it, expect, vi } from 'vitest';
import {
  esIos,
  esPantallaCompleta,
  puedeEntrarEnPantallaCompleta,
  solicitarPantallaCompleta,
  salirDePantallaCompleta,
} from './pantallaCompleta';

function documentoFalso(opciones = {}) {
  const {
    pedir = vi.fn(() => Promise.resolve()),
    salir = vi.fn(() => Promise.resolve()),
    fullscreenElement = null,
  } = opciones;
  const elemento = { requestFullscreen: pedir };
  return {
    documentElement: elemento,
    fullscreenElement,
    exitFullscreen: salir,
    pedir,
    salir,
  };
}

describe('pantalla completa', () => {
  it('detecta si ya está en pantalla completa', () => {
    expect(esPantallaCompleta(documentoFalso())).toBe(false);
    expect(esPantallaCompleta(documentoFalso({ fullscreenElement: {} }))).toBe(true);
    expect(esPantallaCompleta(null)).toBe(false);
  });

  it('indica si el navegador lo permite', () => {
    expect(puedeEntrarEnPantallaCompleta(documentoFalso())).toBe(true);
    expect(puedeEntrarEnPantallaCompleta({ documentElement: {} })).toBe(false);
    expect(puedeEntrarEnPantallaCompleta(null)).toBe(false);
  });

  it('solicita la pantalla completa al documento', async () => {
    const doc = documentoFalso();
    await solicitarPantallaCompleta(doc);
    expect(doc.pedir).toHaveBeenCalledTimes(1);
  });

  it('no falla si el navegador no soporta la API', async () => {
    const doc = { documentElement: {} };
    await expect(solicitarPantallaCompleta(doc)).resolves.toBe(false);
  });

  it('no rompe la app si el navegador rechaza la solicitud', async () => {
    const doc = documentoFalso({ pedir: vi.fn(() => Promise.reject(new Error('sin gesto'))) });
    await expect(solicitarPantallaCompleta(doc)).resolves.toBe(false);
  });

  it('sale de pantalla completa solo si estaba activa', async () => {
    const dentro = documentoFalso({ fullscreenElement: {} });
    await salirDePantallaCompleta(dentro);
    expect(dentro.salir).toHaveBeenCalledTimes(1);

    const fuera = documentoFalso();
    await salirDePantallaCompleta(fuera);
    expect(fuera.salir).not.toHaveBeenCalled();
  });

  it('detecta iOS, donde la API de pantalla completa no existe', () => {
    expect(esIos({ userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)' })).toBe(true);
    expect(esIos({ userAgent: 'Mozilla/5.0 (Linux; Android 14) Chrome/120' })).toBe(false);
    expect(esIos(null)).toBe(false);
  });
});
