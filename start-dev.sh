#!/bin/bash

source "$(dirname "${BASH_SOURCE[0]}")/scripts/logging.sh"

# Check Docker
if ! docker info >/dev/null 2>&1; then
    log $LOG_ERROR "Docker is not running"
    exit 1
fi

# Load environment variables
set -a
source .env.dev
set +a

# Start development services
log $LOG_INFO "Starting development environment..."
docker-compose -f docker-compose.dev.yml up -d

# Wait for services
sleep 5

# Check if services are running
if curl -s http://localhost:$HOST_PORT >/dev/null; then
    log $LOG_INFO "Development environment running at http://localhost:$HOST_PORT"
    log $LOG_INFO "Syncthing UI available at http://localhost:8384"
else
    log $LOG_ERROR "Services failed to start"
    docker-compose -f docker-compose.dev.yml logs
    exit 1
fi 