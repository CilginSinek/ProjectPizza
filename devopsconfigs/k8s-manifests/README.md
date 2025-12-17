# Kubernetes Deployment Guide - ProjectPizza 🍕

Bu rehber ProjectPizza uygulamasını Kubernetes cluster'ına deploy etmek için gerekli tüm adımları içerir.

## 📋 Gereksinimler

- **Kubernetes Cluster**: minikube, Docker Desktop Kubernetes, veya cloud provider (GKE, EKS, AKS)
- **kubectl**: Kubernetes CLI tool
- **Docker**: Container image'larını build etmek için
- **Make** (opsiyonel): Makefile komutları için

## 🚀 Hızlı Başlangıç

### 1. Tek komutla deploy:

```bash
make deploy
```

Bu komut otomatik olarak:
- ✅ Namespace oluşturur
- ✅ Docker image'larını build eder
- ✅ MongoDB, Backend, Frontend ve CronJob'u deploy eder
- ✅ Tüm servislerin hazır olmasını bekler
- ✅ Erişim URL'lerini gösterir

### 2. Deploy sonrası frontend'e erişim:

Deploy tamamlandığında terminal ekranında şu şekilde URL'ler gösterilecek:

```
🎉 Access Your Application 🎉
================================

Frontend (Landing Page):
  http://localhost:30002

Backend API:
  http://localhost:30001
  Health Check: http://localhost:30001/health
```

**Frontend** → `http://localhost:30002`  
**Backend** → `http://localhost:30001`

---

## 📚 Manuel Deployment

Adım adım deployment yapmak için:

### 1. Docker Image'larını Build Et

```bash
make build
# veya
./devopsconfigs/build-images.sh
```

### 2. Kubernetes Manifests'i Uygula

```bash
# Namespace oluştur
kubectl apply -f devopsconfigs/k8s-manifests/00-namespace.yaml

# Secrets ve ConfigMap
kubectl apply -f devopsconfigs/k8s-manifests/02-secrets.yaml

# MongoDB
kubectl apply -f devopsconfigs/k8s-manifests/01-mongo.yaml

# Backend
kubectl apply -f devopsconfigs/k8s-manifests/04-backend.yaml

# Frontend
kubectl apply -f devopsconfigs/k8s-manifests/05-frontend.yaml

# CronJob (cleanup)
kubectl apply -f devopsconfigs/k8s-manifests/03-cronjob-cleanup.yaml
```

### 3. Deployment Durumunu Kontrol Et

```bash
make status
# veya
kubectl get all -n pizza-app
```

---

## 🛠 Kullanışlı Komutlar

### Logları İzleme

```bash
# Backend logs
make logs-backend

# Frontend logs
make logs-frontend
```

### Port Forwarding (Alternatif Erişim)

```bash
# Frontend → http://localhost:8080
make f-frontend

# Backend → http://localhost:3000
make f-backend

# MongoDB → mongodb://localhost:27017
make f-mongo
```

### Deployment Durumu

```bash
# Tüm kaynakları görüntüle
make status

# Pod'ları listele
kubectl get pods -n pizza-app

# Servisleri listele
kubectl get svc -n pizza-app

# CronJob durumu
kubectl get cronjob -n pizza-app
```

### Temizleme

```bash
make clean
# veya
./devopsconfigs/cleanup.sh
```

---

## 🏗 Kubernetes Mimarisi

```
pizza-app namespace
├── MongoDB (StatefulSet)
│   ├── PersistentVolumeClaim (1Gi)
│   └── Service (ClusterIP:27017)
├── Backend
│   ├── Deployment (1 replica)
│   ├── PersistentVolumeClaim (2Gi - encrypted/decrypted files)
│   ├── Service (ClusterIP:80)
│   └── Service (NodePort:30001)
├── Frontend
│   ├── Deployment (1 replica)
│   └── Service (NodePort:30002)
└── CronJob (cleanup tmp files, every 6 hours)
```

---

## 🔧 Konfigürasyon

