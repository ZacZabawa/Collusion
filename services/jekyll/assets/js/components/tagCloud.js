function getSortedTagCounts(graphData) {
    console.log("Starting to count and sort tag occurrences...");
    const tagCounts = {};

    function processNode(node) {
        (node.tags || []).forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });

        if (node.functions && Array.isArray(node.functions)) {
            node.functions.forEach(processNode);
        }

        if (node.projects && Array.isArray(node.projects)) {
            node.projects.forEach(processNode);
        }
    }

    graphData.forEach(processNode);
    const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);
    return sortedTags;
}

function getColorForTag(index, totalTags) {
    const percentile = index / totalTags;
    let color;
    if (percentile < 0.25) color = '#ff5d43';
    else if (percentile < 0.5) color = '#0eb6c8';
    else if (percentile < 0.75) color = '#f9d6a9';
    else color = '#000000';
    return color;
}

function populateCloud(graphData) {
    const sortedTags = getSortedTagCounts(graphData);
    const cloudContainer = document.getElementById('tag-cloud-container');
    if (!cloudContainer) {
        console.error("Tag cloud container not found!");
        return;
    }
    cloudContainer.innerHTML = '';
    sortedTags.forEach(([tag, count], index) => {
        const tagElement = document.createElement('span');
        tagElement.textContent = `${tag} (${count})`;
        tagElement.style.color = getColorForTag(index, sortedTags.length);
        cloudContainer.appendChild(tagElement);
    });
}

export { populateCloud, getSortedTagCounts, getColorForTag };