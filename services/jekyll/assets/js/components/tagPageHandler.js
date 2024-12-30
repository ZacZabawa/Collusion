document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const tag = urlParams.get('tag');

    if (tag) {
        fetch('path/to/your/hierarchical/data.json')
            .then(response => response.json())
            .then(data => {
                const filteredData = filterDataByTag(data, tag);
                renderGraph('graph2', filteredData, tag);
                populatePosts(filteredData);
            })
            .catch(error => console.error('Failed to fetch graph data:', error));
    }
});

function filterDataByTag(data, tag) {
    // Assuming your data structure has nodes that contain tags
    // This function should traverse the hierarchical data and filter based on the tag
    // Placeholder logic below, adjust according to your actual data structure
    return data.filter(node => node.tags && node.tags.includes(tag));
}

function populatePosts(filteredData) {
    // Assuming you have a div with id="tag-posts" to populate with posts related to the tag
    const postsContainer = document.getElementById('tag-posts');
    filteredData.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'post';
        postElement.innerHTML = `<h3>${post.title}</h3><p>${post.summary}</p>`;
        postsContainer.appendChild(postElement);
    });
}