#!/usr/bin/env bash
# Despliegue completo de WorkoutBot a Google Cloud (backend + frontend).
#
# Requisitos:
#   - gcloud autenticado como owner/editor del proyecto
#   - Archivo YAML con las variables de entorno del backend
#     (p.ej. /tmp/opencode/env_workoutbot.yaml). No se versiona por contener secretos.
#
# Uso:
#   ENV_FILE=/ruta/a/env.yaml ./deploy.sh
#   ENV_FILE=... ./deploy.sh only-frontend   # solo Hosting
#   ENV_FILE=... ./deploy.sh only-backend    # solo Cloud Run

set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$DIR/backend"
FRONTEND_DIR="$DIR/frontend"
PROJECT="${GCP_PROJECT_ID:-workoutbot-fit}"
REGION="us-central1"
SERVICE="workoutbot"
SITE="workoutbot-web"

ENV_FILE="${ENV_FILE:-/tmp/opencode/env_workoutbot.yaml}"
MODE="${1:-both}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "✗ No existe el archivo de entorno: $ENV_FILE"
  echo "  Copia el YAML de variables del backend a esa ruta o pasa ENV_FILE=..."
  exit 1
fi

if ! gcloud config get-value account >/dev/null 2>&1; then
  echo "✗ gcloud no autenticado. Ejecuta: gcloud auth login"
  exit 1
fi

deploy_backend() {
  echo "== Cloud Run: $SERVICE =="
  gcloud run deploy "$SERVICE" \
    --source "$BACKEND_DIR" \
    --region "$REGION" \
    --platform managed \
    --env-vars-file "$ENV_FILE" \
    --allow-unauthenticated \
    --memory 256Mi \
    --cpu 1 \
    --concurrency 80 \
    --timeout 60 \
    --port 8080 \
    --min-instances 0 \
    --max-instances 10 \
    --quiet
}

deploy_frontend() {
  echo "== Build frontend =="
  (cd "$FRONTEND_DIR" && npm run build)

  echo "== Firebase Hosting: $SITE =="
  export TOKEN="$(gcloud auth print-access-token)"
  SITE="$SITE" PROJECT="$PROJECT" node "$DIR/scripts/deploy-hosting.mjs"
}

case "$MODE" in
  both)
    deploy_backend
    deploy_frontend
    ;;
  only-backend) deploy_backend ;;
  only-frontend) deploy_frontend ;;
  *)
    echo "Modo desconocido: $MODE (both | only-backend | only-frontend)"
    exit 1
    ;;
esac

echo "✓ Despliegue completado"
