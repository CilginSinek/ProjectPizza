# --- Stage 1: Builder ---
FROM node:20-alpine AS builder
WORKDIR /app

# 1. ADIM: Sadece paket dosyalarini kopyala (Cache'i kullanabilmek icin)
COPY package*.json ./

# 2. ADIM: Paketleri yukle (package.json degismedigi surece burasi CACHE'den gelir, cok hizli gecer)
RUN npm install

# 3. ADIM: Simdi kaynak kodlari kopyala (Kod degisince sadece burasi ve sonrasi calisir)
COPY . .

# 4. ADIM: Build al (API URL'i iceri gomerek)
RUN VITE_API_URL=http://localhost:3000 npm run build

# --- Stage 2: Production (Nginx) ---
FROM nginx:alpine

# Builder asamasindan cikan 'dist' klasorunu al
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx template'ini kopyala
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Environment variable default değeri
ENV BACKEND_HOST=backend:3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --retries=3   CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
