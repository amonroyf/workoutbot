# Estudio de apps de fitness chinas — qué implementar en WorkoutBot

> Objetivo: entender cómo funcionan Keep, Yue Dong Quan, Gudong, Boohee y FITURE,
> y traducir sus mecánicas a mejoras concretas para WorkoutBot (PWA, Colombia,
> entrenador bot por voz, rutina individual).
> Investigado en fuentes públicas y repos de GitHub/Gitee (oct 2026).

---

## 1. Cómo funcionan las principales

### Keep (la más grande de China, cotiza en HK)
- **Giro 2025**: pasó de "plataforma de contenido" a **agente de fitness con IA**.
  Modelo vertical propio (`Kinetic.ai` / `Keepace.ai`), arquitectura multi-agente.
- **AI Coach "Kaka"**: chat de primer nivel; genera plan según objetivo, lugar,
  equipo, datos, hábitos, dieta y **pulso en tiempo real**; da **voz en vivo**
  durante el entrenamiento; analiza después; reconoce comida por foto.
  - 70% de las solicitudes ya generan rutinas personalizadas (jun 2025).
  - Memoria y "persona" del coach para sentirse humano.
- **Contenido**: miles de clases (live + grabadas) que ajustan intensidad.
- **Comunidad/eventos**: retos, **medallas**, carreras online, compartir.
- **Gamificación**: "K星星球" (mundo de juego), monedas de calorías,
  **equipos de check-in (打卡小分队)**, hábitos, reportes mensuales de cambio.
- **Identidad**: a sus usuarios les dice "Keeper" y crea pertenencia.
- **Ecosistema**: cursos + dispositivos + ropa + comida (cierra el ciclo).

### Yue Dong Quan (悦动圈)
- Su motor es **caminar/contar pasos** con precisión + **sobre de dinero (红包)**.
- **Gamificación de recompensa real**: monedas por actividad, canje o retiro,
  **búsqueda del tesoro en el mapa** (caminar a un punto y abrir cofre).
- **Check-in de equipo con sobre rojo**: pegar el check-in al grupo y repartir
  premio → sube aperturas diarias y retención (fuerte en ciudades pequeñas).
- Lección: la **aversión a perder** y el premio inmediato enganchan; el efectivo
  no es replicable/regulado en Colombia → usar recompensas no monetarias.

### Gudong (咕咚)
- Se posiciona como "Facebook del deporte": **comunidad + grupos (运动团)**.
- **Eventos online/offline**: maratones, retos, "batallas" entre colegios/empresas.
- **Moneda "咚卡"** + mini-juego "咕咚运动家": avatar, ropa, fotos en escenarios,
  rankings, tareas diarias/mensuales, logros.
- Lección: el **grupo** y la **identidad** sostienen el hábito; el ranking debe ser
  entre pares, no global.

### Boohee (薄荷健康)
- 18 años de pérdida de peso; base de datos de comida enorme.
- **Foto → calorías** y planes de alimentación; une "comer + entrenar".
- Lección: registrar comida con **baja fricción** (foto) es un gancho fuerte.

### FITURE (espejo inteligente)
- **Motion Engine**: cámara de esqueleto, **corrección de forma en vivo**,
  conteo de reps/series/tiempo, ritmo, **control por gestos**.
- Puntos, insignias, **rankings globales**, juegos en familia, pulso por Bluetooth.
- Privacidad: procesa el esqueleto y **no guarda imágenes**; cámara apagada fuera
  del entrenamiento.
- Lección: manos libres + feedback inmediato + promesa de privacidad.

---

## 2. Patrones que se repiten (y por qué funcionan)

1. **Ciclo plan → ejecución → análisis**: la app no solo cuenta; planea, guía y
   revisa. Keep lo llama "agente proactivo".
2. **Coach con memoria**: recuerda lesiones, gustos, horarios y progreso.
3. **Check-in diario + racha**: el hábito se mide y se ve.
4. **Grupo/equipo**: rendir cuentas ante otros sube la adherencia.
5. **Recompensa variable**: medallas, cofres, monedas, sorteos.
6. **Baja fricción**: foto para comida, gesto para pausar, voz para corregir.
7. **Identidad y pertenencia**: "Keeper", "parche", niveles con nombres propios.
8. **Privacidad como feature**: "todo se procesa en tu teléfono".

---

## 3. Repos de China / con enfoque chino que encontré

- **PaddlePaddle/PaddleDetection — PP-TinyPose**: pose móvil multi-persona,
  versión mejorada para fitness/danza (lados, acostado, saltos, rodillas altas),
  **filtros OneEuro + EMA** y demo Android de sentadillas/brazos. Referencia
  técnica directa para robustez y suavizado.
- **zhiboniu/pose_demo_android**: demo que implementa conteo de sentadillas y
  elevación de brazos con PP-TinyPose (código `pose_action.cc`).
- **zhaoolee/sport**: contador de sentadillas **solo web con acelerómetro**.
  Ideal como *fallback* cuando la cámara falla.
- **2331k/fitness_mini_programe**: mini-programa WeChat con ciclo completo
  plan → ejecución con análisis de movimiento → reporte.
- **KiShao-cn/FitTrack**: mini-programa de bitácora (peso, entrenos, dieta),
  **recordatorio 20:00**, sugerencias con IA y **póster de check-in**.
- **vivalaci/xun-ji**: bitácora avanzada, **local-first**, cola de reintento,
  detección de PR, compartir. Patrón útil para offline.
