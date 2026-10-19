const INICIO = [
  '¡Listo parce, arrancamos! Calienta los hombros y sígueme.',
  '¡Hágale pues! Hoy completamos la rutina, sin excusas.',
  '¡Vamos con toda! Tres ejercicios y quedamos como nuevos.',
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
};

const TRABAJO_GENERAL = [
  '¡Dale con toda, que falta poco!',
  'Concéntrate en la técnica y respira.',
];

const DESCANSO = [
  'Descansa, respira por la nariz y prepárate para la siguiente.',
  'Veinte segundos de descanso. Toma agua y no te enfriés.',
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
