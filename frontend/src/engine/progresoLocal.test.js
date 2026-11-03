// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { CLAVE_RESUMEN, cargarResumenLocal, guardarEntrenamientoLocal } from './progresoLocal';

describe('progresoLocal', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('carga estructura por defecto para usuario nuevo', () => {
    const resumen = cargarResumenLocal();
    expect(resumen.racha).toBe(0);
    expect(resumen.meta_semanal).toBe(3);
    expect(resumen.semana).toHaveLength(7);
  });

  it('guarda un entrenamiento y actualiza racha y dia', () => {
    const nuevo = { total_reps: 10, perfectas: 2, mejor_combo: 3, duracion_sec: 60 };
    const resumen = guardarEntrenamientoLocal(nuevo);
    expect(resumen.ultima).toEqual(nuevo);
    expect(resumen.racha).toBe(1);
    expect(resumen.dias_semana).toBe(1);
    expect(localStorage.getItem(CLAVE_RESUMEN)).toBeTruthy();
  });

  it('no incrementa racha dos veces el mismo dia', () => {
    const nuevo = { total_reps: 5 };
    guardarEntrenamientoLocal(nuevo);
    const segundo = guardarEntrenamientoLocal({ total_reps: 7 });
    expect(segundo.racha).toBe(1);
  });
});
