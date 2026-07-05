#!/bin/bash
set -e
cd /root/call/foodRMS/project/desktop/apps/branch
docker build -t foodrms-branch:latest .
docker save foodrms-branch:latest | k3s ctr images import -
kubectl rollout restart deployment/branch-app
echo "BRANCH APP BUILD AND DEPLOY COMPLETE"
