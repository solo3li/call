#!/bin/bash
set -e

echo "=== FoodRMS Full Deploy Script ==="
echo "Starting at: $(date)"

# Helper: Build, save and import Docker image into k3s
build_and_import() {
  local NAME=$1
  local CONTEXT=$2
  echo ""
  echo ">>> Building $NAME ..."
  docker build -t "$NAME:latest" "$CONTEXT"
  echo ">>> Importing $NAME into k3s ..."
  docker save "$NAME:latest" | k3s ctr images import -
  echo ">>> $NAME done."
}

# Build API
build_and_import "foodrms-backend" "/root/call/foodRMS/project/backend/src/FoodRMS.Api"

# Build BotWorker
build_and_import "foodrms-botworker" "/root/call/foodRMS/project/backend/src/FoodRMS.BotWorker"

# Build Frontend
build_and_import "foodrms-frontend" "/root/call/foodRMS/project/frontend"

# Build Driver App
build_and_import "driver-app" "/root/call/foodRMS/project/driver-app"

# Build External Orders App
build_and_import "external-orders-app" "/root/call/foodRMS/project/external-orders-app"

echo ""
echo "=== Linting Helm charts ==="
helm lint /root/call/foodRMS/project/helm/foodrms

echo ""
echo "=== Applying Helm chart ==="
helm upgrade --install foodrms /root/call/foodRMS/project/helm/foodrms

echo ""
echo "=== Waiting for deployments to roll out ==="
kubectl rollout status deployment/backend   --timeout=120s
kubectl rollout status deployment/frontend  --timeout=120s
kubectl rollout status deployment/driver-app --timeout=120s
kubectl rollout status deployment/external-orders-app --timeout=120s
kubectl rollout status deployment/botworker  --timeout=120s || true  # non-critical

echo ""
echo "=== Pod Status ==="
kubectl get pods -o wide

echo ""
echo "=== Deployment completed at: $(date) ==="
