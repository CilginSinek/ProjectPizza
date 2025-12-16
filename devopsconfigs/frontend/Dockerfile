FROM node:20-alpine AS builder
WORKDIR /app

COPY . .

RUN if [ -f package.json ]; then npm install && npm run build; fi

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/ || exit 1

EXPOSE 8080
#! buda sonra ayarlanıcak

CMD [ "nginx", "-g", "daemon off;" ]