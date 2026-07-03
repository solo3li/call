#!/bin/bash
set -e

echo "Removing old Issabel container if exists..."
docker rm -f issabel || true

echo "Building custom Asterisk..."
docker build -t my-asterisk /root/call/asterisk

echo "Starting Asterisk..."
docker run -d --name asterisk \
  --net=host \
  --restart unless-stopped \
  -v /root/call/asterisk/sip.conf:/etc/asterisk/sip.conf \
  -v /root/call/asterisk/extensions.conf:/etc/asterisk/extensions.conf \
  my-asterisk

echo "Asterisk is running on port 5060!"
