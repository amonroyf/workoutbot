import { obtenerClase } from './clases';

export const CLAVE_PLAN = 'workoutbot:plan:v1';

export const DIAS = Object.freeze([
  Object.freeze({ id: 1, corto: 'L', nombre: 'lunes' }),
  Object.freeze({ id: 2, corto: 'M', nombre: 'martes' }),
  Object.freeze({ id: 3, corto: 'X', nombre: 'miércoles' }),
  Object.freeze({ id: 4, corto: 'J', nombre: 'jueves' }),
  Object.freeze({ id: 5, corto: 'V', nombre: 'viernes' }),
  Object.freeze({ id: 6, corto: 'S', nombre: 'sábado' }),
  Object.freeze({ id: 7, corto: 'D', nombre: 'domingo' }),
]);

export const OBJETIVOS = Object.freeze([
  Object.freeze({
    id: 'equilibrio',
    nombre: 'Equilibrio',
    descripcion: 'Fuerza y cardio parejo',
    clases: Object.freeze(['clasico', 'fuerza-total', 'cardio-express']),
  }),
  Object.freeze({
    id: 'fuerza',
    nombre: 'Fuerza',
    descripcion: 'Piernas, empuje y core',
    clases: Object.freeze(['fuerza-total', 'tren-superior', 'piernas-gluteos']),
  }),
  Object.freeze({
    id: 'cardio',
    nombre: 'Cardio',
    descripcion: 'Pulsaciones y resistencia',
    clases: Object.freeze(['explosivo', 'cardio-express', 'resistencia']),
  }),
  Object.freeze({
    id: 'suave',
    nombre: 'Suave',
    descripcion: 'Para arrancar sin miedo',
    clases: Object.freeze(['principiante', 'clasico', 'core']),
  }),
  Object.freeze({
    id: 'progresion',
    nombre: 'Progresión',
    descripcion: 'De 5 a 15 minutos',
    clases: Object.freeze(['rapida-5', 'media-10', 'larga-15']),
  }),
]);

export const PLAN_POR_DEFECTO = Object.freeze({
  dias: Object.freeze([1, 3, 5]),
  objetivo: 'equilibrio',
});

export function clavePlan(uid) {
  return uid ? `${CLAVE_PLAN}:${uid}` : CLAVE_PLAN;
}

function almacenamientoPorDefecto() {
  try {
    return globalThis.localStorage;
  } catch {
    return null;
  }
}

export function obtenerObjetivo(id) {
  return OBJETIVOS.find((objetivo) => objetivo.id === id) || OBJETIVOS[0];
}

export function normalizarPlan(plan) {
  const objetivo = OBJETIVOS.some((item) => item.id === plan?.objetivo)
    ? plan.objetivo
    : PLAN_POR_DEFECTO.objetivo;
  const dias = [
    ...new Set(
      (Array.isArray(plan?.dias) ? plan.dias : PLAN_POR_DEFECTO.dias)
        .map(Number)
        .filter((dia) => Number.isInteger(dia) && dia >= 1 && dia <= 7)
    ),
  ].sort((a, b) => a - b);

  return {
    dias: dias.length > 0 ? dias : [...PLAN_POR_DEFECTO.dias],
    objetivo,
  };
}

export function diaIso(fecha = new Date()) {
  const dia = fecha.getDay();
  return dia === 0 ? 7 : dia;
}

export function claseParaDia(plan, dia) {
  const normalizado = normalizarPlan(plan);
  const posicion = normalizado.dias.indexOf(dia);
  if (posicion === -1) return null;

  const { clases } = obtenerObjetivo(normalizado.objetivo);
  return obtenerClase(clases[posicion % clases.length]);
}

export function claseParaFecha(plan, fecha = new Date()) {
  return claseParaDia(plan, diaIso(fecha));
}

export function siguienteDiaPlan(plan, desdeDia) {
  const normalizado = normalizarPlan(plan);
  for (let offset = 1; offset <= 7; offset += 1) {
    const dia = ((desdeDia - 1 + offset) % 7) + 1;
    if (normalizado.dias.includes(dia)) {
      return { dia, clase: claseParaDia(normalizado, dia) };
    }
  }
  return null;
}

export function nombreDia(dia) {
  return DIAS.find((item) => item.id === dia)?.nombre || '';
}

export function formatearDias(dias) {
  const nombres = dias.map((dia) => DIAS.find((item) => item.id === dia)?.corto).filter(Boolean);
  if (nombres.length <= 1) return nombres[0] || '';
  return `${nombres.slice(0, -1).join(', ')} y ${nombres.at(-1)}`;
}

export function textoHoy(plan, fecha = new Date()) {
  const clase = claseParaFecha(plan, fecha);
  if (clase) return `Hoy toca ${clase.nombre}`;

  const siguiente = siguienteDiaPlan(plan, diaIso(fecha));
  if (!siguiente) return 'Hoy descansas';
  return `Hoy descansas. El ${nombreDia(siguiente.dia)} toca ${siguiente.clase.nombre}`;
}

export function cargarPlan(storage = almacenamientoPorDefecto(), uid = null) {
  try {
    const guardado = storage?.getItem(clavePlan(uid));
    return normalizarPlan(guardado ? JSON.parse(guardado) : PLAN_POR_DEFECTO);
  } catch {
    return normalizarPlan(PLAN_POR_DEFECTO);
  }
}

export function guardarPlan(plan, storage = almacenamientoPorDefecto(), uid = null) {
  const normalizado = normalizarPlan(plan);
  try {
    storage?.setItem(clavePlan(uid), JSON.stringify(normalizado));
  } catch {
    return normalizado;
  }
  return normalizado;
}
