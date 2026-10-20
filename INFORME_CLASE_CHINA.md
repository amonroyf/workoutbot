# Prueba de concepto: clase completa en apps chinas y rediseño de `Funcional 45`

> Objetivo: entender cómo presentan y ejecutan una clase completa las apps chinas,
> y proponer una clase original para WorkoutBot compatible con el motor actual.
>
> Estado: investigación documental cerrada con fuentes públicas. El **P0 ya está
> implementado en código** (detalle por secciones, progreso segmentado, siguiente
> ejercicio, tutorial y voz de transiciones). No se copió contenido ni clases ajenas.

## 1. Fuentes y nivel de evidencia

| Fuente | Tipo | Evidencia usada | Uso en este informe |
|---|---|---|---|
| Keep (App Store China, `id952694580`; sitio `gotokeep.com` / `calorietech.com`) | App real, China | Catálogo de cursos, niveles `K1`–`K5`, minutos por clase, capturas oficiales, descripción de herramientas y planes | Estructura de biblioteca, tarjeta de clase, nivel/duración y UI general |
| PRD público de Keep (`zhuanlan.zhihu.com/p/686588002`, 2024) | Fuente secundaria | Página de entrenamiento: barra de progreso por grupos, tiempo, video del coach, orden/nombre de acción, tutorial, ajustes de voz/música, bloqueo, orientación, anterior/pausa/siguiente | UI de ejecución y controles |
| Fit (`id1102364578`, Shanghai Rhythm Network Technology Co., Ltd.) | App real, China | 1.200+ cursos, 800+ acciones, filtros por objetivo/parte/dificultad/equipo, captura con contador `5/20`, nombre de acción, botón `讲解`, barra de progreso, voz del coach, ajuste de dificultad, planes por calendario | Estructura de biblioteca, filtros, detalle de clase y control del ejercicio |
| `Kaiji-Z/workout-timer` (GitHub, MIT) | Repo abierto chino | Modelo `WorkoutPlan` con músculos, acciones ordenadas y series; máquina de estados `idle/exercising/resting/completed`; UI con plan `6 acciones / 20 series / ~30 min` y temporizador grande | Modelo de datos y estados de temporizador |

Regla de rigor: toda afirmación está marcada como **oficial/captura**, **secundaria (PRD)** o **repo/código**. Lo que no se pudo verificar no se propone como requisito.

## 2. Qué hace distinta a una clase completa china

No es una lista de 3 ejercicios. Es un producto de **descubrimiento → detalle → ejecución guiada → cierre**, con tres niveles de información: catálogo, clase y bloque.

### 2.1 Nivel catálogo: decidir sin abrumar

- Keep presenta `10.000+` cursos, con niveles `K1`–`K5` y minutos visibles en la tarjeta.
- Fit presenta `1.200+` cursos y `800+` acciones, con filtros por objetivo, parte del cuerpo, dificultad, equipo y duración.
- La tarjeta de clase responde de inmediato: **qué es, cuánto dura, para quién es y si necesito equipo**.
- El usuario no entra a una lista de bloques; entra a una promesa concreta.

### 2.2 Nivel clase: estructura antes de empezar

- Fit muestra el plan del día con clases numeradas, minutos, calorías y nivel (`10 min · 78 kcal · Intermedio`).
- Keep muestra bibliotecas de cursos y planes por semanas, con clases separadas por objetivo y momento.
- El detalle de clase permite revisar el recorrido antes de comprometerse.

### 2.3 Nivel ejecución: guía, no solo reloj

Patrones repetidos:

1. **Progreso segmentado**: no una barra continua, sino una barra dividida por grupos de acciones o por secciones.
2. **Acción actual + siguiente**: el usuario sabe qué hacer ahora y qué sigue.
3. **Tiempo grande y legible**: el temporizador es el centro, no un número pequeño.
4. **Tutorial sin salir de la clase**: ver puntos clave, errores comunes y detalles de la acción.
5. **Voz y música**: voz del coach, avisos de respiración, conteo, ánimo; música opcional configurable.
6. **Control de pantalla**: pausa, anterior, siguiente, bloqueo y orientación.
7. **Rondas y descansos explícitos**: el usuario sabe en qué ronda va y cuánto descansa.
8. **Cierre**: resumen de lo realizado y registro de la sesión.

