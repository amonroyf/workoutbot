# Arquetipos de clases grupales para WorkoutBot

> Investigación para rediseñar el catálogo de una PWA de fitness en casa
> (público hispanohablante, foco Colombia), pasando de "rutinas sueltas" a
> **clases con arquetipo, estructura, música y dirección**.
>
> Estado: **documento de investigación**. No modifica código. Las cifras están
> separadas por nivel de evidencia para no mezclar estándares oficiales con
> convenciones de diseño.

---

## 0. Cómo leer este informe

### 0.1 Niveles de evidencia

| Código | Significado | Ejemplos |
|---|---|---|
| **A** | Fuente oficial, revisada por pares o estándar de organización reconocida | Les Mills, ACSM, NASM, ACE, PubMed/DOI |
| **B** | Fuente de industria, instructor certificado o medio especializado | notas de coreografía, blogs de instructores, IDEA |
| **C** | Convención de diseño o estimación propia, útil pero no normativa | BPM estimado, reparto de minutos, cues propuestos |
| **ZH** | Fuente en chino; se marca explícitamente porque el usuario lo pidió | Baidu Baike, 国家体育总局, Bilibili, Xiaohongshu |
| **JP** | Fuente en japonés; se marca cuando aporta un dato que no encontré en inglés | guía de BodyCombat |

> Regla de lectura: si una fila dice **C**, no la presentes como verdad
> fisiológica. Es una decisión de producto.

### 0.2 Qué se investigó

Siete arquetipos reales de clase grupal:

1. Fuerza con barra / estilo **BODYPUMP**.
2. **HIIT** y Tabata.
3. **Cardio dance** / estilo **Zumba**.
4. **Combat** / estilo **BODYCOMBAT**.
5. **Core y estabilidad**.
6. **Movilidad y yoga suave**.
7. **Spinning / rhythm cycling**.

Para cada uno: duración, reparto por secciones con minutos y porcentaje,
trabajo/descanso, rondas, BPM, cues de instructor, modificaciones para
primerizos y fuentes.

---

## 1. Resumen ejecutivo

| Arquetipo | Duración típica | Densidad | Equipo | Música | Riesgo para primerizo | Mejor uso en casa |
|---|---:|---|---|---|---|---|
| Fuerza / BodyPump | 30 / 45 / 55 min | Media-alta | Barra y discos (o mochila/botellas) | 120–140 BPM | Medio | Fuerza full-body con progresión |
| HIIT / Tabata | 4–30 min | Muy alta | Ninguno | 140–170 BPM | Alto | Sesiones cortas, días con poco tiempo |
| Cardio dance / Zumba | 30 / 45 / 60 min | Media | Ninguno | 90–150 BPM | Bajo-medio | Cardio divertido, baja percepción de esfuerzo |
| Combat / BodyCombat | 30 / 45 / 55 min | Alta | Ninguno | 130–150 BPM | Medio | Cardio + coordinación, descarga de estrés |
| Core y estabilidad | 10 / 20 / 30 min | Media | Ninguno | 100–120 BPM | Bajo | Complemento, postura, anti-dolor lumbar |
| Movilidad / yoga | 20 / 30 / 45 / 60 min | Baja-media | Mat (opcional) | 60–90 BPM | Muy bajo | Recuperación, movilidad, sueño |
| Spinning / rhythm | 30 / 45 / 60 min | Media-alta | Bicicleta | 128–140 BPM | Medio | Cardio de bajo impacto |

**Decisión recomendada:** el catálogo no debe ser una lista de 60 clases de 45
minutos. Debe ser una **escalera de duraciones** (5, 10, 20, 30, 45, 55/60 min)
donde cada arquetipo tenga una versión corta que se pueda terminar. La evidencia
de retención y de adherencia favorece sesiones cortas y frecuentes; la evidencia
de producto (Peloton, Les Mills) muestra que 30 y 45 minutos son el corazón de
la demanda cuando el usuario ya está enganchado.

---

## 2. Principios transversales

### 2.1 Anatomía de una clase grupal real

Toda clase, sin importar el arquetipo, tiene cinco momentos:

| Momento | Función | % típico | Qué no puede faltar |
|---|---|---:|---|
| **Briefing** | Bajar ansiedad, explicar objetivo, mostrar escalas | 2–5% | "Hoy vamos a…", equipo, intensidad, opción fácil |
| **Calentamiento** | Subir temperatura, movilidad, activación | 10–20% | Movimientos específicos de la clase, no estiramientos largos |
| **Bloque principal** | El estímulo | 50–70% | Progresión clara, rondas, cambios anunciados |
| **Vuelta a la calma** | Bajar pulso, estirar, respirar | 10–20% | Música lenta, estiramientos de los músculos usados |
| **Cierre** | Resumen, refuerzo, pertenencia | 1–5% | "Lo lograste", "nos vemos mañana", próxima clase |

Fuente: síntesis de CrossFit Lesson Planning, ACE cueing, Les Mills y Zumba
(ver `CLASE_GRUPAL_REAL.md` para el desarrollo de esta capa).

### 2.2 Música: qué es un dato y qué es una convención

- **Dato**: el BPM se usa para alinear cadencia, respiración y energía. En
  cycling la relación es especialmente fuerte: 2:1 para subidas (BPM = 2 × RPM)
  y 1:1 para sprints.
- **Dato**: la música sincronizada reduce la percepción de esfuerzo y mejora la
  resistencia en clases dirigidas (Les Mills).
- **Convención**: los rangos de BPM por arquetipo que aparecen aquí son guías de
  diseño. Salvo Zumba y spinning, los programas no publican una tabla oficial de
  BPM por track.
- **Derechos**: no se puede usar música de Les Mills, Zumba o del catálogo
  comercial sin licencia. Para WorkoutBot: pistas libres, biblioteca del usuario
  o música original. La música no debe tapar la voz del instructor.

### 2.3 Cues de instructor

Un buen cue cumple una de tres funciones:

1. **Ejecución**: "cadera atrás", "codos a 45°", "abdomen firme".
2. **Seguridad**: "si sientes dolor, cambia", "no bloquees la respiración".
3. **Energía**: "última ronda", "vamos juntos", "3, 2, 1, cambio".

La anticipación es la diferencia entre clase dirigida y lista de ejercicios:
avisar **antes** del cambio, no después. Ejemplo: "quedan 10 segundos… 5, 4, 3,
2, 1, descanso".

### 2.4 Primerizos: reglas que se repiten

- **Dosis mínima**: 1–2 clases por semana al inicio; no 5.
- **Duración**: 10–30 minutos antes que 45–60.
- **Intensidad**: siempre ofrecer opción baja y sin salto.
- **Técnica antes que carga**: primero rango, luego tempo, luego peso.
- **Permiso para parar**: "si la forma se rompe, descansa; no es fallar".
- **Éxito temprano**: que termine la clase y quiera volver.

### 2.5 Contexto Colombia y entrenamiento en casa

Estas no son verdades fisiológicas, son restricciones de diseño que deberían
verse en el catálogo:

| Restricción | Implicación |
|---|---|
| Espacio pequeño (apartamento, sala) | Priorizar movimientos en el sitio, step-touch, sentadilla, patrones sin desplazamiento largo |
| Piso duro / vecinos | Versión sin salto por defecto; saltos como opción, no como requisito |
| Sin equipo | Mochila, botellas, silla, pared y banda como sustitutos declarados |
| Clima cálido / humedad | Sesiones de 10–30 min, pausas de agua, intensidad ajustable |
| Música familiar | Vallenato, cumbia, merengue, salsa y reggaetón para Zumba; no explicar el ritmo, sí el paso |
| Primerizo con miedo a "no poder" | 10–20 min, baja complejidad, instructor que muestra la versión fácil primero |
| Presupuesto | El catálogo no depende de bici, barra ni mat para empezar; el equipo es mejora, no requisito |

Zumba nació en Colombia (Cali), así que el arquetipo de danza no se siente
importado: se siente propio. Es una ventaja de producto que el catálogo debería
explotar con música y nombres locales, no con una copia genérica de "Latin
dance".

---

## 3. Arquetipos

### 3.1 Fuerza / estilo BODYPUMP

#### Ficha

| Campo | Dato |
|---|---|
| Nombre de referencia | BODYPUMP (Les Mills) |
| Duración | 30 / 45 / 55 min |
| Formato | 10 tracks musicales, un grupo muscular por track |
| Equipo | Barra, discos, step/banco; en casa: mochila, botellas, banda |
| Intensidad | Media-alta; impacto bajo |
| Repeticiones | "Rep Effect": carga ligera-moderada, muchas reps; 1000+ reps en 55 min |
| Calorías | ~430–560 kcal por clase de 55 min según fuente |
| Público | Principiantes con opción de barra vacía |

