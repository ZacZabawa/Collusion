#!/bin/bash

# Set variables
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../../.." && pwd)"
SERVICE_NAME="ssl-renewal"
SYSTEMD_DIR="/etc/systemd/system"

# Copy service and timer files
cp "$SCRIPT_DIR/$SERVICE_NAME.service" "$SYSTEMD_DIR/"
cp "$SCRIPT_DIR/$SERVICE_NAME.timer" "$SYSTEMD_DIR/"

# Set permissions for SSL scripts
chmod +x "$SCRIPT_DIR/renew-ssl.sh"
chmod +x "$SCRIPT_DIR/ssl-check.sh"

# Create log directory
mkdir -p "$PROJECT_DIR/services/nginx/logs"

# Reload systemd
systemctl daemon-reload

# Enable and start timer
systemctl enable "$SERVICE_NAME.timer"
systemctl start "$SERVICE_NAME.timer"

# Initial SSL setup
if [ ! -f "$PROJECT_DIR/services/nginx/ssl/zabauhaus.crt" ]; then
    bash "$SCRIPT_DIR/setup-ssl.sh"
fi

echo "SSL renewal system installed successfully" 