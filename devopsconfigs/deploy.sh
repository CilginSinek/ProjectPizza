#!/bin/bash

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}=================================${NC}"
echo -e "${GREEN}ProjectPizza Kubernetes Deployment${NC}"
echo -e "${GREEN}=================================${NC}"
echo ""

NAMESPACE="pizza-app"
echo -e "${YELLOW}Checking namespace...${NC}"
if ! kubectl get namespace $NAMESPACE &> /dev/null; then
    echo -e "${YELLOW}Creating namespace: $NAMESPACE${NC}"
    kubectl create namespace $NAMESPACE
else
    echo -e "${GREEN}Namespace exists: $NAMESPACE${NC}"
fi

echo -e "${YELLOW}Building Docker images...${NC}"
echo "Building devopsconfigs/backend..."
docker build -t devopsconfigs/backend-app:latest -f ./devopsconfigs/backend/Dockerfile ./devopsconfigs/backend

echo "Building devopsconfigs/frontend..."
docker build -t devopsconfigs/frontend-app:latest -f ./devopsconfigs/frontend/Dockerfile ./devopsconfigs/frontend

echo -e "${GREEN}Docker images built successfully!${NC}"
echo ""

echo -e "${YELLOW}Applying Kubernetes manifests...${NC}"

echo "Applying secrets and configmaps..."
kubectl apply -f ./devopsconfigs/k8s-manifests/02-secrets.yaml -n $NAMESPACE

echo "Deploying MongoDB..."
kubectl apply -f ./devopsconfigs/k8s-manifests/01-mongo.yaml -n $NAMESPACE

echo "Waiting for MongoDB to be ready..."
kubectl wait --for=condition=ready pod -l app=mongodb -n $NAMESPACE --timeout=120s

echo "Deploying Backend..."
kubectl apply -f ./devopsconfigs/backend/backend.yaml -n $NAMESPACE

echo "Waiting for Backend to be ready..."
kubectl wait --for=condition=ready pod -l app=backend -n $NAMESPACE --timeout=120s

echo "Deploying Frontend..."
kubectl apply -f ./devopsconfigs/frontend/frontend.yaml -n $NAMESPACE

echo "Deploying CronJob..."
kubectl apply -f ./devopsconfigs/k8s-manifests/03-cronjob-cleanup.yaml -n $NAMESPACE

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
echo -e "${YELLOW}HPA status:${NC}"
kubectl get hpa -n $NAMESPACE

echo ""
echo -e "${YELLOW}CronJob status:${NC}"
kubectl get cronjob -n $NAMESPACE

echo ""
echo -e "${GREEN}Access URLs:${NC}"
echo -e "Frontend: ${GREEN}http://localhost (LoadBalancer)${NC}"
echo -e "Backend:  ${GREEN}http://localhost/api (via Nginx)${NC}"
echo ""
echo -e "${YELLOW}To check logs:${NC}"
echo "kubectl logs -f deployment/devopsconfigs/backend -n $NAMESPACE"
echo "kubectl logs -f deployment/devopsconfigs/frontend -n $NAMESPACE"
echo ""
echo -e "${YELLOW}To delete deployment:${NC}"
echo "./devopsconfigs/cleanup.sh"
