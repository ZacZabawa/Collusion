#!/bin/bash

# Set variables
DOMAIN="zabauha.us"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../../.." && pwd)"
DOCKER_COMPOSE="/usr/local/bin/docker-compose"

# Change to project directory
cd "$PROJECT_DIR"

# Stop nginx temporarily
$DOCKER_COMPOSE stop nginx

# Renew certificates
certbot renew --quiet

# Copy new certificates to nginx ssl directory
cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem "$PROJECT_DIR/services/nginx/ssl/zabauhaus.crt"
cp /etc/letsencrypt/live/$DOMAIN/privkey.pem "$PROJECT_DIR/services/nginx/ssl/zabauhaus.key"

# Set permissions
chmod 600 "$PROJECT_DIR/services/nginx/ssl/zabauhaus.key"
chmod 644 "$PROJECT_DIR/services/nginx/ssl/zabauhaus.crt"

# Start nginx
$DOCKER_COMPOSE start nginx

# Log renewal attempt
echo "SSL renewal attempted at $(date)" >> "$PROJECT_DIR/services/nginx/logs/ssl-renewal.log" 