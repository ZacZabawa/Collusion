const matter = require('gray-matter');
const fs = require('fs');
const path = require('path');
const { logToFile } = require('../utils/logger');

function normalizeString(str) {
    return str.toLowerCase()
              .replace(/[^a-z0-9\s-]/g, '')
              .replace(/\s+/g, '-')
              .replace(/-+/g, '-')
              .trim();
}

async function processVault(data, redis) {
    const { type, path: filePath } = data;
    
    if (path.extname(filePath) !== '.md') return;
    
    logToFile(`Processing vault file: ${filePath}`);
    
    try {
        const rawContent = fs.readFileSync(filePath, 'utf-8');
        const parsedContent = matter(rawContent);
        
        if (parsedContent.data.visibility === 'public') {
            logToFile(`Processing public note: ${parsedContent.data.title}`);
            
            // Remove media tags from content
            parsedContent.data.content = removeMediaTags(parsedContent.content);
            
            // Generate URL
            const dateStr = new Date(parsedContent.data.datetimeCreate)
                .toISOString()
                .split('T')[0]
                .replace(/-/g, '/');
            const normalizedTitle = normalizeString(parsedContent.data.title);
            parsedContent.data.url = `/${dateStr}/${normalizedTitle}.html`;
            
            // Store in Redis
            await redis.hset(
                'notes',
                parsedContent.data.title,
                JSON.stringify(parsedContent.data)
            );
            logToFile(`Stored in Redis: ${parsedContent.data.title}`);
            
            // Update post_urls.json
            let postUrls = {};
            try {
                postUrls = JSON.parse(fs.readFileSync('/shared/post_urls.json', 'utf8'));
            } catch (e) {
                logToFile('Creating new post_urls.json file');
            }
            postUrls[parsedContent.data.title] = parsedContent.data.url;
            fs.writeFileSync('/shared/post_urls.json', JSON.stringify(postUrls, null, 2));
            logToFile(`Updated post_urls.json with ${parsedContent.data.title}`);
            
            // Trigger hierarchy update
            await redis.publish('hierarchy_update', 'update');
            logToFile('Triggered hierarchy update');
        }
    } catch (error) {
        logToFile(`Error processing vault file ${filePath}: ${error.message}`);
        throw error;
    }
}

function removeMediaTags(content) {
    const mediaTagRegex = /!\[\[(.*?)\]\]/g;
    return content.replace(mediaTagRegex, '');
}

module.exports = { processVault }; 