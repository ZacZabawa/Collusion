import * as d3 from 'd3';
import { hexbin } from 'd3-hexbin';
import { wrapText } from '../utils/graphUtils.js';

// Assuming the existence of utility functions like `hideLoadingScreen` elsewhere
// Adjust the function signature to include selectedTag
function renderGraph(graphId, graphData, selectedTag = null) {
    if (!graphData || !Array.isArray(graphData)) {
        console.error("Invalid graph data received:", graphData);
        return;
    }

    // Remove existing SVG before creating a new one
    d3.select(`#${graphId}`).selectAll("svg").remove();

    console.log("Rendering graph for graphId:", graphId, "with selectedTag:", selectedTag);
    
    // Filter data if tag is selected
    const filteredData = selectedTag 
        ? graphData.filter(node => node.tags && node.tags.includes(selectedTag))
        : graphData;

    if (!filteredData.length) {
        console.warn("No data after filtering");
        return;
    }

    const typeDelays = {
        'organization': 2000,
        'function': 4000, // Delay functions by 500ms
        'project': 6000 // Delay projects by 1000ms
    };
        const container = document.querySelector(`#${graphId}`);
        if (!container) {
            console.error(`Container #${graphId} not found.`);
            console.log(`Rendering graph in container: ${containerId}`, graphData); // Add this line
            return;
        }
        container.innerHTML = '';

        console.log(`Rendering graph for graphId: ${graphId} with selectedTag: ${selectedTag}`);
        console.log("Original graphData:", graphData);
        console.log("Filtered graphData:", filteredData);

        // Use selectedTag to filter graphData if selectedTag is not null
        // Inside renderGraph, update the filteredGraphData logic to consider selectedTag
        const filteredGraphData = selectedTag ? graphData.filter(node => 
            node.tags && node.tags.includes(selectedTag)) : graphData;


    let width = 0.9 * window.innerWidth;
    let height = window.innerHeight;
    const functionRadius = 0.3 * Math.min(width, height);
    const projectRadius = 0.4 * Math.min(width, height);

    // Adjust zoom behavior for different screen sizes
    const zoomBehavior = d3.zoom()
        .scaleExtent([0.5, window.innerWidth < 768 ? 3 : 7]) // Less zoom on mobile
        .on('zoom', (event) => {
            svg.attr('transform', event.transform);
        });

    // Create SVG for the graph
    const svg = d3.select(`#${graphId}`).append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .call(zoomBehavior) // Add zoom behavior
        .append("g");
        console.log("SVG created:", svg);
    const nodes = [];
    const links = [];
  
    const g = svg.append('g'); // This group will contain all elements that should be zoomable


// Define the zoom behavior
const zoom = d3.zoom()
    .scaleExtent([2.5, 10]) // Example scale extent, adjust as needed
    .on("zoom", (event) => {
        g.attr("transform", event.transform);
    });

// Apply the zoom behavior to the SVG
svg.call(zoom);

// Attempt to apply an initial zoom of about 20%
// This is done after ensuring the zoom behavior is attached
setTimeout(() => svg.transition().duration(750).call(zoom.scaleTo, 2), 500);

    function traverse(node, parent = null, index = 0, angleOffset = 0) {
        if (!node) return;
        
        nodes.push(node);
        if (parent) {
            links.push({ source: parent.id, target: node.id });
        }
        
        if (node.x !== undefined && node.y !== undefined) {
            console.log("Node position - X:", node.x, "Y:", node.y);
        }
        
        if (node.functions) {
            const angleStep = 2 * Math.PI / node.functions.length;
            node.functions.forEach((child, i) => {
                if (child.type === 'function') {
                    child.x = width / 2 + 0.8 * functionRadius * Math.cos(i * angleStep + angleOffset);
                    child.y = height / 2 + 0.8 * functionRadius * Math.sin(i * angleStep + angleOffset);
                }
                traverse(child, node, i, i * angleStep);
            });
        }
        if (node.projects) {
            const angleStep = 2 * Math.PI / node.projects.length;
            node.projects.forEach((child, i) => {
                child.x = width / 2 + projectRadius * Math.cos(i * angleStep + angleOffset);
                child.y = height / 2 + projectRadius * Math.sin(i * angleStep + angleOffset);
                traverse(child, node, i, i * angleStep + angleOffset);
            });
        }
    }

    // Populate nodes and links using your traverse function
    graphData.forEach(root => traverse(root));

    // Simulation setup as per your main.js
    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id))
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("function", d3.forceRadial(d => d.type === 'function' ? 300 : 0, width / 2, height / 2).strength(0.8))
        .force("project", d3.forceRadial(d => d.type === 'project' ? 500 : 0, width / 2, height / 2).strength(0.5))
        .force("collide", d3.forceCollide().radius(50));

    // Calculate the maximum distance of the function nodes from the center
    let maxDistance = 0;
    nodes.forEach(node => {
        if (node.type === 'function') {
            const dx = node.x - width / 2;
            const dy = node.y - height / 2;
            const distance = Math.sqrt(dx * dx + dy * dy);
            maxDistance = Math.max(maxDistance, distance);
        }
    });

    const buffer = 10; // Adjust the buffer as needed
    const radius = maxDistance + buffer;

    // Add the circle to the SVG
    svg.append("circle")
        .attr("cx", width / 2)
        .attr("cy", height / 2)
        .attr("r", radius)
        .style("fill", "rgba(0, 0, 0, 0.5)"); // Change the color and opacity as needed

    // Add a path for the text
    svg.append("path")
    .attr("id", "textPath")
    .attr("d", `M ${width / 2 - radius}, ${height / 2} a ${radius},${radius} 0 1,1 ${2 * radius},0`)
    .style("fill", "none");

    // Add the text along the path
    svg.append("text")
    .attr("dy", -10) // Adjust the offset as needed
    .append("textPath")
    .attr("xlink:href", "#textPath")
    .attr("startOffset", "25%") // Adjust the position as needed
    .style("text-anchor", "middle")
    .text("Areas of Expertise");

    // Calculate the radius for the projects circle
    const projectCircleRadius = functionRadius * 1.9; // Adjust the multiplier as needed

    // Add the projects circle to the SVG
    svg.append("circle")
        .attr("cx", width / 2)
        .attr("cy", height / 2)
        .attr("r", projectCircleRadius)
        .style("fill", "rgba(0, 0, 0, 0.5)"); // Change the color and opacity as needed

    // Add a path for the projects label
    svg.append("path")
        .attr("id", "projectsTextPath")
        .attr("d", `M ${width / 2 - projectCircleRadius}, ${height / 2} a ${projectCircleRadius},${projectCircleRadius} 0 1,1 ${2 * projectCircleRadius},0`)
        .style("fill", "none");

    // Add the projects label along the path
    svg.append("text")
        .attr("dy", -10) // Adjust the offset as needed
        .append("textPath")
        .attr("xlink:href", "#projectsTextPath")
        .attr("startOffset", "25%") // Adjust the position as needed
        .style("text-anchor", "middle")
        .text("Projects");

    // Initially hide links
    const link = svg.append("g")
    .attr("stroke", "#0c0c0d")
    .attr("stroke-opacity", 0) // Set initial opacity to 0 to hide links
    .selectAll("line")
    .data(links)
    .join("line");

    const color = d3.scaleOrdinal(d3.schemeCategory10);        


    // Filter out  nodes
    const parentNodes = nodes.filter(d => d.type !== 'project');

    // Create node groups with staggered loading, using only parent nodes
    const node = svg.append("g")
    .attr("stroke", "#fff")
    .attr("stroke-width", 0)
    .selectAll("g")
    .data(parentNodes) // Use the filtered array
    .enter()
    .append("g")
    .attr("class", "node") // Add a class for styling and selection
    .attr("transform", d => `translate(${d.x}, ${d.y})`)
    .style("opacity", 0.2); // Start with nodes hidden

    // Fade in the nodes based on their type with a delay
    node.transition()
    .delay(d => typeDelays[d.type]) // Apply delay based on the type
    .style("opacity", 1); // Fade in the node


    // Function to show links connected to a node
    function showLinks(nodeId) {
        link.style("stroke-opacity", d => (d.source.id === nodeId || d.target.id === nodeId) ? 1 : 0);
    }

    // Function to hide all links
    function hideLinks() {
        link.style("stroke-opacity", 0);
    }

    // Hover/select interaction to display child projects
    node.filter(d => d.type !== 'organization') // Exclude organization nodes
    .on("mouseover", function(event, d) {
        if (!d3.select(this).classed("clicked") && d.type !== 'organization') {
            showChildNodes(d, this);
            showLinks(d.id); // Show links connected to this node
        }
    })
    .on("mouseout", function(event, d) {
        if (!d3.select(this).classed("clicked") && d.type !== 'organization') {
            hideChildNodes();
            hideLinks(); // Hide all links
        }
    })
    .on("click", function(event, d) {
        if (d.type !== 'organization') { // Exclude organization nodes from click
            const nodeSelection = d3.select(this);
            const alreadyClicked = nodeSelection.classed("clicked");
            svg.selectAll(".node").classed("clicked", false); // Remove clicked class from all nodes
            hideChildNodes(); // Hide any previously shown child nodes

            if (!alreadyClicked) {
                nodeSelection.classed("clicked", true); // Add clicked class to the current node
                showChildNodes(d, this); // Show child nodes for the current node
            }
            // Prevent the click from triggering any parent elements
            event.stopPropagation();
        }
        showLinks(d.id); // Ensure links remain visible when a node is clicked
        });

