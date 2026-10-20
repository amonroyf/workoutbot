# Auditoría de diseño y experiencia de usuario de WorkoutBot

> Evaluación de la UI contra sistemas de diseño chinos y corrección de los hallazgos
> encontrados. Todas las correcciones de esta auditoría están implementadas en
> `frontend/src`.

## 1. Referencias consultadas (repos de China)

| Sistema | Repo | Licencia | Qué aporta |
|---|---|---|---|
| Ant Design (Alibaba) | `ant-design/ant-design` (~99.8k estrellas) | MIT | 4 valores de diseño + 10 patrones de layout + specs de copy, feedback, empty, motion, icon, botones |
| Arco Design (ByteDance) | `arco-design/arco-design` (~5.7k) | MIT | 8 principios de filosofía de producto y patrón de consistencia de tokens |
| TDesign (Tencent) | `Tencent/tdesign` (~4.1k) | MIT | Sistema de diseño empresarial con tokens de color, tipografía, motion y espaciado |
| Vant (Youzan, móvil) | `youzan/vant` (~24.4k) | MIT | Patrones de UI móvil: toast, dialog, popup, pull-to-refresh, sticky, skeleton |
| Semi Design (Douyin) | `DouyinFE/semi-design` (~10.4k) | Licencia a revisar | 3.000+ design tokens, útil como referencia de nomenclatura de tokens |
| TDesign Mobile Vue | `Tencent/tdesign-mobile-vue` | MIT | Patrones móviles de Tencent |

### Los cuatro valores de Ant Design

- **Natural**: reducir carga cognitiva; añadir sentidos (voz, vibración) cuando aides.
- **Certain**: menos elementos, reglas claras, consistencia entre pantallas.
- **Meaningful**: objetivo claro, feedback inmediato, foco en la tarea.
- **Growing**: el usuario descubre el valor de las funciones.

### Los ocho principios de Arco Design

1. **Feedback Timely**: informar el estado actual y responder a tiempo.
2. **Close to Reality**: usar palabras y conceptos familiares, no jerga.
3. **System Consistency**: mismo término, misma función, misma operación.
4. **Prevent Errors**: mejor impedir el error que avisar después.
5. **Abide by Habits**: acciones visibles para bajar la carga de memoria.
6. **Highlight Priority**: que el usuario escanee, no lea.
7. **Error Solution**: explicar el problema en palabras y dar una salida.
8. **Humanized Support**: ayuda que no necesita manual.

### Patrones de layout de Ant Design

Proximidad, alineación, contraste, repetición, *make it direct*, *stay on the page*,
*keep it lightweight*, *provide an invitation*, *use transition*, *react immediately*.

## 2. Glosario: cómo se llaman los conceptos de diseño visual

