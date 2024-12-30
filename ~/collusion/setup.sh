#!/bin/bash

# Create base directories
mkdir -p /srv/collusion/{services,vault,shared,data,site}

# Create parser service structure
mkdir -p /srv/collusion/services/parser/src/{handlers,utils}

# Create Jekyll service structure
mkdir -p /srv/collusion/services/jekyll/{_data,_layouts,_includes,_posts,assets}

# Create Syncthing service structure
mkdir -p /srv/collusion/services/syncthing/{config,data}

# Create data directories
mkdir -p /srv/collusion/data/{redis,rabbitmq}

# Set permissions
chmod 755 /srv/collusion/vault
chmod 777 /srv/collusion/shared  # Needs write access from multiple services
chmod 755 /srv/collusion/site
chmod 755 /srv/collusion/services/syncthing/config

# Create empty files
touch /srv/collusion/shared/post_urls.json
touch /srv/collusion/shared/notes_hierarchical_with_urls.json

# Initialize empty JSON files
echo '{}' > /srv/collusion/shared/post_urls.json
echo '[]' > /srv/collusion/shared/notes_hierarchical_with_urls.json

# Create symlinks for Jekyll
ln -s /srv/collusion/shared/post_urls.json /srv/collusion/services/jekyll/_data/
ln -s /srv/collusion/shared/notes_hierarchical_with_urls.json /srv/collusion/services/jekyll/_data/

# Initialize Syncthing config
cat > /srv/collusion/services/syncthing/config/config.xml << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<configuration version="30">
    <folder id="mrl9p-vvxsg"
            label="Obsidian Vault"
            path="/var/syncthing/Vault"
            type="sendreceive"
            rescanIntervalS="3600"
            fsWatcherEnabled="true"
            fsWatcherDelayS="10"
            ignorePerms="false"
            autoNormalize="true">
        <filesystemType>basic</filesystemType>
        <device id="default"></device>
        <minDiskFree unit="%">1</minDiskFree>
        <versioning>
            <type>simple</type>
            <param key="keep" val="5"/>
        </versioning>
        <copiers>0</copiers>
        <pullerMaxPendingKiB>0</pullerMaxPendingKiB>
        <hashers>0</hashers>
        <order>random</order>
        <ignoreDelete>false</ignoreDelete>
        <scanProgressIntervalS>0</scanProgressIntervalS>
        <pullerPauseS>0</pullerPauseS>
        <maxConflicts>10</maxConflicts>
        <disableSparseFiles>false</disableSparseFiles>
        <disableTempIndexes>false</disableTempIndexes>
        <paused>false</paused>
        <weakHashThresholdPct>25</weakHashThresholdPct>
        <markerName>.stfolder</markerName>
    </folder>
</configuration>
EOF

# Set proper permissions for Syncthing config
chmod 600 /srv/collusion/services/syncthing/config/config.xml 