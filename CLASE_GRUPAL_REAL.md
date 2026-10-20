# Cómo hacer que WorkoutBot se sienta como una clase grupal real

> Investigación y propuesta para pasar de "rutina guiada" a "clase grupal real":
> estructura, música, cues del instructor, energía de grupo y cierre.
>
> Estado: investigación documental con **P0 implementado en código**: briefing,
> música por sección, cues de anticipación, modificaciones y cierre.

## 1. Resumen

Una clase grupal real no es solo una lista de ejercicios. Es una **experiencia
dirigida**: llega un grupo, se reúne, el instructor explica qué se va a hacer,
calienta, enseña técnica, entrena, baja la intensidad y cierra con feedback.
La música y los cues mantienen el ritmo y la energía.

WorkoutBot ya tiene la base técnica (timer, secciones, voz, demos, progreso).
Lo que falta para que se sienta real es la **capa de dirección y ambiente**:
briefing, música, cues de anticipación, modificaciones, lenguaje de grupo y
cierre con comunidad.

## 2. Fuentes consultadas

- CrossFit. "What to Expect From a Class" y "Lesson Planning": estructura de
  una hora: whiteboard brief, warm-up, skill/fuerza, workout, cool-down.
- CrossFit Roots. "Why Every Class Starts and Ends at the Whiteboard": el
  briefing y el cierre son parte de la clase, no un trámite.
- ACE Fitness. "Cued Up for Success" y "Effective Strategies for Exercise
  Cueing": cues de desempeño, seguridad y alerta; demostrar como si nadie
  hubiera hecho el ejercicio antes.
- ACE Fitness. "Music Selection": música de fondo vs. protagonista, BPM y
  frases musicales.
- Les Mills. "Why the right music is essential": música sincronizada reduce
  la percepción de esfuerzo y aumenta la resistencia.
- ACSM. "Music that Moves": listas de reproducción según formato; formato A
  (movimiento primero) y formato B (música primero).
- Zumba. "Beginner's Guide" y "Tips to Master Cueing": calentamiento suave,
  coreografía principal, vuelta a la calma; cues verbales y no verbales.
- ESHI. "Cómo preparar tu primera clase de grupo": fases, comunicación,
  motivación, seguridad y checklist.
- Smart Fit. "Smart Class": sesión de ~60 min, profesor guía, técnica,
  ajustes personalizados.

## 3. Anatomía de una clase grupal real

### 3.1 Antes de empezar: briefing / pizarra

- Se reúne al grupo.
- Se explica el objetivo del día, los bloques, la duración y la intensidad.
- Se anticipan los movimientos clave.
- Se ofrecen opciones de escala desde el principio.
- Se resuelven dudas y se baja la ansiedad previa.

### 3.2 Calentamiento (5–10 min)

- Movilidad articular y activación.
- Ejercicios generales y luego específicos.
- Música suave que sube de tempo.
- El instructor muestra y el grupo sigue.

### 3.3 Técnica / fuerza (10–20 min)

- Se enseña la técnica antes de exigir intensidad.
- Se practican patrones de movimiento.
- El instructor corrige sin frenar la clase.
- Se ajusta la dificultad por persona.

### 3.4 Parte principal / workout (10–20 min)

- Es el corazón de la clase.
- Intervalos, rondas o coreografía.
- Música con BPM alto y frases claras.
- Cues de anticipación: "3, 2, 1", "última ronda", "cambio".
- Modificaciones visibles para todos los niveles.

### 3.5 Vuelta a la calma (5–10 min)

- Baja progresiva del pulso.
- Estiramientos y respiración.
- Música lenta.
- Cierre con feedback y agradecimiento.

### 3.6 Cierre / comunidad

- Se recoge el resultado o se comparte en pizarra.
- Se despide al grupo.
- Se invita a la próxima clase.
- Se genera sentido de pertenencia.

## 4. Patrones que se repiten

1. **Estructura fija**: calentamiento → parte principal → vuelta a la calma.
2. **Música con intención**: BPM y frases marcan el ritmo.
3. **Cues de anticipación**: avisan antes del cambio, no después.
4. **Modificaciones para todos**: nadie se queda fuera.
5. **Instructor visible y humano**: demuestra, corrige, motiva.
6. **Lenguaje de grupo**: "vamos", "todos", "a mi señal".
7. **Cierre deliberado**: la clase termina con intención, no de golpe.
8. **Comunidad**: el grupo sostiene la constancia.

## 5. Brecha con WorkoutBot actual

WorkoutBot ya tiene:

- Clases por secciones y rondas.
- Timer por trabajo/descanso.
- Voz con pistas por ejercicio y transiciones.
- Tutorial con demo y puntos clave.
- Progreso por secciones y mapa de clase.
- Resumen post-entreno.

Le falta la capa de **clase grupal real**:

