const INICIO = [
  '¡Listo parce, arrancamos! Calienta los hombros y sígueme.',
  '¡Hágale pues! Hoy completamos la rutina, sin excusas.',
  '¡Vamos con toda! Terminamos la clase y quedamos como nuevos.',
];

const TRABAJO = {
  SENTADILLAS: [
    'Sentadillas. Pies al ancho de hombros, cadera atrás y pecho arriba.',
    'Sentadillas. Baja con control y sube con fuerza.',
    'Sentadillas. Rodillas hacia afuera y espalda recta.',
  ],
  FLEXIONES: [
    'Flexiones. Cuerpo en plancha y codos a cuarenta y cinco grados.',
    'Flexiones. No dejes caer la cadera, mantén el abdomen firme.',
    'Flexiones. Baja el pecho con control y empuja fuerte.',
  ],
  JUMPING_JACKS: [
    'Jumping jacks. Abre brazos y piernas al mismo tiempo.',
    'Jumping jacks. Aterriza suave, con las rodillas flexibles.',
    'Jumping jacks. Mantén el ritmo y no aflojes.',
  ],
  ZANCADAS: [
    'Zancadas. Da un paso largo y baja la rodilla de atrás.',
    'Zancadas. Mantén el pecho arriba y el abdomen firme.',
    'Zancadas. Empuja con la pierna de adelante para subir.',
  ],
  PLANCHA: [
    'Plancha. Cuerpo en línea recta y abdomen apretado.',
    'Plancha. No dejes caer la cadera, aguanta firme.',
    'Plancha. Respira y mantén la posición.',
  ],
  RODILLAS_ALTAS: [
    'Rodillas altas. Sube la rodilla a la altura de la cadera.',
    'Rodillas altas. Brazos en movimiento y aterriza suave.',
    'Rodillas altas. Mantén el ritmo y no aflojes.',
  ],
  PUENTE_GLUTEO: [
    'Puente de glúteo. Acuéstate boca arriba con las rodillas flexionadas.',
    'Puente de glúteo. Empuja con los talones y aprieta los glúteos.',
    'Puente de glúteo. Sube con control y baja sin soltar.',
  ],
  ABDOMINALES: [
    'Abdominales. Manos detrás de la cabeza, sin halar el cuello.',
    'Abdominales. Sube con el abdomen y baja con control.',
    'Abdominales. Exhala al subir y mantén el ombligo adentro.',
  ],
};

const TRABAJO_GENERAL = [
  '¡Dale con toda, que falta poco!',
  'Concéntrate en la técnica y respira.',
];

const DESCANSO = [
  'Descansa, respira por la nariz y prepárate para la siguiente.',
  'Descanso. Toma agua y prepárate para la siguiente.',
  'Descanso. Suelta los hombros y recarga energía.',
];

const FIN = [
  '¡Rutina cumplida! Quedó berraco, ahora sí a celebrar.',
  '¡Lo lograste! Rutina completa. Mañana volvemos.',
  '¡Eso es! Terminaste la clase. Orgullo total.',
];

const PAUSA = [
  'Pausa activada. Vuelve cuando estés listo.',
  'Tomamos un respiro. Aquí te espero.',
];

const REANUDA = [
  '¡Volvemos! Retomamos donde íbamos.',
  '¡Dale, seguimos!',
];

const HITO = [
  '¡Diez! Vas con toda.',
  '¡Ese combo! Sigue así.',
  '¡Qué berraquera! No aflojes.',
];

const ULTIMOS_SEGUNDOS = [
  'Tres, dos, uno. ¡Última!',
  '¡Últimos segundos, aguanta!',
];

const ANIMO = [
  '¡Dale, que falta poco!',
  '¡Tú puedes, no aflojes!',
  '¡Eso, así, con fuerza!',
  '¡Respira y sigue, vas muy bien!',
];

const ATASCADO = [
  'Si está difícil, hagamos la versión suave: apóyate en una silla.',
  'Tranquilo, bajamos un cambio. Usa la versión fácil y seguimos.',
  'No pasa nada, ajustamos. Apóyate en la pared y continúa.',
];

const SEGURIDAD = [
  'Si sientes dolor, detente. La técnica primero.',
  'Cuida tus rodillas, no fuerces si algo molesta.',
];

const BANCOS = {
  INICIO,
  DESCANSO,
  FIN,
  PAUSA,
  REANUDA,
  HITO,
  ULTIMOS_SEGUNDOS,
  ANIMO,
  ATASCADO,
  SEGURIDAD,
};

function elegirDe(lista, indice) {
  if (!Array.isArray(lista) || lista.length === 0) return '';
  const i = Math.abs(Math.trunc(indice)) % lista.length;
  return lista[i];
}

export function obtenerFrase(evento, indice = 0, ejercicio = null) {
  if (evento === 'TRABAJO') {
    const banco = (ejercicio && TRABAJO[ejercicio]) || TRABAJO_GENERAL;
    return elegirDe(banco, indice);
  }

  const banco = BANCOS[evento];
  return elegirDe(banco, indice);
}

export const EVENTOS_VOZ = Object.freeze([
  'INICIO',
  'TRABAJO',
  'DESCANSO',
  'FIN',
  'PAUSA',
  'REANUDA',
  'HITO',
  'ULTIMOS_SEGUNDOS',
  'ANIMO',
  'ATASCADO',
  'SEGURIDAD',
]);