#### Orden oficial de tracks

1. Warm-up
2. Squats
3. Chest
4. Back
5. Triceps
6. Biceps
7. Lunges
8. Shoulders
9. Core
10. Cooldown

#### Reparto por secciones (55 min)

| Track | Minutos | % | Foco |
|---|---:|---:|---|
| 01 Warm-up | 6 | 11% | Patrones básicos, subir pulso |
| 02 Squats | 7 | 13% | Piernas, carga más pesada |
| 03 Chest | 6 | 11% | Pecho, press y flexiones |
| 04 Back | 6 | 11% | Espalda, deadlift/row |
| 05 Triceps | 5 | 9% | Tríceps |
| 06 Biceps | 5 | 9% | Bíceps |
| 07 Lunges | 6 | 11% | Unilateral, glúteo |
| 08 Shoulders | 5 | 9% | Hombros |
| 09 Core | 5 | 9% | Core |
| 10 Cooldown | 4 | 7% | Estiramiento |
| **Total** | **55** | **100%** | |

> Reparto **C** normalizado a partir de tracks reales de 2:20–6:30. Cada release
> varía; lo estable es el orden de grupos musculares.

#### Versiones express

| Formato | Tracks | Música | Tiempo real |
|---|---|---|---:|
| 55 min | 1–10 | 10 tracks | ~55 min |
| 45 min | 1, 2, 3, 4, 7, 8, 9, 10 | 8 tracks | 40:22 |
| 45 min con combos | 1, 2, 3, 4, 5+6, 7+8, 9, 10 | 8 tracks | 40:39 |
| 30 min | 1, 2, 3, 4, 9 | 5 tracks | 25:39–27:00 |

Los formatos express no son "la clase completa apurada": recortan tracks y
conservan el orden. En 30 min se pierden tríceps, bíceps, zancadas y hombros; el
instructor puede añadir un cierre corto.

#### Trabajo / descanso y rondas

- No hay descansos programados dentro del track: el descanso es el **cambio de
  track** (30–60 s para cambiar discos y explicar).
- Cada track tiene **3–5 bloques** (sets) con combinaciones de tempo:
  - `2/2`: 2 tiempos abajo, 2 arriba.
  - `3/1`: 3 abajo, 1 arriba.
  - `1/3`: 1 abajo, 3 arriba.
  - `4/4`: lento y controlado.
  - `1/1`: singles.
  - pulsos y medias repeticiones al final.
- Ejemplo real (track de sentadillas): 3 rondas con stances mid, wide y wider;
  ~8 reps por bloque; sin recuperación entre bloques, solo transición de stance.
- La "ronda" en BodyPump es el **track**, no una vuelta de circuito.

#### Música y BPM

Les Mills **no publica BPM oficial por track** en sus notas de coreografía. Los
rangos siguientes son **C**, estimados por tempo de pista y práctica de
instructor:

| Track | BPM estimado |
|---|---:|
| Warm-up | 120–128 |
| Squats | 128–136 |
| Chest | 120–132 |
| Back | 120–132 |
| Triceps / Biceps | 118–130 |
| Lunges | 124–132 |
| Shoulders | 120–130 |
| Core | 110–125 |
| Cooldown | 90–110 |

La lógica es que el tempo marca la velocidad de la repetición: a más BPM, reps
más rápidas y menor carga; a menos BPM, más control y más tiempo bajo tensión.

#### Cues concretos

- **Inicio de track**: "Sentadillas. Barra en la espalda, pies al ancho de
  hombros. Cuatro tiempos abajo, cuatro arriba. Vamos con la primera serie."
- **Mitad**: "Mitad del track. Quedan dos bloques. No sueltes el abdomen."
- **Pulsos**: "Tres pulsos abajo y dos completas. 3, 2, 1, sube."
- **Cambio**: "Última serie. 3, 2, 1, cambio de peso."
- **Cierre**: "Suelta la barra, sacude las piernas. Respira. Lo hiciste."

#### Primerizos

- Empezar con **barra vacía** o solo peso corporal; 1–2 clases/semana.
- Hacer **4–5 tracks** las primeras veces, no los 10.
- Máximo 2–3 clases/semana con un día de descanso entre ellas.
- En casa: mochila cargada, botellas de agua, banda elástica; priorizar técnica
  y rango antes que carga.
- Modificaciones: sentadilla a silla, flexión inclinada, zancada con apoyo,
  press sin peso.

#### Fuentes

- **A**: nota oficial de coreografía BODYPUMP 133 (orden, formatos, tiempos,
  estructura de reps). https://szymonwesolowski.pl/wp-content/uploads/2025/06/BODYPUMP_133_BODYPUMP133ChoreographyNotes_row_en_app_print.pdf.pdf
- **A**: Les Mills, página oficial y formatos 30/45/55.
  https://www.lesmills.com/workouts/bodypump
- **A**: Les Mills China, curso y recomendaciones para principiantes.
  https://www.lesmills.com.cn/course/detail/36
- **A**: Olmedo et al., "Bodypump…", JONNPR.
  https://doi.org/10.19230/jonnpr.3661
- **B**: Les Mills tracklists.
  https://www.lesmills.com/us/tracklist/bodypump
- **B**: 24Life, "What to expect in Les Mills BODYPUMP".
  https://www.24hourfitness.com/24life/fitness/2017/class-notes-what-to-expect-in-les-mills-bodypump

---

### 3.2 HIIT y Tabata

#### Ficha

| Campo | Dato |
|---|---|
| Nombre de referencia | HIIT / Tabata / intervalos de alta intensidad |
| Duración | 4 min (Tabata) a 30–40 min (sesión completa) |
| Formato | Trabajo + descanso, repetido en rondas |
| Equipo | Ninguno (bodyweight); opcional banda/mancuerna |
| Intensidad | Muy alta en el trabajo; 80–95% HRmax |
| Recuperación | 40–50% HRmax, igual o algo más larga que el trabajo |
| Público | Intermedio; primerizos con versión de bajo impacto |

#### Protocolos de referencia

| Protocolo | Trabajo | Descanso | Rondas | Total |
|---|---:|---:|---:|---:|
| Tabata original | 20 s | 10 s | 8 | 4 min |
| HIIT 30/15 | 30 s | 15 s | 8–12 | 6–9 min |
| HIIT 40/20 | 40 s | 20 s | 8–12 | 8–12 min |
| ACSM ejemplo A | 60 s | 60 s | 6–10 | 12–20 min |
| ACSM ejemplo B | 30 s | 90 s | 6–10 | 12–20 min |
| ACSM rango | 15 s–4 min | igual o más larga | 6–10 | 10–40+ min |

Dato importante: el Tabata original **no** era "20 s al 170% del VO2max". El
estudio de Gentil et al. revisó el protocolo original y encontró ~7–9 repeticiones
por intervalo a ≥85 rpm, con una intensidad que no llega a ese 170% mitificado.
La prescripción útil es "todo lo que puedas sostener con forma", no un número
inventado.

#### Reparto por secciones (20 min)

| Sección | Minutos | % | Contenido |
|---|---:|---:|---|
| Calentamiento | 3 | 15% | Movilidad, sentadilla, marcha, hombros |
| Bloque 1 | 6 | 30% | 6 × (40/20) o 8 × (30/15) |
| Descanso entre bloques | 1 | 5% | Caminar, respirar |
| Bloque 2 | 6 | 30% | 6 × (40/20), ejercicios distintos |
| Vuelta a la calma | 4 | 20% | Estiramiento + respiración |
| **Total** | **20** | **100%** | |

#### Reparto por secciones (30 min)

| Sección | Minutos | % | Contenido |
|---|---:|---:|---|
| Calentamiento | 4 | 13% | Progresivo, sin fatiga |
| Bloque 1 | 7 | 23% | 7 × (40/20) |
| Bloque 2 | 7 | 23% | 7 × (40/20), cambio de patrón |
| Bloque 3 | 7 | 23% | 4 × Tabata (20/10) |
| Vuelta a la calma | 5 | 17% | Estiramiento + respiración |
| **Total** | **30** | **100%** | |

#### Trabajo / descanso y rondas

- **Tabata**: 8 rondas de 20/10 = 4 min exactos. No alargar el trabajo: si no
  puedes mantener la calidad, baja la versión, no el descanso.
