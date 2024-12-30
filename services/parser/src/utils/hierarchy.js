const fs = require('fs');
const { logToFile } = require('./logger');

async function updateHierarchy(redis) {
    logToFile('Starting hierarchy update');
    
    try {
        // Get all notes from Redis
        const notes = await redis.hgetall('notes');
        const notesArray = Object.values(notes).map(JSON.parse);
        logToFile(`Retrieved ${notesArray.length} notes from Redis`);
        
        // Update post_urls.json
        const postUrls = {};
        notesArray.forEach(note => {
            if (note.url) {
                postUrls[note.title] = note.url;
            }
        });
        fs.writeFileSync('/shared/post_urls.json', JSON.stringify(postUrls, null, 2));
        logToFile('Updated post_urls.json');
        
        // Create hierarchy
        const hierarchy = createHierarchy(notesArray);
        fs.writeFileSync('/shared/notes_hierarchical_with_urls.json', JSON.stringify(hierarchy, null, 2));
        logToFile('Updated notes_hierarchical_with_urls.json');
        
    } catch (error) {
        logToFile(`Error updating hierarchy: ${error.message}`);
        throw error;
    }
}

function createHierarchy(sortedJsonArray) {
    const hierarchy = [];
    const organizations = sortedJsonArray.filter(note => note.type === 'organization');
    const postUrls = require('/shared/post_urls.json');
    
    logToFile(`Found ${organizations.length} organizations`);
    
    organizations.forEach(organization => {
        const functionsMap = new Map();
        sortedJsonArray.forEach(note => {
            if (note.type === 'function' && note.graph === organization.graph) {
                functionsMap.set(note.function.toLowerCase().trim(), { ...note, projects: [] });
            }
        });
        
        logToFile(`Processing organization: ${organization.title} with ${functionsMap.size} functions`);
        
        sortedJsonArray.forEach(note => {
            if (note.type === 'project' && note.graph === organization.graph) {
                let funcTitle = note.function.toLowerCase().trim();
                let func = functionsMap.get(funcTitle);
                if (func) {
                    note.url = postUrls[note.title];
                    func.projects.push(note);
                } else {
                    logToFile(`No matching function for project: ${note.title} with function: ${note.function}`);
                }
            }
        });
        
        organization.functions = Array.from(functionsMap.values()).map(func => {
            func.url = postUrls[func.title];
            return func;
        });
        hierarchy.push(organization);
    });
    
    return hierarchy;
}

module.exports = { updateHierarchy }; 