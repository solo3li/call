#!/bin/bash
set -ex
cd /root/rms/foodRMS/project/frontend
docker build --no-cache -t foodrms-frontend:latest .
docker save foodrms-frontend:latest | k3s ctr images import -
kubectl rollout restart deployment frontend
kubectl rollout status deployment frontend
