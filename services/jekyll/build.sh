#!/bin/bash

# Clean previous build
rm -rf _site

# Ensure all dependencies are installed
bundle install

# Build Jekyll with production settings
JEKYLL_ENV=production bundle exec jekyll build

# Optimize assets (if needed)
if [ "$JEKYLL_ENV" = "production" ]; then
  find _site/assets -type f -name "*.js" -exec uglifyjs {} -o {} \;
  find _site/assets -type f -name "*.css" -exec cleancss -o {} {} \;
fi 

# Create SVG directory if it doesn't exist
mkdir -p assets/images/svg

# Ensure SVGs are in place
if [ ! -f "assets/images/svg/organization.svg" ] || 
   [ ! -f "assets/images/svg/function.svg" ] || 
   [ ! -f "assets/images/svg/project.svg" ]; then
    echo "Error: Missing required SVG files"
    exit 1
fi 