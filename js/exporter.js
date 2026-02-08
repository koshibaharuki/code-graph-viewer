/**
 * Exporter - Export graph as PNG, SVG, or JSON
 */

class GraphExporter {
    constructor() {
        this.graphInstance = null;
    }

    /**
     * Set graph instance reference
     */
    setGraph(graph) {
        this.graphInstance = graph;
    }

    /**
     * Export current view as PNG
     */
    async exportPNG() {
        const container = document.getElementById('graphContainer');

        if (!container) {
            console.error('Graph container not found');
            return;
        }

        showLoading();

        try {
            // Find the canvas element
            const canvas = container.querySelector('canvas');

            if (canvas) {
                // Direct canvas export
                const dataUrl = canvas.toDataURL('image/png');
                downloadImage(dataUrl, 'code-graph-' + Date.now() + '.png');
            } else {
                // Fallback to html2canvas
                const canvasResult = await html2canvas(container, {
                    backgroundColor: '#0d1117',
                    scale: 2,
                    logging: false,
                    useCORS: true
                });
                const dataUrl = canvasResult.toDataURL('image/png');
                downloadImage(dataUrl, 'code-graph-' + Date.now() + '.png');
            }
        } catch (error) {
            console.error('PNG export error:', error);
            alert('Failed to export PNG. Please try again.');
        }

        hideLoading();
    }

    /**
     * Export current view as SVG
     */
    exportSVG() {
        if (!this.graphInstance || !window.graphData) {
            console.error('No graph data available');
            return;
        }

        showLoading();

        try {
            const data = window.graphData;
            const width = 1200;
            const height = 800;

            // Create SVG content
            let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <style>
    .node-circle { stroke: #30363d; stroke-width: 1; }
    .edge-line { stroke-width: 1; fill: none; opacity: 0.6; }
    .node-label { font-family: 'Segoe UI', sans-serif; font-size: 10px; fill: #e6edf3; }
  </style>
  <rect width="${width}" height="${height}" fill="#0d1117"/>
  <g transform="translate(${width / 2}, ${height / 2})">`;

            // Calculate positions (simple force simulation approximation)
            const nodePositions = new Map();
            const nodeCount = data.nodes.length;

            data.nodes.forEach((node, i) => {
                const angle = (2 * Math.PI * i) / nodeCount;
                const radius = 150 + Math.random() * 150;
                nodePositions.set(node.id, {
                    x: Math.cos(angle) * radius,
                    y: Math.sin(angle) * radius
                });
            });

            // Draw edges
            data.edges.forEach(edge => {
                const source = nodePositions.get(edge.source);
                const target = nodePositions.get(edge.target);

                if (source && target) {
                    const edgeType = EDGE_TYPES[edge.type] || { color: '#58a6ff' };
                    svg += `
    <line class="edge-line" x1="${source.x}" y1="${source.y}" x2="${target.x}" y2="${target.y}" stroke="${edgeType.color}"/>`;
                }
            });

            // Draw nodes
            data.nodes.forEach(node => {
                const pos = nodePositions.get(node.id);
                const nodeType = NODE_TYPES[node.type] || { color: '#58a6ff' };

                if (pos) {
                    svg += `
    <circle class="node-circle" cx="${pos.x}" cy="${pos.y}" r="6" fill="${nodeType.color}"/>
    <text class="node-label" x="${pos.x + 10}" y="${pos.y + 4}">${node.name}</text>`;
                }
            });

            svg += `
  </g>
</svg>`;

            downloadFile(svg, 'code-graph-' + Date.now() + '.svg', 'image/svg+xml');
        } catch (error) {
            console.error('SVG export error:', error);
            alert('Failed to export SVG. Please try again.');
        }

        hideLoading();
    }

    /**
     * Export graph data as JSON
     */
    exportJSON() {
        if (!window.graphData) {
            console.error('No graph data available');
            return;
        }

        try {
            const jsonContent = JSON.stringify(window.graphData, null, 2);
            downloadFile(jsonContent, 'code-graph-' + Date.now() + '.json', 'application/json');
        } catch (error) {
            console.error('JSON export error:', error);
            alert('Failed to export JSON. Please try again.');
        }
    }
}

// Create global exporter instance
const exporter = new GraphExporter();