- **40/20**: el estándar más usable en casa. 8–12 rondas por bloque.
- **30/15**: algo más intenso metabólicamente; útil en bloques de 6–9 min.
- **Descanso entre bloques**: 60–120 s. Es lo que permite repetir calidad.
- **Rondas**: 2–4 bloques por sesión; no más de 30 min de trabajo real.
- **Selección de ejercicios**: alternar patrón dominante para no fatigar el mismo
  músculo: piernas → empuje → piernas → tirón → core.

#### Música y BPM

| Zona | BPM |
|---|---:|
| Calentamiento | 120–135 |
| HIIT / Tabata | 140–170 |
| Recuperación | 110–125 |
| Vuelta a la calma | 90–110 |

> **C**: el BPM no prescribe intensidad fisiológica; sirve para marcar el tempo
> de los intervalos y mantener energía. Un HIIT puede hacerse en silencio.

#### Cues concretos

- **Inicio**: "20 segundos. Todo lo que tengas, con forma. 3, 2, 1, ¡ya!"
- **Mitad**: "Quedan 10. No aflojes. 5, 4, 3, 2, 1, descanso."
- **Descanso**: "10 segundos. Respira por la nariz, baja los hombros."
- **Cambio**: "Siguiente: sentadilla con salto. Versión sin salto si lo necesitas."
- **Última ronda**: "Última. Esta es la buena. 3, 2, 1."
- **Cierre**: "Terminaste. Camina 30 segundos y respira."

#### Primerizos

- Empezar con **4 rondas** de 20/20 o 30/30, no con 8 Tabatas.
- Ofrecer siempre versión **sin salto**: sentadilla a silla, step-touch, rodillas
  altas caminando, flexión en pared.
- Descanso más largo (1:1 o 1:2) las primeras semanas.
- No vender "quema grasa 24 h"; vender "sesión corta, terminas, vuelves".
- Contraindicación relativa: dolor torácico, presión alta no controlada, lesión
  aguda; derivar a profesional.

#### Fuentes

- **A**: Gentil et al., "Tabata…", MSSE.
  https://doi.org/10.1249/mss.0000000000001023
- **A**: ACSM, "High-Intensity Interval Training".
  https://journals.lww.com/acsm-healthfitness/fulltext/2013/05000/high_intensity_interval_training__efficient,.3.aspx
- **B**: Keep / Keepland MIXT (formato grupal 45–60 min; 12 ejercicios × 30 s;
  HIIT 40/20). https://www.tmtpost.com/3213641.html
- **ZH**: Sina, ejemplos de HIIT en casa (20 min × 4 rondas; Tabata 20/10).
  https://www.sina.cn/news/detail/4204838138431536.html
- **ZH**: Xiaohongshu, "4分钟tabata居家跟练".
  https://www.xiaohongshu.com/user/profile/5f60b5d3000000000101c424

---

### 3.3 Cardio dance / estilo Zumba

#### Ficha

| Campo | Dato |
|---|---|
| Nombre de referencia | Zumba |
| Origen | Colombia (Beto Pérez, Cali) |
| Duración | 30 / 45 / 60 min |
| Formato | Canciones encadenadas; no se para a descomponer |
| Equipo | Ninguno |
| Intensidad | Media; impacto bajo-medio |
| Calorías | ~450 kcal/60 min (Baidu); ~300+ kcal/30 min en versión casera |
| Público | Muy amplio; bajo miedo a "no saber bailar" si se repite |

#### Fórmula y ritmos

- **Z = MC²**: Música / Core Steps / Coreografía.
- Cuatro ritmos base: **merengue, salsa, reggaetón, cumbia**.
- Cuatro pasos base por ritmo → 16 movimientos que se combinan.
- La coreografía se mapea a secciones de la canción: intro, verso, coro, puente,
  tags. Cuando se repite la sección, se repite el movimiento.
- No se enseña con "32 counts" rígidos: la música manda.

#### Reparto por secciones (45 min)

| Sección | Minutos | % | BPM | Contenido |
|---|---:|---:|---:|---|
| Calentamiento | 8 | 18% | 90–110 | Marcha, step-touch, movilidad, ritmo lento |
| Cardio build | 10 | 22% | 120–135 | Merengue/salsa, patrones repetidos |
| Pico | 19 | 42% | 130–150 | Reggaetón/cumbia, intervalos por canción |
| Vuelta a la calma | 8 | 18% | 90–110 | Canción lenta, estiramiento |
| **Total** | **45** | **100%** | | |

#### Reparto por secciones (60 min)

| Sección | Minutos | % | BPM |
|---|---:|---:|---:|
| Calentamiento | 9 | 15% | 90–110 |
| Cardio build | 11 | 18% | 120–135 |
| Pico | 30 | 50% | 130–150 |
| Vuelta a la calma | 10 | 17% | 90–110 |
| **Total** | **60** | **100%** | |

#### Trabajo / descanso y rondas

- **No hay descansos programados**: la clase es flujo continuo. Las pausas son
  cambios de canción (10–20 s) y pausas de agua.
- La "ronda" es la **canción** (3–5 min) o el **bloque de 2–4 canciones**.
- El intervalo se crea alternando ritmos rápidos y lentos, no con un timer.
- Para casa: 30 min = 6–8 canciones; 45 min = 9–12; 60 min = 12–15.

#### Música y BPM

| Fase | BPM | Ejemplos |
|---|---:|---|
| Calentamiento | 90–110 | "La Bicicleta" (90), salsa suave, cumbia lenta |
| Cardio build | 120–135 | "Suavemente" (124), merengue |
| Pico | 130–150 | "Danza Kuduro" (130), reggaetón |
| Vuelta a la calma | 90–110 | "Vivir Mi Vida" (100), bolero/cumbia lenta |

Mapa útil para Colombia: vallenato, cumbia, merengue, salsa y reggaetón dan
familiaridad inmediata; no hace falta explicar el ritmo, solo el paso.

#### Cues concretos

- **Inicio**: "No hay pasos incorrectos. Sigue mi pie. Derecha, izquierda,
  step-touch. Sonríe."
- **Cambio**: "Ocho counts a la derecha, cuatro a la izquierda. 3, 2, 1, cambio."
- **Pico**: "¡Todos! Brazos arriba, cadera libre. Una más y cambiamos."
- **Recuperación**: "Baja el ritmo, respira. Agua si necesitas."
- **Cierre**: "Lo bailaste. Eso es cardio. Nos vemos la próxima."

#### Primerizos

- 30 min mejor que 60; 2–3 canciones de calentamiento, no 15.
- Versión **sin salto** y con pasos repetidos; el instructor exagera el movimiento
  para que se lea desde lejos.
- No corregir "estilo de baile"; corregir seguridad (rodillas, espalda, giros).
- Espacio pequeño: pasos hacia adelante/atrás y lado a lado; evitar giros amplios.
- Piso duro: zapato con amortiguación, sin saltos.

#### Fuentes

- **B**: Dancewami, estructura y BPM por fase (instructor certificado).
  https://www.dancewami.com/view/the-best-zumba-songs-for-every-workout-phase-a-certified-instructor-s-playlist-guide-for-2024-2025.html
- **A/B**: Zumba Basic Steps Level 1, manual (fórmula Z=MC², 4 ritmos, 4 pasos).
  https://pdfcoffee.com/download/basic2-manual-english-v4-pdf-free.html
- **ZH**: Baidu Baike, 60 min, calentamiento 15 min, FC ~90→140, ~450 kcal,
  bajo impacto. https://baike.baidu.com/item/%E5%B0%8A%E5%B7%B4/5314252
- **ZH**: Goji Studios (HK), estructura de 1 h: calentamiento, 40–45 min
  principal, 1–2 canciones de enfriamiento. https://gojistudios.com.hk/5700/
- **ZH**: Bilibili, 30 min de Zumba latina sin saltos, ~300+ kcal.
  https://bilitube.cc/watch/BV1nisNzhEBS

---

### 3.4 Combat / estilo BODYCOMBAT

#### Ficha

| Campo | Dato |
|---|---|
| Nombre de referencia | BODYCOMBAT (Les Mills) |
| Duración | 30 / 45 / 55 min |
| Formato | 9 tracks + cooldown; artes marciales sin contacto |
| Equipo | Ninguno |
| Intensidad | Alta; impacto bajo-medio (siempre hay opción baja) |
| Calorías | hasta ~740 kcal/55 min |
| Público | Amplio; no requiere técnica marcial previa |

#### Orden de tracks

1. Warm-up Combo
2. Combat 1
3. Power Training 1
4. Combat 2
5. Power Training 2
6. Combat 3
7. Muay Thai
8. Power Training 3
9. Conditioning
10. Cooldown (el instructor lo añade)

