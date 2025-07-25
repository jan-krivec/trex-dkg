#!/bin/sh

# Create certs directory if it doesn't exist
mkdir -p /etc/nginx/certs

# Check if certificates already exist
if [ ! -f /etc/nginx/certs/server.crt ] || [ ! -f /etc/nginx/certs/server.key ]; then
    echo "Generating SSL certificates..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/nginx/certs/server.key \
        -out /etc/nginx/certs/server.crt \
        -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
    echo "SSL certificates generated successfully!"
else
    echo "SSL certificates already exist, skipping generation."
fi

# Start nginx
exec nginx -g "daemon off;"