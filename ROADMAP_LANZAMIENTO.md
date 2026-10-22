# Roadmap de lanzamiento — WorkoutBot

> Objetivo: convertir WorkoutBot en una PWA que una persona de 25 a 45 años,
> con poco tiempo y sin equipo, pueda abrir, instalar y usar hoy mismo en
> Colombia, sin sentirse frente a un prototipo.

## Contexto

- Producto: PWA de entrenamiento con cámara, voz y conteo de repeticiones.
- Stack: React 19 + Vite + Firebase Auth/Firestore + backend Go en Cloud Run.
- Distribución: link web y PWA instalable. Sin tiendas de apps.
- Monetización: gratis por ahora.
- Equipo: una persona, tiempo parcial.
- Usuarios actuales: ninguno. El riesgo principal es que parezca poco
  profesional y que el primer uso sea confuso.
- Mercado: Colombia, español, clases cortas de 5 a 15 minutos.

## Principios

1. **Una acción clara por pantalla.** La persona debe saber qué hacer sin leer
   un manual.
2. **Confianza antes que funciones.** Privacidad, cámara y datos explicados en
   lenguaje simple.
3. **La cámara es un extra, no un requisito para empezar.** Si falla, la clase
   debe poder continuar.
4. **Cada función nueva debe mejorar activación, retención o confianza.**
   Si no, se posterga.
5. **Medir antes de escalar.** Sin datos no se optimiza.

## P0 — Antes de invitar a alguien real

### 1. PWA real e instalable

- `vite-plugin-pwa` con manifest, service worker y precache del shell.
- Iconos 192, 512, maskable, apple-touch-icon y favicon.
- Prompt de actualización cuando haya nueva versión.
- Botón "Instalar app" con instrucciones para iOS.
- Cache runtime de MediaPipe (WASM y modelos) para el segundo uso.
- Metadata social: título, descripción, Open Graph e imagen.

**Criterio de aceptación:** Lighthouse PWA instalable, la app abre sin conexión
en la pantalla de inicio y avisa cuando hay actualización.

### 2. Analítica y errores

- Firebase Analytics solo con consentimiento explícito.
- Eventos: apertura, login, selección de clase, inicio, finalización, error de
  cámara, instalación y error de guardado.
- Captura global de errores de JavaScript con contexto mínimo, sin datos
  personales.
- Panel simple para revisar el embudo de la primera semana.

**Criterio de aceptación:** se puede responder cuántas personas abren, cuántas
empiezan y cuántas terminan una clase.

### 3. Inicio "Hoy toca"

- Hero con la clase del día, duración, nivel y un único CTA.
- Tres clases cortas recomendadas debajo.
- Racha y semana visibles en una franja compacta.
- Plan semanal, detalle de clase y catálogo completo en una hoja secundaria.
- Estado de cámara y reintento visibles sin bloquear el inicio.

**Criterio de aceptación:** una persona nueva puede empezar en menos de 10
segundos desde que abre la app.

### 4. Onboarding de 3 pasos

1. Qué es WorkoutBot y qué necesita (cámara opcional).
2. Cómo encuadrarse: cuerpo completo, 2 metros, luz frontal.
3. Elegir días y objetivo, con opción de saltar y usar el plan por defecto.

**Criterio de aceptación:** más del 80% de las personas que inician el
onboarding llegan al inicio.

### 5. Legal y confianza

- Política de privacidad y términos en español.
- Aviso claro: el video no se sube ni se guarda; la pose se procesa en el
  dispositivo.
- Enlace visible desde login y desde el inicio.
- Eliminación de cuenta y datos desde la app o un canal directo.

**Criterio de aceptación:** cualquier persona puede entender qué datos se
guardan y cómo borrarlos sin escribir a soporte.

### 6. Identidad mínima

- Wordmark e icono consistentes en app, favicon, manifest y redes.
- Imagen Open Graph 1200x630.
- Landing simple con propuesta de valor, captura y CTA.
- Dominio propio si el presupuesto lo permite.

**Criterio de aceptación:** al compartir el link en WhatsApp se ve una tarjeta
con nombre, descripción e imagen.

### 7. Robustez de cámara

- Guía de encuadre con silueta y mensajes accionables.
- Auto-pausa si se pierde la persona.
- Botones manuales de +1 y -1 repetición.
- Modo sin cámara: temporizador y voz, sin conteo automático.
- Manejo de permisos denegados, cámara ocupada y poca luz.