- **cheerqjy/clock** y **DoFind/CardOnePerson**: check-in con mapa y medalla a
  los 7 días.
- **H1an1/health-coach**: coach de salud open source con base de comida china.

---

## 4. Qué podemos implementar en WorkoutBot (priorizado)

### Prioridad alta (impacto alto / esfuerzo bajo-medio)

1. **Check-in + racha + calendario**
   - Botón "Hoy entrené" al terminar, racha de días, meta semanal (3/semana).
   - Días de descanso programados no rompen la racha (de Keep/Gudong).
   - Ya tenemos Firestore: guardar `checkins` por usuario.

2. **Resumen post-entreno con análisis**
   - Además de reps: errores de forma más frecuentes, ritmo (reps/min), mejor
     combo y comparación con la última sesión.
   - El bot lo **narra por voz** ("mejoraste 4 reps en sentadilla").
   - Inspirado en Keep Kaka / FITURE.

3. **Grupo/parche asíncrono**
   - Crear un "parche" con código, meta semanal compartida y ranking entre pares.
   - Check-in del grupo (de Gudong/Keep 打卡小分队), perfecto para WhatsApp.
   - Sin salas en vivo: cada quien entrena a su hora.

4. **Póster de check-in para WhatsApp/IG**
   - Generar imagen con racha, reps, combo y frase del bot.
   - De FitTrack; en Colombia WhatsApp es el canal natural.

5. **Control por gestos**
   - Mano levantada = pausa/continuar; pulgar arriba = siguiente.
   - De FITURE; usamos los mismos landmarks.
   - Reduce fricción y se siente "mágico".

6. **Fallback por sensores**
   - Si la cámara no ve, contar sentadillas/jumping jacks con acelerómetro.
   - De zhaoolee/sport; evita frustración y pérdida de reps.

### Prioridad media (impacto alto / esfuerzo medio)

7. **Moneda y medallas coleccionables**
   - "Sabor coins" por entrenar, racha y buena forma; desbloquean medallas y
     figuras. Medallas temáticas por retos (de Keep/Gudong).
   - Sin dinero real: recompensa simbólica.

8. **Plan adaptativo por objetivo**
   - Preguntar objetivo, tiempo, equipo y molestias; ajustar ejercicios/tiempos.
   - Empezar con reglas (fiable) y usar IA solo para narrar el plan.
   - De Keep "AI Workout Plan".

9. **Chequeo pre-entreno**
   - "¿Cómo te sientes hoy?" (bien / cansado / dolor) → el bot ajusta intensidad.
   - De Kaka; mejora seguridad y adherencia.

10. **Puntaje de forma por repetición**
    - Cada rep válida suma y cada rep con error resta; mostrar calidad (%).
    - De FITURE/Paddle; convierte el conteo en juego justo.

11. **Suavizado OneEuro + detección de poses raras**
    - Mejorar el filtro actual (EMA) con OneEuro; validar poses de lado,
      acostado y salto. De PP-TinyPose.

12. **Retos mensuales con medalla**
    - "30 días de constancia", "1000 sentadillas en el mes"; medalla virtual.
    - De Keep/Gudong; da un objetivo más allá de la sesión.

### Prioridad baja / futuro

13. **Registro de comida por foto** (Boohee/Keep): requiere visión + base de
    alimentos colombianos; alto esfuerzo.
14. **Clases grabadas/live** y contenido de entrenadores: cambia el modelo.
15. **Hardware/wearables** (pulso) para ajustar intensidad en vivo.
16. **Evaluación corporal por cámara** y reportes de progreso.

---

## 5. Qué NO copiar (o adaptar con cuidado)

- **Sobres de dinero real** (Yue Dong Quan): riesgo regulatorio y de fraude en
  Colombia. Usar recompensas simbólicas o alianzas.
- **Exceso de contenido** (Keep fue criticado por "overchoice"): pocas clases
  claras y bien guiadas para el público 16–60.
- **Ranking global**: desmotiva a principiantes. Mejor ranking entre pares.
- **Métricas vacías**: no mostrar 20 números; mostrar 3 que ayuden a decidir.

---

## 6. Propuesta de siguiente iteración (si se implementa)

Orden sugerido para WorkoutBot:

1. Check-in + racha + meta semanal (base de retención).
2. Resumen post-entreno narrado (aprovecha lo que ya tenemos).
3. Póster para WhatsApp (crecimiento orgánico).
4. Grupo/parche asíncrono (adherencia social).
5. Control por gestos + fallback por sensores (UX manos libres).
6. Moneda/medallas y reto mensual (juego a largo plazo).

---

## 7. Fuentes

- Keep investor relations y resultados 2025 (AI agent, Kaka, Kinetic.ai/Keepace.ai).
- App Store / Microsoft Store de Keep 9.0–9.1 (AI coach, voz, foto comida).
- Análisis de producto de Keep, Yue Dong Quan y Gudong (woshipm).
- FITURE (Motion Engine, form feedback, gestos, rankings, privacidad).
- Boohee (foto/comida, planes).
- GitHub: PaddlePaddle/PaddleDetection PP-TinyPose, zhiboniu/pose_demo_android,
  zhaoolee/sport, 2331k/fitness_mini_programe, KiShao-cn/FitTrack,
  vivalaci/xun-ji, cheerqjy/clock, DoFind/CardOnePerson, H1an1/health-coach.