let isNodeHovered = false;   
// Function to show child nodes with hyperlink only for project nodes
function showChildNodes(d, nodeElement) {
    const children = d.functions || d.projects || [];
    children.forEach(child => {
        const childNode = svg.append("g")
            .attr("class", "node child-node")
            .attr("transform", `translate(${child.x}, ${child.y})`)
            .style("opacity", 0);

        // Add click handler for project nodes with URLs
        if (child.type === 'project' && child.url) {
            childNode.style("cursor", "pointer")
                .on("click", (event) => {
                    event.stopPropagation();
                    window.location.href = child.url;
                });
        }
        
        childNode.append("circle")
            .attr("r", 60)
            .attr("fill", `url(#${child.type})`);

        // Add and wrap text for child nodes
        const childText = childNode.append("text")
            .attr("class", "node-text")
            .attr("text-anchor", "middle")
            .attr("dy", "-0.5em")
            .style("font-size", `${Math.min(svgWidth / 75, 14)}px`)
            .text(child.title);

        // Apply text wrapping to child nodes
        wrapText(childText, 60);
        
        childNode.transition()
            .duration(1000)
            .style("opacity", 1);
    });
}

// Step 3: Adjust the parent node event handlers
node.on("mouseover", function(event, d) {
    isNodeHovered = true;
    showChildNodes(d, this);
    showLinks(d.id);
})
.on("mouseout", function(event, d) {
    isNodeHovered = false;
    setTimeout(() => {
        if (!isNodeHovered) {
            hideChildNodes();
            hideLinks();
        }
    }, 2000); // 2-second delay
});

