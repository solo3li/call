#!/bin/bash
set -ex

# Build HQ App
cd /root/rms/foodRMS/project/desktop
docker build --no-cache -f Dockerfile.hq -t foodrms-hq:latest .
docker save foodrms-hq:latest | k3s ctr images import -

# Build Branch App
docker build --no-cache -f Dockerfile.branch -t foodrms-branch:latest .
docker save foodrms-branch:latest | k3s ctr images import -

echo "Images built and imported successfully."
