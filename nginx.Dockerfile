FROM nginx:alpine

# Install OpenSSL
RUN apk add --no-cache openssl

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy certificate generation script
COPY generate-certs.sh /generate-certs.sh
RUN chmod +x /generate-certs.sh

# Start with certificate generation
CMD ["/bin/sh", "/generate-certs.sh"]