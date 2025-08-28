FROM node:18-bullseye


# Copy dkg.js first (as a dependency)
COPY ./dkg.js /app/dkg.js
COPY dkg-evm-module /app/dkg-evm-module

WORKDIR /app/dkg.js
RUN npm install

# Set up the working directory
WORKDIR /app/ui

COPY ./ui/package*.json ./
COPY ./ui ./
RUN npm install

# Create symbolic links
RUN if [ -e /app/ui/node_modules/dkg.js ] || [ -L /app/ui/node_modules/dkg.js ]; then \
    rm -rf /app/ui/node_modules/dkg.js; \
    fi && \
    ln -s /app/dkg.js /app/ui/node_modules/dkg.js

RUN if [ -e /app/dkg.js/node_modules/dkg-evm-module ] || [ -L /app/dkg.js/node_modules/dkg-evm-module ]; then \
    rm -rf /app/dkg.js/node_modules/dkg-evm-module; \
    fi && \
    ln -s /app/dkg-evm-module /app/dkg.js/node_modules/dkg-evm-module

# Expose the application port
EXPOSE 4200

# Default command
CMD ["/bin/sh", "-c", "npm run build && npx http-server dist/app -p 4200 --cors"]