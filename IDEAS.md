# IDEAS — Mecánicas de juego que ayudan a **cumplir la rutina**

> Filtro aplicado: solo ideas que **mejoran la mecánica del juego de fit** y que
> hacen que el participante **termine y repita su rutina**. Fuera: personas,
> marketing, redes y negocio. Enfoque: adherencia y finalización.

---

## 1. Mecánicas de sesión (que no se abandone a mitad)

- **Meta clara + barra de progreso**: "faltan 12 reps / 3 min" siempre visible;
  el usuario sabe cuánto falta para cerrar.
- **Guardado y reanudar**: si cierra la app o se corta, retoma **donde iba**
  (misma fase, mismas reps). Nada de empezar de cero.
- **Pausa automática**: si el usuario sale de cuadro o se detiene, pausa el reloj
  ("pausa activada, vuelve cuando quieras") en vez de seguir descontando.
- **Bajar, no romper**: si el bot detecta que te estás rindiendo, ofrece
  *"¿bajamos la intensidad?"* en vez de dejar que abandones.
- **Cierre garantizado**: al llegar al final hay una **última repetición /
  campana** y pantalla de "rutina cumplida" (refuerzo de finalización).
- **Descansos configurables y salto de descanso** (continuar cuando estés listo).
- **Día mínimo**: aunque sea **1 minuto**, cuenta como rutina cumplida. Modelo
  "no todo o nada" para no romper el hábito.
- **Micro-sesión (5 min)** como puerta de entrada; progresa a 15 y 30 min.

---

## 2. Mecánicas de conteo y feedback (que se sienta justo y claro)

- **Conteo fiable** (base ya implementada): descenso de cadera en sentadilla,
  plancha en flexiones, piernas abiertas en jumping jacks. Sin esto, el juego no
  se siente justo y el usuario abandona.
- **Feedback de forma por voz**, no solo texto: el bot corrige sin que tengas que
  mirar la pantalla.
- **Combo / flow**: multiplicador por hacer reps seguidas con buena forma.
- **Sabor Score**: mide **forma + ritmo + constancia**, no solo cantidad; premia
  el esfuerzo y no solo el número (motiva a quienes hacen menos reps).
- **Barra de forma**: indicador en vivo de "vas bien / ojo con la espalda".
- **Metrónomo / beat**: marca el ritmo objetivo de cada rep para evitar reps
  a medias y dar sensación de logro.
- **Conteo por voz**: el bot canta los números al ritmo (refuerzo inmediato).

---

## 3. Voz del entrenador (motiva, ayuda y corrige)

El corazón de la experiencia: una voz que **anima, enseña y corrige** durante la
rutina. Es lo que hace que la gente siga y termine.