#### Reparto por secciones (55 min)

| Track | Minutos | % | Foco |
|---|---:|---:|---|
| Warm-up | 6 | 11% | Guardia, jab, cross, rodillas |
| Combat 1 | 5 | 9% | Combinaciones de boxeo |
| Power Training 1 | 5 | 9% | Piernas y potencia |
| Combat 2 | 5 | 9% | Patadas |
| Power Training 2 | 5 | 9% | Fuerza metabólica |
| Combat 3 | 6 | 11% | Combinaciones mixtas |
| Muay Thai | 7 | 13% | Rodillas, codos, clinch |
| Power Training 3 | 6 | 11% | Potencia final |
| Conditioning | 5 | 9% | Core/acondicionamiento |
| Cooldown | 5 | 9% | Estiramiento |
| **Total** | **55** | **100%** | |

#### Versiones express

| Formato | Tracks | Tiempo real |
|---|---|---:|
| 55 min | 1–9 + cooldown | ~55 min |
| 45 min | 1–7 + cooldown | 40:30 + cierre |
| 30 min | 1, 2, 3, 7, 9 + cooldown | 26:05 + cierre |
| 30 min alterno | 1, 2, 3, 7, 9 | 26:05 |

#### Trabajo / descanso y rondas

- Cada track dura **2:16–7:15** y es continuo.
- No hay descanso formal: la recuperación es activa dentro de la combinación
  (pulse, step, guardia, "shake out").
- La "ronda" es la **combinación** dentro del track (normalmente 4–8 counts,
  repetida 4–8 veces).
- Entre tracks: 15–30 s para beber y cambiar de combinación.
- En casa: si falta espacio, sustituir desplazamientos por step en el sitio; no
  patear muebles.

#### Música y BPM

| Track | BPM estimado |
|---|---:|
| Warm-up | 128–135 |
| Combat 1–3 | 135–150 |
| Power Training | 135–150 |
| Muay Thai | 140–150 |
| Conditioning | 130–140 |
| Cooldown | 90–110 |

El rango global **130–150 BPM** proviene de una guía japonesa de BODYCOMBAT;
los valores por track son **C** (estimación por tempo). La música electrónica y
el hip-hop son la base del programa.

#### Cues concretos

- **Inicio**: "Guardia arriba. Jab, cross, hook. No es pelear, es moverse."
- **Combinación**: "Jab, cross, rodilla. Otra vez. 3, 2, 1, cambia."
- **Potencia**: "Golpea con la cadera, no con el brazo. Exhala en cada golpe."
- **Bajo impacto**: "Sin salto: step y rodilla al frente. La energía no baja."
- **Última**: "Última combinación. Todo lo que queda. 3, 2, 1."
- **Cierre**: "Baja la guardia, sacude los brazos. Buen trabajo."

#### Primerizos

- 30 min express o 45 min; no empezar por 55.
- 1–2 clases/semana; aprender guardia y cuatro golpes antes de velocidad.
- Siempre ofrecer versión de bajo impacto: sin salto, patada baja, rodilla al
  frente.
- No contacto, no sparring, no equipo.
- Muñeca: puño cerrado pero no rígido; golpear al aire, no hiperextender.

#### Fuentes

- **A**: nota oficial de coreografía BODYCOMBAT 103 (orden, formatos, tiempos).
  https://lesmills.fun/wp-content/uploads/2025/06/bodycombat_103_bodycombat103choreographynotes_row_en_app_print_pdf11.pdf
- **A**: Les Mills China, curso y recomendaciones.
  https://www.lesmills.com.cn/course/detail/37
- **A/B**: folleto BODYCOMBAT (estructura y beneficios).
  https://www.fdlymca.org/sft960/lmusbodycombatbrochure.pdf
- **B**: Village Gym, calorías por clase (BODYCOMBAT 740 kcal/55 min).
  https://www.villagegym.co.uk/blog/les-mills-fitness-class-calories-burned/
- **JP**: guía BODYCOMBAT, BPM 130–150 y estructura de intervalos.
  https://app-tatsujin.com/les-mills-bodycombat-beginner-guide-2/

---

### 3.5 Core y estabilidad

#### Ficha

| Campo | Dato |
|---|---|
| Nombre de referencia | Core / CXWORX / estabilidad |
| Duración | 10 / 20 / 30 min |
| Formato | Circuitos de isométricos y anti-movimiento |
| Equipo | Ninguno; opcional banda, disco, mat |
| Intensidad | Media; foco en control, no en sudor |
| Calorías | ~230 kcal/30 min (referencia Les Mills Core) |
| Público | Todos; especialmente quien pasa sentado |

#### Qué es "core" de verdad

No es solo abdominales. Es la capacidad de **resistir movimiento** y transmitir
fuerza:

- Anti-extensión: plancha, dead bug, hollow hold.
- Anti-rotación: pallof press con banda, bird dog.
- Anti-flexión lateral: plancha lateral, suitcase carry.
- Extensión: superman, bird dog.
- Movilidad de cadera y respiración: puente, 90/90, respiración 360°.

NASM describe la plancha como un isométrico de anti-extensión, propio de la fase
de **estabilización/resistencia**, con múltiples series y descanso para preparar
las siguientes. Advierte no progresar la duración demasiado rápido, no bloquear
la respiración y no dejar caer la cadera.

#### Reparto por secciones (30 min)

| Sección | Minutos | % | Contenido |
|---|---:|---:|---|
| Calentamiento | 4 | 13% | Respiración, movilidad, activación |
| Bloque A | 7 | 23% | Plancha, dead bug, bird dog (40/20) |
| Bloque B | 7 | 23% | Plancha lateral, puente, hollow (40/20) |
| Bloque C | 7 | 23% | Circuito anti-rotación + finisher (30/30) |
| Vuelta a la calma | 5 | 17% | Estiramiento, respiración |
| **Total** | **30** | **100%** | |

#### Reparto por secciones (20 min)

| Sección | Minutos | % | Contenido |
|---|---:|---:|---|
| Calentamiento | 3 | 15% | Respiración y movilidad |
| Bloque A | 6 | 30% | 4 × (40/20) |
| Bloque B | 6 | 30% | 4 × (40/20) |
| Vuelta a la calma | 5 | 25% | Estiramiento |
| **Total** | **20** | **100%** | |

#### Trabajo / descanso y rondas

| Nivel | Hold | Series | Descanso |
|---|---:|---:|---:|
| Principiante | 15–30 s | 2–3 | 30–60 s |
| Intermedio | 30–45 s | 3 | 30–45 s |
| Avanzado | 45–60 s | 3–4 | 30–45 s |
| Fuerza máxima | 10–20 s | 3–5 | 30–60 s |

- Circuito típico: **40 s trabajo / 20 s descanso**, 4–6 ejercicios, 2–4 rondas.
- Alternativa suave: **30/30** o **45/15**.
- Progresión: +5–10 s por semana, solo si la forma se mantiene.
- Regla de oro: **la serie termina cuando la forma se rompe**, no cuando suena
  el timer. En la app: botón "terminar serie" y registro de tiempo real.

#### Música y BPM

| Fase | BPM |
|---|---:|
| Calentamiento | 90–110 |
| Circuito | 100–120 |
| Vuelta a la calma | 70–90 |

> **C**: el core no depende del beat. La música sirve para marcar el tempo de
> las reps y evitar silencio incómodo; no para forzar la respiración.

#### Cues concretos

- **Plancha**: "Ombligo adentro, glúteos apretados, costillas abajo. Respira."
- **Mitad**: "Quedan 20. Si la cadera cae, apoya rodillas. No es fracaso."
- **Descanso**: "10 segundos. Suelta, respira, vuelve."
- **Plancha lateral**: "Cadera arriba, hombro sobre codo. No te dejes caer."
- **Dead bug**: "Espalda baja pegada al piso. Estira brazo y pierna, exhala."
- **Cierre**: "Suelta. Respira profundo. Mañana no debería doler la espalda."

#### Primerizos

- Empezar con **15–20 s** de plancha, no 60.
- Versiones: plancha con rodillas, plancha en pared, dead bug solo brazos,
  bird dog sin elevar mucho.
- No hacer plancha si hay dolor lumbar agudo; sustituir por dead bug o bird dog.
- No aguantar la respiración; si no puede hablar, está demasiado fuerte.
- 2–3 días/semana, no todos los días.

#### Fuentes

- **A**: NASM, biblioteca de ejercicios: plancha.
  https://www.nasm.org/resource-center/exercise-library/plank
