# Evaluación de Código — Mecánica del Juego (WorkoutBot)

Fecha: 2026-10-19
Alcance: frontend (`frontend/src`)
Método: revisión estática + tests unitarios (Vitest)

---

## 1. Resumen ejecutivo

Se auditaron las mecánicas principales: **timer/fases**, **detección de los
ejercicios** y **scoring**. Se encontraron 13 hallazgos relevantes, de los
cuales **2 críticos** afectaban directamente la mecánica (repeticiones perdidas
o falsas) y **3 altos** comprometían confiabilidad del timer, la cámara y la
detección.

Todos los hallazgos fueron corregidos y cubiertos con tests unitarios. La suite
actual tiene **150 tests de frontend (13 archivos, 100% en verde)** y **5 tests
de backend (Go)**. El build de producción compila correctamente.

---

## 2. Hallazgos y correcciones

Severidad: Crítico (rompe la mecánica) · Alto · Medio · Bajo · Info.

### 2.1 Estado de detección compartido entre ejercicios — CRÍTICO

- **Dónde:** `hooks/useMediaPipe.js` (`estadoEjercicio`)
- **Problema:** el estado `ARRIBA/ABAJO` era un único `ref` compartido por los
  tres ejercicios. Al cambiar de ejercicio (p. ej. sentadillas → flexiones),
  el estado del ejercicio anterior se heredaba. Resultado: repeticiones perdidas
  o contadas de inmediato (falso positivo).
- **Impacto:** el marcador no reflejaba el esfuerzo real.
- **Corrección:** se rastrea el ejercicio en curso (`ejercicioEnCurso`) y se
  reinicia el estado a `ARRIBA` al detectar un cambio de ejercicio y al salir de
  la fase `TRABAJO`.

### 2.2 Sin verificación de visibilidad antes de contar — ALTO

- **Dónde:** `hooks/useMediaPipe.js` (detectores)
- **Problema:** los detectores calculaban ángulos aunque un landmark estuviera
  ocluido o fuera de cuadro. Un `visibility` bajo produce coordenadas basura.
- **Impacto:** repeticiones falsas.
- **Corrección:** helper `esVisible()` con umbral 0.5; los detectores ignoran
  frames con landmarks clave poco visibles.

### 2.3 Timer por conteo de ticks (drift) — ALTO

- **Dónde:** `store/workoutStore.js`
- **Problema:** el temporizador decrementaba un contador dentro de
  `setInterval` cada 1000 ms. Los timers del navegador se retrasan y se
  throttlean en segundo plano, acumulando deriva; además la lógica de
  transición estaba embebida y difícil de testear.
- **Impacto:** duración de fases inexacta y no determinista.
- **Corrección:** el tiempo se calcula contra un timestamp real (`finFaseEn`) y
  se actualiza cada 250 ms con `avanzarCircuito()` (función pura). La duración
  de cada fase es exacta independientemente del drift.

### 2.4 Stream de cámara sin liberar — ALTO

- **Dónde:** `components/CameraFeed.jsx`
- **Problema:** `getUserMedia` obtenía el stream pero no se detenían los tracks
  al desmontar el componente.
- **Impacto:** la cámara quedaba encendida y se filtraba memoria.
- **Corrección:** cleanup con `getTracks().forEach(t => t.stop())`, limpieza de
  `srcObject` y guardia contra resolución tardía tras el desmontaje.

### 2.5 Errores de cámara no manejados — MEDIO

- **Dónde:** `components/CameraFeed.jsx`
- **Problema:** si el usuario negaba permisos o no había cámara, la promesa
  rechazaba sin feedback (unhandled rejection).
- **Corrección:** `catch` con log y aviso visual en pantalla.

### 2.6 Detección de Jumping Jacks débil — MEDIO

- **Dónde:** `hooks/useMediaPipe.js`
- **Problema:** la heurística usaba distancias absolutas (`< 0.1`) y consideraba
  `manosJuntas` sin contexto, sin escala corporal; sensible a la distancia a la
  cámara y a la orientación.
- **Corrección:** nueva versión en `engine/detectors.js` que normaliza la
  separación de muñecas por el ancho de hombros y exige brazos por encima/debajo
  de los hombros con separación relativa. (Mejora heurística, no detector
  perfecto; ver §5.)

### 2.7 Doble conteo por ruido — MEDIO

- **Dónde:** `hooks/useMediaPipe.js`
- **Problema:** una oscilación del ángulo en el umbral podía contar dos veces
  casi instantáneas.