| Concepto | Qué significa | Cómo se ve en WorkoutBot |
|---|---|---|
| Jerarquía visual | El orden en que el ojo lee la pantalla | Temporizador grande > ejercicio > sección > metadatos |
| Peso visual | Cuánto llama la atención un elemento | Color saturado + tamaño grande = más peso |
| Proximidad | Elementos cerca se perciben como un grupo | Título de sección pegado a sus ejercicios |
| Alineación | Ejes compartidos para que nada flote | Textos y tarjetas centrados en un mismo eje |
| Contraste mayor/menor | Lo importante se destaca, lo secundario se apaga | Acción primaria verde, secundarias neutras |
| Repetición | Un mismo patrón repetido genera consistencia | Formato "Ronda 2 de 3" en toda la app |
| Agrupación (chunking) | Dividir información en bloques digestibles | Resumen agrupado por sección |
| Enumeración | Lista con orden explícito | "1. Calentamiento · 8 min" |
| Affordance | Lo que un objeto permite hacer | Botones con etiqueta de acción ("Empezar clase") |
| Signifier | La señal que indica que algo es interactivo | Borde, fondo y `focus-visible` en botones |
| Invitación (invitation) | Señal que invita a interactuar | "Ver el detalle de la clase" con `aria-expanded` |
| Feedback / reacción | Respuesta inmediata a una acción | "Voz: sí" cambia al pulsar |
| Feedback de proceso | Estado de una operación en curso | Barra de progreso por secciones |
| Feedback de resultado | Confirmación de que terminó | "Clase completada" + resumen |
| Empty state | Qué mostrar cuando no hay datos | Falta: estado de primer usuario |
| Progressive disclosure | Mostrar detalle solo si se pide | Detalle de la clase tras un botón |
| Stay on the page | Resolver sin cambiar de pantalla | Tutorial en modal, no en otra vista |
| Direct manipulation | Manipular el objeto directamente | Chips de días que se activan al tocarlos |
| Prevent errors | Impedir el error antes de que pase | `aria-pressed` y estados por defecto seguros |
| Error solution | Mensaje que explica y propone salida | "No se pudo activar la música en este navegador" |
| Highlight priority | Que el usuario escanee, no lea | Podio de 3 datos clave arriba del resumen |
| Consistencia de sistema | Mismo término y misma operación | Verde = primario, amarillo = descanso, naranja = racha |
| Objetivo táctil (target size) | Tamaño mínimo pulsable | Botones de 44 px (`min-h-11`), CTA de 56 px |
| Ley de Fitts | Distancia y tamaño definen el tiempo para acertar | Acciones frecuentes abajo, al alcance del pulgar |
| Microcopy | Texto de la interfaz | "Si te cuesta: apóyate en una silla" |
| Sentence case vs. mayúsculas | Mayúsculas solo para etiquetas cortas | Títulos en sentence case, sin `tracking-widest` |
| Tokens de diseño | Nombres y valores de estilos reutilizables | Falta: migrar a tokens de color/espaciado |
| Escala de espaciado (8 pt) | Rejilla de espaciado | Varias clases `p-2`, `p-3`, `mt-4` sin sistema |
| Skeleton | Marcador de carga | Falta en el resumen async |
| Motion / transición | Movimiento que explica el cambio | Barras de progreso con `duration-300` |
| Perceived performance | La rapidez con la que se siente la respuesta | Falta: feedback optimista al guardar |
| Foco visible | Anillo de foco para teclado | `focus-visible:outline` en botones |

## 3. Hallazgos y correcciones aplicadas

### 3.1 Lenguaje y nomenclatura (Close to Reality + Copywriting)

| Hallazgo | Corrección | Dónde |
|---|---|---|
| Interruptores en inglés dentro de una app en español: "Voz on", "Música on" | "Voz: sí/no", "Música: sí/no" | `WorkoutUI.jsx` |
| "Briefing" (anglicismo) | "Antes de empezar" | `App.jsx` |
| "Escala:" (jerga técnica) | "Si te cuesta: apóyate en una silla o una pared" | `App.jsx` |
| "Total 38 bloques" (lenguaje interno) | "38 ejercicios en 5 secciones" | `App.jsx` |
| "Reps: 12" | "Repeticiones: 12" | `WorkoutUI.jsx` |
| "Ronda 2/3" | "Ronda 2 de 3" | `WorkoutUI.jsx`, `MapaCircuito.jsx` |
| "Total reps" | "Repeticiones totales" | `SummaryScreen.jsx` |
| "Tutorial" | "Cómo se hace" | `WorkoutUI.jsx` |
| "Plancha: sostenida" (sin número) | "Plancha: 30 s" con segundos reales | `SummaryScreen.jsx`, `circuito.js` |

### 3.2 Jerarquía y foco de atención (Highlight Priority + Contraste)

| Hallazgo | Corrección | Dónde |
|---|---|---|
| Cuatro botones del mismo peso apilados en la esquina | Barra inferior: acción primaria "Pausa" a lo ancho, secundarias neutras | `WorkoutUI.jsx` |
| Nombre del ejercicio en mayúsculas con tracking amplio | Sentence case y peso tipográfico, el temporizador sigue siendo el héroe | `WorkoutUI.jsx` |
| Etiquetas del mapa a 9 px, recortadas e ilegibles | 10 px, `title` con el nombre completo, "Ronda X de Y" | `MapaCircuito.jsx` |
| Resumen con 5 colores decorativos sin significado | Un solo acento, datos agrupados por sección | `SummaryScreen.jsx` |
| Dos textos "siguiente" en dos sitios | Una sola línea "Siguiente/Sigue" bajo el temporizador | `WorkoutUI.jsx` |

