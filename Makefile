# Project Pizza Makefile
# Usage: make [command] (e.g., make deploy, make help)

# ℹ️ HELP: Show available commands
help:
	@echo "Available commands:"
	@echo "  make deploy        - Setup and start the system"
	@echo "  make stop          - Stop all Kubernetes resources (keeps data)"
	@echo "  make delete-all    - Delete entire namespace (complete cleanup)"
	@echo "  make clean         - Remove deployment (alternative)"
	@echo "  make build         - Build Docker images only"
	@echo "  make status        - Show all pods and services status"
	@echo "  make logs-backend  - Watch Backend logs live"
	@echo "  make logs-frontend - Watch Frontend logs live"
	@echo "  make f-frontend    - Port-forward Frontend (http://localhost:8080)"
	@echo "  make f-backend     - Port-forward Backend (http://localhost:3000)"
	@echo "  make f-mongo       - Port-forward MongoDB (localhost:27017)"
	@echo "  make mongo-shell   - Open MongoDB shell"
	@echo "  make mongo-logs    - View last 20 user activity logs from MongoDB"
	@echo "  make user-logs     - Fetch user logs via API (TOKEN=xxx make user-logs)"

# 🚀 DEPLOY
deploy:
	chmod +x devopsconfigs/deploy.sh
	./devopsconfigs/deploy.sh

# 🛑 STOP (Stop all Kubernetes resources)
stop:
	@echo "⚠️  Stopping all Kubernetes resources..."
	@echo "This will delete all pods, services, and deployments in pizza-app namespace"
	@echo "Data in PersistentVolumes will be preserved"
	kubectl delete deployment --all -n pizza-app
	kubectl delete service --all -n pizza-app
	kubectl delete cronjob --all -n pizza-app
	@echo "✅ All resources stopped! Use 'make deploy' to restart."

# 🗑️ DELETE ALL (Complete cleanup)
delete-all:
	@echo "⚠️  Deleting pizza-app namespace and all resources..."
	kubectl delete namespace pizza-app --ignore-not-found=true
	@echo "✅ Cleanup completed!"

# 🧹 CLEAN (Alternative using script)
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
	@echo "Opening Frontend: http://localhost:8080"
	kubectl port-forward svc/frontend-service 8080:80 -n pizza-app

f-backend:
	@echo "Opening Backend: http://localhost:3000"
	kubectl port-forward svc/backend-service 3000:80 -n pizza-app

f-mongo:
	@echo "Opening MongoDB: mongodb://localhost:27017"
	kubectl port-forward svc/mongodb-service 27017:27017 -n pizza-app

# 🗄️ MONGODB ACCESS
mongo-shell:
	@echo "Opening MongoDB shell..."
	@POD=$$(kubectl get pod -l app=mongodb -n pizza-app -o jsonpath='{.items[0].metadata.name}'); \
	kubectl exec -it $$POD -n pizza-app -- mongo projectpizza

mongo-logs:
	@echo "Viewing user activity logs from MongoDB..."
	@POD=$$(kubectl get pod -l app=mongodb -n pizza-app -o jsonpath='{.items[0].metadata.name}'); \
	kubectl exec -it $$POD -n pizza-app -- mongo projectpizza --eval "db.eventlogs.find().sort({timestamp: -1}).limit(20).pretty()"

# 📊 USER LOGS (via API)
user-logs:
	@echo "Fetching user logs via API (requires authentication token)..."
	@echo "Usage: TOKEN=your_jwt_token make user-logs"
	@if [ -z "$$TOKEN" ]; then \
		echo "Error: TOKEN environment variable not set"; \
		echo "Example: TOKEN=eyJhbGc... make user-logs"; \
		exit 1; \
	fi
	@curl -H "Authorization: Bearer $$TOKEN" http://localhost:3000/api/logs/my-logs | jq .

# .PHONY declaration (all targets)
.PHONY: deploy stop clean delete-all build logs-backend logs-frontend f-backend f-frontend f-mongo mongo-shell mongo-logs user-logs status help