- **B**: artículo que cita el reto de core de 4 semanas de ACE (progresión
  20→35 s, 3 circuitos).
  https://spscorner.com/article-sharing/training-programming/%E5%9B%9B%E9%80%B1%E5%B9%B3%E6%9D%BF%E6%8C%91%E6%88%B0-4-week-plank-challenge/
- **B**: J2N Fitness, core 45/15 y 30/30.
  https://j2nfitness.vhx.tv/quick-core
- **B**: Runlovers, circuito 45/15 × 4 rondas.
  https://runlovers.it/en/2026/home-core-workout-plank-variations-circuit/
- **ZH**: 国家体育总局, "平板支撑并非时间越长越好": principiante 15 s × 2,
  intermedio 30 s × 3, avanzado 60 s × 3–4 o 2 min × 2–3; descanso 30 s.
  https://www.sport.gov.cn/n20001280/n20745751/n20767239/c21858758/content.html
- **ZH**: SmartWorkout, 2–4 series de 30–60 s, descanso 30–60 s, +5–10 s/semana.
  https://smartworkout.app/zh/%E5%81%A5%E8%BA%AB%E7%BB%83%E4%B9%A0%E5%BA%93/%E8%85%B9%E8%82%8C/%E5%B9%B3%E6%9D%BF%E6%94%AF%E6%92%91

---

### 3.6 Movilidad y yoga suave

#### Ficha

| Campo | Dato |
|---|---|
| Nombre de referencia | Vinyasa suave / Hatha / movilidad |
| Duración | 20 / 30 / 45 / 60 min |
| Formato | Secuencia de posturas, respiración, transiciones |
| Equipo | Mat opcional; bloque, silla, pared |
| Intensidad | Baja-media; impacto nulo |
| Calorías | ~265 kcal/45 min (referencia BodyBalance) |
| Público | Todos; ideal para recuperación y primerizos |

#### Arco de una clase de 60 min

| Fase | Minutos | % | Contenido |
|---|---:|---:|---|
| Llegada / centrado | 5 | 8% | Respiración, intención, body scan |
| Calentamiento | 7 | 12% | Cat-cow, movilidad de columna, hombros |
| Saludos al sol | 10 | 17% | 2–4 rondas de Surya Namaskar A/B |
| De pie y pico | 18 | 30% | Guerreros, equilibrio, postura pico |
| Suelo / enfriamiento | 12 | 20% | Apertura de cadera, torsión, forward fold |
| Savasana | 8 | 13% | Relajación final |
| **Total** | **60** | **100%** | |

Reglas de secuencia:

- **No robar minutos a Savasana**: mínimo 5–8 min en una clase de 60.
- **Llegar a perro boca abajo** en los primeros 8 minutos.
- **Estar en el suelo** hacia el minuto 45.
- La postura pico se puede cambiar cada clase; el calentamiento y el cierre se
  mantienen estables para que el cuerpo reconozca la estructura.

#### Duraciones y reparto

| Duración | Llegada | Calentamiento | Saludos | De pie/pico | Suelo | Savasana |
|---|---:|---:|---:|---:|---:|---:|
| 20 min | 2 (10%) | 3 (15%) | — | 9 (45%) | 4 (20%) | 2 (10%) |
| 30 min | 3 (10%) | 4 (13%) | 5 (17%) | 10 (33%) | 5 (17%) | 3 (10%) |
| 45 min | 4 (9%) | 6 (13%) | 8 (18%) | 14 (31%) | 8 (18%) | 5 (11%) |
| 60 min | 5 (8%) | 7 (12%) | 10 (17%) | 18 (30%) | 12 (20%) | 8 (13%) |

#### Trabajo / descanso y rondas

- **Un movimiento, una respiración** en las transiciones.
- Posturas sostenidas: **3–5 respiraciones** (~45 s); caderas y aperturas:
  60–90 s; equilibrio: 5–8 respiraciones.
- No hay "rondas" ni timer de trabajo/descanso. La estructura es el arco:
  calentar → subir → pico → bajar → descansar.
- La respiración es el metrónomo: si se pierde, se baja el ritmo.

#### Música y BPM

| Fase | BPM |
|---|---:|
| Centrado / respiración | 60–70 |
| Calentamiento | 70–80 |
| Flujo / de pie | 80–90 |
| Suelo / Savasana | 60–70 |

> **C**: el yoga no se hace "al beat". La música es ambiente; debe haber silencio
> para las instrucciones y la respiración. Si hay beat fuerte, se convierte en
> otra clase.

#### Cues concretos

- **Inicio**: "Siéntate cómodo. Inhala por la nariz, exhala más largo. Tres
  respiraciones para llegar."
- **Transición**: "Inhala, brazos arriba. Exhala, pliega. Una respiración, un
  movimiento."
- **Postura**: "Llega hasta donde puedas sin dolor. Tres respiraciones más."
- **Modificación**: "Si los isquiotibiales tiran, dobla las rodillas. Si la
  cadera molesta, siéntate sobre un bloque."
- **Savasana**: "Suelta brazos y piernas. No hay nada que corregir. Cinco
  minutos para ti."

#### Primerizos

- 20–30 min; no empezar con una clase de 60 min de vinyasa rápido.
- Rodillas dobladas, bloques, silla y pared a mano.
- Evitar inversiones, posturas de equilibrio sobre la cabeza y torsiones
  profundas sin supervisión.
- "Child's pose" siempre disponible: no es abandonar, es regular.
- Embarazo, hipertensión, glaucoma, lesión de columna: consultar profesional.

#### Fuentes

- **B**: Yoga Sequencing, plantilla de 60 min y regla de Savasana.
  https://www.yoga-sequencing.com/blog/how-to-sequence-a-60-minute-vinyasa-class
- **B**: Yoga Journaling, presupuesto de 60 min y proporciones por fase.
  https://membership.yoga-journaling.com/create-yoga-sequence/60-minute-class/
- **B**: U of Yoga, clases de 45–75 min, posturas de 1–5 respiraciones.
  https://uofyoga.com/vinyasa-yoga/
- **ZH**: plantilla china de 60 min: 冥想 10 / 热身 10 / 体位 30 / 放松 10;
  incluye guion de seguridad y respiración abdominal.
  https://www.trfsz.com/newsview469166.html

---

### 3.7 Spinning / rhythm cycling

#### Ficha

| Campo | Dato |
|---|---|
| Nombre de referencia | RPM / Spinning / rhythm cycling |
| Duración | 30 / 45 / 60 min |
| Formato | Calentamiento, planos, subidas, intervalos, enfriamiento |
| Equipo | Bicicleta estática |
| Intensidad | Media-alta; impacto nulo |
| Calorías | ~675 kcal/45 min (referencia RPM) |
| Público | Amplio; la resistencia la controla el usuario |

#### Reparto por secciones (45 min)

| Sección | Minutos | % | Cadencia | Contenido |
|---|---:|---:|---|---|
| Calentamiento | 7 | 16% | 80–95 rpm | 3 pickups de 1 min a 100 rpm |
| Plano / resistencia | 10 | 22% | 85–95 rpm | Endurance, Z2 |
| Subidas | 12 | 27% | 60–80 rpm | Sentado y de pie |
| Intervalos | 8 | 18% | 90–110 rpm | 30–60 s fuertes |
| Enfriamiento | 8 | 18% | 70–85 rpm | Estiramiento |
| **Total** | **45** | **100%** | | |

#### Reparto por secciones (30 min)

| Sección | Minutos | % | Contenido |
|---|---:|---:|---|
| Calentamiento | 5 | 17% | Progresivo |
| Plano | 7 | 23% | Endurance |
| Subidas | 8 | 27% | 3–4 sets |
| Intervalos | 6 | 20% | 4–6 × 30 s |
| Enfriamiento | 4 | 13% | Estiramiento |
| **Total** | **30** | **100%** | |

#### Trabajo / descanso y rondas

- **Rolling Hills** (IDEA): 30 s de pie a 65 rpm → 30 s sentado a 80+ rpm →
  30 s "downhill" (recuperación), 3–4 sets.
- **Intervalos**: 30 s–3 min de trabajo; recuperación 1–3 min.
- **Sprints**: 15–30 s a 100–120 rpm, con resistencia suficiente para no
  rebotar.
- La "ronda" es el **set** de subida/intervalo; la clase encadena 4–8 sets.
- Regla de cadencia: si la cadera rebota, falta resistencia o sobra RPM.

#### Música y BPM

Relación oficial de referencia (Spinning®):

