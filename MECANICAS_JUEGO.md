# Mecánicas de juego: máquina de estados + demo en pantalla

> Enfoque: que el usuario **entienda cómo se hace** cada ejercicio y que el
> progreso se sienta como un juego. Referentes y opciones concretas para
> WorkoutBot (PWA, cámara, entrenador por voz).

---

## 1. Referentes que ya lo hacen

- **开练 (Kai Lian, China)** — 300+ ejercicios con **"3D演示 + 语音讲解"**,
  **"跟练模式"** (te guía rep a rep) y **"记录模式"**. Es el ejemplo más claro
  de máquina de estados + demostración en pantalla.
- **Keep** — clases con **demostración visual + voz en vivo** y coach Kaka que
  corrige; el contenido se ajusta al nivel.
- **FITURE** — espejo que **demuestra, cuenta, corrige la forma** y da ritmo;
  control por gestos.
- **FitCraft** — **demos 3D interactivas** (orbitar, zoom, velocidad) para
  aprender el movimiento desde cualquier ángulo.
- **Avatone** — tu **avatar evoluciona** con el progreso (motivación visual).
- **Millie (NeurIPS 2019)** — **avatar entrenador** que observa y califica
  velocidad, precisión y forma.
- **OpenHIIT / SetTimer / feeel** — apps open source con **flujo por estados**
  (listo → trabajo → descanso → siguiente) y guía visual.

---

## 2. Tres máquinas de estados que conviene separar

### A) Máquina de estados de la clase (la que ve el usuario)
```
CALIBRACION -> DEMO -> PREPARADO -> TRABAJO -> DESCANSO -> SIGUIENTE -> FIN
                 ^                                  |
                 +---------- (repetir demo) --------+
```
- **DEMO**: muestra cómo se hace (loop corto + 2-3 pistas + voz).
- **PREPARADO**: "en posición", cuenta 3-2-1.
- **TRABAJO**: repeticiones con feedback.
- **DESCANSO**: descanso + vista previa del siguiente ejercicio.
- **SIGUIENTE**: transición con animación.

### B) Máquina de estados del ejercicio (la que da el conteo)
```
ARRIBA -> ABAJO -> ARRIBA (rep válida)
   ^         |
   +-- error de forma (aviso, no cuenta)
```
- Visualizarla en pantalla: anillo/barra que sube y baja con el movimiento.
- Colores: verde = forma correcta, amarillo = corrige, rojo = no cuenta.

### C) Máquina de estados del jugador (progreso)
```
NOVATO -> CONSTANTE -> BERRA CO -> TIGRE
```
- Se sube con reps válidas, racha y "perfects"; desbloquea medallas y demos.

---

## 3. Mecánicas de juego implementables

1. **Mapa de estaciones (nodos)**
   - 3 tarjetas/nodos: completado, actual, bloqueado. Cada nodo muestra
     animación, tiempo y reps. Se siente como un nivel.
2. **"Enséñame primero" (DEMO)**
   - Antes de cada ejercicio (o al tocar "¿Cómo se hace?"), loop de 3-5 s con
     las 2-3 claves técnicas y la voz del bot.
3. **Fantasma / espejo (ghost)**
   - Silueta o esqueleto ideal superpuesto/side-by-side; compara ángulos y
     marca el cuerpo en verde/rojo. Nivel avanzado.
4. **Follow the leader (bot hace la repetición)**
   - Un avatar/stick figure hace la repetición al ritmo objetivo; el usuario lo
     imita. El bot marca el tempo.
5. **Anillo de repetición**
   - Anillo que se llena en ARRIBA→ABAJO y explota en "PERFECT" al completar.
6. **Perfect / combo / racha**
   - Repeticiones con buena forma dan "PERFECT", suben combo y llenan una barra
     que desbloquea el siguiente nodo.
7. **Progresión tipo jefe**
   - El último ejercicio es "jefe"; los perfects acumulados lo debilitan.
8. **Pistas progresivas (evitar overchoice)**
   - Primera vez: demo completa + 3 pistas. Después: mini-demo y solo la pista
     que el usuario necesita.

---

## 4. Opciones para la demo en pantalla (de menor a mayor esfuerzo)