### 3.3 Usabilidad táctil y accesibilidad (Keep it lightweight + Fitts)

| Hallazgo | Corrección | Dónde |
|---|---|---|
| Botones de 36 px de alto | `min-h-11` (44 px) y CTA de 56 px a ancho completo | `WorkoutUI.jsx`, `App.jsx` |
| Botones de demo de 36 px | `min-h-11` y `aria-pressed` en los interruptores | `WorkoutUI.jsx` |
| Sin anillo de foco visible | `focus-visible:outline` en botones nuevos | varios |
| Miniaturas de demo tapables sin etiqueta clara | `aria-label` descriptivo y etiqueta "Ahora"/"Después" | `WorkoutUI.jsx` |

### 3.4 Progresive disclosure y peso de la pantalla de inicio (Stay on the page)

| Hallazgo | Corrección | Dónde |
|---|---|---|
| La pantalla inicial mostraba briefing, descripción, 5 secciones y un scroll anidado | Resumen corto + botón "Ver el detalle de la clase" con `aria-expanded` | `App.jsx` |

### 3.5 Feedback (Feedback Timely + Error Solution)

| Hallazgo | Corrección | Dónde |
|---|---|---|
| El botón de música no explicaba nada si el navegador no tenía Web Audio | Aviso en pantalla: "No se pudo activar la música en este navegador" | `useMusica.js`, `workoutStore.js` |
| Los interruptores no comunicaban su estado | Estado visible en la propia etiqueta | `WorkoutUI.jsx` |

### 3.6 Meaningful: datos correctos (Meaningful)

| Hallazgo | Corrección | Dónde |
|---|---|---|
| Los ejercicios de tiempo no se acumulaban: el resumen decía "sostenida" sin valor | Se acumulan los segundos de cada bloque y se muestran por ejercicio | `circuito.js`, `score.js` |
| El total de repeticiones no separaba repeticiones de segundos | `separarTotales`, `calcularTotal` (repeticiones) y `calcularSegundos` (tiempo) | `score.js` |

### 3.7 Consistencia de sistema (System Consistency)

| Hallazgo | Corrección | Dónde |
|---|---|---|
| Verde, naranja, amarillo y un arcoíris con varios significados | Verde = acción primaria, amarillo = descanso/atención, naranja = racha y combo | `WorkoutUI.jsx`, `SummaryScreen.jsx` |
| Formatos de ronda distintos según pantalla | Un solo formato "Ronda X de Y" | toda la app |

## 4. Sistema de tokens, iconos, skeleton y empty state

### 4.1 Tokens de diseño (`frontend/src/index.css`)

Bloque `@theme` de Tailwind v4. Genera utilidades tipo `bg-marca-500`,
`text-tinta-100`, `rounded-ficha`, `shadow-flotante`.

| Familia | Tokens | Regla |
|---|---|---|
| Marca | `marca-300…700` | Acción primaria, progreso, positivo |
| Aviso | `aviso-300…600` | Descanso, atención, cuenta regresiva |
| Racha | `racha-300…500` | Racha, combo, plan semanal |
| Error | `error-300…600` | Cámara, permisos, errores |
| Info | `info-300…500` | Datos neutrales informativos |
| Tinta | `tinta-100…950` | Texto y superficies (9 niveles) |
| Superficies | `fondo`, `panel`, `panel-alto`, `linea` | Fondo de la app, tarjetas, separadores |
| Radios | `boton`, `panel`, `ficha`, `chip` | 12, 16, 20 y 999 px |
| Sombras | `flotante`, `foco` | Diálogos y anillos de foco |

Regla de uso: verde = acción principal, ámbar = descanso, naranja = racha,
rojo = error. Ningún componente usa colores sueltos.

### 4.2 Iconografía (`frontend/src/components/Icono.jsx`)

18 iconos SVG con el mismo trazo (1.8), `currentColor` y viewBox 24×24:
pausa, reproducir, voz, musica, ayuda, chevronDerecha, chevronAbajo, calendario,
fuego, reloj, check, alerta, camara, info, casa, rayo, cerrar.

Reglas aplicadas (Ant Design, spec de iconos):