| Zona | RPM | BPM (2:1) |
|---|---:|---:|
| Calentamiento/recuperación | 70–85 | 140–170 |
| Endurance / Z2 | 85–95 | 170–190 |
| Tempo / umbral | 88–95 | 176–190 |
| Subida sentado | 60–75 | 120–150 |
| Subida de pie | 55–70 | 110–140 |
| Sprint | 100–120 | 100–120 (1:1) |

- **Subidas**: música 2:1 (BPM = 2 × RPM). Ejemplo: 60 rpm → 120 BPM;
  80 rpm → 160 BPM.
- **Sprints**: música 1:1. Ejemplo: 110 rpm → 110 BPM.
- En la práctica, una clase de 45 min suele moverse en **128–140 BPM** con
  cambios por bloque.

#### Cues concretos

- **Inicio**: "Cadencia libre, resistencia ligera. 80 rpm. Tres pickups de un
  minuto a 100."
- **Subida**: "De pie, 65 rpm. Cadera atrás, peso en los pedales. 30 segundos.
  3, 2, 1, sentado."
- **Intervalo**: "30 segundos fuertes. No rebotes. 10, 9, 8…"
- **Recuperación**: "Baja resistencia, respira. 80 rpm. Recupera para la
  siguiente."
- **Cierre**: "Suelta la resistencia, pedalea suave. Estira cuádriceps y
  gemelos."

#### Primerizos

- 30 min; quedarse sentado, 60–80 rpm, resistencia baja.
- Ajustar sillín y manillar antes de empezar; rodilla casi extendida en el
  punto más bajo.
- No hacer sprints de pie hasta tener control; primero cadencia sentado.
- Si hay dolor de rodilla, revisar altura de sillín y no empujar con punta del
  pie.
- En casa sin bici: adaptar a "cardio rhythm" con step-touch, sentadilla tempo y
  música, sin fingir que es spinning.

#### Fuentes

- **B**: IDEA, "Sample Class: Reaching the Summit" (calentamiento 6–8 min,
  130–135 BPM, rolling hills 30/30/30, 3–4 sets).
  https://www.ideafit.com/sample-class-reaching-the-summit/
- **ZH**: GagaRun, guía RPM/BPM de Spinning® (planos 80–110, subidas 60–80,
  sprints 100–120; tabla 2:1 y 1:1).
  https://www.gagarun.com/zh/blog/spin-bike-rpm-bpm-music-guide
- **B**: Village Gym, calorías RPM 675/45 min.
  https://www.villagegym.co.uk/blog/les-mills-fitness-class-calories-burned/

---

## 4. Comparativa entre arquetipos

| Dimensión | BodyPump | HIIT | Zumba | Combat | Core | Yoga | Spinning |
|---|---|---|---|---|---|---|---|
| Duración núcleo | 45–55 | 10–30 | 45–60 | 45–55 | 20–30 | 45–60 | 45–60 |
| Densidad | Media-alta | Muy alta | Media | Alta | Media | Baja | Media-alta |
| Impacto | Bajo | Alto | Bajo-medio | Bajo-medio | Bajo | Nulo | Nulo |
| Curva de aprendizaje | Media | Baja | Media | Media | Baja | Media | Baja |
| Equipo | Barra/mochila | Ninguno | Ninguno | Ninguno | Ninguno | Mat | Bici |
| Música | Protagonista | Metrónomo | Protagonista | Protagonista | Fondo | Ambiente | Protagonista |
| Riesgo de lesión | Medio | Alto | Bajo | Medio | Bajo | Muy bajo | Medio |
| Retención esperada | Media | Media-baja | Alta | Alta | Media | Alta | Alta |
| Mejor para | Fuerza | Tiempo corto | Cardio social | Estrés | Postura | Recuperación | Cardio bajo impacto |

Lectura de producto: **Zumba, Combat y Spinning** son "experiencia"; **BodyPump,
Core y Yoga** son "resultado"; **HIIT** es "eficiencia". El catálogo debe tener
las tres motivaciones, no solo una.

---

## 5. Catálogo recomendado por duración

### 5.1 Principios

1. **Una clase = un arquetipo claro**, no una mezcla indefinida.
2. **Cada arquetipo tiene una versión que se puede terminar** en 10–30 min.
3. **La duración no es solo recorte**: cambia el objetivo.
   - 5–10 min: activación, hábito, "no tengo tiempo".
   - 20 min: sesión real mínima.
   - 30 min: estándar de producto.
   - 45 min: experiencia completa.
   - 55–60 min: clase insignia / fin de semana.
4. **Primerizo → 10–20 min, bajo impacto, instrucciones claras.**
5. **La clase de 45 min no se ofrece como primera clase** salvo que el usuario
   la elija explícitamente.

### 5.2 Escalera de duraciones

| Tier | Duración | Objetivo | Arquetipos | Nº de clases sugerido |
|---|---:|---|---|---:|
| T0 | 5 min | Activación / hábito | Movilidad, core express, cardio express | 4–6 |
| T1 | 10 min | Sesión mínima | HIIT, core, movilidad, fuerza express | 6–8 |
| T2 | 20 min | Sesión real | HIIT, fuerza, Zumba, core, yoga | 8–10 |
| T3 | 30 min | Estándar | BodyPump express, Combat, Core, Spin, Zumba, Yoga | 8–10 |
| T4 | 45 min | Experiencia completa | BodyPump, Combat, Spin, Zumba, Yoga, Funcional | 6–8 |
| T5 | 55–60 min | Insignia | BodyPump, Combat, Zumba, Spin, Yoga | 4–6 |

### 5.3 Detalle por tier

#### T0 — 5 min

| Clase | Arquetipo | Estructura | Para quién |
|---|---|---|---|
| "Despierta" | Movilidad | 1 min respiración + 4 min movilidad de columna/hombros | Todos |
| "Core 5" | Core | 4 × (40/20) + 1 min estiramiento | Principiante |
| "Cardio 5" | HIIT suave | 2 min calentamiento + 4 × (30/15) + 1 min calma | Principiante |
| "Fuerza 5" | Fuerza | Sentadilla, flexión, puente, plancha × 2 rondas | Principiante |

#### T1 — 10 min

| Clase | Arquetipo | Estructura | Para quién |
|---|---|---|---|
| "Tabata 10" | HIIT | 2 min calentamiento + 4 min Tabata + 4 min calma | Intermedio |
| "Core 10" | Core | 2 min calentamiento + 5 min circuito + 3 min calma | Todos |
| "Movilidad 10" | Yoga/movilidad | 8 posturas × 3 respiraciones + 2 min Savasana | Todos |
| "Fuerza express" | Fuerza | 4 ejercicios × 2 rondas (40/20) | Principiante |

#### T2 — 20 min

| Clase | Arquetipo | Estructura | Para quién |
|---|---|---|---|
| "HIIT 20" | HIIT | 3 + 6 + 1 + 6 + 4 | Intermedio |
| "Fuerza 20" | Fuerza | 3 bloques × 2 rondas, 40/20 | Principiante-intermedio |
| "Zumba 20" | Dance | 5 + 10 + 5 | Todos |
| "Core 20" | Core | 3 + 6 + 6 + 5 | Todos |
| "Yoga 20" | Yoga | 2 + 3 + 9 + 4 + 2 | Principiante |

#### T3 — 30 min

| Clase | Arquetipo | Estructura | Para quién |
|---|---|---|---|
| "BodyPump 30" | Fuerza | 5 tracks: warm-up, squats, chest, back, core | Principiante |
| "Combat 30" | Combat | 5 tracks: warm-up, combat 1, power 1, muay thai, conditioning | Principiante |
| "Core 30" | Core | 4 + 7 + 7 + 7 + 5 | Todos |
| "Spin 30" | Spinning | 5 + 7 + 8 + 6 + 4 | Todos |
| "Zumba 30" | Dance | 5 + 8 + 12 + 5 | Todos |
| "Yoga 30" | Yoga | 3 + 4 + 5 + 10 + 5 + 3 | Principiante |

#### T4 — 45 min

| Clase | Arquetipo | Estructura | Para quién |
|---|---|---|---|
| "BodyPump 45" | Fuerza | 8 tracks (1,2,3,4,7,8,9,10) | Intermedio |
| "Combat 45" | Combat | 7 tracks + cooldown | Intermedio |
| "Spin 45" | Spinning | 7 + 10 + 12 + 8 + 8 | Intermedio |
| "Zumba 45" | Dance | 8 + 10 + 19 + 8 | Todos |
| "Yoga 45" | Yoga | 4 + 6 + 8 + 14 + 8 + 5 | Todos |
| "Funcional 45" | Fuerza metabólica | 5 secciones, 3 rondas | Intermedio |