| Opción | Cómo se ve | Peso | Licencia/riesgo | Encaje |
|---|---|---|---|---|
| **A. Stick figure propio** | Esqueleto animado en canvas, mismo estilo del overlay | ~0 KB extra | Ninguno | Muy alto (ya dibujamos skeleton) |
| **B. GIFs de dataset** | GIF realista de 3-5 s por ejercicio | 1-3 MB por GIF | `hasaneyldrm/exercises-dataset` (MIT) / `BodyIQDB` | Alto, rápido de integrar |
| **C. Ilustraciones 3 frames** | 3 poses clave por ejercicio | Bajo | `bryllim/workout-guide` (CC BY-SA 4.0) | Medio |
| **D. Lottie** | Animación vectorial, recoloreable | Muy bajo | Requiere crear/comprar assets | Alto si se producen |
| **E. Avatar 3D (glTF)** | Modelo 3D interactivo (orbitar/zoom) | ~50 KB por ejercicio | `opengym3d` (MIT) / Mixamo (solo dentro de la app) | Muy alto, premium |

### Repos encontrados
- **AssiamahS/opengym3d** — librería 3D open source (Blender→glb, Three.js,
  keyframes por ejercicio, MIT).
- **hasaneyldrm/exercises-dataset** — 1,324 ejercicios con **GIF animado**,
  miniatura, músculos, equipo y pasos (MIT).
- **bryllim/workout-guide** — 302 ejercicios con 3 ilustraciones consistentes
  (CC BY-SA 4.0).
- **BodyIQDB/workout-exercise-animation-dataset** — 1,500 ejercicios con GIF.
- **AnderssonProgramming/gym-mvp** — modelo 3D con selección por zonas
  (React Three Fiber).
- **OpenHIIT / SetTimer / feeel** — máquinas de estados de temporizador/entreno.

---

## 5. Recomendación para WorkoutBot (MVP)

**Fase 1 — sin assets externos (rápido y liviano):**
1. **Botón "¿Cómo se hace?"** en la pantalla de trabajo: pausa la rutina y abre
   un overlay con un **stick figure animado** (keyframes propios) + 2-3 pistas
   + voz del bot. Al cerrar, reanuda.
2. **Demo durante el DESCANSO**: tarjeta con el siguiente ejercicio animado.
3. **Mapa de 3 nodos** arriba: completado / actual / siguiente.
4. **Anillo de repetición** que sigue la máquina ARRIBA→ABAJO y marca PERFECT.
5. **Voz sincronizada a estados**: "mira cómo se hace", "prepárate", "3-2-1",
   "¡dale!", "descansa".

**Fase 2 — demo realista:**
6. Reemplazar/añadir **GIFs** o **3D** solo para los 3 ejercicios (sentadilla,
   flexión, jumping jack) para no cargar la app.

**Fase 3 — fantasma/espejo:**
7. Superponer el esqueleto ideal y comparar ángulos en vivo.

---

## 6. Cómo encaja en el código actual

- `engine/circuito.js`: añadir estados `DEMO`/`PREPARADO` (o mantener el flujo y
  mostrar demo durante `DESCANSO`).
- `engine/detectors.js`: ya expone la fase `ARRIBA`/`ABAJO`; usarla para el
  anillo de repetición.
- `components/WorkoutUI.jsx`: mapa de nodos, anillo y botón "¿Cómo se hace?".
- Nuevo `components/DemoEjercicio.jsx`: canvas con stick figure animado.
- Nuevo `engine/demos.js`: keyframes normalizados por ejercicio.
- `hooks/useEntrenadorVoz.js`: cues ligados a los estados de la clase.
- `store/workoutStore.js`: `demoAbierta`, `pausar` al abrir, `reanudar` al cerrar.

---

## 7. Decisión

Elegido e implementado: **A. Stick figure propio**.

Ya está en la app:
- `engine/demos.js`: keyframes e interpolación de sentadilla, flexión y jumping jack.
- `components/DemoEjercicio.jsx`: canvas animado con esqueleto.
- `components/MapaCircuito.jsx`: mapa de estaciones (completado / actual / pendiente).
- `WorkoutUI.jsx`: botón **"¿Cómo se hace?"**, demo durante el descanso, anillo
  de repetición ARRIBA/ABAJO y flash **¡PERFECTA!**.
- `hooks/useEntrenadorVoz.js`: guion hablado al abrir la demo y reanudación.
- `store/workoutStore.js`: pausa automática al abrir la demo y reinicio al cerrar.

Siguiente fase opcional: **B. GIFs realistas** para los 3 ejercicios y luego
**C. avatar 3D**.