- Briefing tipo pizarra antes de empezar.
- Música sincronizada por sección.
- Cues de anticipación y conteos grupales.
- Modificaciones explícitas por ejercicio.
- Lenguaje de instructor con energía de grupo.
- Cierre con feedback y comunidad.
- Sensación de "sesión en vivo" (participantes, hora de inicio).

## 6. Propuesta priorizada

### P0 — clase con dirección y ambiente

1. **Pantalla de briefing / pizarra**
   - Objetivo del día, duración, intensidad, equipo.
   - Movimientos clave que aparecerán.
   - Opciones de escala (más fácil / más fuerte).
   - Botón "Empezar clase" grande.

2. **Música por sección**
   - Calentamiento: 110–125 BPM.
   - Fuerza: 120–140 BPM.
   - Metabólico/HIIT: 140–170 BPM.
   - Vuelta a la calma: <110 BPM.
   - Transiciones suaves entre secciones.
   - Volumen de música bajo cuando habla la voz.

3. **Cues de anticipación**
   - "En 3, 2, 1 cambiamos".
   - "Última ronda".
   - "Siguiente: sentadillas".
   - "Mitad del ejercicio".
   - Conteos de inicio de bloque.

4. **Modificaciones en el tutorial**
   - "Más fácil": apoyo en silla/pared, rango menor, sin salto.
   - "Más fuerte": más rango, tempo mayor, variante avanzada.
   - Visibles antes de empezar y durante la clase.

5. **Lenguaje de grupo**
   - "Vamos todos".
   - "A mi señal".
   - "Una más conmigo".
   - "Descansamos juntos".
   - Mantener el tono colombiano, sin forzar.

6. **Cierre con feedback**
   - Resumen narrado: tiempo, bloques, reps, forma.
   - Frase de cierre: "Nos vemos mañana".
   - Opción de compartir el resultado.

### P1 — sensación de sesión en vivo

7. **Inicio programado**
   - "La clase empieza en 02:30".
   - Cuenta regresiva grupal.
   - Botón "Unirme".

8. **Presencia de grupo**
   - "Hoy entrenan N personas".
   - Siluetas o avatares genéricos.
   - Evitar leaderboard global desmotivante.

9. **Rondas con cuenta grupal**
   - "Ronda 2 de 3: todos juntos".
   - Aplausos o sonido de transición.

10. **Instructor con identidad**
    - Nombre y avatar.
    - Frases propias repetibles.
    - Demo más visible.

### P2 — comunidad real

11. **Sesiones grupales asíncronas**
    - Parche con código.
    - Meta compartida de la semana.
    - Check-in del grupo.

12. **Resumen compartible**
    - Póster para WhatsApp/Instagram.
    - Frase del instructor.

13. **Plan semanal con clases**
    - Asignar clases completas por día.
    - Recordatorio opcional.

## 7. Implementación sugerida en WorkoutBot

### 7.1 Briefing

- Añadir `enfoque` y `intencion` a la clase.
- Mostrar sección de briefing en la pantalla de calibración.
- Incluir escalas por ejercicio.

### 7.2 Música

- Añadir `musica` a la clase con BPM por sección.
- Usar `Audio` o Web Audio API.
- Ajustar volumen al hablar la voz.
- Respetar licencias: pistas libres o del usuario.

### 7.3 Voz

- Ampliar `voz.js` con:
  - `CUENTA_REGRESIVA`.
  - `MODIFICACION_FACIL`.
  - `MODIFICACION_FUERTE`.
  - `GRUPO`.
  - `CIERRE`.
- Mantener la voz existente y agregar frases de grupo.

### 7.4 UI

- Añadir indicador de "sesión en vivo" y participantes.
- Mostrar modificaciones en el tutorial.
- Añadir barra de música y control de volumen.
- Mejorar el cierre con resumen y frase del instructor.

## 8. Recomendación inmediata

Empezar por **P0**: briefing, música por sección, cues de anticipación,
modificaciones y cierre. Son cambios de alto impacto y no requieren backend.
El P0 ya está implementado en el frontend; el P1 (sesión en vivo) y P2
(comunidad) dependen de decidir si la clase es síncrona o asíncrona.

## 9. Preguntas abiertas

1. ¿La clase será en vivo con otras personas o una simulación de grupo?
2. ¿Se permite usar música con licencia o solo pistas libres?
3. ¿Queremos instructor con nombre y avatar propios?
4. ¿El cierre debe incluir compartir en redes o solo resumen local?

## 10. Conclusión

Para que WorkoutBot parezca una clase grupal real, no basta con más ejercicios.
Hay que añadir **dirección, música, anticipación, modificaciones y cierre**.
La estructura técnica ya está; el siguiente paso es convertir la rutina en una
sesión dirigida por un instructor con energía de grupo.