#### T5 — 55–60 min

| Clase | Arquetipo | Estructura | Para quién |
|---|---|---|---|
| "BodyPump 55" | Fuerza | 10 tracks | Intermedio-avanzado |
| "Combat 55" | Combat | 9 tracks + cooldown | Intermedio-avanzado |
| "Zumba 60" | Dance | 9 + 11 + 30 + 10 | Todos |
| "Spin 60" | Spinning | 8 + 14 + 16 + 12 + 10 | Intermedio-avanzado |
| "Yoga 60" | Yoga | 5 + 7 + 10 + 18 + 12 + 8 | Todos |

### 5.4 Qué lanzar primero

Orden recomendado para el MVP:

1. **T1/T2 de core, movilidad y HIIT** (bajo costo de producción, alto valor
   percibido, terminables).
2. **T2/T3 de fuerza bodyweight** (aprovecha el motor y los detectores actuales).
3. **T2/T3 de Zumba/Combat** (la experiencia "clase" se siente; no requiere
   equipo).
4. **T3/T4 de BodyPump y Spinning** (más difíciles por equipo/espacio; dejar
   para cuando haya tracción).
5. **T5 insignia** solo cuando exista comunidad y usuarios recurrentes.

---

## 6. Por qué estas duraciones: evidencia de retención y adherencia

### 6.1 El problema

- Apps de salud y fitness: **3% de retención al día 30** (benchmark 2023).
- Activación: **26% al día 1 → 10% al día 28**.
- Suscripciones anuales: **33% de retención**.
- Análisis de supervivencia de 3.034 usuarios de una app de fitness: muchos
  abandonan en pocas semanas.

Conclusión: el enemigo no es la falta de contenido, es el abandono temprano.
Una clase de 45 min que no se termina es peor que una de 10 min que sí se
termina.

### 6.2 Sesiones cortas: evidencia directa

Ensayo aleatorizado en 56 mujeres sedentarias con obesidad, 20 semanas:

| Variable | Múltiples bouts de 10 min | Bouts largos | Diferencia |
|---|---:|---:|---|
| Días de ejercicio | 87,3 ± 29,5 | 69,1 ± 28,9 | P < 0,05 |
| Minutos/semana | 223,8 | 188,2 | P = 0,08 |
| VO2peak | Similar | Similar | — |
| Pérdida de peso | −8,9 kg | −6,4 kg | P < 0,07 |

Interpretación: repartir el ejercicio en bloques cortos aumentó la **adherencia**
y el volumen semanal, con resultados físicos comparables. Para WorkoutBot: las
clases de 10–20 min no son "menos serias"; son la puerta de entrada.

### 6.3 Demanda real: el inventario de Peloton

Inventario on-demand (julio 2019):

| Duración | Clases |
|---:|---:|
| 5 min | 27 |
| 10 min | 101 |
| 15 min | 338 |
| 20 min | 960 |
| 30 min | 1.340 |
| 45 min | 2.874 |
| 60 min | 138 |
| 75 min | 9 |

- Promedio: ~35,3 min.
- Moda: 45 min, seguida de 30 min.
- Un post de inventario de 2020 en Reddit reporta 30 min por delante de 45 min.

Lectura: la demanda se concentra en **30–45 min**, pero existe una cola larga de
5–20 min que sirve para días ocupados y para principiantes. La escalera de
duraciones captura ambos comportamientos.

### 6.4 Lo que hacen los programas de referencia

- BodyPump: 55/45/30; el 30-min conserva 5 tracks y elimina grupos accesorios.
- BodyCombat: 55/45/30; el 30-min conserva warm-up, combat 1, power 1, muay thai
  y conditioning.
- Zumba: 30 min es una versión reconocida; el manual permite 45 vs 60.
- Les Mills China: principiante 1–2 clases/semana, 4–5 tracks iniciales en
  BodyPump, máximo 2–3/semana con descanso.
- Keep y apps chinas: Tabata de 4 min, HIIT de 13–20 min, Zumba de 30 min sin
  saltos.

### 6.5 Cues y retención

Ensayo con 29 instructores de cycling y 246 miembros: entrenar a los instructores
en comunicación **motivacionalmente adaptativa** (autonomía, competencia,
relación) aumentó la satisfacción de necesidades y la intención de permanecer.
Para WorkoutBot: la voz no es decoración; es un factor de retención.

### 6.6 Síntesis para el catálogo

| Decisión | Evidencia |
|---|---|
| Tener 10–20 min como primera clase | RCT de bouts cortos; benchmarks de retención |
| Tener 30 min como estándar | Peloton; formatos express de Les Mills |
| Tener 45 min como experiencia | Demanda moda en Peloton; clase grupal completa |
| Tener 5 min como hábito | Cola larga de Peloton; apps chinas |
| No lanzar solo 55–60 min | Abandono temprano; principiante no lo termina |
| Invertir en voz/cues | RCT de instructores (permanencia); música reduce percepción de esfuerzo |

---

## 7. Implementación en WorkoutBot: qué cambia en el modelo de datos

No es código, es contrato de datos. Cada clase debería poder describirse con:

| Campo | Tipo | Ejemplo | Por qué |
|---|---|---|---|
| `arquetipo` | enum | `fuerza`, `hiit`, `dance`, `combat`, `core`, `movilidad`, `spinning` | Filtro y expectativa |
| `duracionMin` | int | 20 | Tier de catálogo |
| `nivel` | enum | `principiante`, `intermedio`, `avanzado` | Onboarding |
| `impacto` | enum | `bajo`, `medio`, `alto` | Seguridad y piso |
| `equipamiento` | array | `[]`, `["mochila"]` | Filtro realista |
| `bpmPorSeccion` | array | `[{seccion:"pico", bpm:140}]` | Música |
| `secciones` | array | calentamiento, bloques, calma | Motor actual |
| `trabajo` / `descanso` | int (s) | 40 / 20 | Timer |
| `rondas` | int | 3 | Timer |
| `cues` | array | `["3, 2, 1, cambio"]` | Voz |
| `modificaciones` | array | fácil / fuerte | Accesibilidad |
| `contraindicaciones` | array | `["dolor lumbar agudo"]` | Seguridad |

Recomendación de implementación:

1. **No duplicar clases por duración**: una clase de 30 min es una **selección**
   de tracks/secciones de la de 45/55, no un archivo distinto.
2. **Un campo `modo` por sección**: `tiempo`, `reps`, `hold`, `libre`.
3. **El timer debe permitir "terminar serie"** en core y fuerza isométrica.
4. **La voz debe tener variantes** por arquetipo (no el mismo tono para HIIT y
   yoga).
5. **El cierre debe registrar** clase terminada, duración real y percepción de
   esfuerzo (RPE 1–10).

---

## 8. Fuentes

### 8.1 Fuentes autoritativas en inglés (A/B)

| Tema | Fuente | URL |
|---|---|---|
| BodyPump: orden, formatos, reps | Nota oficial BODYPUMP 133 | https://szymonwesolowski.pl/wp-content/uploads/2025/06/BODYPUMP_133_BODYPUMP133ChoreographyNotes_row_en_app_print.pdf.pdf |
| BodyPump: formatos y duración | Les Mills | https://www.lesmills.com/workouts/bodypump |
| BodyPump: estudio | Olmedo et al., JONNPR | https://doi.org/10.19230/jonnpr.3661 |
| BodyPump: tracklists | Les Mills | https://www.lesmills.com/us/tracklist/bodypump |
| BodyCombat: orden y formatos | Nota oficial BODYCOMBAT 103 | https://lesmills.fun/wp-content/uploads/2025/06/bodycombat_103_bodycombat103choreographynotes_row_en_app_print_pdf11.pdf |
| BodyCombat: folleto | Les Mills | https://www.fdlymca.org/sft960/lmusbodycombatbrochure.pdf |
| Calorías Les Mills | Village Gym | https://www.villagegym.co.uk/blog/les-mills-fitness-class-calories-burned/ |
| Tabata: revisión | Gentil et al., MSSE | https://doi.org/10.1249/mss.0000000000001023 |
| HIIT: prescripción | ACSM | https://journals.lww.com/acsm-healthfitness/fulltext/2013/05000/high_intensity_interval_training__efficient,.3.aspx |
| Core: plancha | NASM | https://www.nasm.org/resource-center/exercise-library/plank |
| Core: circuito 45/15 | J2N Fitness | https://j2nfitness.vhx.tv/quick-core |
| Yoga: secuencia 60 min | Yoga Sequencing | https://www.yoga-sequencing.com/blog/how-to-sequence-a-60-minute-vinyasa-class |
| Yoga: presupuesto 60 min | Yoga Journaling | https://membership.yoga-journaling.com/create-yoga-sequence/60-minute-class/ |
| Yoga: duración y holds | U of Yoga | https://uofyoga.com/vinyasa-yoga/ |
| Spinning: clase muestra | IDEA | https://www.ideafit.com/sample-class-reaching-the-summit/ |
| Zumba: estructura y BPM | Dancewami | https://www.dancewami.com/view/the-best-zumba-songs-for-every-workout-phase-a-certified-instructor-s-playlist-guide-for-2024-2025.html |
| Zumba: manual | Zumba Basic Steps | https://pdfcoffee.com/download/basic2-manual-english-v4-pdf-free.html |
| Retención apps | Business of Apps | https://www.businessofapps.com/data/health-fitness-app-benchmarks/ |
| Abandono apps | mHealth | https://mhealth.amegroups.org/article/view/144969/html |
| Bouts cortos | PubMed 8963358 | https://pubmed.ncbi.nlm.nih.gov/8963358/ |
| Peloton inventario | Quora | https://www.quora.com/What-is-the-average-length-of-a-Peloton-class |
| Peloton 2020 | Reddit | https://www.reddit.com/r/pelotoncycle/comments/gzp965/ondemand_workout_library_inventory_counts/ |
| Cues y retención | Scandinavian J Med Sci Sports | https://doi.org/10.1111/sms.12713 |

