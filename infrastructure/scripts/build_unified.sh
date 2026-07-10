#!/bin/bash
set -e
cd /root/call/apps/desktop-app/apps/unified-rms
docker build -t foodrms-unified:latest .
docker save foodrms-unified:latest | k3s ctr images import -
kubectl rollout restart deployment/unified-app -n default || echo "Deployment unified-app not found yet, will be created by Helm."
echo "UNIFIED APP BUILD AND DEPLOY COMPLETE"
