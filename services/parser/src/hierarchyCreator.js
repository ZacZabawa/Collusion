const fs = require('fs');

// Load the post URLs
let postUrls = require('./_data/post_urls.json');

function createHierarchy(sortedJsonArray) {
  const hierarchy = [];
  const organizations = sortedJsonArray.filter(note => note.type === 'organization');
  organizations.forEach(organization => {
    const functionsMap = new Map();
    sortedJsonArray.forEach(note => {
      if (note.type === 'function' && note.graph === organization.graph) {
        functionsMap.set(note.function.toLowerCase().trim(), { ...note, projects: [] });
      }
    });
    sortedJsonArray.forEach(note => {
      if (note.type === 'project' && note.graph === organization.graph) {
        let funcTitle = note.function.toLowerCase().trim();
        let func = functionsMap.get(funcTitle);
        if (func) {
          note.url = postUrls[note.title];  // Read the URL from the postUrls
          func.projects.push(note);
        } else {
          logToFile(`No matching function for project: ${note.title} with function: ${note.function}`);
        }
      }
    });
    organization.functions = Array.from(functionsMap.values()).map(func => {
      func.url = postUrls[func.title];  // Read the URL from the postUrls
      return func;
    });
    hierarchy.push(organization);
  });
  return hierarchy;
}

// Load the sortedJsonArray and call createHierarchy
function loadAndCreateHierarchy() {
  fs.readFile('_data/notes_flat.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    const sortedJsonArray = JSON.parse(data);
    const hierarchy = createHierarchy(sortedJsonArray);
    fs.writeFile('_data/notes_hierarchical_with_urls.json', JSON.stringify(hierarchy, null, 2), err => {
      if (err) {
        console.error(err);
        return;
      }
      console.log('Hierarchy created successfully.');
    });
  });
}

// Call the function initially
loadAndCreateHierarchy();

// Watch the post_urls.json file for changes
fs.watch('post_urls.json', (eventType, filename) => {
  if (eventType === 'change') {
    console.log(`post_urls.json has been updated. Recreating hierarchy...`);
    delete require.cache[require.resolve('./post_urls.json')]; // Clear the require cache
    postUrls = require('../../../post_urls.json'); // Reload the post URLs
    loadAndCreateHierarchy(); // Recreate the hierarchy
  }
});