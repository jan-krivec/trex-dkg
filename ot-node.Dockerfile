FROM node:18-bullseye

# Install dependencies and utilities including netcat-openbsd
RUN apt-get update && \
    apt-get install -y \
    curl \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

WORKDIR /app/ot-node-docker

COPY dkg-evm-module /app/dkg-evm-module

COPY ./ot-node-docker/package*.json ./
COPY ./ot-node-docker ./
RUN npm install

# Create symbolic link to dkg-evm-module
RUN if [ -e /app/ot-node-docker/node_modules/dkg-evm-module ] || [ -L /app/ot-node-docker/node_modules/dkg-evm-module ]; then \
    rm -rf /app/ot-node-docker/node_modules/dkg-evm-module; \
    fi && \
    ln -s /app/dkg-evm-module /app/ot-node-docker/node_modules/dkg-evm-module

RUN if [ -e /app/ui/node_modules/dkg.js ] || [ -L /app/ui/node_modules/dkg.js ]; then \
    rm -rf /app/ui/node_modules/dkg.js; \
    fi && \
    ln -s /app/dkg.js /app/ui/node_modules/dkg.js

# Create .env file with environment variables
RUN echo "NODE_ENV=development" > /app/ot-node-docker/.env && \
    echo "RPC_ENDPOINT_BC1=http://hardhat-network:8545" >> /app/ot-node-docker/.env && \
    echo "RPC_ENDPOINT_BC2=http://hardhat-network:9545" >> /app/ot-node-docker/.env

EXPOSE 8900

RUN chmod +x ./tools/local-network-setup/setup-linux-environment.sh

# Default entrypoint with setup
ENTRYPOINT ["/bin/sh", "-c", "/bin/sleep 25 && chmod +x ./tools/local-network-setup/setup-linux-environment.sh && ./tools/local-network-setup/setup-linux-environment.sh --nodes=8"]