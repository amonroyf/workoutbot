export const CLASES = Object.freeze([
  Object.freeze({
    id: 'clasico',
    nombre: 'Clásico',
    descripcion: 'Fuerza y cardio parejo. Ideal para empezar.',
    nivel: 'principiante',
    bloques: Object.freeze([
      Object.freeze({ ejercicio: 'SENTADILLAS', trabajo: 40, descanso: 20 }),
      Object.freeze({ ejercicio: 'FLEXIONES', trabajo: 40, descanso: 20 }),
      Object.freeze({ ejercicio: 'JUMPING_JACKS', trabajo: 40, descanso: 0 }),
    ]),
  }),
  Object.freeze({
    id: 'explosivo',
    nombre: 'Explosivo',
    descripcion: 'Cardio primero para subir pulsaciones, luego fuerza.',
    nivel: 'intermedio',
    bloques: Object.freeze([
      Object.freeze({ ejercicio: 'JUMPING_JACKS', trabajo: 30, descanso: 15 }),
      Object.freeze({ ejercicio: 'SENTADILLAS', trabajo: 30, descanso: 15 }),
      Object.freeze({ ejercicio: 'FLEXIONES', trabajo: 30, descanso: 0 }),
    ]),
  }),
  Object.freeze({
    id: 'resistencia',
    nombre: 'Resistencia',
    descripcion: 'Más tiempo por ejercicio para aguantar el ritmo.',
    nivel: 'avanzado',
    bloques: Object.freeze([
      Object.freeze({ ejercicio: 'SENTADILLAS', trabajo: 50, descanso: 20 }),
      Object.freeze({ ejercicio: 'FLEXIONES', trabajo: 50, descanso: 20 }),
      Object.freeze({ ejercicio: 'JUMPING_JACKS', trabajo: 50, descanso: 0 }),
    ]),
  }),
  Object.freeze({
    id: 'fuerza-total',
    nombre: 'Fuerza total',
    descripcion: 'Piernas, pecho, core y glúteos en una sola vuelta.',
    nivel: 'principiante',
    bloques: Object.freeze([
      Object.freeze({ ejercicio: 'SENTADILLAS', trabajo: 40, descanso: 20 }),
      Object.freeze({ ejercicio: 'FLEXIONES', trabajo: 40, descanso: 20 }),
      Object.freeze({ ejercicio: 'ZANCADAS', trabajo: 40, descanso: 20 }),
      Object.freeze({ ejercicio: 'PUENTE_GLUTEO', trabajo: 40, descanso: 20 }),
      Object.freeze({ ejercicio: 'PLANCHA', trabajo: 30, descanso: 0 }),
    ]),
  }),
  Object.freeze({
    id: 'cardio-express',
    nombre: 'Cardio express',
    descripcion: 'Sube pulsaciones rápido sin material.',
    nivel: 'intermedio',
    bloques: Object.freeze([
      Object.freeze({ ejercicio: 'JUMPING_JACKS', trabajo: 30, descanso: 15 }),
      Object.freeze({ ejercicio: 'RODILLAS_ALTAS', trabajo: 30, descanso: 15 }),
      Object.freeze({ ejercicio: 'ZANCADAS', trabajo: 30, descanso: 15 }),
      Object.freeze({ ejercicio: 'JUMPING_JACKS', trabajo: 30, descanso: 15 }),
      Object.freeze({ ejercicio: 'FLEXIONES', trabajo: 30, descanso: 0 }),
    ]),
  }),
  Object.freeze({
    id: 'core',
    nombre: 'Core',
    descripcion: 'Abdomen, espalda baja y glúteos con control.',
    nivel: 'principiante',
    bloques: Object.freeze([
      Object.freeze({ ejercicio: 'PLANCHA', trabajo: 30, descanso: 15 }),
      Object.freeze({ ejercicio: 'ABDOMINALES', trabajo: 30, descanso: 15 }),
      Object.freeze({ ejercicio: 'PUENTE_GLUTEO', trabajo: 30, descanso: 15 }),
      Object.freeze({ ejercicio: 'PLANCHA', trabajo: 30, descanso: 0 }),
    ]),
  }),
  Object.freeze({
    id: 'piernas-gluteos',
    nombre: 'Piernas y glúteos',
    descripcion: 'Fuerza de tren inferior y glúteo.',
    nivel: 'intermedio',
    bloques: Object.freeze([
      Object.freeze({ ejercicio: 'SENTADILLAS', trabajo: 40, descanso: 20 }),
      Object.freeze({ ejercicio: 'ZANCADAS', trabajo: 40, descanso: 20 }),
      Object.freeze({ ejercicio: 'PUENTE_GLUTEO', trabajo: 40, descanso: 20 }),
      Object.freeze({ ejercicio: 'SENTADILLAS', trabajo: 40, descanso: 0 }),
    ]),
  }),
  Object.freeze({
    id: 'tren-superior',
    nombre: 'Tren superior',
    descripcion: 'Empuje y estabilidad para pecho, hombros y core.',
    nivel: 'intermedio',
    bloques: Object.freeze([
      Object.freeze({ ejercicio: 'FLEXIONES', trabajo: 40, descanso: 20 }),
      Object.freeze({ ejercicio: 'PLANCHA', trabajo: 30, descanso: 20 }),
      Object.freeze({ ejercicio: 'FLEXIONES', trabajo: 30, descanso: 20 }),
      Object.freeze({ ejercicio: 'PLANCHA', trabajo: 30, descanso: 0 }),
    ]),
  }),
  Object.freeze({
    id: 'principiante',
    nombre: 'Principiante',
    descripcion: 'Ritmo suave y descansos largos para arrancar.',
    nivel: 'principiante',
    bloques: Object.freeze([
      Object.freeze({ ejercicio: 'SENTADILLAS', trabajo: 30, descanso: 20 }),
      Object.freeze({ ejercicio: 'FLEXIONES', trabajo: 30, descanso: 20 }),
      Object.freeze({ ejercicio: 'PUENTE_GLUTEO', trabajo: 30, descanso: 20 }),
      Object.freeze({ ejercicio: 'PLANCHA', trabajo: 20, descanso: 0 }),
    ]),
  }),
  Object.freeze({
    id: 'core-fuerte',
    nombre: 'Core fuerte',
    descripcion: 'Planchas, dead bug y hollow para un centro sólido.',
    nivel: 'intermedio',
    bloques: Object.freeze([
      Object.freeze({ ejercicio: 'PLANCHA', trabajo: 30, descanso: 15 }),
      Object.freeze({ ejercicio: 'PLANCHA_LATERAL', trabajo: 25, descanso: 15 }),
      Object.freeze({ ejercicio: 'DEAD_BUG', trabajo: 30, descanso: 15 }),
      Object.freeze({ ejercicio: 'SUPERMAN', trabajo: 25, descanso: 15 }),
      Object.freeze({ ejercicio: 'HOLLOW_HOLD', trabajo: 20, descanso: 0 }),
    ]),
  }),
  Object.freeze({
    id: 'full-body',
    nombre: 'Full body',
    descripcion: 'Piernas, pecho y core con variantes nuevas.',
    nivel: 'intermedio',
    bloques: Object.freeze([
      Object.freeze({ ejercicio: 'SENTADILLA_SUMO', trabajo: 40, descanso: 20 }),
      Object.freeze({ ejercicio: 'FLEXION_DIAMANTE', trabajo: 40, descanso: 20 }),
      Object.freeze({ ejercicio: 'PUENTE_UNA_PIERNA', trabajo: 40, descanso: 20 }),
      Object.freeze({ ejercicio: 'MOUNTAIN_CLIMBER', trabajo: 30, descanso: 0 }),
    ]),
  }),
  Object.freeze({
    id: 'piernas-express',
    nombre: 'Piernas express',
    descripcion: 'Tren inferior y estabilidad sin saltos.',
    nivel: 'principiante',
    bloques: Object.freeze([
      Object.freeze({ ejercicio: 'SENTADILLA_SUMO', trabajo: 40, descanso: 20 }),
      Object.freeze({ ejercicio: 'WALL_SIT', trabajo: 30, descanso: 15 }),
      Object.freeze({ ejercicio: 'PUENTE_UNA_PIERNA', trabajo: 40, descanso: 20 }),
      Object.freeze({ ejercicio: 'BIRD_DOG', trabajo: 30, descanso: 0 }),
    ]),
  }),
]);

export const CLASE_POR_DEFECTO = CLASES[0];

export function obtenerClase(id) {
  return CLASES.find((clase) => clase.id === id) || null;
}

export function duracionClase(clase = CLASE_POR_DEFECTO) {
  return clase.bloques.reduce(
    (total, bloque) => total + bloque.trabajo + (bloque.descanso || 0),
    0
  );
}

export function formatearDuracion(segundos) {
  const minutos = Math.floor(segundos / 60);
  const resto = segundos % 60;
  if (minutos === 0) return `${resto}s`;
  if (resto === 0) return `${minutos} min`;
  return `${minutos} min ${resto}s`;
}
