FROM node:18-bullseye

WORKDIR /app/dkg-evm-module

COPY ./dkg-evm-module/package*.json ./
RUN npm install
COPY ./dkg-evm-module ./