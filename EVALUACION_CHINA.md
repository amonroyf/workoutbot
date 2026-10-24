# Evaluación comparativa: WorkoutBot vs. apps de fitness chinas (2025–2026)

> **Objetivo:** tomar como referencia las apps de fitness más avanzadas de China
> (2025–2026) y evaluar, con calma, dónde está WorkoutBot hoy, qué es
> diferencial y qué brechas conviene cerrar.
>
> **Método:** inventario real del código del repo (frontend + backend) cruzado con
> investigación de fuentes públicas (reportes financieros, App Store, análisis de
> producto y repos) y con los estudios ya guardados `APPS_CHINA.md`,
> `ARQUETIPOS_CLASES.md` e `INFORME_CLASE_CHINA.md`.
>
> **Fecha:** oct 2026. Todo dato no verificable se marca como tal.
>
> Complementa (no reemplaza) a `APPS_CHINA.md` (mecánicas) e
> `INFORME_CLASE_CHINA.md` (anatomía de una clase).

---

## 1. Resumen ejecutivo

WorkoutBot es un **PWA de entrenamiento por voz con cámara, 100% sin equipo,
sin video y sin cuentas sociales**, orientado a clases cortas de 2 a 15 min. En
su nicho (conteo por visión + coach de voz + catálogo pequeño y claro) está
**por encima de la media china en foco y simplicidad**, pero **por debajo en el
ciclo de retención** (recordatorios, comunidad, recompensas, resumen
compartible) y en **personalización por IA**.

Los tres aprendizajes centrales de 2025–2026 en China:

1. **La IA dejó de ser un gimmick.** Keep ("All in AI", feb 2025) pasó a un
   sistema multi-agente con modelo propio (`Kinetic.AI`) y en 1S2025 **volvió a
   utilidades** (ajustado +10,35 M RMB vs. −167 M un año antes), con la IA como
   motor declarado de ingresos futuros. El registro de comida por foto retiene
   **50 % al día siguiente** y sube la retención de DAU al **79 %**.
2. **El hábito se gana con bucle social + recompensa + recordatorio.** El
   estudio de gamificación (China, 2025) muestra que los elementos de juego
   *median* el uso continuado (β = 0,593, p < 0,001). Keep vende ~4 M
   participantes/año en eventos con medalla.
3. **La simplificación vende.** Apps recientes como `AI离线健身`, FormFit y
   Repmirror ganan por **una sola cámara, feedback en vivo, offline y promesa de
   privacidad**. WorkoutBot ya juega esa carta.

**Conclusión:** WorkoutBot no debe copiar el catálogo ni el hardware. Debe
copiar el **bucle** (recordar → volver → ver progreso → compartir) y sumar una
capa ligera de **personalización/IA**, manteniendo su ventaja: sin equipo, sin
video, pocas clases y mucho foco.

---

## 2. Panorama chino 2025–2026 (datos verificables)

### 2.1 Mercado

| Dato | Valor | Fuente |
|---|---|---|
| Ingresos apps fitness China 2025 | ~US$1.280 M; penetración 12,6 %; CAGR 4 % a 2029 | Statista |
| Mercado fitness total China | 9.917 亿 RMB (2023) → 14.476 亿 (2027E) | 民生证券 |
| Penetración online | → 58,4 % (2027E) | 民生证券 |
| Keep 1S2025 | Ingreso 822 M RMB (−20,8 %); ajustado **+10,35 M** (vs. −167 M); margen bruto 52,2 % | NBD/财报 |
| Keep usuarios | MAU 22,49 M; suscriptores 2,80 M; penetración 12,4 %; ARPU 6,1 RMB/mes | NBD/财报 |
| Keep IA | DAU core IA >150 k (jul 2025); comida por foto = 1/3 de usuarios de chat IA; retención D1 50 %, DAU 79 % | NBD/财报 |

Lectura: el mercado ya **no crece por usuarios** (Keep cae en ingresos), crece
por **monetización y retención**. Esa es exactamente la fase en la que WorkoutBot
podría saltarse años si copia bien las mecánicas de retención.

### 2.2 Qué hacen distinto las apps líderes

**Keep — de app de contenido a agente de IA**
- "All in AI" (feb 2025): arquitectura multi-agente (MAS) + modelo afinado
  `Kinetic.AI`; coach "Kaka" con memoria, voz en vivo, análisis post-entreno y
  comida por foto.
- **60+ categorías deportivas**, ~5.000 cursos oficiales (**~15 % generados por
  IA**), planes personalizados con evaluación corporal.
