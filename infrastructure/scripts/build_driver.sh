#!/bin/bash
set -e
cd /root/call/foodRMS/project/driver-app
docker build -t driver-app:latest .
docker save driver-app:latest | k3s ctr images import -
kubectl rollout restart deployment/driver-app
echo "DRIVER APP BUILD AND DEPLOY COMPLETE"
