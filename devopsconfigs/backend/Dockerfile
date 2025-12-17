# --- Stage 1: Builder (Derleme) ---
FROM node:20-alpine AS builder
# Bash sadece burada gerekli (npm install sırasında script çalışması için)
RUN apk add --no-cache bash
WORKDIR /app

COPY package*.json ./
COPY . .

RUN npm install --only=production

# --- Stage 2: Production (Çalışma) ---
FROM node:20-alpine
WORKDIR /app

# Builder aşamasından sadece gerekli dosyaları alıyoruz
COPY --from=builder /app .

# Create encrypted and decrypted directories for file storage
RUN mkdir -p /app/encrypted /app/decrypted && \
    chown -R node:node /app

# Healthcheck Node.js üzerinden yapılıyor (Ekstra pakete gerek yok)
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3   CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

USER node

EXPOSE 3000

CMD ["node", "index.js"]
