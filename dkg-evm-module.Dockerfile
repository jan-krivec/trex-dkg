FROM node:18-bullseye

WORKDIR /app/dkg-evm-module

COPY ./dkg-evm-module/package*.json ./
COPY ./dkg-evm-module ./
RUN npm install