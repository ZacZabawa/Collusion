#!/bin/bash

# Log levels
LOG_ERROR=0
LOG_WARN=1
LOG_INFO=2
LOG_DEBUG=3

# Colors
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging function
log() {
    local level=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local log_file="deployment.log"

    case $level in
        $LOG_ERROR)
            echo -e "${RED}[ERROR]${NC} ${timestamp} - ${message}" | tee -a "$log_file"
            ;;
        $LOG_WARN)
            echo -e "${YELLOW}[WARN]${NC} ${timestamp} - ${message}" | tee -a "$log_file"
            ;;
        $LOG_INFO)
            echo -e "${GREEN}[INFO]${NC} ${timestamp} - ${message}" | tee -a "$log_file"
            ;;
        $LOG_DEBUG)
            echo -e "${BLUE}[DEBUG]${NC} ${timestamp} - ${message}" | tee -a "$log_file"
            ;;
    esac
}

# Error handling function
handle_error() {
    local exit_code=$?
    local error_message=$1
    
    if [ $exit_code -ne 0 ]; then
        log $LOG_ERROR "$error_message (Exit code: $exit_code)"
        exit $exit_code
    fi
} 