### 2.4 Lo que NO se copia

- No se copian clases, secuencias, videos, textos de coach ni marcas.
- No se copian métricas vacías: el panel debe mostrar lo que sirve para decidir.
- No se copia el catálogo gigante: la clase completa debe tener un recorrido claro y corto.

## 3. Síntesis: anatomía de una clase completa

Una clase completa puede modelarse como:

```
Clase
 ├─ metadatos: id, nombre, nivel, duración, equipamiento, objetivo
 ├─ secciones
 │   ├─ metadatos: id, nombre, tipo, rondas, descanso entre rondas
 │   └─ bloques: ejercicio, trabajo, descanso, intensidad, pista de voz
 └─ compilación
     └─ bloques planos con sección, ronda, total de rondas
```

La clase se ejecuta con un motor genérico. La UI cambia según la sección y la ronda; la voz anuncia transiciones; el temporizador mantiene trabajo/descanso por bloque y descanso entre rondas.

### Estados mínimos del temporizador

Inspirado en `Kaiji-Z/workout-timer` y en las apps:

- `idle`: clase lista para empezar.
- `exercising`: bloque en trabajo.
- `resting`: descanso entre bloques o rondas.
- `paused`: pausa manual.
- `section-break`: cambio de sección.
- `completed`: clase terminada, resumen.

### Pistas de voz recomendadas

- Inicio de sección: nombre y duración.
- Inicio de ronda: número de ronda y total.
- A mitad de bloque: “mitad” o “respira”.
- Cambio de ejercicio: nombre de la siguiente acción.
- Descanso: “descansa X segundos”.
- Últimos segundos: “3, 2, 1”.
- Cierre: “vuelta a la calma” y “clase terminada”.

## 4. Clase original propuesta: `Funcional 45`

Diseño original para WorkoutBot, nivel intermedio, sin equipamiento, 45 minutos exactos. No reproduce una clase ajena; usa patrones comunes de estructura y guía.

### 4.1 Metadatos

| Campo | Valor |
|---|---|
| id | `funcional-45` |
| nombre | Funcional 45 |
| nivel | intermedio |
| objetivo | funcional |
| duración | 45 min (2700 s) |
| equipamiento | ninguno |
| formato | completa |

### 4.2 Estructura por secciones

| Sección | Tipo | Duración | Rondas | Rol |
|---|---|---:|---:|---|
| Calentamiento | calentamiento | 8 min | 1 | subir pulso, movilidad, activación |
| Fuerza | principal | 14 min | 3 | piernas, empuje, glúteo y estabilidad |
| Metabólico | principal | 11 min | 3 | capacidad aeróbica, técnica ante fatiga |
| Core y control | principal | 5 min | 1 | estabilidad y control |
| Vuelta a la calma | enfriamiento | 7 min | 1 | bajar pulso y estirar |

Total: `8 + 14 + 11 + 5 + 7 = 45 min`.

### 4.3 JSON compatible con WorkoutBot

Este es el esquema actual de `secciones` con `rondas`, `descansoRonda` y `bloques`; el motor lo compila a bloques planos y calcula la duración.

