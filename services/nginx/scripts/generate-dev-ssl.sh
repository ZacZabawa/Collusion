#!/bin/bash

# Set variables
SSL_DIR="../ssl"
DOMAIN="zabauha.us"
DAYS_VALID=365

# Create SSL directory if it doesn't exist
mkdir -p $SSL_DIR

# Generate self-signed certificate for development
openssl req -x509 -nodes -days $DAYS_VALID -newkey rsa:2048 \
  -keyout $SSL_DIR/zabauhaus.key \
  -out $SSL_DIR/zabauhaus.crt \
  -subj "/CN=${DOMAIN}/O=Zabauhaus Development/C=US"

# Set permissions
chmod 600 $SSL_DIR/zabauhaus.key
chmod 644 $SSL_DIR/zabauhaus.crt

echo "Development SSL certificates generated successfully" 