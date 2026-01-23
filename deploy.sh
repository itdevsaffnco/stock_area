#!/bin/bash

# Stock Area Production Deployment Script
# Usage: ./deploy.sh

set -e

echo "🚀 Starting Stock Area Production Deployment..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! docker ps > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Building Docker images...${NC}"

# Build Backend Image
echo -e "${YELLOW}Building backend image...${NC}"
docker build -t itsaffnco/saffnco_stock_sales_backend:latest ./backend

# Build Frontend Image
echo -e "${YELLOW}Building frontend image...${NC}"
docker build -t itsaffnco/saffnco_stock_sales_frontend:latest ./frontend

echo -e "${YELLOW}🔄 Pushing images to registry...${NC}"

# Push Backend Image
docker push itsaffnco/saffnco_stock_sales_backend:latest

# Push Frontend Image
docker push itsaffnco/saffnco_stock_sales_frontend:latest

echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"

# Stop and remove existing containers
docker-compose -f docker-compose.prod.yml down || true

echo -e "${YELLOW}🚀 Starting new containers...${NC}"

# Start new containers
docker-compose -f docker-compose.prod.yml up -d

echo -e "${YELLOW}⏳ Waiting for services to be healthy...${NC}"

# Wait for services to be ready
sleep 10

# Check service health
if docker-compose -f docker-compose.prod.yml ps | grep -q "healthy"; then
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo -e "${GREEN}Frontend: https://stockarea.saffnco.app${NC}"
    echo -e "${GREEN}Backend: https://20.20.0.40:5000${NC}"
else
    echo -e "${RED}⚠️  Some services may not be healthy. Check logs:${NC}"
    docker-compose -f docker-compose.prod.yml logs
    exit 1
fi

echo -e "${GREEN}🎉 Deployment complete!${NC}"
