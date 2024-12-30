import { getSortedTagCounts, getColorForTag } from './tagCloud.js';
import { renderGraph } from './graphRenderer.js';

function filterGraphByTag(graphData, tag) {
    console.log("Filtering graph for tag:", tag);
    
    // First, find all nodes that have the tag
    const nodesWithTag = new Set();
    
    function processNode(node) {
        if (node.tags && node.tags.includes(tag)) {
            nodesWithTag.add(node.id);
            return true;
        }
        
        let hasTaggedChild = false;
        
        // Check functions
        if (node.functions) {
            hasTaggedChild = node.functions.some(processNode);
        }
        
        // Check projects
        if (node.projects) {
            hasTaggedChild = hasTaggedChild || node.projects.some(processNode);
        }
        
        if (hasTaggedChild) {
            nodesWithTag.add(node.id);
        }
        
        return hasTaggedChild;
    }

    // Create a deep copy of the data to avoid modifying the original
    const filteredData = JSON.parse(JSON.stringify(graphData));
    
    // Filter the data
    return filteredData.filter(node => processNode(node));
}

function populateSkillsDropdown(graphData) {
    console.log("Populating skills dropdown...");
    const sortedTags = getSortedTagCounts(graphData);
    
    const skillsDropdown = document.getElementById('skills-dropdown');
    
    if (!skillsDropdown) {
        console.error("Skills dropdown container not found!");
        return;
    }
    
    skillsDropdown.innerHTML = '';
    
    // Add "Show All" option at the top
    const showAllElement = document.createElement('a');
    showAllElement.href = '#';
    showAllElement.textContent = "Show All";
    showAllElement.addEventListener('click', (e) => {
        e.preventDefault();
        renderGraph("graph2", graphData);
    });
    skillsDropdown.appendChild(showAllElement);
    
    sortedTags.forEach(([tag, count], index) => {
        const skillElement = document.createElement('a');
        skillElement.href = '#';
        skillElement.textContent = `${tag} (${count})`;
        skillElement.style.color = getColorForTag(index, sortedTags.length);
        
        skillElement.addEventListener('click', (e) => {
            e.preventDefault();
            console.log(`Clicked skill: ${tag}`);
            const filteredData = filterGraphByTag(graphData, tag);
            console.log("Filtered data:", filteredData);
            renderGraph("graph2", filteredData, tag);
        });
        
        skillsDropdown.appendChild(skillElement);
    });
}

export { populateSkillsDropdown }; 