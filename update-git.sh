#!/bin/bash

# Source logging utilities
source "$(dirname "${BASH_SOURCE[0]}")/scripts/logging.sh"

# Check if there are changes to commit
if [ -z "$(git status --porcelain)" ]; then
    log $LOG_INFO "No changes to commit"
    exit 0
fi

# Show current changes
log $LOG_INFO "Current changes:"
git status -s

# Prompt for commit message
read -p "Enter commit message: " commit_message

# Add all changes
log $LOG_INFO "Adding changes..."
git add .

# Commit changes
log $LOG_INFO "Committing changes..."
git commit -m "$commit_message"

# Push to remote
log $LOG_INFO "Pushing to remote..."
git push origin main

# Check if push was successful
if [ $? -eq 0 ]; then
    log $LOG_INFO "Successfully pushed changes to remote"
    
    # Run development deployment if requested
    read -p "Deploy to development environment? (y/n): " deploy_answer
    if [[ $deploy_answer == "y" ]]; then
        ./deploy-dev.sh
    fi
else
    log $LOG_ERROR "Failed to push changes"
    exit 1
fi 