```json
{
  "id": "funcional-45",
  "nombre": "Funcional 45",
  "descripcion": "Clase completa de 45 minutos: calentamiento, fuerza, metabólico, core y vuelta a la calma.",
  "nivel": "intermedio",
  "tipo": "funcional",
  "formato": "completa",
  "duracionMin": 45,
  "equipamiento": "ninguno",
  "secciones": [
    {
      "id": "calentamiento",
      "nombre": "Calentamiento",
      "tipo": "calentamiento",
      "rondas": 1,
      "descansoRonda": 0,
      "pistaVoz": "Calentamiento, ocho minutos. Vamos a preparar el cuerpo.",
      "bloques": [
        { "ejercicio": "MARCHA", "trabajo": 120, "descanso": 0, "intensidad": "suave", "pistaVoz": "Empezamos suave, camina en el lugar y suelta los hombros." },
        { "ejercicio": "SENTADILLAS", "trabajo": 60, "descanso": 15, "intensidad": "suave", "pistaVoz": "Sentadillas sin peso, baja hasta donde estés cómodo." },
        { "ejercicio": "ZANCADAS", "trabajo": 60, "descanso": 15, "intensidad": "suave", "pistaVoz": "Zancadas alternas, paso corto y controlado." },
        { "ejercicio": "BIRD_DOG", "trabajo": 60, "descanso": 0, "intensidad": "suave", "pistaVoz": "Bird dog para activar core y espalda." },
        { "ejercicio": "RODILLAS_ALTAS", "trabajo": 60, "descanso": 0, "intensidad": "suave", "pistaVoz": "Rodillas altas suave, sin saltar." },
        { "ejercicio": "MARCHA", "trabajo": 90, "descanso": 0, "intensidad": "suave", "pistaVoz": "Últimos segundos de calentamiento, respira." }
      ]
    },
    {
      "id": "fuerza",
      "nombre": "Fuerza",
      "tipo": "principal",
      "rondas": 3,
      "descansoRonda": 60,
      "pistaVoz": "Bloque de fuerza, tres rondas.",
      "bloques": [
        { "ejercicio": "SENTADILLAS", "trabajo": 40, "descanso": 20, "intensidad": "media", "pistaVoz": "Sentadilla, cadera atrás y pecho arriba." },
        { "ejercicio": "FLEXIONES", "trabajo": 40, "descanso": 20, "intensidad": "media", "pistaVoz": "Flexión, cuerpo en plancha y codos a cuarenta y cinco grados." },
        { "ejercicio": "ZANCADAS", "trabajo": 40, "descanso": 20, "intensidad": "media", "pistaVoz": "Zancada, baja la rodilla de atrás con control." },
        { "ejercicio": "PUENTE_GLUTEO", "trabajo": 40, "descanso": 60, "intensidad": "media", "pistaVoz": "Puente, empuja con los talones y aprieta los glúteos." }
      ]
    },
    {
      "id": "metabolico",
      "nombre": "Metabólico",
      "tipo": "principal",
      "rondas": 3,
      "descansoRonda": 40,
      "pistaVoz": "Bloque metabólico, tres rondas. Mantén la técnica.",
      "bloques": [
        { "ejercicio": "JUMPING_JACKS", "trabajo": 30, "descanso": 20, "intensidad": "alta", "pistaVoz": "Jumping jacks, abre brazos y piernas al mismo tiempo." },
        { "ejercicio": "MOUNTAIN_CLIMBER", "trabajo": 30, "descanso": 20, "intensidad": "alta", "pistaVoz": "Mountain climber, rodillas al pecho y cadera baja." },
        { "ejercicio": "RODILLAS_ALTAS", "trabajo": 30, "descanso": 20, "intensidad": "alta", "pistaVoz": "Rodillas altas, ritmo fuerte pero controlado." },
        { "ejercicio": "PLANCHA", "trabajo": 30, "descanso": 40, "intensidad": "media", "pistaVoz": "Plancha, cuerpo en línea y abdomen firme." }
      ]
    },
    {
      "id": "core",
      "nombre": "Core y control",
      "tipo": "principal",
      "rondas": 1,
      "descansoRonda": 0,
      "pistaVoz": "Bloque de core y control. Calidad antes que velocidad.",
      "bloques": [
        { "ejercicio": "DEAD_BUG", "trabajo": 45, "descanso": 15, "intensidad": "media", "pistaVoz": "Dead bug, espalda pegada al piso." },
        { "ejercicio": "HOLLOW_HOLD", "trabajo": 30, "descanso": 15, "intensidad": "media", "pistaVoz": "Hollow hold, lumbar pegada y respira." },
        { "ejercicio": "BIRD_DOG", "trabajo": 45, "descanso": 15, "intensidad": "media", "pistaVoz": "Bird dog, estira brazo y pierna opuestos." },
        { "ejercicio": "PLANCHA_LATERAL", "trabajo": 30, "descanso": 15, "intensidad": "media", "pistaVoz": "Plancha lateral, cadera arriba y cuerpo alineado." },
        { "ejercicio": "SUPERMAN", "trabajo": 30, "descanso": 30, "intensidad": "media", "pistaVoz": "Superman, levanta brazos y piernas sin forzar el cuello." },
        { "ejercicio": "PLANCHA", "trabajo": 30, "descanso": 0, "intensidad": "media", "pistaVoz": "Plancha final, aguanta y respira." }
      ]
    },
    {
      "id": "enfriamiento",
      "nombre": "Vuelta a la calma",
      "tipo": "enfriamiento",
      "rondas": 1,
      "descansoRonda": 0,
      "pistaVoz": "Vuelta a la calma. Baja el pulso y estira.",
      "bloques": [
        { "ejercicio": "MARCHA_SUAVE", "trabajo": 120, "descanso": 0, "intensidad": "suave", "pistaVoz": "Bajamos el ritmo, camina suave y respira." },
        { "ejercicio": "ESTIRAMIENTO_GENERAL", "trabajo": 300, "descanso": 0, "intensidad": "suave", "pistaVoz": "Estiramiento general, sin rebotar, sostén cada posición." }
      ]
    }
  ]
}
```

