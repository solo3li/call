#!/bin/bash
set -e

echo "Starting Issabel PBX in Docker..."
docker run -d --name issabel \
  --privileged \
  --restart unless-stopped \
  -v /sys/fs/cgroup:/sys/fs/cgroup:ro \
  -p 8443:443 \
  -p 5060:5060/udp \
  -p 5060:5060/tcp \
  -p 15001-15050:15001-15050/udp \
  cubicerp/issabel /usr/sbin/init

echo "Issabel is starting. Web UI will be available at https://$(curl -s ifconfig.me):8443"
