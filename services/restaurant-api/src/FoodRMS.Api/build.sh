#!/bin/bash
docker build -t foodrms-api:latest .
docker tag foodrms-api:latest foodrms-backend:latest
docker save foodrms-backend:latest | k3s ctr images import -
kubectl rollout restart deployment backend
