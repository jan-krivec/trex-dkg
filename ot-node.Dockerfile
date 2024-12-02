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


EXPOSE 8900

RUN chmod +x ./tools/local-network-setup/setup-linux-environment.sh

# Default entrypoint with setup
ENTRYPOINT ["/bin/sh", "-c", "/bin/sleep 25 && chmod +x ./tools/local-network-setup/setup-linux-environment.sh && ./tools/local-network-setup/setup-linux-environment.sh --nodes=8"]