- **Medallas físicas + IP联名** (~4 M participantes/año, 500+ diseños,
  60 亿 de conversación): el evento es el gancho, la medalla el objeto social.
- 140+ clubes; "check-in small teams" (打卡小分队); monedas de calorías.

**乐动力 (Alibaba / 橙狮体育, V10.13.0 · 2026.8)**
- **AI运动**: 14 puntos de esqueleto, 15 acciones, corrección en vivo; "AI无障
  碍" para personas con discapacidad.
- Juegos y eventos con gobierno/universidades ("云动会", AI体能赛).
- Mecánicas de retención explícitas: **打卡挑战赛, 红包赛, 运动大富翁**;
  integra cursos, comunidad y "减脂营" con coach.

**咕咚 (律动, 2亿+ usuarios)**
- Membership (18 ¥/mes, 168 ¥/año) con **AI "配速兔子"**, planes, análisis
  avanzado y **sin publicidad**.
- 20万+ clubes/运动团; eventos online con medalla; moneda 咚卡 + mini-juego;
  informes anuales (年报) muy compartibles.

**悦动圈**
- Núcleo en pasos + **recompensa inmediata (红包)** y "印花赛" de equipo;
  precisión de conteo declarada 95,8 %. Fuerte en ciudades pequeñas.

**Nuevas apps globales/chinas 2026 (competencia directa)**
- `RepStandard` (jul 2026): cámara → conteo (sentadilla, flexión, abdominal,
  plancha), **20 niveles ("绵羊"→"Sigma"), 50+ logros, certificado compartible**.
- `FormFit`: 200+ ejercicios, corrección por voz, **modo offline**, comunidad,
  comida por foto, plan PRO con retroalimentación de expertos.
- `Repmirror`: **form score por repetición**, 4 personalidades de voz, 400+
  librería, Apple Health, IA como capa Premium.
- `AI离线健身`: 35 movimientos, 8 zonas, **100 % offline, sin recolección de
  datos, pago único**.
- `Movepath`: XP, streak que "tiembla" si faltas, WebMCP para agentes.

Patrón común: **una cámara + feedback hablado + progresión gamificada +
offline/privacidad**. Casi idéntico al núcleo de WorkoutBot.

---

## 3. WorkoutBot hoy (inventario real del repo)

Extraído de `frontend/src` y `backend/*.go`.

### 3.1 Producto y catálogo
- **PWA** (Vite/React), instalable; sin app nativa.
- **11 clases / 4 arquetipos**: fuerza (10/30/45), HIIT (10/20/30), combat
  (20/30), core (5/10/20). **41 ejercicios**, **19 detectores**, sección
  **"Activación funcional"** + vuelta a la calma. Solo peso corporal
  (`equipamiento: []`).
- Clases cortas **2–15 min** (copy de login/onboarding); objetivo de público
  amplio (16–60, variantes suave/fuerte, bajo impacto).
- **Plan semanal** ("Hoy toca"), objetivo (equilibrio/fuerza/cardio/suave...),
  rotación de clases, persistido en `localStorage` (`plan.js`).

### 3.2 Ejecución con cámara y voz
- **MediaPipe Pose** en el navegador; filtro **OneEuro**; selección del lado
  más visible; **score de forma coseno**; "perfecta" con umbral 85.
- **19 detectores** puros (`detectors.js`): sentadilla con calibración de cadera,
  rechazo de "silla", plancha obligatoria en flexiones, JJ con piernas abiertas,
  entre otros.
- **Coach de voz por frases** (`voz.js`, banco `TRABAJO`/`ACTIVACION`), voz de
  transiciones, sin TTS generativo.
- **Música CC0** por arquetipo (`musica.js`, 4 pistas), BPM por sección.
- **Demos animadas** de stick-figure (`demos.js`) en vez de video.

### 3.3 Retención y progreso (lo que ya existe)
- **Check-in + racha + meta semanal** (Firestore; backend `resumen.go`).
- **Resumen narrado** post-entreno: reps, perfectas, mejor combo, racha,
  comparación con la sesión anterior.
- Objetivos y plan semanal.

### 3.4 Backend y datos
- **Go en Cloud Run** (`workoutbot`): endpoints de score/resumen, `cache.go`,
  middleware de auth. Firestore.
- **Firebase Auth**.
- Analítica (GA) **no habilitada** (falta `MEASUREMENT_ID`).

