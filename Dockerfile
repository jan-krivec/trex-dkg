# Use an official Node.js runtime as a parent image
FROM node:18-bullseye

# Set up the working directory
WORKDIR /app

# Install dependencies and utilities including netcat-openbsd
RUN apt-get update && \
    apt-get install -y \
    curl \
    wget \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# First, handle dkg-evm-module
WORKDIR /app/dkg-evm-module
COPY ./dkg-evm-module/package*.json ./
RUN npm install
COPY ./dkg-evm-module ./

# Then, handle ot-node-docker with a clean workspace
WORKDIR /app/ot-node-docker
COPY ./ot-node-docker/package*.json ./
RUN npm install

# Preprare dkg.js library
WORKDIR /app/dkg.js
COPY ./dkg.js/package*.json ./
RUN npm install

# Preprare fronternd
WORKDIR /app/app
COPY ./app/package*.json ./
RUN npm install

# Copy the rest of ot-node-docker files
COPY ./ot-node-docker ./

# Create a symbolic link to dkg-evm-module as dkg-evm-module
RUN if [ -e node_modules/dkg-evm-module ] || [ -L node_modules/dkg-evm-module ]; then \
    rm -rf node_modules/dkg-evm-module; \
    fi && \
    ln -s /app/dkg-evm-module node_modules/dkg-evm-module

# Expose the ot-node-docker application port
EXPOSE 8900

# Make setup script executable
RUN chmod +x ./tools/local-network-setup/setup-linux-environment.sh