- El icono acompaña a la etiqueta, nunca la reemplaza.
- Tamaño 16 px en botones de la barra, 18–22 px en acciones principales.
- `currentColor`: el icono hereda el color del texto, sin colores propios.
- Iconos decorativos con `aria-hidden`; los accionables con `aria-label`.

### 4.3 Skeleton (`frontend/src/components/Esqueleto.jsx`)

- `Esqueleto`: bloque con brillo animado.
- `EsqueletoTexto`: líneas de texto.
- `EsqueletoTarjeta`: tarjeta completa.

Uso: carga de estadísticas al entrar, carga del resumen al terminar la clase y
activación de la cámara. Respeta `prefers-reduced-motion`.

### 4.4 Empty state de primer usuario

`engine/primeraVez.js` + `components/GuiaPrimeraVez.jsx`.

- Se muestra solo si no hay historial (`esPrimeraVez`) y no se ha descartado.
- Es una guía de un solo uso (patrón "one-time prompt" de Arco): se guarda en
  `localStorage` (`workoutbot:guia:v1`) al pulsar "Entendido".
- Tres pasos con icono: cámara, elección de clase, entrenador por voz.

### 4.5 Unificación de paleta

Migrados a tokens: `App.jsx`, `WorkoutUI.jsx`, `SummaryScreen.jsx`,
`PlanSemanal.jsx`, `MapaCircuito.jsx`, `CameraFeed.jsx` y `LoginScreen.jsx`.
En el bundle ya no queda ninguna clase de la paleta anterior
(`text-white`, `bg-green-500`, `text-orange-300`).

## 5. Pendientes (no implementados)

1. **Tipografía**: falta una escala tipográfica con tokens (`--text-*`).
2. **Iconos de marca**: el logo de WorkoutBot es un rayo genérico.
3. **Skeleton en el plan semanal** cuando se sincroniza con el servidor.
4. **Copys de error** para cámara y voz con el patrón "problema + salida".
5. **Modo de alto contraste** y verificación AA en todas las combinaciones de token.
6. **Guion de la clase** como token de datos, para que el guion viva en la clase
   y no en el motor.

## 6. Revisión móvil (safe areas y uso del espacio)

Verificado con capturas reales en Chrome headless a 360×780 y 390×844.

| Hallazgo | Corrección |
|---|---|
| La app usaba `h-screen` (100vh): sobraba espacio con la barra del navegador | `h-dvh` (altura dinámica) en el contenedor raíz |
| El notch y la barra de gestos se comían la cabecera y la barra de botones | `viewport-fit=cover` + `env(safe-area-inset-*)` en cabecera, barra inferior, overlays, resumen, login y avisos |
| La pantalla inicial no cabía y el botón "Empezar clase" quedaba cortado | Pantalla inicial con scroll propio (`overflow-y-auto`, `overscroll-contain`) y contenido alineado arriba |
| La cabecera se partía en dos líneas y el texto derecho se cortaba | Fila única: chip de fase + nombre de sección truncado + reloj de sección (`7:52`) |
| Los nombres de sección salían truncados ("Calen...", "Vuelt...") | `nombreCorto` por sección (Calent., Fuerza, Metab., Core, Calma) y conectores de ancho fijo |
| La barra inferior se salía de pantalla ("Cómo se hace" cortado) | Botones cortos (Pausa / Voz / Música) + un icono de ayuda con `aria-label` |
| El aviso de cámara tapaba la cabecera y el mapa | En clase es una píldora discreta abajo; en el inicio es una tarjeta en el flujo del contenido |
| Decía "Sostén" en ejercicios que no son isométricos (marchar, estirar) | Campo `consigna` y `consignaAyuda` por ejercicio: Muévete, Sostén, Estira, Levanta, Controla, Respira |
| El error de cámara y el estado "Activando cámara" flotaban sobre el saludo | Estado de cámara en el store (`errorCamara`, `camaraActiva`, `reintentoCamara`) y aviso en línea |

## 7. Cómo se verifica

- `npm test` en `frontend/` (174 tests).
- `npm run build` en `frontend/`.
- Capturas reales en móvil con Chrome headless a 360 y 390 px de ancho.
- Prueba manual en un teléfono real: notch, barra de gestos y barra del navegador.
