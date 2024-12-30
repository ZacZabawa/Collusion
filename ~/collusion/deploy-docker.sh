#!/bin/bash

# Login to Docker Hub
docker login

# Pull latest images
docker-compose -f docker-compose.prod.yml pull

# Stop existing containers
docker-compose -f docker-compose.prod.yml down

# Start new containers
docker-compose -f docker-compose.prod.yml up -d 