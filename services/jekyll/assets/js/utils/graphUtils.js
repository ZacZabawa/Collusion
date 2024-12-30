import * as d3 from 'd3';
function wrapText(text, nodeRadius) {
    text.each(function() {
        const text = d3.select(this);
        const words = text.text().split(/\s+/);
        const lineHeight = 1.2; // Increased for better readability
        const maxWidth = nodeRadius * 1.5; // Adjust text width based on node size
        const maxLines = 3; // Maximum number of lines before truncating
        
        let lines = [];
        let currentLine = [];
        let currentLineWidth = 0;
        
        // Clear existing text
        text.text(null);
        
        // Create temporary tspan to measure text
        let tempTspan = text.append("tspan");
        
        words.forEach(word => {
            tempTspan.text(word);
            const wordWidth = tempTspan.node().getComputedTextLength();
            
            if (currentLineWidth + wordWidth > maxWidth && currentLine.length > 0) {
                lines.push(currentLine.join(" "));
                currentLine = [word];
                currentLineWidth = wordWidth;
            } else {
                currentLine.push(word);
                currentLineWidth += wordWidth;
            }
        });
        
        if (currentLine.length > 0) {
            lines.push(currentLine.join(" "));
        }
        
        // Remove temporary tspan
        tempTspan.remove();
        
        // Add final text with truncation if needed
        lines = lines.slice(0, maxLines);
        const dy = parseFloat(text.attr("dy") || 0);
        
        lines.forEach((line, i) => {
            if (i === maxLines - 1 && lines.length > maxLines) {
                // Add ellipsis to last line if text was truncated
                line = line.slice(0, -3) + "...";
            }
            
            text.append("tspan")
                .attr("x", 0)
                .attr("dy", i === 0 ? dy + "em" : lineHeight + "em")
                .attr("text-anchor", "middle")
                .text(line);
        });
    });
}

export { wrapText };