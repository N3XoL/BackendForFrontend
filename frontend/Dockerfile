FROM node:lts-alpine AS build-stage

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENTRYPOINT ["npm", "run", "dev", "--", "--host"]