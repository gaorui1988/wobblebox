FROM node:22-bookworm-slim AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm config set registry http://mirrors.tencentyun.com/npm/ && npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine

COPY deploy/container-nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
