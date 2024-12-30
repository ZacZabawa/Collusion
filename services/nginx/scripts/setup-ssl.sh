#!/bin/bash

# Set variables
DOMAIN="zabauha.us"
EMAIL="zzdesigns@protonmail.com"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../../.." && pwd)"

# Install certbot (if not already installed)
if ! command -v certbot &> /dev/null; then
    apt-get update
    apt-get install -y certbot python3-certbot-nginx
fi

# Stop nginx temporarily
cd "$PROJECT_DIR" && docker-compose stop nginx

# Get SSL certificate
certbot certonly --standalone \
    --preferred-challenges http \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN \
    -d www.$DOMAIN

# Copy certificates to nginx ssl directory
mkdir -p "$PROJECT_DIR/services/nginx/ssl"
cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem "$PROJECT_DIR/services/nginx/ssl/zabauhaus.crt"
cp /etc/letsencrypt/live/$DOMAIN/privkey.pem "$PROJECT_DIR/services/nginx/ssl/zabauhaus.key"

# Set permissions
chmod 600 "$PROJECT_DIR/services/nginx/ssl/zabauhaus.key"
chmod 644 "$PROJECT_DIR/services/nginx/ssl/zabauhaus.crt"

# Start nginx
cd "$PROJECT_DIR" && docker-compose start nginx

echo "SSL certificates installed successfully" 