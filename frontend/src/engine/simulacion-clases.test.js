import { describe, it, expect } from 'vitest';
import { obtenerClase } from './clases';
import { estadoInicialCircuito, avanzarCircuito, avanzarTransicion } from './circuito';

describe('simulacion de clases', () => {
  for (const id of ['fuerza-10', 'hiit-10', 'core-5', 'combat-10']) {
    it(`completa ${id} sin crash`, () => {
      const clase = obtenerClase(id);
      expect(clase).toBeTruthy();
      let estado = estadoInicialCircuito(0, clase);
      let ahora = 0;
      let guard = 0;
      while (estado.faseActual !== 'FIN' && guard < 1000) {
        guard += 1;
        if (estado.finFaseEn == null) break;
        ahora = estado.finFaseEn;
        let r = avanzarCircuito(estado, ahora, clase);
        if (!r) break;
        estado = { ...estado, ...r.estado };
        if (estado.faseActual === 'TRANSICION') {
          const r2 = avanzarTransicion(estado, estado.finFaseEn, clase);
          if (r2) estado = { ...estado, ...r2.estado };
        }
      }
      expect(estado.faseActual).toBe('FIN');
    });
  }
});