### 8.2 Fuentes en chino (marcadas ZH)

| Tema | Fuente | URL | Qué aporta |
|---|---|---|---|
| BodyPump/Combat en China | Les Mills China | https://www.lesmills.com.cn/course/detail/36 | Formatos y consejos para principiantes |
| BodyCombat en China | Les Mills China | https://www.lesmills.com.cn/course/detail/37 | Formatos y consejos |
| HIIT grupal | TMT Post (Keep MIXT) | https://www.tmtpost.com/3213641.html | 12 ejercicios × 30 s; 40/20; 45–60 min |
| HIIT en casa | Sina | https://www.sina.cn/news/detail/4204838138431536.html | 20 min × 4 rondas; Tabata |
| Tabata casero | Xiaohongshu | https://www.xiaohongshu.com/user/profile/5f60b5d3000000000101c424 | "4分钟tabata" |
| Zumba 60 min | Baidu Baike | https://baike.baidu.com/item/%E5%B0%8A%E5%B7%B4/5314252 | Calentamiento 15 min, FC 90→140, 450 kcal |
| Zumba estructura | Goji Studios | https://gojistudios.com.hk/5700/ | 40–45 min principal, 1–2 canciones de calma |
| Zumba 30 min sin saltos | Bilibili | https://bilitube.cc/watch/BV1nisNzhEBS | 30 min, bajo impacto, ~300 kcal |
| Plancha: seguridad | 国家体育总局 | https://www.sport.gov.cn/n20001280/n20745751/n20767239/c21858758/content.html | 15 s × 2, 30 s × 3, 60 s × 3–4; descanso 30 s |
| Plancha: series | SmartWorkout | https://smartworkout.app/zh/%E5%81%A5%E8%BA%AB%E7%BB%83%E4%B9%A0%E5%BA%93/%E8%85%B9%E8%82%8C/%E5%B9%B3%E6%9D%BF%E6%94%AF%E6%92%91 | 2–4 series de 30–60 s; +5–10 s/semana |
| Yoga 60 min | TRFSZ | https://www.trfsz.com/newsview469166.html | 冥想 10 / 热身 10 / 体位 30 / 放松 10 |
| Spinning RPM/BPM | GagaRun | https://www.gagarun.com/zh/blog/spin-bike-rpm-bpm-music-guide | Tabla RPM↔BPM, 2:1 y 1:1 |

### 8.3 Fuente en japonés (JP)

| Tema | Fuente | URL | Qué aporta |
|---|---|---|---|
| BodyCombat BPM | App Tatsujin | https://app-tatsujin.com/les-mills-bodycombat-beginner-guide-2/ | 130–150 BPM; estructura de intervalos |

### 8.4 GitHub y herramientas abiertas

| Repo | Qué es | Licencia | Qué se puede reutilizar |
|---|---|---|---|
| https://github.com/insin/tabata_timer | Timer Tabata en Flutter, 31★ | Ver repo | Modelo de intervalos, presets 20/10 |
| https://github.com/LLarean/tabata-timer | Timer de intervalos en Unity, GPLv3 | GPLv3 | Lógica de trabajo/descanso/rondas |
| https://github.com/Snouzy/workout-cool | Plataforma open source de coaching + base de ejercicios, 8.632★ | MIT | Modelo de datos de ejercicios y clases; https://workout.cool |

Nota: el proyecto original de `workout-cool` fue vendido/abandonado por costos de
licencias de video. Para WorkoutBot, usar el **modelo de datos** y la base de
ejercicios, no el contenido audiovisual.

### 8.5 Benchmarks de producto

| Dato | Fuente |
|---|---|
| Retención día 30: 3% | Business of Apps |
| Activación 26% día 1 → 10% día 28 | Business of Apps |
| Suscripciones anuales: 33% retención | Business of Apps |
| Abandono en pocas semanas (3.034 usuarios) | mHealth |
| Bouts cortos vs largos (56 mujeres, 20 semanas) | PubMed 8963358 |
| Inventario Peloton (5–75 min) | Quora / Reddit |
| Cues y permanencia (29 instructores, 246 miembros) | DOI 10.1111/sms.12713 |

---

## 9. Límites y vacíos

1. **BPM de BodyPump**: Les Mills no publica BPM oficial por track. Los rangos
   son estimación de instructor (**C**), no estándar. Si se necesita precisión,
   medir las pistas con un analizador de tempo y registrar la fuente.
2. **BPM de BodyCombat**: el rango 130–150 viene de una guía japonesa, no de un
   documento oficial de Les Mills. Los valores por track son **C**.
3. **Core**: no hay un estándar único de trabajo/descanso. Las cifras 40/20,
   45/15 y 30/30 son prácticas de industria; la fuente más sólida es la
   progresión de volumen y la regla de "parar cuando la forma se rompe".
4. **Zumba**: la estructura por fases es de instructor certificado; el manual
   oficial es más cualitativo que numérico. Los BPM exactos provienen de
   canciones concretas y cambian por playlist.
5. **Yoga**: los holds de "3–5 respiraciones" son convención de estilo; no hay
   un estándar universal. La regla de Savasana 5–8 min sí es ampliamente
   compartida.
6. **Spinning**: la relación 2:1 y 1:1 es de Spinning®; otras marcas usan
   convenciones distintas. La fuente china es buena para la tabla, pero es
   secundaria.
7. **Colombia**: no encontré un benchmark local de retención o duración de
   clases. Las decisiones de catálogo son una extrapolación de benchmarks
   globales + contexto cultural (Zumba nació en Cali; vallenato/cumbia/reggaetón
   son familiares). Validar con datos propios en el MVP.
8. **Música**: ninguna de las fuentes autoriza usar sus pistas. El catálogo de
   WorkoutBot debe construirse con música licenciada o del usuario.

---

## 10. Conclusión

WorkoutBot no necesita "más ejercicios". Necesita **siete arquetipos bien
resueltos** y una **escalera de duraciones** que permita al usuario terminar algo
hoy:

- **5–10 min**: hábito y activación.
- **20 min**: sesión mínima real.
- **30 min**: estándar de producto.
- **45 min**: experiencia completa.
- **55–60 min**: insignia para usuarios recurrentes.

La evidencia de retención (3% al día 30) y de adherencia (bouts cortos aumentan
días de ejercicio) dice que la primera clase debe ser corta, clara y terminable.
La evidencia de producto (Peloton, Les Mills) dice que 30 y 45 min son el
corazón de la demanda cuando el usuario ya está enganchado. La evidencia de
instructores (SDT) dice que la voz y los cues son parte del producto, no un
adorno.

El orden de construcción recomendado es: **core, movilidad y HIIT cortos** →
**fuerza bodyweight** → **Zumba/Combat** → **BodyPump/Spinning** → **clases
insignia**. Cada clase debe declarar su arquetipo, duración, impacto, equipo,
BPM por sección, trabajo/descanso, rondas, cues y modificaciones. Sin esos datos,
no es una clase: es una lista de ejercicios con un temporizador.
