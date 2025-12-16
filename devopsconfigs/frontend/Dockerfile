FROM node:20-alphine AS builder
WORKDIR /app

COPY . .

RUN if [-f package.json ]; then npm install && npm run build; fi

FROM nginx:alphine

COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80
#! buda sonra ayarlanıcak

CMD [ "nginx", "-g", "daemon off;" ]