- **Corrección:** cooldown de 300 ms entre repeticiones (`COOLDOWN_REP_MS`).

### 2.8 Envío de score duplicado y sin manejo de error — MEDIO

- **Dónde:** `App.jsx`
- **Problema:** el efecto de `FIN` podía reejecutarse (p. ej. cambio de `user`)
  y reenviar el resultado; además el `fetch` no revisaba la respuesta.
- **Corrección:** guardia `enviadoRef` (un envío por circuito) y verificación de
  `res.ok` con log de error.

### 2.9 `detenerRutina` dejaba estado sucio — BAJO

- **Dónde:** `store/workoutStore.js`
- **Problema:** "Volver" no reseteaba `totales`, `ejercicioActual` ni `finFaseEn`.
- **Corrección:** reseteo completo del estado de mecánica.

### 2.10 Score calculado dos veces — BAJO

- **Dónde:** `App.jsx`
- **Problema:** `total` y `totalReps` eran la misma suma calculada por separado.
- **Corrección:** único cálculo con `calcularTotal()` (`engine/score.js`),
  reutilizado en `SummaryScreen`.

### 2.11 Detección con video no listo — BAJO

- **Dónde:** `hooks/useMediaPipe.js`
- **Problema:** podía llamarse `detectForVideo` antes de tener frames
  (`readyState < 2`).
- **Corrección:** guardia de `readyState`.

### 2.12 Log de depuración en producción — BAJO

- **Dónde:** `App.jsx`
- **Problema:** `console.log` por cambio de ejercicio en cada render.
- **Corrección:** eliminado.

### 2.13 AudioContext suspendido — BAJO

- **Dónde:** `engine/sounds.js`
- **Problema:** por política de autoplay, el `AudioContext` puede iniciar
  suspendido y no sonar.
- **Corrección:** `resume()` cuando el contexto está suspendido.

---

## 3. Qué NO era bug (aclaración)

- El contador no muestra `0`: la secuencia es `40 → 1` y transiciona al llegar a
  cero. La fase dura exactamente 40 s. Es el comportamiento correcto.
- `score` y `total_reps` son iguales por diseño (el score es el total de
  repeticiones).

---

## 4. Refactor para testabilidad

Se extrajo la lógica pura fuera de React:

| Archivo | Responsabilidad |
|---------|-----------------|
| `engine/angles.js` | `calculateAngle`, `distancia`, `esVisible` |
| `engine/detectors.js` | Máquinas de estado puras de los 11 ejercicios + `DETECTORES` |
| `engine/circuito.js` | Constantes, estado inicial y `avanzarCircuito()` (fases/timer) |
| `engine/score.js` | `calcularTotal()` |

El hook y el store ahora solo orquestan efectos (MediaPipe, audio, intervalos).

---

## 5. Tests

```bash
cd frontend
npm test
```

Resultado: **13 archivos, 150 tests, todos en verde.**

Backend:
```bash
cd backend
go test ./...
```
Resultado: **5 tests, todos en verde.**

Cobertura de lógica:
- `angles.test.js`: ángulos 0/90/180, visibilidad, distancia y normalización
  por largo de torso.
- `filters.test.js`: OneEuroFilter, suavizado de landmarks y reinicio de filtros.
- `forma.test.js`: similitud coseno y score de forma para sentadilla, sumo,
  flexión, plancha y variantes; rechazo por baja visibilidad o torso nulo.
- `modeloPose.test.js`: selección lite/full/heavy, override y cadena de respaldo.
- `detectors.test.js`: calibración de cadera, conteo único por ejercicio, gate
  de visibilidad, rechazo de silla, plancha en flexiones, piernas en JJ,
  zancada, plancha isométrica, rodillas altas, puente de glúteo, abdominal,
  mountain climber, plancha lateral, superman y score de forma.
- `circuito.test.js`: estado inicial, descuento por tiempo real, transición a
  descanso, cambio de ejercicio, recorrido completo hasta `FIN`, acumulado por
  rondas, estaciones del mapa y resumen por secciones.
- `circuito-clases.test.js`: motor genérico con clases de distinta duración,
  bloques, progreso y totales.
- `clases.test.js`: catálogo de 13 clases, duración, formato, ejercicios válidos,
  modo por tiempo y compilación de `Funcional 45` (5 secciones, 38 bloques).
- `demos.test.js`: keyframes de la demo, articulaciones válidas, interpolación
  y guion de voz.
