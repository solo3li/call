#!/bin/bash
set -e
cd /root/call/foodRMS/project/frontend
docker build -t foodrms-frontend:latest .
docker save foodrms-frontend:latest | k3s ctr images import -
kubectl rollout restart deployment/frontend
echo "FRONTEND BUILD AND DEPLOY COMPLETE"
