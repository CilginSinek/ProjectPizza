#!/bin/bash

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}=================================${NC}"
echo -e "${GREEN}ProjectPizza Kubernetes Deployment${NC}"
echo -e "${GREEN}=================================${NC}"
echo ""

NAMESPACE="pizza-app"
echo -e "${YELLOW}Checking namespace...${NC}"
if ! kubectl get namespace $NAMESPACE &> /dev/null; then
    echo -e "${YELLOW}Creating namespace: $NAMESPACE${NC}"
    kubectl apply -f ./devopsconfigs/k8s-manifests/00-namespace.yaml
else
    echo -e "${GREEN}Namespace exists: $NAMESPACE${NC}"
fi

echo -e "${YELLOW}Building Docker images...${NC}"
echo "Building backend..."
docker build -t projectpizza-backend:latest -f ./devopsconfigs/backend/Dockerfile ./devopsconfigs/backend

echo "Building frontend..."
docker build -t projectpizza-frontend:latest -f ./devopsconfigs/frontend/Dockerfile ./devopsconfigs/frontend

echo -e "${GREEN}Docker images built successfully!${NC}"
echo ""

echo -e "${YELLOW}Applying Kubernetes manifests...${NC}"

echo "Applying secrets and configmaps..."
kubectl apply -f ./devopsconfigs/k8s-manifests/02-secrets.yaml

echo "Deploying MongoDB..."
kubectl apply -f ./devopsconfigs/k8s-manifests/01-mongo.yaml

echo "Waiting for MongoDB to be ready..."
kubectl wait --for=condition=ready pod -l app=mongodb -n $NAMESPACE --timeout=120s

echo "Deploying Backend..."
kubectl apply -f ./devopsconfigs/k8s-manifests/04-backend.yaml

echo "Waiting for Backend to be ready..."
kubectl wait --for=condition=ready pod -l app=backend -n $NAMESPACE --timeout=120s

echo "Deploying Frontend..."
kubectl apply -f ./devopsconfigs/k8s-manifests/05-frontend.yaml

echo "Waiting for Frontend to be ready..."
kubectl wait --for=condition=ready pod -l app=frontend -n $NAMESPACE --timeout=120s

echo "Deploying CronJob..."
kubectl apply -f ./devopsconfigs/k8s-manifests/03-cronjob-cleanup.yaml

echo ""
echo -e "${GREEN}=================================${NC}"
echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${GREEN}=================================${NC}"
echo ""

echo -e "${YELLOW}Services status:${NC}"
kubectl get svc -n $NAMESPACE

echo ""
echo -e "${YELLOW}Pods status:${NC}"
kubectl get pods -n $NAMESPACE

echo ""
echo -e "${YELLOW}CronJob status:${NC}"
kubectl get cronjob -n $NAMESPACE

echo ""
echo -e "${GREEN}=================================${NC}"
echo -e "${GREEN}🎉 Access Your Application 🎉${NC}"
echo -e "${GREEN}=================================${NC}"
echo ""

# Get NodePort for frontend
FRONTEND_PORT=$(kubectl get svc frontend-service -n $NAMESPACE -o jsonpath='{.spec.ports[0].nodePort}')
BACKEND_PORT=$(kubectl get svc backend-nodeport -n $NAMESPACE -o jsonpath='{.spec.ports[0].nodePort}')

echo -e "${BLUE}Frontend (Landing Page):${NC}"
echo -e "  ${GREEN}http://localhost:${FRONTEND_PORT}${NC}"
echo ""
echo -e "${BLUE}Backend API:${NC}"
echo -e "  ${GREEN}http://localhost:${BACKEND_PORT}${NC}"
echo -e "  Health Check: ${GREEN}http://localhost:${BACKEND_PORT}/health${NC}"
echo ""

echo -e "${YELLOW}📋 Useful Commands:${NC}"
echo ""
echo -e "${YELLOW}View logs:${NC}"
echo "  make logs-backend   # Backend logs"
echo "  make logs-frontend  # Frontend logs"
echo ""
echo -e "${YELLOW}Port forwarding (use standard ports):${NC}"
echo "  make f-frontend     # http://localhost:8080"
echo "  make f-backend      # http://localhost:3000"
echo "  make f-mongo        # mongodb://localhost:27017"
echo ""
echo -e "${YELLOW}Check status:${NC}"
echo "  make status         # All resources"
echo ""
echo -e "${YELLOW}Clean up:${NC}"
echo "  make clean          # Remove deployment"
echo ""
