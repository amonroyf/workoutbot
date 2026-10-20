export const EJERCICIOS_CATALOGO = Object.freeze({
  SENTADILLAS: Object.freeze({
    id: 'SENTADILLAS',
    nombre: 'Sentadillas',
    grupo: 'piernas',
    nivel: 'principiante',
    equipamiento: 'ninguno',
    vista: 'perfil',
    detector: 'sentadilla',
    modo: 'reps',
    demo: 'stick',
    pistas: ['Pies al ancho de hombros', 'Cadera atrás, pecho arriba', 'Rodillas hacia afuera'],
  }),
  FLEXIONES: Object.freeze({
    id: 'FLEXIONES',
    nombre: 'Flexiones',
    grupo: 'pecho',
    nivel: 'intermedio',
    equipamiento: 'ninguno',
    vista: 'perfil',
    detector: 'flexion',
    modo: 'reps',
    demo: 'stick',
    pistas: ['Cuerpo en plancha', 'Codos a 45 grados', 'Baja el pecho con control'],
  }),
  JUMPING_JACKS: Object.freeze({
    id: 'JUMPING_JACKS',
    nombre: 'Jumping jacks',
    grupo: 'cardio',
    nivel: 'principiante',
    equipamiento: 'ninguno',
    vista: 'frontal',
    detector: 'jumping_jack',
    modo: 'reps',
    demo: 'stick',
    pistas: ['Abre brazos y piernas', 'Aterriza suave', 'Mantén el ritmo'],
  }),
  ZANCADAS: Object.freeze({
    id: 'ZANCADAS',
    nombre: 'Zancadas',
    grupo: 'piernas',
    nivel: 'intermedio',
    equipamiento: 'ninguno',
    vista: 'perfil',
    detector: 'zancada',
    modo: 'reps',
    demo: 'stick',
    pistas: ['Da un paso largo', 'Baja la rodilla de atrás', 'Pecho arriba'],
  }),
  PLANCHA: Object.freeze({
    id: 'PLANCHA',
    nombre: 'Plancha',
    grupo: 'core',
    nivel: 'principiante',
    equipamiento: 'ninguno',
    vista: 'perfil',
    detector: 'plancha',
    modo: 'tiempo',
    demo: 'stick',
    pistas: ['Cuerpo en línea recta', 'Aprieta el abdomen', 'No dejes caer la cadera'],
  }),
  RODILLAS_ALTAS: Object.freeze({
    id: 'RODILLAS_ALTAS',
    nombre: 'Rodillas altas',
    grupo: 'cardio',
    nivel: 'principiante',
    equipamiento: 'ninguno',
    vista: 'frontal',
    detector: 'rodillas_altas',
    modo: 'reps',
    demo: 'stick',
    pistas: ['Sube la rodilla a la cadera', 'Brazos en movimiento', 'Aterriza suave'],
  }),
  PUENTE_GLUTEO: Object.freeze({
    id: 'PUENTE_GLUTEO',
    nombre: 'Puente de glúteo',
    grupo: 'glúteos',
    nivel: 'principiante',
    equipamiento: 'ninguno',
    vista: 'perfil',
    detector: 'puente_gluteo',
    modo: 'reps',
    demo: 'stick',
    pistas: ['Acuéstate boca arriba', 'Empuja con los talones', 'Aprieta los glúteos arriba'],
  }),
  ABDOMINALES: Object.freeze({
    id: 'ABDOMINALES',
    nombre: 'Abdominales',
    grupo: 'core',
    nivel: 'principiante',
    equipamiento: 'ninguno',
    vista: 'perfil',
    detector: 'abdominal',
    modo: 'reps',
    demo: 'stick',
    pistas: ['Manos detrás de la cabeza', 'Sube con el abdomen', 'Baja con control'],
  }),
});

export function obtenerEjercicio(id) {
  return EJERCICIOS_CATALOGO[id] || null;
}

export function nombreEjercicio(id) {
  return obtenerEjercicio(id)?.nombre || id.replace('_', ' ');
}

export function esDeTiempo(id) {
  return obtenerEjercicio(id)?.modo === 'tiempo';
}
