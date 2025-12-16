#!/bin/bash

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

NAMESPACE="pizza-app"

echo -e "${RED}=================================${NC}"
echo -e "${RED}ProjectPizza Cleanup${NC}"
echo -e "${RED}=================================${NC}"
echo ""

read -p "Are you sure you want to delete all resources in namespace '$NAMESPACE'? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo -e "${YELLOW}Cleanup cancelled.${NC}"
    exit 0
fi

echo -e "${YELLOW}Deleting all resources in namespace: $NAMESPACE${NC}"

kubectl delete -f ./devopsconfigs/k8s-manifests/03-cronjob-cleanup.yaml -n $NAMESPACE --ignore-not-found=true

kubectl delete -f ./devopsconfigs/frontend/frontend.yaml -n $NAMESPACE --ignore-not-found=true

kubectl delete -f ./devopsconfigs/backend/backend.yaml -n $NAMESPACE --ignore-not-found=true

kubectl delete -f ./devopsconfigs/k8s-manifests/01-mongo.yaml -n $NAMESPACE --ignore-not-found=true

kubectl delete -f ./devopsconfigs/k8s-manifests/02-secrets.yaml -n $NAMESPACE --ignore-not-found=true

echo ""
read -p "Do you want to delete the namespace '$NAMESPACE' as well? (yes/no): " delete_ns

if [ "$delete_ns" = "yes" ]; then
    kubectl delete namespace $NAMESPACE --ignore-not-found=true
    echo -e "${GREEN}Namespace deleted.${NC}"
fi

echo ""
echo -e "${GREEN}Cleanup completed!${NC}"
