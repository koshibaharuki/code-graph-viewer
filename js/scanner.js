/**
 * Scanner - Analyze codebase and generate graph JSON
 */

class CodebaseScanner {
    constructor() {
        this.nodes = [];
        this.edges = [];
        this.nodeMap = new Map();
    }

    /**
     * Reset scanner state
     */
    reset() {
        this.nodes = [];
        this.edges = [];
        this.nodeMap = new Map();
    }

    /**
     * Scan files from folder input
     * @param {FileList} files - Files from folder input
     * @returns {Object} Graph data { nodes, edges }
     */
    async scanFiles(files) {
        this.reset();
        showLoading();

        try {
            // Filter and process files
            const codeFiles = Array.from(files).filter(file => {
                const ext = getFileExtension(file.name);
                return ['js', 'ts', 'jsx', 'tsx', 'py', 'go', 'java', 'vue', 'svelte', 'rb'].includes(ext);
            });

            // Create nodes for each file
            for (const file of codeFiles) {
                const ext = getFileExtension(file.name);
                const nodeType = getNodeTypeFromExtension(ext);
                const relativePath = file.webkitRelativePath || file.name;

                const node = {
                    id: generateId(),
                    name: file.name,
                    type: nodeType,
                    path: relativePath,
                    extension: ext
                };

                this.nodes.push(node);
                this.nodeMap.set(relativePath, node);
            }

            // Analyze imports/dependencies
            for (const file of codeFiles) {
                const content = await this.readFileContent(file);
                const relativePath = file.webkitRelativePath || file.name;
                const sourceNode = this.nodeMap.get(relativePath);

                if (sourceNode && content) {
                    await this.analyzeImports(content, sourceNode, file);
                }
            }

            hideLoading();
            return { nodes: this.nodes, edges: this.edges };
        } catch (error) {
            console.error('Scan error:', error);
            hideLoading();
            return { nodes: [], edges: [] };
        }
    }

    /**
     * Read file content as text
     */
    readFileContent(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    /**
     * Analyze imports in file content
     */
    analyzeImports(content, sourceNode, file) {
        const ext = getFileExtension(file.name);
        const basePath = (file.webkitRelativePath || file.name).split('/').slice(0, -1).join('/');

        // JavaScript/TypeScript imports
        if (['js', 'ts', 'jsx', 'tsx', 'vue', 'svelte'].includes(ext)) {
            this.analyzeJSImports(content, sourceNode, basePath);
        }

        // Python imports
        if (ext === 'py') {
            this.analyzePythonImports(content, sourceNode, basePath);
        }

        // Detect API calls, DB operations, etc.
        this.analyzePatterns(content, sourceNode);
    }

    /**
     * Analyze JavaScript/TypeScript imports
     */
    analyzeJSImports(content, sourceNode, basePath) {
        // ES6 imports: import X from './path'
        const importRegex = /import\s+(?:(?:\{[^}]*\}|[^{}\s]+)\s+from\s+)?['"]([^'"]+)['"]/g;
        let match;

        while ((match = importRegex.exec(content)) !== null) {
            const importPath = match[1];

            // Only process relative imports
            if (importPath.startsWith('.')) {
                const resolvedPath = this.resolvePath(basePath, importPath);
                const targetNode = this.findNodeByPath(resolvedPath);

                if (targetNode && targetNode.id !== sourceNode.id) {
                    this.edges.push({
                        source: sourceNode.id,
                        target: targetNode.id,
                        type: 'import'
                    });
                }
            }
        }

        // CommonJS requires: require('./path')
        const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
        while ((match = requireRegex.exec(content)) !== null) {
            const importPath = match[1];

            if (importPath.startsWith('.')) {
                const resolvedPath = this.resolvePath(basePath, importPath);
                const targetNode = this.findNodeByPath(resolvedPath);

                if (targetNode && targetNode.id !== sourceNode.id) {
                    this.edges.push({
                        source: sourceNode.id,
                        target: targetNode.id,
                        type: 'import'
                    });
                }
            }
        }
    }

    /**
     * Analyze Python imports
     */
    analyzePythonImports(content, sourceNode, basePath) {
        // from module import X
        const fromImportRegex = /from\s+(\S+)\s+import/g;
        let match;

        while ((match = fromImportRegex.exec(content)) !== null) {
            const modulePath = match[1].replace(/\./g, '/');
            const targetNode = this.findNodeByPath(modulePath + '.py');

            if (targetNode && targetNode.id !== sourceNode.id) {
                this.edges.push({
                    source: sourceNode.id,
                    target: targetNode.id,
                    type: 'import'
                });
            }
        }

        // import module
        const importRegex = /^import\s+(\S+)/gm;
        while ((match = importRegex.exec(content)) !== null) {
            const modulePath = match[1].replace(/\./g, '/');
            const targetNode = this.findNodeByPath(modulePath + '.py');

            if (targetNode && targetNode.id !== sourceNode.id) {
                this.edges.push({
                    source: sourceNode.id,
                    target: targetNode.id,
                    type: 'import'
                });
            }
        }
    }

    /**
     * Analyze common patterns (API, DB, etc.)
     */
    analyzePatterns(content, sourceNode) {
        // Detect API endpoints
        const endpointPatterns = [
            /app\.(get|post|put|delete|patch)\s*\(\s*['"]([^'"]+)['"]/gi,
            /router\.(get|post|put|delete|patch)\s*\(\s*['"]([^'"]+)['"]/gi,
            /@(Get|Post|Put|Delete|Patch)\s*\(\s*['"]([^'"]+)['"]/gi
        ];

        endpointPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                const path = match[2];
                const existingEndpoint = this.nodes.find(n => n.name === path && n.type === 'endpoint');

                if (!existingEndpoint) {
                    const endpointNode = {
                        id: generateId(),
                        name: path,
                        type: 'endpoint',
                        path: path
                    };
                    this.nodes.push(endpointNode);
                    this.nodeMap.set(path, endpointNode);

                    this.edges.push({
                        source: sourceNode.id,
                        target: endpointNode.id,
                        type: 'endpoint_handler'
                    });
                }
            }
        });

        // Detect database operations
        if (/\.(find|findOne|findMany|create|update|delete|query|execute)/i.test(content)) {
            // Mark source as having DB operations
            if (!sourceNode.hasDb) {
                sourceNode.hasDb = true;
            }
        }
    }

    /**
     * Resolve relative path
     */
    resolvePath(basePath, relativePath) {
        const parts = basePath.split('/').filter(p => p);
        const relParts = relativePath.split('/');

        for (const part of relParts) {
            if (part === '..') {
                parts.pop();
            } else if (part !== '.') {
                parts.push(part);
            }
        }

        let resolved = parts.join('/');

        // Try adding extensions if not present
        if (!resolved.includes('.')) {
            const extensions = ['.js', '.ts', '.jsx', '.tsx', '/index.js', '/index.ts'];
            for (const ext of extensions) {
                if (this.nodeMap.has(resolved + ext)) {
                    return resolved + ext;
                }
            }
        }

        return resolved;
    }

    /**
     * Find node by path (fuzzy match)
     */
    findNodeByPath(searchPath) {
        // Direct match
        if (this.nodeMap.has(searchPath)) {
            return this.nodeMap.get(searchPath);
        }

        // Fuzzy match - find node where path ends with searchPath
        for (const [path, node] of this.nodeMap) {
            if (path.endsWith(searchPath) || path.endsWith(searchPath.replace(/^\.\//, ''))) {
                return node;
            }
        }

        return null;
    }
}

// Create global scanner instance
const scanner = new CodebaseScanner();
