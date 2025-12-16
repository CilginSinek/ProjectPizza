#get alphine image an build
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./

COPY  . .

RUN npm ci --only=production

FROM node:20-alpine
WORKDIR /app

COPY --from=builder /app .

RUN chown -R node:node /app

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

USER node

EXPOSE 3000 
#! daha sonra ayarlanıcak

CMD ["node", "src/index.js"]