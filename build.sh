#!/bin/bash

# Clean previous build
rm -rf _site

# Build Jekyll with production settings
JEKYLL_ENV=production bundle exec jekyll build

# Optimize assets
find _site/assets -type f -name "*.js" -exec uglifyjs {} -o {} \;
find _site/assets -type f -name "*.css" -exec cleancss -o {} {} \; 