- **Voz motivante en vivo**: arenga durante la repetición ("¡vamos campeón, dos
  más!"); sube la energía justo cuando cuesta.
- **Corrección de postura hablada**: dice el error **concreto** y cómo arreglarlo
  ("baja más la cadera", "no redondees la espalda", "alinea el cuerpo en plancha",
  "abre más las piernas"), sin que tengas que mirar la pantalla.
- **Refuerzo positivo primero**: reconoce lo bueno y luego corrige
  ("¡buena esa! ahora sube un poquito más").
- **Cues antes/durante/después**: "prepárate" → "¡ahora!" → "otra vez"; menos
  errores y más repeticiones válidas.
- **Sin repetir frases**: varía el mensaje para no volverse cansón.
- **Frecuencia adaptativa**: si la forma va bien, habla poco; si falla, corrige
  más seguido.
- **Refuerzo en hitos**: "¡diez!", "¡récord!", "¡última!" con tono que sube.
- **Tono que acompaña el cansancio**: baja la voz si te ve fatigado, la sube si te
  ve fuerte.
- **Ayuda cuando se traba**: si no detecta reps en unos segundos, ofrece una
  **regresión** ("hagámosla con la silla, sin pena").
- **Explicación breve de técnica**: si repites el error, da una pista corta
  ("rodillas hacia afuera").
- **Seguridad primero**: avisa "no fuerces la rodilla", "detente si sientes dolor".
- **Cierre hablado**: "¡Rutina cumplida, quedó berraco!" como refuerzo final.
- **Solo habla en los descansos si hay música**: no pisa la canción.
- **Offline**: usa frases pregrabadas/cacheadas para no depender de la red.
- **Parla local**: motiva y corrige con sabor colombiano ("¡hágale pues!",
  "no se rinda mijo", "eso, así, suave").
- **Subtítulos en pantalla**: la misma frase visible, para quien entrena con ruido
  o sin sonido.

---

## 4. Mecánicas de adherencia (volver a entrenar)

- **Racha flexible**: días de descanso programados no rompen la racha.
- **Objetivo semanal** (ej. 3 clases/semana) en vez de exigir todos los días.
- **Progresión adaptativa**: si cumples, sube la exigencia; si no, baja sola.
  El usuario **nunca "falla"**, siempre completa un nivel posible.
- **Reconciliación sin culpa**: si llevas días sin entrar, el bot te recibe
  suave ("despacito volvemos") en lugar de reprochar.
- **Reto diario rotativo** que siempre se puede completar en una sesión.
- **Accountability ligera**: un "parche" o compañero ve tu progreso y te anima
  (asíncrono, sin salas en vivo).
- **Recordatorio en el mejor horario**: notificación/WhatsApp cuando sueles
  entrenar; si no respondes, baja la frecuencia (no ser invasivo).

---

## 5. Mecánicas de estructura de clase (para poder completarla)

- **Estructura fija**: calentamiento → trabajo → enfriamiento. Te dice qué sigue.
- **Sets y series** con repeticiones objetivo por ejercicio.
- **Regresiones por ejercicio**: versión fácil de cada movimiento (sentadilla con
  apoyo de silla, flexión en rodillas, JJ sin salto) para no trabarse.
- **Modos por barrera** (bajan la fricción y permiten cumplir):
  - **Modo Longevo**: adultos mayores, movilidad y equilibrio.
  - **Modo Rehab**: postura/espalda de trabajo de escritorio.
  - **Modo Familia**: todos en casa, el bot nombra a cada uno.
  - **Modo "me da pena"**: sin cámara al inicio, la activa luego.
- **Objetivos por meta**: bajar barriga / fuerza / cardio / movilidad.
- **Duración elegible**: 5, 15 o 30 min según el tiempo real del día.
- **Calentamiento y enfriamiento cortos** que también se cuentan como cumplidos.

---

## 6. Mecánicas técnicas que permiten terminar

- **Offline (PWA)**: entrenar sin datos; el progreso se sincroniza al volver.
- **Fallback a sensores**: si la cámara falla, usa acelerómetro/giroscopio para no
  perder el conteo y no frustrar la sesión.
- **Modo audio (manos libres)**: toda la clase guiada por voz, sin mirar pantalla.
- **Ritmo/música sincronizada (BPM)**: ayuda a mantener el paso y a completar la
  fase; el bot habla en los descansos para no pisar la música.
- **Reintento de guardado**: si falla el envío del puntaje, reintenta solo.

---

## 7. Referencias investigadas (mecánicas)

- **gmen1057/fitness-coach** — PWA con progreso, rachas y métricas.
- **rishisim/FormFlow** — corrección en vivo, sets/descansos, racha.
- **burakorkmez/codeflex-ai** — voz de coach + planes adaptativos.
- **shumeraa/Spotter-AI**, **pawan7323/AI_Gym_Trainer** — feedback de forma + TTS.
- **Virtuagym (tendencias 2026)** — IA, social y "fitness como juego".
- **RockMyRun / Tempo Magic / Power Music / Body Beat** — ritmo/BPM como
  mecanismo para completar el entrenamiento.
- Literatura de gamificación en Colombia — recompensas y retos suben la
  motivación y la constancia.

> Regla de oro del filtro: si la idea no ayuda a **empezar, seguir o terminar** la
> rutina, no entra.
