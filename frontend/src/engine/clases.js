const CLASES_EXPRESS_BASE = Object.freeze([
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
  // Rutina de la pereza: todo sentado frente a la cámara, solo tren
  // superior. Sin ropa de gimnasio ni salir de la silla del escritorio.
  Object.freeze({
    id: 'pausa-activa',
    nombre: 'Pausa de Escritorio',
    descripcion: 'El método perezoso. Suelta la tensión del teletrabajo sin levantarte de tu silla.',
    nivel: 'principiante',
    bloques: Object.freeze([
      Object.freeze({ ejercicio: 'CIRCULOS_BRAZOS', trabajo: 20, descanso: 10 }),
      Object.freeze({ ejercicio: 'ELEVACIONES_LATERALES', trabajo: 20, descanso: 10 }),
      Object.freeze({ ejercicio: 'ROTACION_TORSO', trabajo: 30, descanso: 10 }),
      Object.freeze({ ejercicio: 'ESTIRAMIENTO_CUELLO', trabajo: 20, descanso: 0 }),
    ]),
  }),
]);

function congelarLista(lista) {
  return Object.freeze(lista.map((item) => Object.freeze({ ...item })));
}

export function compilarClase(clase) {
  const totalSecciones = clase.secciones.length;
  const bloques = [];

  clase.secciones.forEach((seccion, seccionIndex) => {
    const totalRondas = Math.max(1, seccion.rondas || 1);
    const bloquesSeccion = seccion.bloques;

    for (let ronda = 1; ronda <= totalRondas; ronda += 1) {
      bloquesSeccion.forEach((bloque, indice) => {
        const esUltimo = indice === bloquesSeccion.length - 1;
        const descanso =
          esUltimo && ronda < totalRondas
            ? seccion.descansoRonda ?? bloque.descanso ?? 0
            : bloque.descanso ?? 0;

        bloques.push(
          Object.freeze({
            ...bloque,
            descanso,
            seccionId: seccion.id,
            seccionNombre: seccion.nombre,
            seccionTipo: seccion.tipo,
            seccionIndex,
            totalSecciones,
            ronda,
            totalRondas,
          })
        );
      });
    }
  });

  const secciones = Object.freeze(
    clase.secciones.map((seccion) =>
      Object.freeze({
        ...seccion,
        bloques: congelarLista(seccion.bloques),
      })
    )
  );

  return Object.freeze({
    ...clase,
    formato: clase.formato || 'completa',
    secciones,
    bloques: Object.freeze(bloques),
    duracion: bloques.reduce(
      (total, bloque) => total + bloque.trabajo + bloque.descanso,
      0
    ),
  });
}

export function resumenSecciones(clase) {
  if (!clase || !Array.isArray(clase.secciones)) return null;

  return clase.secciones.map((seccion, i) => {
    const bloques = clase.bloques.filter((bloque) => bloque.seccionIndex === i);
    return {
      id: seccion.id,
      nombre: seccion.nombre,
      nombreCorto: seccion.nombreCorto || seccion.nombre,
      tipo: seccion.tipo,
      rondas: seccion.rondas || 1,
      duracion: bloques.reduce(
        (total, bloque) => total + bloque.trabajo + (bloque.descanso || 0),
        0
      ),
      ejercicios: [...new Set(bloques.map((bloque) => bloque.ejercicio))],
    };
  });
}

