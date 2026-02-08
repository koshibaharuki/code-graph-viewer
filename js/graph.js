/**
 * Graph - 3D Force-directed graph visualization using 3d-force-graph
 */

class Graph3D {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.graph = null;
        this.data = { nodes: [], links: [] };
        this.filters = {
            nodeTypes: new Set(Object.keys(NODE_TYPES)),
            edgeTypes: new Set(Object.keys(EDGE_TYPES)),
            searchTerm: ''
        };
        this.options = {
            showLabels: false,
            showArrows: true,
            freezeLayout: false
        };
        this.selectedNode = null;
        this.highlightNodes = new Set();
        this.highlightLinks = new Set();

        this.init();
    }

    /**
     * Initialize the 3D graph
     */
    init() {
        // Create 3D Force Graph
        this.graph = ForceGraph3D()(this.container)
            .backgroundColor('#0d1117')
            .nodeColor(node => this.getNodeColor(node))
            .nodeVal(node => this.getNodeSize(node))
            .nodeLabel(node => this.options.showLabels ? '' : `${node.name} (${node.type})`)
            .nodeOpacity(0.9)
            .linkColor(link => this.getLinkColor(link))
            .linkWidth(link => this.highlightLinks.has(link) ? 2 : 1)
            .linkOpacity(0.6)
            .linkDirectionalArrowLength(link => this.options.showArrows ? 4 : 0)
            .linkDirectionalArrowRelPos(1)
            .linkDirectionalParticles(link => this.highlightLinks.has(link) ? 2 : 0)
            .linkDirectionalParticleWidth(2)
            .onNodeClick(node => this.onNodeClick(node))
            .onNodeHover(node => this.onNodeHover(node))
            .onBackgroundClick(() => this.clearSelection());

        // Add 3D labels if enabled
        this.graph.nodeThreeObject(node => {
            if (this.options.showLabels) {
                return this.createLabel(node);
            }
            return null;
        });

        // Set camera position
        this.graph.cameraPosition({ x: 0, y: 0, z: 500 });

        // Store reference for exporter
        exporter.setGraph(this.graph);
    }

    /**
     * Create 3D text label for node
     */
    createLabel(node) {
        const sprite = new THREE.Sprite(
            new THREE.SpriteMaterial({
                map: this.createTextTexture(node.name),
                transparent: true
            })
        );
        sprite.scale.set(40, 20, 1);
        sprite.position.set(0, 12, 0);
        return sprite;
    }

    /**
     * Create texture from text
     */
    createTextTexture(text) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 64;

        ctx.fillStyle = 'rgba(22, 27, 34, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.font = '24px Segoe UI';
        ctx.fillStyle = '#e6edf3';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Truncate long text
        const maxLength = 20;
        const displayText = text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
        ctx.fillText(displayText, canvas.width / 2, canvas.height / 2);

        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        return texture;
    }

    /**
     * Load graph data
     */
    loadData(graphData) {
        // Store original data
        window.graphData = graphData;

        // Convert edges to links format
        this.data = {
            nodes: graphData.nodes.map(n => ({ ...n })),
            links: graphData.edges.map(e => ({
                source: e.source,
                target: e.target,
                type: e.type
            }))
        };

        // Update filters with available types
        this.updateAvailableTypes();

        // Apply filters and render
        this.applyFilters();

        // Update statistics
        this.updateStats();
    }

    /**
     * Update available node/edge types in filters
     */
    updateAvailableTypes() {
        const nodeCounts = countByType(this.data.nodes);
        const edgeCounts = countByType(this.data.links);

        // Populate node type filters
        const nodeFiltersEl = document.getElementById('nodeTypeFilters');
        nodeFiltersEl.innerHTML = '';

        Object.entries(NODE_TYPES).forEach(([type, config]) => {
            const count = nodeCounts[type] || 0;
            if (count > 0) {
                nodeFiltersEl.appendChild(this.createFilterItem(type, config, count, 'node'));
            }
        });

        // Populate edge type filters
        const edgeFiltersEl = document.getElementById('edgeTypeFilters');
        edgeFiltersEl.innerHTML = '';

        Object.entries(EDGE_TYPES).forEach(([type, config]) => {
            const count = edgeCounts[type] || 0;
            if (count > 0) {
                edgeFiltersEl.appendChild(this.createFilterItem(type, config, count, 'edge'));
            }
        });
    }

    /**
     * Create filter checkbox item
     */
    createFilterItem(type, config, count, category) {
        const label = document.createElement('label');
        label.className = 'filter-item';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = category === 'node'
            ? this.filters.nodeTypes.has(type)
            : this.filters.edgeTypes.has(type);
        checkbox.addEventListener('change', () => {
            if (category === 'node') {
                if (checkbox.checked) {
                    this.filters.nodeTypes.add(type);
                } else {
                    this.filters.nodeTypes.delete(type);
                }
            } else {
                if (checkbox.checked) {
                    this.filters.edgeTypes.add(type);
                } else {
                    this.filters.edgeTypes.delete(type);
                }
            }
            this.applyFilters();
        });

        const colorDot = document.createElement('span');
        colorDot.className = 'filter-color';
        colorDot.style.backgroundColor = config.color;

        const labelText = document.createElement('span');
        labelText.className = 'filter-label';
        labelText.textContent = type;

        const countBadge = document.createElement('span');
        countBadge.className = 'filter-count';
        countBadge.textContent = count;

        label.appendChild(checkbox);
        label.appendChild(colorDot);
        label.appendChild(labelText);
        label.appendChild(countBadge);

        return label;
    }

    /**
     * Apply filters to graph
     */
    applyFilters() {
        const searchTerm = this.filters.searchTerm.toLowerCase();

        // Filter nodes
        const filteredNodes = this.data.nodes.filter(node => {
            const typeMatch = this.filters.nodeTypes.has(node.type);
            const searchMatch = !searchTerm ||
                node.name.toLowerCase().includes(searchTerm) ||
                (node.path && node.path.toLowerCase().includes(searchTerm));
            return typeMatch && searchMatch;
        });

        // Get IDs of visible nodes
        const visibleNodeIds = new Set(filteredNodes.map(n => n.id));

        // Filter links
        const filteredLinks = this.data.links.filter(link => {
            const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
            const targetId = typeof link.target === 'object' ? link.target.id : link.target;

            return this.filters.edgeTypes.has(link.type) &&
                visibleNodeIds.has(sourceId) &&
                visibleNodeIds.has(targetId);
        });

        // Update graph
        this.graph.graphData({
            nodes: filteredNodes,
            links: filteredLinks
        });

        // Update stats
        document.getElementById('nodeCount').textContent = filteredNodes.length;
        document.getElementById('edgeCount').textContent = filteredLinks.length;
    }

    /**
     * Update statistics display
     */
    updateStats() {
        document.getElementById('nodeCount').textContent = this.data.nodes.length;
        document.getElementById('edgeCount').textContent = this.data.links.length;
    }

    /**
     * Get node color based on type
     */
    getNodeColor(node) {
        if (this.highlightNodes.has(node)) {
            return '#ffffff';
        }
        const config = NODE_TYPES[node.type];
        return config ? config.color : '#58a6ff';
    }

    /**
     * Get node size based on connections
     */
    getNodeSize(node) {
        // Base size + bonus for connections
        const connections = this.data.links.filter(l => {
            const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
            const targetId = typeof l.target === 'object' ? l.target.id : l.target;
            return sourceId === node.id || targetId === node.id;
        }).length;

        return Math.max(2, Math.min(10, 2 + connections * 0.5));
    }

    /**
     * Get link color based on type
     */
    getLinkColor(link) {
        if (this.highlightLinks.has(link)) {
            return '#ffffff';
        }
        const config = EDGE_TYPES[link.type];
        return config ? config.color : '#58a6ff';
    }

    /**
     * Handle node click
     */
    onNodeClick(node) {
        if (!node) return;

        this.selectedNode = node;
        this.showNodeDetails(node);

        // Focus camera on node
        this.graph.cameraPosition(
            { x: node.x + 100, y: node.y, z: node.z + 100 },
            node,
            1000
        );
    }

    /**
     * Handle node hover
     */
    onNodeHover(node) {
        this.highlightNodes.clear();
        this.highlightLinks.clear();

        if (node) {
            this.highlightNodes.add(node);

            // Find connected nodes and links
            this.data.links.forEach(link => {
                const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
                const targetId = typeof link.target === 'object' ? link.target.id : link.target;

                if (sourceId === node.id || targetId === node.id) {
                    this.highlightLinks.add(link);

                    // Find connected node
                    const connectedId = sourceId === node.id ? targetId : sourceId;
                    const connectedNode = this.data.nodes.find(n => n.id === connectedId);
                    if (connectedNode) {
                        this.highlightNodes.add(connectedNode);
                    }
                }
            });
        }

        // Update visuals
        this.graph
            .nodeColor(this.graph.nodeColor())
            .linkWidth(this.graph.linkWidth())
            .linkColor(this.graph.linkColor());
    }

    /**
     * Show node details in panel
     */
    showNodeDetails(node) {
        const panel = document.getElementById('detailPanel');
        panel.classList.add('open');

        document.getElementById('detailTitle').textContent = node.name;
        document.getElementById('detailType').textContent = node.type;
        document.getElementById('detailPath').textContent = node.path || '-';

        // Find connections
        const incoming = [];
        const outgoing = [];

        this.data.links.forEach(link => {
            const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
            const targetId = typeof link.target === 'object' ? link.target.id : link.target;

            if (targetId === node.id) {
                const sourceNode = this.data.nodes.find(n => n.id === sourceId);
                if (sourceNode) {
                    incoming.push({ node: sourceNode, type: link.type });
                }
            }
            if (sourceId === node.id) {
                const targetNode = this.data.nodes.find(n => n.id === targetId);
                if (targetNode) {
                    outgoing.push({ node: targetNode, type: link.type });
                }
            }
        });

        document.getElementById('detailConnections').textContent = incoming.length + outgoing.length;

        // Populate incoming list
        const incomingList = document.getElementById('incomingList');
        incomingList.innerHTML = incoming.length ? '' : '<li>None</li>';
        incoming.forEach(({ node: n, type }) => {
            const li = document.createElement('li');
            li.innerHTML = `${n.name} <span class="edge-type">${type}</span>`;
            li.addEventListener('click', () => this.onNodeClick(n));
            incomingList.appendChild(li);
        });

        // Populate outgoing list
        const outgoingList = document.getElementById('outgoingList');
        outgoingList.innerHTML = outgoing.length ? '' : '<li>None</li>';
        outgoing.forEach(({ node: n, type }) => {
            const li = document.createElement('li');
            li.innerHTML = `${n.name} <span class="edge-type">${type}</span>`;
            li.addEventListener('click', () => this.onNodeClick(n));
            outgoingList.appendChild(li);
        });
    }

    /**
     * Clear selection
     */
    clearSelection() {
        this.selectedNode = null;
        document.getElementById('detailPanel').classList.remove('open');
    }

    /**
     * Set search filter
     */
    setSearch(term) {
        this.filters.searchTerm = term;
        this.applyFilters();
    }

    /**
     * Toggle labels
     */
    setShowLabels(show) {
        this.options.showLabels = show;
        this.graph.nodeThreeObject(node => {
            if (show) {
                return this.createLabel(node);
            }
            return null;
        });
        this.graph.nodeLabel(node => show ? '' : `${node.name} (${node.type})`);
    }

    /**
     * Toggle arrows
     */
    setShowArrows(show) {
        this.options.showArrows = show;
        this.graph.linkDirectionalArrowLength(show ? 4 : 0);
    }

    /**
     * Toggle freeze layout
     */
    setFreezeLayout(freeze) {
        this.options.freezeLayout = freeze;
        if (freeze) {
            this.graph.cooldownTicks(0);
            this.graph.d3Force('charge', null);
        } else {
            this.graph.cooldownTicks(Infinity);
            this.graph.d3Force('charge').strength(-50);
            this.graph.d3ReheatSimulation();
        }
    }

    /**
     * Resize graph to fit container
     */
    resize() {
        if (this.graph) {
            this.graph.width(this.container.clientWidth);
            this.graph.height(this.container.clientHeight);
        }
    }
}

// Global graph instance (initialized in app.js)
let graph3d = null;
