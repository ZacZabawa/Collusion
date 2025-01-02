#!/bin/bash

# Stop and remove existing containers
docker-compose -f docker-compose.dev.yml down

# Pull latest changes from git
git pull origin main

# Build and start containers
docker-compose -f docker-compose.dev.yml up -d --build

# Wait for services to start
sleep 10

# Check if services are running
if curl -s http://localhost:4000 >/dev/null; then
    echo "Development environment running at http://localhost:4000"
    echo "Syncthing UI available at http://localhost:8384"
else
    echo "Services failed to start"
    docker-compose -f docker-compose.dev.yml logs
    exit 1
fi 