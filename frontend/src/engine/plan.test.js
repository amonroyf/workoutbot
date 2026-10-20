import { describe, it, expect } from 'vitest';
import {
  CLAVE_PLAN,
  PLAN_POR_DEFECTO,
  cargarPlan,
  clavePlan,
  claseParaDia,
  claseParaFecha,
  diaIso,
  formatearDias,
  guardarPlan,
  normalizarPlan,
  siguienteDiaPlan,
  textoHoy,
} from './plan';

function fechaLocal(anio, mes, dia) {
  return new Date(anio, mes - 1, dia, 12, 0, 0);
}

function almacenFalso() {
  const datos = {};
  return {
    getItem: (clave) => datos[clave] ?? null,
    setItem: (clave, valor) => {
      datos[clave] = valor;
    },
    datos,
  };
}

describe('normalizarPlan', () => {
  it('usa el plan por defecto cuando no hay datos', () => {
    expect(normalizarPlan(null)).toEqual({
      dias: [...PLAN_POR_DEFECTO.dias],
      objetivo: PLAN_POR_DEFECTO.objetivo,
    });
  });

  it('ordena, deduplica y descarta días inválidos', () => {
    const plan = normalizarPlan({ dias: ['5', 1, 5, 9, 0, 3.5, 3], objetivo: 'fuerza' });
    expect(plan.dias).toEqual([1, 3, 5]);
    expect(plan.objetivo).toBe('fuerza');
  });

  it('cae al objetivo y días por defecto si vienen inválidos', () => {
    expect(normalizarPlan({ dias: [], objetivo: 'inventado' })).toEqual({
      dias: [...PLAN_POR_DEFECTO.dias],
      objetivo: PLAN_POR_DEFECTO.objetivo,
    });
  });
});

describe('claseParaDia', () => {
  it('asigna las clases del objetivo en orden de día', () => {
    const plan = { dias: [1, 3, 5], objetivo: 'equilibrio' };
    expect(claseParaDia(plan, 1)?.id).toBe('clasico');
    expect(claseParaDia(plan, 3)?.id).toBe('fuerza-total');
    expect(claseParaDia(plan, 5)?.id).toBe('cardio-express');
  });

  it('devuelve null en días no planeados', () => {
    expect(claseParaDia({ dias: [1, 3, 5], objetivo: 'equilibrio' }, 2)).toBeNull();
  });

  it('rota las clases si hay más días que clases', () => {
    const plan = { dias: [1, 2, 3, 4], objetivo: 'fuerza' };
    expect(claseParaDia(plan, 1)?.id).toBe('fuerza-total');
    expect(claseParaDia(plan, 4)?.id).toBe('fuerza-total');
  });
});

describe('diaIso y claseParaFecha', () => {
  it('mapea domingo a 7 y lunes a 1', () => {
    expect(diaIso(fechaLocal(2026, 10, 19))).toBe(1);
    expect(diaIso(fechaLocal(2026, 10, 25))).toBe(7);
  });

  it('devuelve la clase que toca en la fecha', () => {
    const plan = { dias: [1, 3, 5], objetivo: 'equilibrio' };
    expect(claseParaFecha(plan, fechaLocal(2026, 10, 19))?.id).toBe('clasico');
    expect(claseParaFecha(plan, fechaLocal(2026, 10, 20))).toBeNull();
  });
});

describe('siguienteDiaPlan', () => {
  it('encuentra el próximo día planeado y su clase', () => {
    const plan = { dias: [1, 3, 5], objetivo: 'equilibrio' };
    expect(siguienteDiaPlan(plan, 2)).toMatchObject({ dia: 3, clase: { id: 'fuerza-total' } });
    expect(siguienteDiaPlan(plan, 5)).toMatchObject({ dia: 1, clase: { id: 'clasico' } });
  });
});

describe('textoHoy', () => {
  it('dice qué toca hoy o cuándo es el próximo entreno', () => {
    const plan = { dias: [1, 3, 5], objetivo: 'equilibrio' };
    expect(textoHoy(plan, fechaLocal(2026, 10, 19))).toBe('Hoy toca Clásico');
    expect(textoHoy(plan, fechaLocal(2026, 10, 20))).toBe(
      'Hoy descansas. El miércoles toca Fuerza total'
    );
  });
});

describe('formatearDias', () => {
  it('lista los días en formato corto', () => {
    expect(formatearDias([1, 3, 5])).toBe('L, X y V');
    expect(formatearDias([2])).toBe('M');
  });
});

describe('persistencia del plan', () => {
  it('usa una clave por usuario', () => {
    expect(clavePlan('abc')).toBe(`${CLAVE_PLAN}:abc`);
    expect(clavePlan()).toBe(CLAVE_PLAN);
  });

  it('guarda y recupera el plan normalizado', () => {
    const almacen = almacenFalso();
    guardarPlan({ dias: [5, 1, 3], objetivo: 'cardio' }, almacen);
    expect(JSON.parse(almacen.datos[CLAVE_PLAN])).toEqual({
      dias: [1, 3, 5],
      objetivo: 'cardio',
    });
    expect(cargarPlan(almacen)).toEqual({ dias: [1, 3, 5], objetivo: 'cardio' });
  });

  it('aísla el plan entre usuarios', () => {
    const almacen = almacenFalso();
    guardarPlan({ dias: [2, 4], objetivo: 'fuerza' }, almacen, 'u1');
    expect(cargarPlan(almacen, 'u1')).toEqual({ dias: [2, 4], objetivo: 'fuerza' });
    expect(cargarPlan(almacen, 'u2')).toEqual({
      dias: [...PLAN_POR_DEFECTO.dias],
      objetivo: PLAN_POR_DEFECTO.objetivo,
    });
  });

  it('vuelve al plan por defecto si el JSON está roto', () => {
    const almacen = almacenFalso();
    almacen.setItem(CLAVE_PLAN, '{roto');
    expect(cargarPlan(almacen)).toEqual({
      dias: [...PLAN_POR_DEFECTO.dias],
      objetivo: PLAN_POR_DEFECTO.objetivo,
    });
  });
});
