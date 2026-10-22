# Guía de Despliegue — WorkoutBot

## 1. Arquitectura de Producción

```
┌─────────────────────────────────────────────────────────────┐
│                     GOOGLE CLOUD PROJECT                     │
│                       workoutbot-fit                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────┐     ┌─────────────────────────────┐    │
│  │  Firebase Host   │     │       Cloud Run             │    │
│  │  (Frontend)      │────▶│  workoutbot (Backend Go)    │    │
│  │  React + Vite    │     │  us-central1                │    │
│  └─────────────────┘     │  0-10 instancias            │    │
│         │                 └──────────┬──────────────────┘    │
│         │                            │                        │
│         ▼                            ▼                        │
│  ┌─────────────┐          ┌──────────────────┐              │
│  │  Firebase    │          │    Firestore      │              │
│  │  Auth        │          │  workout_logs     │              │
│  └─────────────┘          └──────────────────┘              │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## 2. Prerrequisitos

```bash
# Google Cloud SDK
gcloud --version
gcloud auth login
gcloud config set project <TU_PROYECTO_ID>

# Firebase CLI
firebase --version
firebase login

# Node.js >= 18
node --version
npm --version

# Go >= 1.22
go version
```

### Permisos requeridos en GCP

| Rol | Servicio |
|-----|----------|
| `roles/run.admin` | Cloud Run |
| `roles/firebasehosting.admin` | Firebase Hosting |
| `roles/datastore.user` | Firestore |
| `roles/iam.serviceAccountUser` | IAM |

## 3. Variables de Entorno

### Backend (Cloud Run)

```bash
cp backend/.env.example backend/.env
```

```yaml
GCP_PROJECT_ID: <tu-proyecto-id>
PORT: "8080"
FRONTEND_URL: https://workoutbot-web.web.app
```

### Frontend (Firebase Hosting)

```bash
cp frontend/.env.example frontend/.env
```

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

`VITE_FIREBASE_MEASUREMENT_ID` es opcional. Si lo omites, la app funciona
igual pero no envía analítica. Puedes encontrarlo en Firebase Console >
Configuración del proyecto > Tus apps > Configuración del SDK.

## 4. Despliegue

### Despliegue completo

```bash
cp backend/.env /tmp/opencode/env_workoutbot.yaml
ENV_FILE=/tmp/opencode/env_workoutbot.yaml ./deploy.sh
```

### Despliegue parcial

```bash
# Solo backend (Cloud Run)
ENV_FILE=/tmp/opencode/env_workoutbot.yaml ./deploy.sh only-backend

# Solo frontend (Firebase Hosting)
ENV_FILE=/tmp/opencode/env_workoutbot.yaml ./deploy.sh only-frontend
```

### Despliegue manual del backend

```bash
gcloud run deploy workoutbot \
  --source backend \
  --region us-central1 \
  --platform managed \
  --env-vars-file /tmp/opencode/env_workoutbot.yaml \
  --allow-unauthenticated \
  --memory 256Mi \
  --cpu 1 \
  --concurrency 80 \
  --timeout 60 \
  --port 8080 \
  --quiet
```

### Despliegue manual del frontend

```bash
cd frontend
npm run build
firebase deploy --only hosting --project <tu-proyecto-id>
```

## 5. Endpoints

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `POST /api/v1/workout/finish` | POST | Guarda resultado y check-in (requiere Bearer token) |
| `GET /api/v1/stats` | GET | Racha, semana y últimas sesiones (requiere Bearer token) |
| `DELETE /api/v1/account` | DELETE | Borra datos y cuenta del usuario (requiere Bearer token reciente) |

## 6. Monitoreo

```bash
# Ver URL del servicio
gcloud run services describe workoutbot --region us-central1 --format="value(status.url)"

# Logs
gcloud run services logs tail workoutbot --region us-central1

# Health check
curl https://workoutbot-849959121166.us-central1.run.app/health
```

## URLs desplegadas

| Servicio | URL |
|----------|-----|
| Frontend | https://workoutbot-web.web.app |
| Backend API | https://workoutbot-849959121166.us-central1.run.app |
| Firebase Console | https://console.firebase.google.com/project/workoutbot-fit |
| GCP Console | https://console.cloud.google.com/project/workoutbot-fit |

## Dominio personalizado (pendiente)

La app vive hoy en `https://workoutbot-web.web.app`. Si registras un dominio
propio (por ejemplo `workoutbot.app`), estos son los pasos:

1. **Comprar el dominio** en un registrador (Cloud Domains, Namecheap, etc.).
   No inventes ni anuncies un dominio que no exista.

2. **Conectar Firebase Hosting:**
   ```bash
   firebase hosting:sites:list --project workoutbot-fit
   ```
   En Firebase Console > Hosting > Agregar dominio personalizado, escribe el
   dominio y sigue las instrucciones de verificación (TXT) y los registros A /
   AAAA que Firebase te indique.

3. **Agregar el dominio al backend** para CORS. En el despliegue de Cloud Run
   suma el dominio a `FRONTEND_URL` separado por comas, o usa una variable
   distinta si tu middleware lo soporta:
   ```yaml
   FRONTEND_URL: https://workoutbot-web.web.app,https://workoutbot.app
   ```

4. **Autorizar el dominio en Firebase Auth** (Login > Dominios autorizados)
   para que Google Sign-In funcione.

5. **Actualizar metadatos** cuando ya responda:
   - `frontend/index.html`: `og:url`, `og:image` y `canonical` al dominio final.
   - `frontend/public/og-image.png` si el nombre visible cambia.
   - `VITE_BACKEND_URL` / rutas de API si dejan de ser relativas.

6. **HTTPS**: Firebase Hosting emite el certificado automáticamente cuando el
   DNS queda bien configurado (puede tardar hasta 24 h).

## Paso manual pendiente: habilitar Google Sign-In

Por limitación de las APIs de Google (IAP OAuth deprecado), el proveedor
Google debe habilitarse con un clic:

1. Ir a https://console.firebase.google.com/project/workoutbot-fit/authentication/providers
2. En la lista, seleccionar **Google**
3. Pulsar **Habilitar** (Enable) y guardar

Esto crea automáticamente el OAuth client que usa el login del frontend.
