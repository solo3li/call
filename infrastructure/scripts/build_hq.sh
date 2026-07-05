#!/bin/bash
set -e
cd /root/call/foodRMS/project/desktop/apps/hq
docker build -t hq-app:latest .
docker save hq-app:latest | k3s ctr images import -
kubectl rollout restart deployment/hq-app
echo "HQ APP BUILD AND DEPLOY COMPLETE"