- `progreso.test.js`: diferencia de reps, comparación y guion narrado del resumen.
- `plan.test.js`: normalización, días, objetivo, rotación de clases, siguiente día y persistencia del plan semanal por usuario.
- `backend/resumen_test.go`: racha, semana (lunes), meta semanal, sesiones
  duplicadas, fallback de fecha y orden de última/anterior.
- `voz.test.js`: bancos de frases y rotación.
- `score.test.js`: suma y casos nulos/vacíos.

---

## 6. Mejoras de mecánica basadas en investigación (2ª iteración)

Se investigó cómo cuentan repeticiones proyectos reales y la literatura
científica. Fuentes principales:

- [Hamza-Asif-ai/Squat-Detection-Rep-Counter](https://github.com/Hamza-Asif-ai/Squat-Detection-Rep-Counter) — histéresis + state machine.
- [Venkatraman-web/squat-counter](https://github.com/Venkatraman-web/squat-counter) — estados Standing/Squatting/Sitting y rechazo de silla.
- [dimsedra/squat-counter](https://github.com/dimsedra/squat-counter) — EMA smoothing y calibración automática.
- [ieee-sb-uniwa/milon-exercise-engine](https://github.com/ieee-sb-uniwa/milon-exercise-engine) — exige descenso de cadera, no solo ángulo.
- [PMC13347614](https://pmc.ncbi.nlm.nih.gov/articles/PMC13347614) — error sistemático de pose 2D (~10°) y corrección.
- [PubMed 36198251](https://pubmed.ncbi.nlm.nih.gov/36198251) — validez de pose 2D para plano sagital.

Conclusión de la investigación: el conteo es fiable **de perfil**, pero "hacer
una sentadilla real" requiere más que el ángulo de rodilla. Se implementó:

1. **Calibración de línea base**: mientras el usuario está de pie se registra la
   altura de la cadera (`baseY`) con OneEuroFilter.
2. **Verificación de descenso de cadera**: la repetición solo inicia si la cadera
   baja respecto a la base → evita contar flexiones de rodilla estando de pie.
3. **Rechazo de "silla"**: si se mantiene flexionado por más de 2 s se marca
   `sentado` y no se cuenta (levantarse de una silla no suma).
4. **OneEuroFilter** sobre landmarks (x/y/z) para eliminar jitter de MediaPipe,
   con más respuesta cuando hay movimiento rápido.
5. **Selección del lado más visible**: se usa la pierna/brazo con mayor
   visibilidad en vez de solo el lado derecho.
6. **Flexiones**: se exige postura de **plancha** (cuerpo horizontal, ángulo
   hombro–cadera–tobillo) para evitar contar de pie.
7. **Jumping Jacks**: se exige **piernas abiertas** junto con brazos arriba, y
   separación normalizada por ancho de hombros/caderas.
8. **Feedback de forma**: mensajes en pantalla ("Baja más la cadera",
   "Colócate en plancha de perfil", "Posición sentado: no cuenta").
9. **Normalización por torso**: los ángulos y vectores se calculan sobre
   landmarks centrados en la cadera y escalados por el largo hombro-cadera.
10. **Score de forma coseno**: compara alineación de torso, piernas y brazos
    contra una referencia ideal; se muestra en vivo y define "perfecta" con
    umbral 85.
11. **Modelo adaptativo**: `lite` en móviles, `full` en gama alta y `heavy` en
    escritorio potente, con override `?pose=` y respaldo `heavy → full → lite`.

Cuándo **no** es fiable (limitación conocida):
- Vista frontal en sentadillas (el plano frontal tiene baja validez).
- Persona parcialmente fuera de cuadro u ocluida.
- Ropa holgada, mala iluminación o cámara muy lejos.
- Cuerpo en diagonal severa respecto a la cámara (subestimación del ángulo).

---

## 7. Recomendaciones pendientes (futuras)

1. **Persistencia offline**: reintentar el envío de score si falla la red.
2. **Uso del eje Z** de los landmarks para robustez ante rotaciones.
3. **Calibración guiada** en la fase `CALIBRACION` (pedir postura de pie y medir
   proporciones del usuario).
4. **Clasificador de ejercicio** (LSTM/CNN) para validar que el ejercicio
   ejecutado corresponde al esperado.
5. **Medición en cámara real** de los umbrales de forma y del modelo `heavy`.

---

## 8. Verificación final

- `npm test` → 150/150 OK
- `go test ./...` → OK
- `npm run build` → OK
- Despliegue a Firebase Hosting tras las correcciones y mejoras.