// Modify the click event handler for function nodes
node.filter(d => d.type === 'function')
    .on("click", function(event, d) {
        const nodeSelection = d3.select(this);
        const alreadyClicked = nodeSelection.classed("clicked");
        svg.selectAll(".node.clicked").classed("clicked", false); // Remove clicked class from all nodes
        hideChildNodes(); // Hide any previously shown child nodes

        if (!alreadyClicked) {
            nodeSelection.classed("clicked", true); // Add clicked class to the current node
            showChildNodes(d, this); // Show child nodes for the current node
        }
        event.stopPropagation(); // Prevent the click from triggering any parent elements
        showLinks(d.id); // Ensure links remain visible when a node is clicked
    });


    // Function to hide child nodes
    function hideChildNodes() {
        svg.selectAll(".child-node").remove();
    }

    // Clicking on the SVG background will hide all child nodes and remove the clicked class
    svg.on("click", function() {
        svg.selectAll(".node.clicked").classed("clicked", false);
        hideChildNodes();
    });

    // Add circles to the node groups
    node.append("circle")
    .attr("r", 60)
    .attr("fill", d => `url(#${d.type})`); // Use the type of the node to determine the fill

    // Define the width and height of the SVG
    const svgWidth = svg.node().getBoundingClientRect().width;
    const svgHeight = svg.node().getBoundingClientRect().height;

    // Add text to the node groups
    const nodeRadius = 60; // Match this to your circle radius

    // Add text to the node groups
    var text = node.append("text")
        .attr("class", "node-text")
        .attr("text-anchor", "middle")
        .attr("dy", "-0.5em") // Start slightly higher to account for multiple lines
        .style("font-size", `${Math.min(svgWidth / 75, 14)}px`) // Cap the font size
        .text(d => {
            return d.title.split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
        });

    wrapText(text, nodeRadius);


    // Define the pattern for each level
    svg.append('defs')
                .selectAll('pattern')
                .data(['organization', 'function', 'project'])
                .join('pattern')
                .attr('id', d => d)
                .attr('width', 1)
                .attr('height', 1)
                .append('image')
                .attr('xlink:href', d => `/assets/svg/${d}.svg`)
                .attr('width', 120)
                .attr('height', 120)
                .attr('x', 0)
                .attr('y', 0);
        
    // Update nodes and links positions after each tick
    simulation.on("tick", () => {
                link
                    .attr("x1", d => d.source.x)
                    .attr("y1", d => d.source.y)
                    .attr("x2", d => d.target.x)
                    .attr("y2", d => d.target.y);
        
                node
                    .attr("transform", d => `translate(${d.x}, ${d.y})`);
                });
     
    // Update the graph header based on the selected tag
    updateGraphHeader(selectedTag);

    // Add window resize handler
    window.addEventListener('resize', () => {
        width = 0.9 * window.innerWidth;
        height = window.innerHeight;
        svg.attr("viewBox", `0 0 ${width} ${height}`);
    });

    // Move the node click handler inside the render function where 'node' is defined
    node.filter(d => d.type === 'project')
        .on("click", function(event, d) {
            if (d.url) {
                window.location.href = d.url;
            }
            event.stopPropagation();
        });
}

function updateGraphHeader(selectedTag) {
    const graphHeader = document.getElementById('graph-header');
    if (selectedTag) {
        graphHeader.innerHTML = `<h2>${selectedTag} <button onclick="clearTagSelection()">X</button></h2>`;
    } else {
        graphHeader.innerHTML = '';
    }
}

window.clearTagSelection = function() {
    renderGraph('graph2', allGraphData);
}

export { renderGraph };