**Criterio de aceptación:** una clase se puede completar aunque la cámara falle.

### 8. Login en navegadores dentro de apps

- Detectar webview de WhatsApp, Instagram y Facebook.
- Fallback a redirect si el popup falla.
- Aviso "abrir en Chrome o Safari" con opción de copiar el link.

**Criterio de aceptación:** el login no se queda en un popup bloqueado sin
explicación.

## P1 — Primeras semanas con usuarios

- Clases de 5, 10 y 15 minutos con progresión real.
- Guardar plan y sesión en Firestore, no solo en localStorage.
- Reanudar una clase interrumpida.
- Medallas y minijuegos ligados a constancia, no solo a repeticiones.
- Compartir resumen como imagen.
- Recordatorios suaves por notificación o correo.
- Pruebas con 10 personas reales y ajustes de copy.

## P2 — Crecimiento

- Rutinas personalizadas según objetivo, tiempo y equipo.
- Modo multijugador o clase grupal en vivo.
- Contenido de nutrición y descanso.
- Monetización: plan premium, sin anuncios.
- Integración con relojes o bandas.
- Versión para centros de bienestar.

## Anti-roadmap

No hacer todavía:

- App nativa en App Store o Play Store.
- Chat con IA generativa como función principal.
- Red social, feed o comentarios.
- Pagos antes de tener retención.
- Nuevos detectores de ejercicios antes de estabilizar los 17 actuales.
- Dashboard administrativo complejo.
- Multiidioma.

## Repos de referencia

| Repo | Para qué sirve | Decisión |
| --- | --- | --- |
| `vite-pwa/vite-plugin-pwa` | Manifest, service worker y prompt de actualización | Adoptar |
| `GoogleChrome/workbox` | Estrategias de cache | Usar vía vite-plugin-pwa |
| `firebase/firebase-js-sdk` | Auth, Firestore y Analytics | Ya instalado |
| `getsentry/sentry-javascript` | Errores en producción | Evaluar cuando haya presupuesto |
| `PostHog/posthog-js` | Analítica de producto y embudos | Alternativa a Firebase Analytics |
| `pmndrs/zustand` | Estado global | Ya instalado |
| `mediapipe/tasks-vision` | Pose en el dispositivo | Ya instalado |
| `tailwindlabs/tailwindcss` | Estilos | Ya instalado |
| `shadcn-ui/ui` | Componentes accesibles | Solo si hace falta |
| `react-hook-form/react-hook-form` | Formularios | Cuando haya onboarding complejo |
| `vercel/og` o `resvg` | Imagen Open Graph | Generar una sola vez |
| `google/model-viewer` | Modelos 3D de ejercicios | Futuro, no P0 |

## Plan de 8 semanas

| Semana | Foco | Entregable |
| --- | --- | --- |
| 1 | PWA + iconos + metadata | App instalable y compartible |
| 2 | Analítica + errores + consentimiento | Embudo medible |
| 3 | Inicio "Hoy toca" | Activación en menos de 10 segundos |
| 4 | Onboarding + encuadre de cámara | Primer uso guiado |
| 5 | Legal + identidad + landing | Confianza y link presentable |
| 6 | Robustez de cámara + modo sin cámara | Clase completable siempre |
| 7 | Pruebas con 10 personas | Lista de fricciones reales |
| 8 | Ajustes + lanzamiento blando | Primer grupo de usuarios |

## Métricas

- Activación: porcentaje que inicia una clase en la primera sesión.
- Finalización: porcentaje que termina la clase iniciada.
- Retención D1 y D7.
- Segunda clase en 7 días.
- Instalaciones PWA.
- Errores de cámara por sesión.
- Tiempo hasta el primer "Empezar".

## Checklist de lanzamiento

- [ ] Manifest, iconos y service worker verificados.
- [ ] La app abre sin conexión.
- [ ] Analytics solo tras consentimiento.
- [ ] Privacidad y términos publicados.
- [ ] Login funciona en Chrome, Safari y webview con fallback.
- [ ] Una clase se completa con cámara y sin cámara.
- [ ] Resumen se guarda y se ve en el siguiente inicio.
- [ ] Open Graph correcto en WhatsApp.
- [ ] Prueba con 10 personas y bugs críticos corregidos.