### Secrets (02-secrets.yaml)

Hassas bilgiler için:
- `jwt-secret`: JWT token şifreleme anahtarı
- `master-key`: Dosya şifreleme master key
- `mongodb-uri`: MongoDB bağlantı string'i

### ConfigMap (02-secrets.yaml)

Uygulama ayarları:
- `NODE_ENV`: production/development
- `PORT`: Backend port (3000)
- `CORS_ORIGIN`: Frontend origin URL
- `TMP_CLEANUP_HOURS`: Geçici dosyaların silinme süresi

---

## 🐛 Troubleshooting

### Pod başlamıyor?

```bash
# Pod detaylarını incele
kubectl describe pod <pod-name> -n pizza-app

# Logları kontrol et
kubectl logs <pod-name> -n pizza-app
```

### Image pull hatası?

Lokal cluster kullanıyorsanız (minikube, Docker Desktop), image'ların pull policy'si `IfNotPresent` olarak ayarlandı. Image'ları build ettikten sonra deploy edin.

### MongoDB bağlantı hatası?

```bash
# MongoDB pod'un çalıştığını kontrol et
kubectl get pods -n pizza-app -l app=mongodb

# MongoDB loglarını incele
kubectl logs -l app=mongodb -n pizza-app
```

### Frontend backend'e bağlanamıyor?

Frontend, backend'e `http://localhost:30001` üzerinden erişir (NodePort). Eğer farklı bir environment'ta çalışıyorsanız, `05-frontend.yaml` içindeki `VITE_API_URL` değerini güncelleyin.

---

## 📦 Build ve Push (Container Registry için)

Registry'e push etmek için:

```bash
# Registry ile build
./devopsconfigs/build-images.sh v1.0.0 docker.io/yourusername

# Image'ları push et
docker push docker.io/yourusername/projectpizza-backend:v1.0.0
docker push docker.io/yourusername/projectpizza-backend:latest
docker push docker.io/yourusername/projectpizza-frontend:v1.0.0
docker push docker.io/yourusername/projectpizza-frontend:latest
```

Registry kullanırken manifest dosyalarındaki `image:` değerlerini de güncellemeyi unutmayın.

---

## 🌐 Cloud Provider Deployment

### Google Kubernetes Engine (GKE)

```bash
# Cluster oluştur
gcloud container clusters create pizza-cluster --num-nodes=3

# Credentials al
gcloud container clusters get-credentials pizza-cluster

# Deploy
make deploy
```

### Amazon EKS

```bash
# Cluster oluştur
eksctl create cluster --name pizza-cluster --nodes 3

# Deploy
make deploy
```

### Azure AKS

```bash
# Cluster oluştur
az aks create --resource-group myResourceGroup --name pizza-cluster --node-count 3

# Credentials al
az aks get-credentials --resource-group myResourceGroup --name pizza-cluster

# Deploy
make deploy
```

---

## 📊 Monitoring ve Scaling

### Pod'ları scale etme

```bash
# Backend'i 3 replica yap
kubectl scale deployment backend -n pizza-app --replicas=3

# Frontend'i 2 replica yap
kubectl scale deployment frontend -n pizza-app --replicas=2
```

### Resource kullanımını görüntüleme

```bash
kubectl top pods -n pizza-app
kubectl top nodes
```

---

## ✅ Başarılı Deployment Kontrolü

Deployment'ın başarılı olduğunu doğrulamak için:

1. ✅ Tüm pod'lar `Running` durumunda
2. ✅ Backend health check: `http://localhost:30001/health` → 200 OK
3. ✅ Frontend erişilebilir: `http://localhost:30002`
4. ✅ MongoDB bağlantısı çalışıyor

```bash
# Hızlı kontrol
kubectl get pods -n pizza-app
# Tüm pod'lar Running olmalı

# Backend health check
curl http://localhost:30001/health

# Frontend kontrol
curl http://localhost:30002
```

---

**Keyifli deployment'lar! 🚀**