### 3.5 Lo que NO tiene
- Comunidad/grupos, retos, medallas, moneda, ranking.
- Recordatorios/notificaciones.
- Póster/resumen compartible.
- IA generativa (planes o voz adaptativa).
- Detección de postura por foto de comida, wearables, ECG/pulso.
- Contenido en video o classes en vivo.

---

## 4. Comparación directa

Leyenda: ✅ existe · 🟡 parcial · ❌ ausente.

| Capacidad | WorkoutBot | Keep | 乐动力 | 咕咚/悦动圈 | Nuevas 2026 |
|---|:---:|:---:|:---:|:---:|:---:|
| Cámara + corrección en vivo | ✅ | 🟡 | ✅ | ❌ | ✅ |
| Conteo por visión | ✅ (19 ej.) | 🟡 | ✅ (15) | ❌ (sensores) | ✅ |
| Score de forma | ✅ | 🟡 | 🟡 | ❌ | ✅ |
| Coach por voz en vivo | ✅ (frases) | ✅ (TTS+IA) | ✅ | ✅ (喋喋) | ✅ |
| Música configurable | 🟡 (4 pistas) | ✅ | ✅ | ✅ | 🟡 |
| Sin equipo / sin video | ✅ | ❌ | 🟡 | ❌ | ✅ |
| Offline | ❌ (PWA) | 🟡 | ❌ | ❌ | ✅ |
| Privacidad "todo local" | 🟡 (pose local, score sube) | ❌ | ❌ | ❌ | ✅ |
| Catálogo amplio | ❌ (11) | ✅ (5000+) | ✅ | ✅ | ✅ (200–400) |
| Plan semanal / "hoy toca" | ✅ | ✅ | ✅ | ✅ | ✅ |
| Plan adaptativo por IA | ❌ | ✅ | 🟡 | 🟡 | 🟡 |
| Check-in + racha | ✅ | ✅ | ✅ | ✅ | ✅ |
| Recordatorio / notificación | ❌ | ✅ | ✅ | ✅ | ✅ |
| Resumen post-entreno | ✅ (narrado) | ✅ | ✅ | ✅ | ✅ |
| Póster/resumen compartible | ❌ | ✅ | ✅ | ✅ | ✅ (cert.) |
| Medallas / retos | ❌ | ✅ (físico) | ✅ | ✅ | ✅ (logros) |
| Comunidad / grupos | ❌ | ✅ | ✅ | ✅ | 🟡 |
| Ranking entre pares | ❌ | ✅ | ✅ | ✅ | ✅ |
| Monetización | ❌ | ✅ | ✅ | ✅ | ✅ (Premium) |
| Comida por foto | ❌ | ✅ | ❌ | ❌ | ✅ (FormFit) |

---

## 5. Fortalezas y brechas

### 5.1 Fortalezas (defender)
1. **Foco radical**: 11 clases claras frente al "overchoice" que la propia
   prensa china critica en Keep. Es una ventaja, no un atraso.
2. **Sin equipo y sin video**: coste de contenido casi nulo; funciona en casa.
3. **Calidad de la mecánica**: detectores con calibración, rechazo de trampas y
   score de forma están al nivel de FITURE/Paddle, por encima de media.
4. **PWA + voz propia**: multiplataforma, sin app stores, sin TTS pagado.
5. **Coach narrado** y **activación funcional por arquetipo**: diferenciador de
   diseño frente a listas genéricas.

### 5.2 Brechas frente a China (por importancia)
1. **No hay bucle de retorno**: falta recordatorio y algo que el usuario quiera
   volver a ver. Es la brecha #1 — el resto es secundario.
2. **Nada salible/compartible**: sin póster ni certificado, el crecimiento es
   cero; en Colombia WhatsApp es el canal natural.
3. **Sin progresión de largo plazo**: racha y meta están, pero no hay retos,
   medallas ni niveles que den objetivo más allá de la sesión.
4. **Sin personalización**: no hay "¿cómo te sientes hoy?" ni plan adaptativo.
5. **Sin social**: los líderes chinos lo usan como pegamento; puede ser
   asíncrono (parche/grupo) sin salas en vivo.
6. **Detección limitada a 19 ejercicios**: el catálogo no puede crecer sin más
   detectores (costoso) → conviene un **fallback por temporizador/sensores**.

---

## 6. Recomendaciones priorizadas

### P0 — cerrar el bucle de retención (alto impacto, esfuerzo bajo-medio)
1. **Recordatorio del plan** ("Hoy toca", p. ej. 20:00) vía notificación PWA,
   opt-in. Inspirado en `KiShao-cn/FitTrack`. *Es la palanca #1 de retorno.*