const FUNCIONAL_45_BASE = {
  id: 'funcional-45',
  nombre: 'Funcional 45',
  descripcion:
    'Clase completa de 45 minutos: calentamiento, fuerza, metabólico, core y vuelta a la calma.',
  nivel: 'intermedio',
  tipo: 'funcional',
  formato: 'completa',
  duracionMin: 45,
  equipamiento: 'ninguno',
  secciones: [
    {
      id: 'calentamiento',
      nombre: 'Calentamiento',
      nombreCorto: 'Calent.',
      tipo: 'calentamiento',
      rondas: 1,
      pistaVoz: 'Calentamiento, ocho minutos. Vamos a preparar el cuerpo.',
      bloques: [
        {
          ejercicio: 'MARCHA',
          trabajo: 120,
          descanso: 0,
          intensidad: 'suave',
          pistaVoz: 'Empezamos suave, camina en el lugar y suelta los hombros.',
        },
        {
          ejercicio: 'SENTADILLAS',
          trabajo: 60,
          descanso: 15,
          intensidad: 'suave',
          pistaVoz: 'Sentadillas sin peso, baja hasta donde estés cómodo.',
        },
        {
          ejercicio: 'ZANCADAS',
          trabajo: 60,
          descanso: 15,
          intensidad: 'suave',
          pistaVoz: 'Zancadas alternas, paso corto y controlado.',
        },
        {
          ejercicio: 'BIRD_DOG',
          trabajo: 60,
          descanso: 0,
          intensidad: 'suave',
          pistaVoz: 'Bird dog para activar core y espalda.',
        },
        {
          ejercicio: 'RODILLAS_ALTAS',
          trabajo: 60,
          descanso: 0,
          intensidad: 'suave',
          pistaVoz: 'Rodillas altas suave, sin saltar.',
        },
        {
          ejercicio: 'MARCHA',
          trabajo: 90,
          descanso: 0,
          intensidad: 'suave',
          pistaVoz: 'Últimos segundos de calentamiento, respira.',
        },
      ],
    },
    {
      id: 'fuerza',
      nombre: 'Fuerza',
      nombreCorto: 'Fuerza',
      tipo: 'principal',
      rondas: 3,
      descansoRonda: 60,
      pistaVoz: 'Bloque de fuerza, tres rondas.',
      bloques: [
        {
          ejercicio: 'SENTADILLAS',
          trabajo: 40,
          descanso: 20,
          intensidad: 'media',
          pistaVoz: 'Sentadilla, cadera atrás y pecho arriba.',
        },
        {
          ejercicio: 'FLEXIONES',
          trabajo: 40,
          descanso: 20,
          intensidad: 'media',
          pistaVoz: 'Flexión, cuerpo en plancha y codos a cuarenta y cinco grados.',
        },
        {
          ejercicio: 'ZANCADAS',
          trabajo: 40,
          descanso: 20,
          intensidad: 'media',
          pistaVoz: 'Zancada, baja la rodilla de atrás con control.',
        },
        {
          ejercicio: 'PUENTE_GLUTEO',
          trabajo: 40,
          descanso: 60,
          intensidad: 'media',
          pistaVoz: 'Puente, empuja con los talones y aprieta los glúteos.',
        },
      ],
    },
    {
      id: 'metabolico',
      nombre: 'Metabólico',
      nombreCorto: 'Metab.',
      tipo: 'principal',
      rondas: 3,
      descansoRonda: 40,
      pistaVoz: 'Bloque metabólico, tres rondas. Mantén la técnica.',
      bloques: [
        {
          ejercicio: 'JUMPING_JACKS',
          trabajo: 30,
          descanso: 20,
          intensidad: 'alta',
          pistaVoz: 'Jumping jacks, abre brazos y piernas al mismo tiempo.',
        },
        {
          ejercicio: 'MOUNTAIN_CLIMBER',
          trabajo: 30,
          descanso: 20,
          intensidad: 'alta',
          pistaVoz: 'Mountain climber, rodillas al pecho y cadera baja.',
        },
        {
          ejercicio: 'RODILLAS_ALTAS',
          trabajo: 30,
          descanso: 20,
          intensidad: 'alta',
          pistaVoz: 'Rodillas altas, ritmo fuerte pero controlado.',
        },
        {
          ejercicio: 'PLANCHA',
          trabajo: 30,
          descanso: 40,
          intensidad: 'media',
          pistaVoz: 'Plancha, cuerpo en línea y abdomen firme.',
        },
      ],
    },
    {
      id: 'core',
      nombre: 'Core y control',
      nombreCorto: 'Core',
      tipo: 'principal',
      rondas: 1,
      pistaVoz: 'Bloque de core y control. Calidad antes que velocidad.',
      bloques: [
        {
          ejercicio: 'DEAD_BUG',
          trabajo: 45,
          descanso: 15,
          intensidad: 'media',
          pistaVoz: 'Dead bug, espalda pegada al piso.',
        },
        {
          ejercicio: 'HOLLOW_HOLD',
          trabajo: 30,
          descanso: 15,
          intensidad: 'media',
          pistaVoz: 'Hollow hold, lumbar pegada y respira.',
        },
        {
          ejercicio: 'BIRD_DOG',
          trabajo: 45,
          descanso: 15,
          intensidad: 'media',
          pistaVoz: 'Bird dog, estira brazo y pierna opuestos.',
        },
        {
          ejercicio: 'PLANCHA_LATERAL',
          trabajo: 30,
          descanso: 15,
          intensidad: 'media',
          pistaVoz: 'Plancha lateral, cadera arriba y cuerpo alineado.',
        },
        {
          ejercicio: 'SUPERMAN',
          trabajo: 30,
          descanso: 30,
          intensidad: 'media',
          pistaVoz: 'Superman, levanta brazos y piernas sin forzar el cuello.',
        },
        {
          ejercicio: 'PLANCHA',
          trabajo: 30,
          descanso: 0,
          intensidad: 'media',
          pistaVoz: 'Plancha final, aguanta y respira.',
        },
      ],
    },
    {
      id: 'enfriamiento',
      nombre: 'Vuelta a la calma',
      nombreCorto: 'Calma',
      tipo: 'enfriamiento',
      rondas: 1,
      pistaVoz: 'Vuelta a la calma. Baja el pulso y estira.',
      bloques: [
        {
          ejercicio: 'MARCHA_SUAVE',
          trabajo: 120,
          descanso: 0,
          intensidad: 'suave',
          pistaVoz: 'Bajamos el ritmo, camina suave y respira.',
        },
        {
          ejercicio: 'ESTIRAMIENTO_GENERAL',
          trabajo: 300,
          descanso: 0,
          intensidad: 'suave',
          pistaVoz: 'Estiramiento general, sin rebotar, sostén cada posición.',
        },
      ],
    },
  ],
};

export const FUNCIONAL_45 = compilarClase(FUNCIONAL_45_BASE);

export const CLASES_EXPRESS = Object.freeze(
  CLASES_EXPRESS_BASE.map((clase) =>
    Object.freeze({
      ...clase,
      tipo: 'express',
      formato: 'express',
    })
  )
);

export const CLASES_COMPLETAS = Object.freeze([FUNCIONAL_45]);

export const CLASES = Object.freeze([...CLASES_COMPLETAS, ...CLASES_EXPRESS]);


export const CLASE_POR_DEFECTO = CLASES[0];

// La primera clase que ve alguien nuevo debe ser corta y amable. La clase
// completa de 45 minutos sigue disponible en el catálogo, pero no es la puerta
// de entrada.
export const CLASE_INICIAL =
  CLASES.find((clase) => clase.id === 'principiante') || CLASE_POR_DEFECTO;

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

export function formatearReloj(segundos) {
  const total = Math.max(0, Math.round(segundos));
  const minutos = Math.floor(total / 60);
  const resto = total % 60;
  return `${minutos}:${String(resto).padStart(2, '0')}`;
}
