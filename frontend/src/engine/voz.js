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
  MARCHA: [
    'Marcha en el lugar. Suelta los hombros y respira.',
    'Marcha. Brazos relajados y paso cómodo.',
  ],
  MARCHA_SUAVE: [
    'Marcha suave. Baja el ritmo y recupera la respiración.',
    'Marcha suave. Deja que el pulso baje poco a poco.',
  ],
  BIRD_DOG: [
    'Bird dog. Estira brazo y pierna opuestos sin arquear la espalda.',
    'Bird dog. Mantén el abdomen firme y el cuello relajado.',
  ],
  MOUNTAIN_CLIMBER: [
    'Mountain climber. Rodillas al pecho y cadera baja.',
    'Mountain climber. Ritmo firme, sin rebotar la cadera.',
  ],
  DEAD_BUG: [
    'Dead bug. Espalda pegada al piso y movimientos lentos.',
    'Dead bug. Estira brazo y pierna opuestos con control.',
  ],
  HOLLOW_HOLD: [
    'Hollow hold. Lumbar pegada al piso y abdomen apretado.',
    'Hollow hold. Respira corto y mantén la posición.',
  ],
  PLANCHA_LATERAL: [
    'Plancha lateral. Cadera arriba y cuerpo alineado.',
    'Plancha lateral. Apoya el antebrazo y no dejes caer la cadera.',
  ],
  SUPERMAN: [
    'Superman. Levanta brazos y piernas sin forzar el cuello.',
    'Superman. Sube con control y baja lento.',
  ],
  ESTIRAMIENTO_GENERAL: [
    'Estiramiento general. Sin rebotar, sostén cada posición.',
    'Estiramiento. Respira lento y suelta la tensión.',
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
  '¡Eso es! Terminaste la clase. Nos vemos mañana.',
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
  '¡Vamos todos, una más!',
  '¡A mi señal, todos juntos!',
];

const ATASCADO = [
  'Si está difícil, hagamos la versión suave: apóyate en una silla.',
  'Tranquilo, bajamos un cambio. Usa la versión fácil y seguimos.',
  'No pasa nada, ajustamos. Apóyate en la pared y continúa.',
];

const ON_FIRE = [
  '¡Estás en fuego! ¡No pares!',
  '¡Qué racha! ¡Sigue así, máquina!',
  '¡Imparable! ¡Así se hace!',
];

const SEGURIDAD = [
  'Si sientes dolor, detente. La técnica primero.',
  'Cuida tus rodillas, no fuerces si algo molesta.',
];


const CALENTAMIENTO = [
  'Calentamiento. Vamos a preparar el cuerpo con movimiento suave.',
  'Arrancamos el calentamiento. Sube la temperatura poco a poco.',
];

const SECCION = [
  'Cambiamos de bloque. Mantén la técnica.',
  'Nuevo bloque. Respira y enfócate.',
];

const RONDA = [
  'Nueva ronda. Misma técnica, un poco más de energía.',
  'Otra ronda. No aflojes.',
];

const ULTIMA_RONDA = [
  'Última ronda. Vamos todos con todo.',
  'Ronda final. A mi señal, juntos.',
];

const GRUPO = [
  'Vamos todos, al mismo ritmo.',
  'Juntos llegamos, no aflojamos.',
  'Una más conmigo, que falta poco.',
];

const MITAD = [
  'Mitad del ejercicio. Mantén la forma.',
  'Vas por la mitad. Respira y sigue.',
];

const SIGUIENTE = [
  'Prepárate para lo que viene.',
  'Sigue el siguiente ejercicio.',
];

const ENFRIAMIENTO = [
  'Vuelta a la calma. Baja el pulso y estira.',
  'Enfriamiento. Respira profundo y suelta los músculos.',
];

const RESPIRACION = [
  'Respira profundo, lento. Suelta el aire.',
  'Inhala por la nariz, exhala suave.',
];

const BANCOS = {
  INICIO,
  CALENTAMIENTO,
  SECCION,
  RONDA,
  ULTIMA_RONDA,
  GRUPO,
  MITAD,
  SIGUIENTE,
  ENFRIAMIENTO,
  RESPIRACION,
  DESCANSO,
  FIN,
  PAUSA,
  REANUDA,
  HITO,
  ULTIMOS_SEGUNDOS,
  ANIMO,
   ATASCADO,
   ON_FIRE,
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
  'CALENTAMIENTO',
  'SECCION',
  'RONDA',
  'ULTIMA_RONDA',
  'GRUPO',
  'MITAD',
  'SIGUIENTE',
  'ENFRIAMIENTO',
  'RESPIRACION',
  'TRABAJO',
  'DESCANSO',
  'FIN',
  'PAUSA',
  'REANUDA',
  'HITO',
  'ULTIMOS_SEGUNDOS',
  'ANIMO',
  'ATASCADO',
  'ON_FIRE',
  'SEGURIDAD',
]);
