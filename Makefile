# Project Pizza Makefile
# Usage: make [command] (e.g., make deploy, make help)

.PHONY: deploy clean build logs-backend logs-frontend f-backend f-frontend f-mongo status help

# ℹ️ HELP: Show available commands
help:
	@echo "Available commands:"
	@echo "  make deploy        - Setup and start the system"
	@echo "  make clean         - Remove deployment and resources"
	@echo "  make build         - Build Docker images only"
	@echo "  make status        - Show all pods and services status"
	@echo "  make logs-backend  - Watch Backend logs live"
	@echo "  make logs-frontend - Watch Frontend logs live"
	@echo "  make f-frontend    - Tunnel to Frontend (http://localhost:8080)"
	@echo "  make f-backend     - Tunnel to Backend (http://localhost:3000)"
	@echo "  make f-mongo       - Tunnel to MongoDB (localhost:27017)"

# 🚀 DEPLOY
deploy:
	chmod +x devopsconfigs/deploy.sh
	./devopsconfigs/deploy.sh

# 🧹 CLEAN
clean:
	chmod +x devopsconfigs/cleanup.sh
	./devopsconfigs/cleanup.sh

# 🐳 BUILD
build:
	chmod +x devopsconfigs/build-images.sh
	./devopsconfigs/build-images.sh

# 📊 STATUS
status:
	kubectl get all -n pizza-app

# 📜 LOGS
logs-backend:
	@echo "Watching Backend logs..."
	kubectl logs -f -l app=backend -n pizza-app

logs-frontend:
	@echo "Watching Frontend logs..."
	kubectl logs -f -l app=frontend -n pizza-app

# 🔌 PORT-FORWARDS
f-frontend:
	@echo "Opening Frontend tunnel: http://localhost:8080"
	kubectl port-forward svc/frontend-service 8080:80 -n pizza-app

f-backend:
	@echo "Opening Backend tunnel: http://localhost:3000"
	kubectl port-forward svc/backend-service 3000:80 -n pizza-app

f-mongo:
	@echo "Opening MongoDB tunnel: mongodb://localhost:27017"
	kubectl port-forward svc/mongodb-service 27017:27017 -n pizza-app
