#!/bin/bash

# Navigate to dev directory
cd ~/collusion-dev

# Stash any local changes
git stash

# Pull latest changes
git pull origin main

# Run deployment script
./deploy-dev.sh 