# Varias clases y biblioteca de ejercicios

> Cómo pasar de un circuito fijo a una biblioteca de clases y ejercicios,
> qué librerías open source existen y cómo lo resuelven las apps chinas.

---

## 1. Respuesta corta

> **Estado actual:** Fases 1 y 2 implementadas. El motor interpreta clases como
> datos (`engine/clases.js`), hay **9 clases** y **8 ejercicios** en el catálogo
> (`engine/ejercicios.js`), con **5 detectores nuevos** (zancada, plancha,
> rodillas altas, puente de glúteo y abdominal) y demos stick figure. La plancha
> se sigue por tiempo. **Plan semanal local** implementado (días, objetivo y
> rotación de clases). Falta ampliar movilidad, mountain climber/burpee, el
> catálogo remoto y la asignación por entrenador.

Sí existen librerías: hay datasets de **800 a 1,324 ejercicios** con JSON,
instrucciones en español y animaciones/GIFs. Las apps chinas no programan cada
clase: tienen una **biblioteca de acciones** (动作库), una **biblioteca de
clases** (课程库) y un **motor que interpreta la clase como datos**. La clase se
compone con ejercicios, tiempos, descansos y rondas; la app solo ejecuta ese
guion y muestra la demo.

Para WorkoutBot la ruta es:

1. Convertir la clase en **datos** (JSON), no en código.
2. Tener un **catálogo de ejercicios** con metadatos.
3. Tener un **motor genérico** que ejecute cualquier clase.
4. Ampliar ejercicios en 3 niveles: detector, seguimiento por tiempo y registro
   manual.
5. Usar una librería open source para demos e instrucciones, con licencia clara.

---

## 2. Modelo: la clase es datos, no código

Hoy `circuito.js` tiene los 3 ejercicios fijos. La cambio conceptualmente por:

```json
{
  "id": "fuerza-total",
  "nombre": "Fuerza total",
  "nivel": "principiante",
  "objetivo": "fuerza",
  "duracionMin": 12,
  "equipamiento": "ninguno",
  "bloques": [
    { "ejercicio": "SENTADILLA", "trabajo": 40, "descanso": 20 },
    { "ejercicio": "FLEXION", "trabajo": 40, "descanso": 20 },
    { "ejercicio": "ZANCADA", "trabajo": 40, "descanso": 20 },
    { "ejercicio": "PUENTE_GLUTEO", "trabajo": 40, "descanso": 20 },
    { "ejercicio": "PLANCHA", "trabajo": 30, "descanso": 0 }
  ]
}
```

Y cada ejercicio en el catálogo:

```json
{
  "id": "SENTADILLA",
  "nombre": "Sentadilla",
  "grupo": "piernas",
  "nivel": "principiante",
  "equipamiento": "ninguno",
  "vista": "perfil",
  "detector": "sentadilla",
  "demo": "stick",
  "pistas": ["Pies al ancho de hombros", "Cadera atrás", "Rodillas hacia afuera"],
  "contraindicaciones": []
}
```

Ventajas:

- Crear una clase nueva es escribir JSON, no tocar el motor.
- Se pueden generar clases por objetivo, nivel, tiempo y equipamiento.
- El mismo ejercicio sirve en muchas clases.
- Se puede asignar un plan semanal a cada cliente.
- Se puede medir qué clase terminan y cuál abandonan.

### Cambios en el código actual

- `engine/ejercicios.js`: catálogo de ejercicios.
- `engine/clases.js`: plantillas de clases.
- `engine/circuito.js`: `crearCircuito(clase)` en vez de `EJERCICIOS` fijo.
- `store/workoutStore.js`: `claseActual`, `iniciarClase(claseId)`.
- `components/SelectorClases.jsx`: lista de clases por nivel/objetivo/tiempo.
- `components/WorkoutUI.jsx`: ya funciona con cualquier clase si el motor es
  genérico.
- `engine/generador.js` (fase 2): arma una clase según objetivo, tiempo y nivel.

---

## 3. Tipos de clase que puede interpretar el mismo motor

- **Circuito**: trabajo + descanso, rondas.
- **Intervalos / HIIT**: 40/20, 30/15, 20/10.
- **Tabata**: 20/10 × 8.
- **AMRAP**: tantas rondas como pueda en X minutos.
- **EMOM**: cada minuto empieza un bloque.
- **Escalera**: 10, 8, 6, 4, 2 repeticiones.
- **Seguir el video**: sin conteo, solo tiempo y demo.
- **Movilidad / estiramiento**: solo tiempo, sin detector.
- **Plan semanal**: lunes fuerza, miércoles cardio, viernes core.

---

## 4. Cómo ampliar ejercicios sin programar un detector por cada uno

### Nivel A — Con detector (reps automáticas)
Familias reutilizables con parámetros:

