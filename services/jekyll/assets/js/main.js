import $ from 'jquery';
import { initLoadingScreen } from './components/loadingScreen.js';
import { populateCloud } from './components/tagCloud.js';
import { renderGraph } from './components/graphRenderer.js';
import { populateSkillsDropdown } from './components/skillsHandler.js';
import * as d3 from 'd3';
import { hexbin } from 'd3-hexbin';
import 'bootstrap/dist/css/bootstrap.min.css';

document.addEventListener('DOMContentLoaded', async function() {
    if (document.getElementById('graph2')) {
        initLoadingScreen();
    }
    try {
        await init();
    } catch (error) {
        console.error("Error during initialization:", error);
    }
});

async function init() {
    try {
        const graphData = await d3.json("/_data/notes_hierarchical_with_urls.json");
        console.log("Fetched notes data:", graphData);

        // Render the graph initially with all data
        renderGraph("graph2", graphData);
        
        // Populate both tag cloud and skills dropdown
        populateCloud(graphData);
        populateSkillsDropdown(graphData);  // Make sure this is called

        // Handle tag selection
        document.querySelectorAll('.tag').forEach(tagElement => {
            tagElement.addEventListener('click', event => {
                const selectedTag = event.target.dataset.tag;
                renderGraph("graph2", graphData, selectedTag);
            });
        });
    } catch (error) {
        console.error("Error during initialization:", error);
        throw error; // Re-throw to see the full error in console
    }
}

// Check for any initial renderGraph calls
console.log("Current renderGraph calls in main.js:");
// ... show the relevant code where renderGraph is called