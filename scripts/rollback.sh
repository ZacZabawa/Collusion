#!/bin/bash

# Source logging functions
source "$(dirname "${BASH_SOURCE[0]}")/logging.sh"

# Create backup directory if it doesn't exist
BACKUP_DIR="backups"
mkdir -p "$BACKUP_DIR"

# Create backup of site files
create_backup() {
    local source_dir=$1
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$BACKUP_DIR/site_backup_${timestamp}.tar.gz"
    
    log $LOG_INFO "Creating backup of $source_dir"
    tar -czf "$backup_file" -C "$source_dir" .
    
    if [ $? -eq 0 ]; then
        log $LOG_INFO "Backup created: $backup_file"
        echo "$backup_file"
    else
        log $LOG_ERROR "Backup creation failed"
        return 1
    fi
}

# Restore from backup
restore_backup() {
    local backup_file=$1
    local target_dir=$2
    
    if [ ! -f "$backup_file" ]; then
        log $LOG_ERROR "Backup file not found: $backup_file"
        return 1
    fi
    
    log $LOG_INFO "Restoring from backup: $backup_file"
    rm -rf "${target_dir:?}"/*
    tar -xzf "$backup_file" -C "$target_dir"
    
    if [ $? -eq 0 ]; then
        log $LOG_INFO "Restore completed successfully"
        return 0
    else
        log $LOG_ERROR "Restore failed"
        return 1
    fi
}

# Clean old backups (keep last 5)
clean_old_backups() {
    log $LOG_INFO "Cleaning old backups..."
    ls -t "$BACKUP_DIR"/site_backup_*.tar.gz 2>/dev/null | tail -n +6 | xargs -r rm
} 