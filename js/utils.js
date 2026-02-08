/**
 * Utils - Helper functions and constants
 */

// Node type configurations with colors
const NODE_TYPES = {
    endpoint: { color: '#ef4444', label: 'Endpoint' },
    collection: { color: '#f97316', label: 'Collection' },
    file: { color: '#3b82f6', label: 'File' },
    router: { color: '#22c55e', label: 'Router' },
    script: { color: '#a855f7', label: 'Script' },
    task: { color: '#eab308', label: 'Task' },
    cache_key: { color: '#ec4899', label: 'Cache Key' },
    service: { color: '#14b8a6', label: 'Service' },
    utility: { color: '#6366f1', label: 'Utility' },
    webhook: { color: '#f43f5e', label: 'Webhook' },
    event: { color: '#84cc16', label: 'Event' },
    external_api: { color: '#06b6d4', label: 'External API' }
};

// Edge type configurations with colors
const EDGE_TYPES = {
    db_read: { color: '#22c55e', label: 'DB Read' },
    endpoint_handler: { color: '#3b82f6', label: 'Endpoint Handler' },
    db_write: { color: '#f97316', label: 'DB Write' },
    api_call: { color: '#a855f7', label: 'API Call' },
    cache_read: { color: '#14b8a6', label: 'Cache Read' },
    cache_write: { color: '#ec4899', label: 'Cache Write' },
    webhook_receive: { color: '#eab308', label: 'Webhook Receive' },
    event_publish: { color: '#84cc16', label: 'Event Publish' },
    webhook_send: { color: '#ef4444', label: 'Webhook Send' },
    import: { color: '#58a6ff', label: 'Import' },
    export: { color: '#a371f7', label: 'Export' }
};

/**
 * Count occurrences of each type in data
 */
function countByType(items, typeKey = 'type') {
    const counts = {};
    items.forEach(item => {
        const type = item[typeKey] || 'unknown';
        counts[type] = (counts[type] || 0) + 1;
    });
    return counts;
}

/**
 * Generate unique ID
 */
function generateId() {
    return 'id_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Debounce function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Get file extension
 */
function getFileExtension(filename) {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase();
}

/**
 * Determine node type from file extension
 */
function getNodeTypeFromExtension(ext) {
    const mapping = {
        'js': 'file',
        'ts': 'file',
        'jsx': 'file',
        'tsx': 'file',
        'py': 'script',
        'rb': 'script',
        'go': 'file',
        'rs': 'file',
        'java': 'file',
        'css': 'utility',
        'scss': 'utility',
        'less': 'utility',
        'html': 'file',
        'vue': 'file',
        'svelte': 'file',
        'json': 'collection',
        'yaml': 'collection',
        'yml': 'collection',
        'sql': 'collection',
        'md': 'utility',
        'txt': 'utility'
    };
    return mapping[ext] || 'file';
}

/**
 * Show loading overlay
 */
function showLoading() {
    document.getElementById('loadingOverlay').classList.add('visible');
}

/**
 * Hide loading overlay
 */
function hideLoading() {
    document.getElementById('loadingOverlay').classList.remove('visible');
}

/**
 * Download file
 */
function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Download image from data URL
 */
function downloadImage(dataUrl, filename) {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
