#!/bin/bash
set -e

echo "=== FoodRMS Desktop Deploy Script ==="
echo "Starting at: $(date)"

build_and_import() {
  local NAME=$1
  local DOCKERFILE=$2
  echo ""
  echo ">>> Building $NAME ..."
  docker build --no-cache -t "$NAME:latest" -f "$DOCKERFILE" .
  echo ">>> Importing $NAME into k3s ..."
  docker save "$NAME:latest" | k3s ctr images import -
  echo ">>> $NAME done."
}

cd /root/call/foodRMS/project/desktop

# Build Branch App
build_and_import "foodrms-branch" "Dockerfile.branch"

# Build HQ App
build_and_import "foodrms-hq" "Dockerfile.hq"

echo ""
echo "=== Waiting for deployments to roll out ==="
kubectl rollout restart deployment/branch-app
kubectl rollout restart deployment/hq-app

kubectl rollout status deployment/branch-app --timeout=120s
kubectl rollout status deployment/hq-app --timeout=120s

echo ""
echo "=== Pod Status ==="
kubectl get pods -o wide

echo ""
echo "=== Deployment completed at: $(date) ==="
