# 🚀 Quick Start Guide - ProjectPizza Frontend

## Hızlı Başlangıç

```bash
# 1. Dependencies yükle
npm install

# 2. Environment dosyası oluştur
cp .env.example .env

# 3. Development server'ı başlat (Port 4000'de açılır)
npm run dev

# Tarayıcıda aç: http://localhost:4000
```

## Build & Test

```bash
# Production build
npm run build

# Build preview
npm run preview

# Lint kontrolü
npm run lint
```

## Önemli Bilgiler

### Port Konfigürasyonu ⚠️
- **Frontend**: Port `4000` (DEĞİŞTİRMEYİN!)
- **Backend**: Port `3000`
- **API Proxy**: `/api` otomatik olarak `http://localhost:3000/api`'ye yönlendirilir

### API Kullanımı

**Option 1: Fetch-based (Mevcut)**
```typescript
import { apiService } from './services/api';

const response = await apiService.post('/api/auth/login', {
  username: 'test',
  password: 'test123'
});

if (response.status === 'success') {
  console.log('Success!', response.data);
}
```

**Option 2: Axios-based**
```typescript
import { apiServiceAxios } from './services/api-axios';

const response = await apiServiceAxios.post('/api/auth/login', {
  username: 'test',
  password: 'test123'
});

if (response.status === 'success') {
  console.log('Success!', response.data);
}
```

### Environment Variables

`.env` dosyası:
```env
VITE_API_URL=http://localhost:3000
```

Kullanımı:
```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

## Pages (Sayfalar)

- `/` - Landing page
- `/login` - Giriş sayfası
- `/register` - Kayıt sayfası
- `/dashboard` - Dashboard (auth required)
- `/upload` - Dosya yükleme (auth required)
- `/d/:fileId` - Dosya indirme

## Backend Integration

Backend API format:
```typescript
// Success Response
{
  status: "success",
  data: { ... },
  message: "Success message"
}

// Error Response
{
  status: "error",
  message: "Error message"
}
```

## Docker

```bash
# Tüm projeyi Docker ile çalıştır
cd /path/to/ProjectPizza
docker-compose up -d

# Frontend logs
docker-compose logs -f frontend

# Stop
docker-compose down
```

## Common Issues

### Port 4000 already in use
```bash
lsof -i :4000
kill -9 <PID>
```

### Build failed
```bash
rm -rf node_modules dist .vite
npm install
npm run build
```

### API calls failing
1. Backend'in çalıştığından emin olun (port 3000)
2. CORS ayarlarını kontrol edin
3. `.env` dosyasında `VITE_API_URL` doğru mu kontrol edin

## DevOps ⚠️

- ❌ `vite.config.ts` içindeki port'u değiştirmeyin (4000 olmalı)
- ❌ `outDir` değiştirmeyin ('dist' olmalı)
- ❌ `host: true` satırını silmeyin (Docker için gerekli)
- ❌ `devopsconfigs/` klasörüne dokunmayın

---

**Detaylı bilgi için**: `DEVOPS-REQUIREMENTS.md` ve `INTEGRATION.md` dosyalarını inceleyin.
