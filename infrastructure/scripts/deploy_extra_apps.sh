#!/bin/bash
set -ex

# Build TOTP App
cd /root/rms/foodRMS/TOTP
docker build --no-cache -t foodrms-totp:latest .
docker save foodrms-totp:latest | k3s ctr images import -

# Build Driver App
cd /root/rms/foodRMS/project/driver-app
docker build --no-cache -t driver-app:latest .
docker save driver-app:latest | k3s ctr images import -

kubectl rollout restart deployment totp
kubectl rollout restart deployment driver-app

echo "Extra apps built and deployed successfully."
