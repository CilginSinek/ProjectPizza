#!/bin/bash

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

VERSION=${1:-"v1.0.0"}
REGISTRY=${2:-""}

echo -e "${GREEN}=================================${NC}"
echo -e "${GREEN}Building Docker Images${NC}"
echo -e "${GREEN}Version: $VERSION${NC}"
echo -e "${GREEN}=================================${NC}"
echo ""

echo -e "${YELLOW}Building Backend image...${NC}"
if [ -z "$REGISTRY" ]; then
    docker build \
        -t projectpizza-backend:latest \
        -t projectpizza-backend:$VERSION \
        -f ./devopsconfigs/backend/Dockerfile \
        ./devopsconfigs/backend
    
    echo -e "${GREEN}Backend images created:${NC}"
    echo "  - projectpizza-backend:latest"
    echo "  - projectpizza-backend:$VERSION"
else
    docker build \
        -t $REGISTRY/projectpizza-backend:latest \
        -t $REGISTRY/projectpizza-backend:$VERSION \
        -f ./devopsconfigs/backend/Dockerfile \
        ./devopsconfigs/backend
    
    echo -e "${GREEN}Backend images created:${NC}"
    echo "  - $REGISTRY/projectpizza-backend:latest"
    echo "  - $REGISTRY/projectpizza-backend:$VERSION"
fi

echo ""

echo -e "${YELLOW}Building Frontend image...${NC}"
if [ -z "$REGISTRY" ]; then
    docker build \
        -t projectpizza-frontend:latest \
        -t projectpizza-frontend:$VERSION \
        -f ./devopsconfigs/frontend/Dockerfile \
        ./devopsconfigs/frontend
    
    echo -e "${GREEN}Frontend images created:${NC}"
    echo "  - projectpizza-frontend:latest"
    echo "  - projectpizza-frontend:$VERSION"
else
    docker build \
        -t $REGISTRY/projectpizza-frontend:latest \
        -t $REGISTRY/projectpizza-frontend:$VERSION \
        -f ./devopsconfigs/frontend/Dockerfile \
        ./devopsconfigs/frontend
    
    echo -e "${GREEN}Frontend images created:${NC}"
    echo "  - $REGISTRY/projectpizza-frontend:latest"
    echo "  - $REGISTRY/projectpizza-frontend:$VERSION"
fi

echo ""
echo -e "${GREEN}=================================${NC}"
echo -e "${GREEN}Build completed successfully!${NC}"
echo -e "${GREEN}=================================${NC}"
echo ""

echo -e "${YELLOW}Local images:${NC}"
docker images | grep -E "(projectpizza-backend|projectpizza-frontend)"

echo ""
echo -e "${YELLOW}Usage examples:${NC}"
echo "  Local build:  ./devopsconfigs/build-images.sh v1.0.0"
echo "  With registry: ./devopsconfigs/build-images.sh v1.0.0 docker.io/username"
echo ""

if [ ! -z "$REGISTRY" ]; then
    echo -e "${YELLOW}To push images to registry:${NC}"
    echo "  docker push $REGISTRY/projectpizza-backend:$VERSION"
    echo "  docker push $REGISTRY/projectpizza-backend:latest"
    echo "  docker push $REGISTRY/projectpizza-frontend:$VERSION"
    echo "  docker push $REGISTRY/projectpizza-frontend:latest"
fi
