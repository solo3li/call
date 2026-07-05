#!/bin/bash
# Native Asterisk Installation and Setup Script for Ubuntu 22.04+

# Ensure script is run as root
if [ "$EUID" -ne 0 ]; then
  echo "Please run this script as root (sudo ./install.sh)"
  exit 1
fi

echo "====================================================="
echo "   Asterisk Native Setup & Sync Service Installer"
echo "====================================================="

# Prompt for the backend API URL
read -p "Enter the complete Backend API URL for Asterisk Config (e.g. http://api.yourdomain.com/api/internal/asterisk/config): " BACKEND_API_URL

if [ -z "$BACKEND_API_URL" ]; then
    echo "Error: Backend API URL is required."
    exit 1
fi

echo "Updating system and installing Asterisk..."
apt-get update
apt-get install -y asterisk curl jq

echo "Setting up configuration directory..."
# Asterisk should already have created /etc/asterisk
# We'll copy the base files just in case
cp sip.conf /etc/asterisk/sip.conf
cp extensions.conf /etc/asterisk/extensions.conf

echo "Setting up sync script..."
cp sync.sh /usr/local/bin/asterisk-sync.sh
chmod +x /usr/local/bin/asterisk-sync.sh

echo "Creating systemd service for asterisk-sync..."
cat <<EOF > /etc/systemd/system/asterisk-sync.service
[Unit]
Description=Asterisk Configuration Sync Service
After=network.target asterisk.service
Requires=asterisk.service

[Service]
Type=simple
User=root
Environment="BACKEND_API_URL=$BACKEND_API_URL"
ExecStart=/usr/local/bin/asterisk-sync.sh
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

echo "Reloading systemd daemon and enabling services..."
systemctl daemon-reload
systemctl enable asterisk
systemctl start asterisk
systemctl enable asterisk-sync
systemctl restart asterisk-sync

echo "====================================================="
echo "Installation Complete!"
echo "Asterisk is running directly on the VPS."
echo "The sync service is running and fetching from:"
echo "$BACKEND_API_URL"
echo "To check sync logs: journalctl -u asterisk-sync -f"
echo "====================================================="