2. **Póster de check-in** para WhatsApp/IG (racha, reps, combo, frase del bot),
   generado con Canvas. De Keep/Gudong/FitTrack; ya existe el resumen narrado.
3. **Fallback de conteo por temporizador/sensores** cuando la cámara no ve,
   para no perder reps ni frustrar. De `zhaoolee/sport`.

### P1 — dar objetivo de largo plazo (medio esfuerzo)
4. **Retos mensuales + medallas virtuales** ("30 días de constancia", "1000
   sentadillas"), sin dinero real (dejar fuera 红包). De Keep/咕咚.
5. **Niveles + logros** al estilo RepStandard (20 niveles, 50+ logros,
   certificado). Barato y muy compartible.
6. **Chequeo pre-entreno** ("¿cómo te sientes?") que ajuste intensidad →
   seguridad y sensación de coach. De Kaka.
7. **Grupo/parche asíncrono** con meta compartida y ranking entre pares (no
   global). De Gudong/Keep; perfecto para Colombia.

### P2 — personalización e IA ligera (más esfuerzo)
8. **Plan adaptativo por reglas + narración**: ajustar ejercicios/tiempos según
   objetivo, tiempo, molestias; IA sólo para narrar (fiable y barato).
9. **Control por gestos** (mano = pausa, pulgar = siguiente) reutilizando los
   landmarks. De FITURE; UX "mágica".
10. **Modo offline real** (service worker + cola de reintento de score) y
    mantener la promesa "la cámara no sale de tu teléfono". De `xun-ji`/AI离线健身.

### Lo que NO copiar
- **Sobres de dinero real / 红包**: riesgo regulatorio y de fraude.
- **Catálogo gigante / video en vivo / hardware**: rompe el foco y el coste.
- **Ranking global** y **métricas vacías**: desmotivan a principiantes.
- **Medallas físicas con IP**: inviable sin logística.

---

## 7. Roadmap sugerido (una iteración por bloque)

| Iteración | Entregable | Valor |
|---|---|---|
| 1 | Recordatorio + póster de check-in | Retorno + crecimiento orgánico |
| 2 | Retos mensuales + medallas virtuales + niveles | Objetivo de largo plazo |
| 3 | Chequeo pre-entreno + plan adaptativo (reglas) | Personalización y seguridad |
| 4 | Grupo/parche asíncrono + ranking entre pares | Pegamento social |
| 5 | Gestos + offline real | UX sin fricción |

---

## 8. Límites de este informe

- El inventario de WorkoutBot proviene de revisión de código; puede haber
  matices de UI no capturados (p. ej. componentes exactos de instalación).
- Datos financieros de Keep son de 1S2025 (los más recientes públicos citados).
- Las apps chinas no se instalaron ni se probaron en sesión real; la UI se
  infiere de App Store, PRDs públicos y análisis de producto.
- Statista/民生证券 son estimaciones de mercado, no auditoría.

---

## 9. Fuentes

- **Keep**: 财报 1S2025 (NBD, 民生证券 "AI能顶半边天", sep 2025); App Store
  `id952694580`; análisis de producto (woshipm, jiemian); presión "All in AI"
  (feb 2025); ecosports "孙颖莎 x Keep" (nov 2025).
- **乐动力 / 阿里体育**: article "AI运动：阿里体育端智能最佳实践" (2021);
  App Store 应用宝 `cn.ledongli.ldl` V10.13.0 (2026.8).
- **咕咚**: App Store `id453480684` (membresía 18 ¥/mes, AI 配速兔子);
  acuerdo de membresía `tms.codoon.com`; 网易 "跑步软件前十" (2025).
- **悦动圈 / 悦跑圈**: 网经社 电商评测; woshipm 竞品分析 (2024).
- **36kr** "运动 APP 奖牌…社交货币" (2025); **woshipm** "Keep 用户运营体系"
  (jun 2025).
- **Statista** Fitness Apps — China (2025).
- **Estudios/repos**: Gamified features as mediator (IJBEM 2025, β=0.593);
  RepStandard (jul 2026); FormFit; Repmirror; AI离线健身; Movepath.
- **Interno**: `APPS_CHINA.md`, `ARQUETIPOS_CLASES.md`, `INFORME_CLASE_CHINA.md`,
  `EVALUACION.md`, `BIBLIOTECA_CLASES.md`; código `frontend/src` y
  `backend/*.go`.