Verificación de duración por sección:

- Calentamiento: `120 + (60+15) + (60+15) + 60 + 60 + 90 = 480 s`.
- Fuerza: `3 × (40+20 + 40+20 + 40+20 + 40+60) = 840 s`.
- Metabólico: `3 × (30+20 + 30+20 + 30+20 + 30+40) = 660 s`.
- Core: `(45+15) + (30+15) + (45+15) + (30+15) + (30+30) + 30 = 300 s`.
- Vuelta a la calma: `120 + 300 = 420 s`.

Total: `480 + 840 + 660 + 300 + 420 = 2700 s = 45 min`.

## 5. Wireframes textuales

### 5.1 Selector de clase

```text
┌──────────────────────────────────────────────┐
│ Funcional 45                                  │
│ Intermedio · 45 min · Sin equipo             │
│ 5 secciones · 38 bloques                     │
│                                               │
│ [Calentamiento] [Fuerza] [Metabólico] ...    │
│                                               │
│ [ Empezar clase ]                             │
└──────────────────────────────────────────────┘
```

### 5.2 Detalle previo

```text
┌──────────────────────────────────────────────┐
│ Funcional 45                                  │
│ Intermedio · 45 min · Sin equipo             │
│                                               │
│ Calentamiento 8 min                           │
│   Marcha, sentadillas suaves, zancadas...    │
│ Fuerza 14 min · 3 rondas                      │
│   Sentadillas, flexiones, zancadas, puente   │
│ Metabólico 11 min · 3 rondas                 │
│   Jumping jacks, mountain climber...          │
│ Core 5 min · 1 ronda                          │
│ Vuelta a la calma 7 min                       │
│                                               │
│ [ Volver ]                 [ Empezar ]        │
└──────────────────────────────────────────────┘
```

### 5.3 Pantalla de ejecución

```text
┌──────────────────────────────────────────────┐
│ Calentamiento ▓▓▓░░░░░░░░  02:14 / 08:00     │
│                                               │
│               00:40                           │
│        ┌─────────────────────┐               │
│        │                     │               │
│        │   Sentadillas       │               │
│        │   [ demo stick ]    │               │
│        │                     │               │
│        └─────────────────────┘               │
│ Siguiente: Zancadas                           │
│                                               │
│ [ Anterior ]   [ Pausa ]   [ Siguiente ]     │
│ [ Voz ] [ Música ] [ Bloqueo ] [ Tutorial ] │
└──────────────────────────────────────────────┘
```

### 5.4 Línea de tiempo por bloque

```text
[trabajo 40s][descanso 20s][trabajo 40s][descanso 20s] ... [descanso ronda 60s]
     ▲                              ▲
     │                              └─ anuncio: "descansa 60 segundos"
     └─ anuncio: "sentadillas, cadera atrás"
```

### 5.5 Flujo completo

```text
Selector de clase
    │
    ▼
Detalle de clase (secciones, rondas, duración)
    │
    ▼
Ejecución
    │
    ├─ cambio de sección → voz
    ├─ cambio de ronda   → voz
    ├─ cambio de bloque  → voz
    ├─ mitad de bloque   → voz
    └─ últimos segundos  → cuenta regresiva
    │
    ▼
Resumen (duración, bloques, reps/tiempo)
```