| Familia | Ejercicios que cubre |
|---|---|
| Sentadilla | sentadilla, sumo, búlgara, a silla |
| Flexión | flexión, inclinada, en pared, diamante |
| Jumping jack | jumping jack, jacks parciales |
| Zancada | zancada frontal, lateral, inversa |
| Plancha | plancha, plancha lateral, con rodillas |
| Rodillas altas | rodillas altas, marcha rápida |
| Puente glúteo | puente, puente a una pierna |
| Abdominal | crunch, sit-up, dead bug |

### Nivel B — Seguimiento por tiempo (sin detector)
La app muestra demo, voz y temporizador; el usuario sigue. Sirve para movilidad,
estiramientos, burpees, mountain climbers y ejercicios nuevos mientras se
construye el detector. **No se inventan reps**: se mide tiempo y se registra la
sesión.

### Nivel C — Registro manual
Para gym: el usuario anota peso y reps. No requiere cámara.

Así se puede lanzar una biblioteca grande sin tener 300 detectores.

---

## 5. Librerías y datasets open source

| Repo | Contenido | Idiomas | Licencia | Nota |
|---|---|---|---|---|
| `yuhonas/free-exercise-db` | 800+ ejercicios, JSON, 2 imágenes por ejercicio | EN | **Unlicense (dominio público)** | La opción más segura para producción |
| `hasaneyldrm/exercises-dataset` | 1,324 ejercicios con **GIF animado**, thumbnail, músculos y pasos | 10, incluye **ES y ZH** | MIT en datos; **media © Gym visual** | Verificar licencia de la media antes de publicar |
| `RepDB/exercise-dataset` | 650 ejercicios, WebP 512px, start/peak, MET, tags | EN/DE/**ES** | Free tier comercial **con atribución**, sin redistribuir | Ilustraciones consistentes; animaciones son de pago |
| `wger-project/wger` | App autoalojable, API REST, rutinas y wiki de ejercicios | Multi | Código AGPL; datos CC | Buena referencia de modelo de datos y API |
| `mohamedatef90/exercise-library` | 1,112 ejercicios con GIF | EN | Verificar licencia | CDN de GIFs |
| `longhaul-fitness/exercises` | Fuerza y cardio en JSON | EN | MIT | Simple y limpio |
| `bryllim/workout-guide` | 302 ejercicios, 3 ilustraciones por ejercicio | EN | CC BY-SA 4.0 | Requiere atribución y compartir igual |
| `AssiamahS/opengym3d` | Librería de animación 3D de ejercicios (Blender → glb → Three.js) | — | MIT | Para fase 3D |
| `1c7/Fitness` | Enlaces a videos de técnica (Bilibili/Douyin) | ZH | Contenido de terceros | Referencia, no para copiar |

### Recomendación de licencia

1. **Producción segura:** `free-exercise-db` (dominio público) + pistas propias
   en español + stick figures para animar.
2. **Si se quieren GIFs:** usar `hasaneyldrm` solo si se aclara la licencia de
   Gym visual; si no, licenciar la media o producirla.
3. **Si se quieren ilustraciones consistentes:** RepDB free con atribución
   visible; animaciones de pago.
4. **Evitar** scraping de Keep/开练/ExerciseDB sin licencia.

---

## 6. Repos chinos encontrados

| Repo | Qué tiene |
|---|---|
| `Mrzzchao/exercises-dataset` | 1,324 ejercicios, 6 idiomas incluyendo chino, buscador online, JSON |
| `marcomarcogd/exercises-dataset-zh-cn` | Traducción completa al chino del dataset de 1,324 |
| `wangmuerxiao/exercises-dataset-zh` | Versión china con metadata y media 180×180 (MIT) |
| `hasaneyldrm/exercises-dataset` | 1,324 GIFs, incluye español y chino (datos MIT; media Gym visual) |
| `PaddlePaddle/PaddleDetection` | **PP-TinyPose**, pose estimation móvil (Apache-2.0) |
| `zhiboniu/pose_demo_android` | Demo Android de pose con Paddle |
| `zhaoolee/sport` | Contador de sentadillas web con acelerómetro |
| `2331k/fitness_mini_programe` | Mini programa WeChat: plan, análisis de movimiento, reporte |
| `Kaiji-Z/workout-timer` | Flutter MIT: 870+ acciones (free-exercise-db CC0), calendario, stats y AI por prompt |
| `KiShao-cn/FitTrack` | Registro de entrenos, recordatorios 20:00, posters |
| `vivalaci/xun-ji` | Entreno local-first, cola de reintentos, PRs |
| `Mocha-L/Fitness_wxApp` | Mini programa de reserva de clases (Apache-2.0) |
| `evangui/multi-fitness-console` | SaaS de gimnasios multi-sede (Java) |
| `MiloTnT/gym-management-system` | Gestión de gimnasio (MIT) |
| Gitee `kaiji1126/free-exercise-db` | Espejo chino de free-exercise-db |
| Gitee `love-xx/fitness`, `semefly/bodybuilding`, `a369312278/LightTrack` | Apps/mini programas de fitness |

Conclusión: los repos chinos fuertes están en **datos y pose estimation**; los
de contenido puro suelen ser enlaces a videos o datasets traducidos. No hay un
"Keep open source" con su biblioteca completa.

---

## 7. Cómo lo hacen las apps chinas

### Keep
- Biblioteca de **acciones + cursos + métricas corporales**.
- **Demos 3D** en la app y planes personalizados por objetivo, nivel y equipo.
- Modelo propio **Keepace.ai** y un agente de cursos que genera planes.
- A mediados de 2026 reportaron **más de 8,000 cursos creados con AIGC** en el
  semestre, con revisión humana (75% de aprobación) y más de 30,000 sesiones.
- Voz en vivo para running, medallas, comunidad y hardware.

### 开练 (Kai Lian)
- **300+动作库**: gimnasio, mancuernas y peso corporal; permite acciones
  personalizadas.
- **3D演示 + 语音讲解** para cada acción.
- **跟练模式** (seguir la clase) y **记录模式** (registrar).
- Planes por parte del cuerpo y base de alimentos.

### FITURE
- Espejo con **Motion Engine**: feedback de forma en vivo, conteo de reps,
  control por gestos, rankings y privacidad (no almacena imágenes).

### 悦动圈 y 咕咚
- Gamificación: pasos, monedas, medallas, mapas, retos de grupo y eventos.
- La parte de dinero/sobres rojos no es replicable tal cual en Colombia por
  regulación; la mecánica de retos y rachas sí.

### Patrón común
```
动作库 (ejercicios) + 课程库 (clases) + 计划引擎 (plan)
+ 演示 (3D/video) + 跟练 (follow-along) + 反馈 (IA/detector)
+ 社交/juego (rachas, medallas, retos)
```

---

## 8. Ruta propuesta para WorkoutBot

### Fase 1 — Biblioteca mínima (sin nuevos detectores)
- Catálogo de ejercicios con metadata y pistas en español.
- Motor genérico de clases.
- Selector con 3 clases usando los 3 ejercicios actuales en distinto orden,
  tiempos y rondas.
- Modo "seguir por tiempo" para ejercicios sin detector.
- Demo: stick figure para los actuales y **GIF/imagen** para los nuevos.

### Fase 2 — Primeras clases nuevas (implementada)
6 clases de peso corporal agregadas al selector, 4-5 bloques cada una:

1. **Fuerza total**: sentadilla, flexión, zancada, puente glúteo, plancha.
2. **Cardio express**: jumping jack, rodillas altas, zancada, jumping jack,
   flexión.
3. **Core**: plancha, abdominal, puente de glúteo, plancha.
4. **Piernas y glúteos**: sentadilla, zancada, puente, sentadilla.
5. **Tren superior**: flexión, plancha, flexión, plancha.
6. **Principiante**: sentadilla, flexión, puente, plancha.

Detectores nuevos implementados: **zancada, plancha (tiempo), rodillas altas,
puente de glúteo y abdominal**. Pendientes para una siguiente iteración:
mountain climber, burpee, dead bug, movilidad y variantes con silla/pared.

### Fase 3 — Para clientes
- Generador de clase por objetivo, tiempo, nivel y equipamiento.
- Plan semanal por días y objetivo (implementado en inicio; hoy es local, no asignable por entrenador).
- Progreso por clase: terminadas, abandonadas, reps, perfectas, racha.
- Catálogo remoto (Firestore o JSON en Hosting) para actualizar sin recompilar.
- Backend: `GET /exercises`, `GET /classes`, `GET /plan`, `POST /session`.

### Fase 4 — Diferenciación
- Más detectores o modelo de pose propio (PP-TinyPose).
- Avatar 3D o Lottie.
- Recomendación con IA y ajuste por fatiga.
- Retos y medallas.

---

## 9. Riesgos y decisiones

- **Licencias de media**: es el punto más delicado. Empezar con
  `free-exercise-db` (dominio público) evita problemas.
- **Calidad de detección**: no prometer 100% de exactitud; usar "rep válida" y
  "seguir por tiempo" como fallback.
- **Exceso de contenido**: mejor 6 clases bien hechas que 200 ejercicios sin
  demo ni voz.
- **Cámara**: los ejercicios de suelo y perfil son más difíciles; para esos,
  priorizar seguimiento por tiempo o registro manual.
- **Costos**: GIFs pesan; usar WebP/AVIF, miniaturas y cargar solo la demo
  visible.

---

## 10. Recomendación

Las fases 1 y 2 ya están implementadas: motor genérico, catálogo, selector de 9
clases, 5 detectores nuevos y demo stick figure en la esquina. El siguiente paso
es medir uso real y luego agregar movilidad, mountain climber/burpee y catálogo
remoto.

La biblioteca de datos recomendada para el MVP es `free-exercise-db` por
licencia, y `hasaneyldrm/exercises-dataset` solo como referencia visual hasta
aclarar la licencia de su media.
