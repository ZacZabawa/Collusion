async function fetchGraphData(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching graph data:", error);
        return null;
    }
}

export { fetchGraphData };