## 6. Recomendaciones priorizadas

### P0 — cerrar la experiencia de clase completa

1. **Progreso segmentado por secciones** en la pantalla de ejecución. Debe verse en qué sección está y cuántas faltan. Evidencia: Keep (barra por grupos) y Fit (contador y barra).
2. **Acción siguiente visible**. Reduce la carga cognitiva y mantiene el ritmo. Evidencia: PRD de Keep y UI de Fit.
3. **Voz en transiciones**: sección, ronda, mitad, descanso, últimos segundos y cierre. Evidencia: Keep (voz), Fit (voz del coach), Kaiji (mensajes de estado).
4. **Descanso entre rondas explícito**, con cuenta regresiva y aviso de la siguiente ronda. Evidencia: Kaiji y lógica de clases por rondas.
5. **Tutorial accesible sin perder la clase**: puntos clave y errores comunes. Evidencia: Keep (botón de tutorial en el PRD).
6. **Pantalla de detalle antes de empezar**: secciones, rondas, duración total y equipamiento. Evidencia: Fit y Keep.

### P1 — mejorar la sensación de clase guiada

7. **Tarjeta de clase con nivel, minutos, calorías aproximadas y equipo**. Evidencia: Fit y Keep.
8. **Ajuste de intensidad por clase** (suave / normal / fuerte) cambiando tiempos o variantes sin romper la estructura. Evidencia: Fit (dificultad durante el entrenamiento).
9. **Modo bloqueo y orientación**. Evidencia: PRD de Keep.
10. **Música configurable** y volumen de voz independiente. Evidencia: Keep (ajustes de música y voz).
11. **Mensaje de mitad de clase** con progreso y ánimo. Evidencia: patrón de coach en Fit/Keep.
12. **Resumen post-clase** con lo completado y comparación con la sesión anterior. Evidencia: Fit y Kaiji.

### P2 — crecer el producto sin perder foco

13. **Plan semanal** que asigne clases completas y exprés por día. Evidencia: Kaiji (calendario) y Keep (planes).
14. **Plan adaptativo** por objetivo, tiempo disponible y equipo. Evidencia: Keep y Fit.
15. **Registro local** de sesiones y progreso. Evidencia: Kaiji (local-only).
16. **Compartir resumen** en WhatsApp/Instagram. No es clase, pero cierra el ciclo de adherencia.

## 7. Verificación propuesta

- [ ] La clase dura exactamente 2700 s según `compilarClase()`.
- [ ] La UI muestra sección actual, ronda, acción actual y siguiente acción.
- [ ] La voz anuncia sección, ronda, mitad, descanso y cierre.
- [ ] El progreso segmentado refleja las 5 secciones.
- [ ] El tutorial abre y cierra sin salir de la clase.
- [ ] El resumen muestra duración, bloques completados y reps/tiempo.
- [ ] Pruebas manuales en móvil: bloqueo, pausa, anterior, siguiente, cambio de orientación.
- [ ] Prueba de accesibilidad: tamaño de toque, contraste y voz comprensible.

## 8. Límites de esta prueba de concepto

- No se instalaron apps chinas ni se accedió a sesiones privadas.
- La UI de ejecución de Keep se tomó de un PRD público; puede no reflejar la versión actual.
- Fit es una app real, pero sus capturas son de una versión anterior.
- `Kaiji-Z/workout-timer` es un temporizador/planificador, no una clase guiada por video; sirve como referencia de modelo de datos y estados, no de contenido.
- La investigación no implementó cambios por sí sola; el P0 se implementó después en `frontend/src`.

## 9. Conclusión

Las apps chinas no compiten por tener más ejercicios; compiten por **cuán claro es el recorrido**. La clase completa china combina: biblioteca filtrable, tarjeta de clase con promesa clara, detalle por secciones, ejecución guiada por voz y video/demo, progreso segmentado, tutorial sin fricción y cierre con resumen.

WorkoutBot ya tiene el esqueleto: catálogo, motor de bloques, secciones, rondas y voz. El rediseño propuesto se concentra en **hacer visible el recorrido** (sección, ronda, siguiente acción, progreso segmentado) y en **cerrar el ciclo** (detalle previo y resumen), sin copiar contenido ni depender de video.
