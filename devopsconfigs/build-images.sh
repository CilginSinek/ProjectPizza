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
        -t backend-app:latest \
        -t backend-app:$VERSION \
        -f ./devopsconfigs/backend/Dockerfile \
        ./backend
    
    echo -e "${GREEN}Backend images created:${NC}"
    echo "  - backend-app:latest"
    echo "  - backend-app:$VERSION"
else
    docker build \
        -t $REGISTRY/backend-app:latest \
        -t $REGISTRY/backend-app:$VERSION \
        -f ./devopsconfigs/backend/Dockerfile \
        ./backend
    
    echo -e "${GREEN}Backend images created:${NC}"
    echo "  - $REGISTRY/backend-app:latest"
    echo "  - $REGISTRY/backend-app:$VERSION"
fi

echo ""

echo -e "${YELLOW}Building Frontend image...${NC}"
if [ -z "$REGISTRY" ]; then
    docker build \
        -t frontend-app:latest \
        -t frontend-app:$VERSION \
        -f ./devopsconfigs/frontend/Dockerfile \
        ./frontend
    
    echo -e "${GREEN}Frontend images created:${NC}"
    echo "  - frontend-app:latest"
    echo "  - frontend-app:$VERSION"
else
    docker build \
        -t $REGISTRY/frontend-app:latest \
        -t $REGISTRY/frontend-app:$VERSION \
        -f ./devopsconfigs/frontend/Dockerfile \
        ./frontend
    
    echo -e "${GREEN}Frontend images created:${NC}"
    echo "  - $REGISTRY/frontend-app:latest"
    echo "  - $REGISTRY/frontend-app:$VERSION"
fi

echo ""
echo -e "${GREEN}=================================${NC}"
echo -e "${GREEN}Build completed successfully!${NC}"
echo -e "${GREEN}=================================${NC}"
echo ""

echo -e "${YELLOW}Local images:${NC}"
docker images | grep -E "(backend-app|frontend-app)"

echo ""
echo -e "${YELLOW}Usage examples:${NC}"
echo "  Local build:  ./devopsconfigs/build-images.sh v1.0.0"
echo "  With registry: ./devopsconfigs/build-images.sh v1.0.0 docker.io/username"
echo ""

if [ ! -z "$REGISTRY" ]; then
    echo -e "${YELLOW}To push images to registry:${NC}"
    echo "  docker push $REGISTRY/backend-app:$VERSION"
    echo "  docker push $REGISTRY/backend-app:latest"
    echo "  docker push $REGISTRY/frontend-app:$VERSION"
    echo "  docker push $REGISTRY/frontend-app:latest"
fi
