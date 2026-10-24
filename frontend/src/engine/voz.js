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
  ROTACION_TORSO: [
    'Rotación de torso. Gira suave, la espalda de la silla lo agradece.',
    'Rotación de torso. Mano al hombro contrario y vuelve al centro.',
    'Rotación de torso. Sin prisa, gira hasta donde llegue.',
  ],
  PRESS_HOMBRO: [
    'Press de hombro. Empuja arriba y baja con control.',
    'Press. Codos bajo las muñecas, no bloquees.',
    'Press. Respira al empujar y aprieta el abdomen.',
  ],
  REMO: [
    'Remo. Codos cerca del torso y atrás.',
    'Remo. Aprieta la espalda arriba, un segundo.',
    'Remo. No uses impulso, tira con la espalda.',
  ],
  PESO_MUERTO: [
    'Peso muerto. Cadera atrás y espalda recta.',
    'Peso muerto. Baja hasta media pierna y sube apretando glúteos.',
    'Peso muerto. Pecho arriba, no redondees la espalda.',
  ],
  SENTADILLA_SALTO: [
    'Sentadilla con salto. Baja y explota hacia arriba.',
    'Sentadilla con salto. Aterriza suave, rodillas flexibles.',
    'Sin salto también vale: sube y ponte de pie con fuerza.',
  ],
  BURPEE: [
    'Burpee. Manos al piso, piernas atrás, flexión y salto.',
    'Burpee. Mantén el abdomen firme en la plancha.',
    'Burpee. Versión sin salto: camina los pies.',
  ],
  PLANK_JACK: [
    'Plank jack. Plancha firme y piernas abren y cierran.',
    'Plank jack. No muevas la cadera.',
    'Plank jack. Ritmo constante, abdomen apretado.',
  ],
  ESCALADOR: [
    'Escaladores. Rodillas al pecho y cadera baja.',
    'Escaladores. Ritmo fuerte, sin rebotar la cadera.',
    'Escaladores. Manos bajo los hombros.',
  ],
  JAB_CROSS: [
    'Jab y cross. Extiende el brazo y vuelve a la guardia.',
    'Jab y cross. Rota el torso, exhala en el golpe.',
    'Jab y cross. Puño firme, no hiperextiendas el codo.',
  ],
  RODILLAZO: [
    'Rodillazo. Sube la rodilla al frente y baja.',
    'Rodillazo. Torso erguido, golpea con la cadera.',
    'Rodillazo. Alterna y mantén el ritmo.',
  ],
  PATADA_FRONTAL: [
    'Patada frontal. Sube la rodilla y extiende.',
    'Patada frontal. Baja con control, sin dejarla caer.',
    'Patada frontal. Golpea al aire, pierna firme.',
  ],
  PATADA_LATERAL: [
    'Patada lateral. Sube la pierna al lado.',
    'Patada lateral. Torso erguido y equilibrio.',
    'Patada lateral. Cambia de lado con control.',
  ],
  GUARDIA: [
    'Guardia. Puños cerca del mentón y paso ligero.',
    'Guardia. Codos abajo, muévete en el sitio.',
    'Guardia. Pie ligero, no es pelear, es moverse.',
  ],
  COMBINACION: [
    'Combinación. Jab, cross y gancho. Otra vez.',
    'Combinación. Exhala en cada golpe y vuelve a la guardia.',
    'Combinación. 3, 2, 1, cambia.',
  ],
  CRUNCH_BICICLETA: [
    'Bicicleta. Codo hacia la rodilla opuesta.',
    'Bicicleta. Lumbar pegada al piso, lento.',
    'Bicicleta. Alterna sin prisa, controla.',
  ],
  V_UP: [
    'V-up. Sube brazos y piernas a encontrarse.',
    'V-up. Lumbar pegada y baja con control.',
    'V-up. Si es mucho, flexiona las rodillas.',
  ],
  ELEVACION_PIERNAS: [
    'Elevación de piernas. Piernas juntas y lumbar pegada.',
    'Elevación de piernas. Baja solo hasta donde controles.',
    'Elevación de piernas. No arquees la espalda.',
  ],
  RUSSIAN_TWIST: [
    'Giro ruso. Torso atrás y gira de lado a lado.',
    'Giro ruso. Pecho arriba, gira con control.',
    'Giro ruso. Exhala en cada giro.',
  ],
  POSTURA_NINO: [
    'Postura del niño. Frente al piso y brazos estirados.',
    'Postura del niño. Respira profundo y suelta.',
    'Postura del niño. Siéntate en los talones.',
  ],
  ESTIRAMIENTO_ISQUIOS: [
    'Isquios. Pierna estirada y espalda larga.',
    'Isquios. Sin rebotar, sostén y respira.',
    'Isquios. Llega hasta donde puedas.',
  ],
  ESTIRAMIENTO_CUADRICEPS: [
    'Cuádriceps. Talón al glúteo y rodillas juntas.',
    'Cuádriceps. Sostén y respira, sin jalar.',
    'Cuádriceps. Apóyate en la pared si lo necesitas.',
  ],
  RESPIRACION_DIAFRAGMATICA: [
    'Respira. Inhala por la nariz y exhala largo.',
    'Respira. Suelta los hombros y el aire.',
    'Respira. Baja el pulso, lo hiciste bien.',
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


const ACTIVACION = [
  'Activación funcional. Preparamos el cuerpo con movimiento.',
  'Arrancamos la activación. Sube la temperatura poco a poco.',
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
  ACTIVACION,
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
  'ACTIVACION',
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
