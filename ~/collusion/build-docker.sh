#!/bin/bash

# Set variables
DOCKER_USERNAME="zzdesigns"
VERSION=$(date +%Y%m%d_%H%M%S)

# Build images
docker build -t $DOCKER_USERNAME/collusion:$VERSION -t $DOCKER_USERNAME/collusion:latest .

# Push to Docker Hub
docker push $DOCKER_USERNAME/collusion:$VERSION
docker push $DOCKER_USERNAME/collusion:latest 