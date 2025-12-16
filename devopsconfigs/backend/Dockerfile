#get alphine image an build
FROM node:20-alphine AS builder
WORKDIR /app

COPY package*.json ./

COPY  . .

RUN if [-f package.json ]; then npm ci; fi

FROM node:20-alphine
WORKDIR /app

COPY --from=builder /app .

USER node

EXPOSE 3000 
#! daha sonra ayarlanıcak

CMD [ "node", "src/index.js" ]