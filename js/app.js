/**
 * App - Main application logic
 */

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize 3D graph
    graph3d = new Graph3D('graphContainer');

    // Load sample data or show empty state
    loadSampleData();

    // Setup event listeners
    setupEventListeners();

    // Handle window resize
    window.addEventListener('resize', debounce(() => {
        graph3d.resize();
    }, 200));
});

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Upload JSON button
    const uploadBtn = document.getElementById('uploadBtn');
    const fileInput = document.getElementById('fileInput');

    uploadBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileUpload);

    // Scan folder button
    const scanFolderBtn = document.getElementById('scanFolderBtn');
    const folderInput = document.getElementById('folderInput');

    scanFolderBtn.addEventListener('click', () => folderInput.click());
    folderInput.addEventListener('change', handleFolderScan);

    // Search input
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', debounce((e) => {
        graph3d.setSearch(e.target.value);
    }, 300));

    // Display options
    document.getElementById('showLabels').addEventListener('change', (e) => {
        graph3d.setShowLabels(e.target.checked);
    });

    document.getElementById('showArrows').addEventListener('change', (e) => {
        graph3d.setShowArrows(e.target.checked);
    });

    document.getElementById('freezeLayout').addEventListener('change', (e) => {
        graph3d.setFreezeLayout(e.target.checked);
    });

    // Close detail panel
    document.getElementById('closeDetail').addEventListener('click', () => {
        graph3d.clearSelection();
    });

    // Export buttons
    document.getElementById('exportPng').addEventListener('click', () => {
        exporter.exportPNG();
    });

    document.getElementById('exportSvg').addEventListener('click', () => {
        exporter.exportSVG();
    });

    document.getElementById('exportJson').addEventListener('click', () => {
        exporter.exportJSON();
    });
}

/**
 * Handle JSON file upload
 */
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    document.getElementById('fileName').textContent = 'Loaded: ' + file.name;
    showLoading();

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);

            // Validate data structure
            if (!data.nodes || !Array.isArray(data.nodes)) {
                throw new Error('Invalid JSON: missing nodes array');
            }
            if (!data.edges && !data.links) {
                throw new Error('Invalid JSON: missing edges/links array');
            }

            // Normalize edges/links
            if (data.links && !data.edges) {
                data.edges = data.links;
            }

            graph3d.loadData(data);
        } catch (error) {
            console.error('Parse error:', error);
            alert('Failed to parse JSON file: ' + error.message);
        }
        hideLoading();
    };

    reader.onerror = () => {
        hideLoading();
        alert('Failed to read file');
    };

    reader.readAsText(file);
}

/**
 * Handle folder scan
 */
async function handleFolderScan(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    document.getElementById('fileName').textContent = 'Scanning folder...';

    try {
        const graphData = await scanner.scanFiles(files);

        if (graphData.nodes.length === 0) {
            alert('No code files found in the selected folder.');
            document.getElementById('fileName').textContent = 'No files found';
            return;
        }

        document.getElementById('fileName').textContent = `Scanned: ${graphData.nodes.length} files`;
        graph3d.loadData(graphData);
    } catch (error) {
        console.error('Scan error:', error);
        alert('Failed to scan folder: ' + error.message);
        document.getElementById('fileName').textContent = 'Scan failed';
    }
}

/**
 * Load sample data for demo
 */
function loadSampleData() {
    const sampleData = {
        nodes: [
            // Core files
            { id: '1', name: 'app.js', type: 'file', path: 'src/app.js' },
            { id: '2', name: 'server.js', type: 'file', path: 'src/server.js' },
            { id: '3', name: 'index.js', type: 'file', path: 'src/index.js' },

            // Routers
            { id: '4', name: 'userRouter.js', type: 'router', path: 'src/routes/userRouter.js' },
            { id: '5', name: 'productRouter.js', type: 'router', path: 'src/routes/productRouter.js' },
            { id: '6', name: 'orderRouter.js', type: 'router', path: 'src/routes/orderRouter.js' },
            { id: '7', name: 'authRouter.js', type: 'router', path: 'src/routes/authRouter.js' },

            // Endpoints
            { id: '8', name: '/api/users', type: 'endpoint', path: '/api/users' },
            { id: '9', name: '/api/products', type: 'endpoint', path: '/api/products' },
            { id: '10', name: '/api/orders', type: 'endpoint', path: '/api/orders' },
            { id: '11', name: '/api/auth/login', type: 'endpoint', path: '/api/auth/login' },
            { id: '12', name: '/api/auth/register', type: 'endpoint', path: '/api/auth/register' },

            // Services
            { id: '13', name: 'UserService', type: 'service', path: 'src/services/UserService.js' },
            { id: '14', name: 'ProductService', type: 'service', path: 'src/services/ProductService.js' },
            { id: '15', name: 'OrderService', type: 'service', path: 'src/services/OrderService.js' },
            { id: '16', name: 'AuthService', type: 'service', path: 'src/services/AuthService.js' },
            { id: '17', name: 'EmailService', type: 'service', path: 'src/services/EmailService.js' },

            // Collections/Models
            { id: '18', name: 'users', type: 'collection', path: 'db/users' },
            { id: '19', name: 'products', type: 'collection', path: 'db/products' },
            { id: '20', name: 'orders', type: 'collection', path: 'db/orders' },
            { id: '21', name: 'sessions', type: 'collection', path: 'db/sessions' },

            // Utilities
            { id: '22', name: 'logger.js', type: 'utility', path: 'src/utils/logger.js' },
            { id: '23', name: 'validator.js', type: 'utility', path: 'src/utils/validator.js' },
            { id: '24', name: 'helpers.js', type: 'utility', path: 'src/utils/helpers.js' },

            // Scripts
            { id: '25', name: 'migrate.py', type: 'script', path: 'scripts/migrate.py' },
            { id: '26', name: 'seed.py', type: 'script', path: 'scripts/seed.py' },

            // Cache keys
            { id: '27', name: 'user_cache', type: 'cache_key', path: 'cache:users' },
            { id: '28', name: 'product_cache', type: 'cache_key', path: 'cache:products' },

            // Tasks
            { id: '29', name: 'sendEmails', type: 'task', path: 'tasks/sendEmails.js' },
            { id: '30', name: 'processOrders', type: 'task', path: 'tasks/processOrders.js' },

            // Webhooks
            { id: '31', name: 'stripeWebhook', type: 'webhook', path: 'webhooks/stripe.js' },
            { id: '32', name: 'githubWebhook', type: 'webhook', path: 'webhooks/github.js' },

            // Events
            { id: '33', name: 'userCreated', type: 'event', path: 'events/userCreated' },
            { id: '34', name: 'orderPlaced', type: 'event', path: 'events/orderPlaced' },

            // External APIs
            { id: '35', name: 'StripeAPI', type: 'external_api', path: 'https://api.stripe.com' },
            { id: '36', name: 'SendGridAPI', type: 'external_api', path: 'https://api.sendgrid.com' },

            // More files for density
            { id: '37', name: 'middleware.js', type: 'file', path: 'src/middleware.js' },
            { id: '38', name: 'config.js', type: 'file', path: 'src/config.js' },
            { id: '39', name: 'database.js', type: 'file', path: 'src/database.js' },
            { id: '40', name: 'redis.js', type: 'file', path: 'src/redis.js' }
        ],
        edges: [
            // App structure
            { source: '3', target: '1', type: 'import' },
            { source: '1', target: '2', type: 'import' },
            { source: '1', target: '37', type: 'import' },
            { source: '1', target: '38', type: 'import' },

            // Routers to App
            { source: '1', target: '4', type: 'import' },
            { source: '1', target: '5', type: 'import' },
            { source: '1', target: '6', type: 'import' },
            { source: '1', target: '7', type: 'import' },

            // Routers to Endpoints
            { source: '4', target: '8', type: 'endpoint_handler' },
            { source: '5', target: '9', type: 'endpoint_handler' },
            { source: '6', target: '10', type: 'endpoint_handler' },
            { source: '7', target: '11', type: 'endpoint_handler' },
            { source: '7', target: '12', type: 'endpoint_handler' },

            // Routers to Services
            { source: '4', target: '13', type: 'import' },
            { source: '5', target: '14', type: 'import' },
            { source: '6', target: '15', type: 'import' },
            { source: '7', target: '16', type: 'import' },

            // Services to Collections (DB)
            { source: '13', target: '18', type: 'db_read' },
            { source: '13', target: '18', type: 'db_write' },
            { source: '14', target: '19', type: 'db_read' },
            { source: '14', target: '19', type: 'db_write' },
            { source: '15', target: '20', type: 'db_read' },
            { source: '15', target: '20', type: 'db_write' },
            { source: '16', target: '21', type: 'db_read' },
            { source: '16', target: '21', type: 'db_write' },

            // Services to Cache
            { source: '13', target: '27', type: 'cache_read' },
            { source: '13', target: '27', type: 'cache_write' },
            { source: '14', target: '28', type: 'cache_read' },
            { source: '14', target: '28', type: 'cache_write' },

            // Services to Utilities
            { source: '13', target: '22', type: 'import' },
            { source: '13', target: '23', type: 'import' },
            { source: '14', target: '22', type: 'import' },
            { source: '15', target: '23', type: 'import' },
            { source: '16', target: '24', type: 'import' },

            // Email service
            { source: '17', target: '36', type: 'api_call' },
            { source: '29', target: '17', type: 'import' },

            // Order processing
            { source: '30', target: '15', type: 'import' },
            { source: '30', target: '35', type: 'api_call' },

            // Webhooks
            { source: '31', target: '15', type: 'webhook_receive' },
            { source: '31', target: '35', type: 'api_call' },
            { source: '32', target: '26', type: 'webhook_receive' },

            // Events
            { source: '13', target: '33', type: 'event_publish' },
            { source: '15', target: '34', type: 'event_publish' },
            { source: '33', target: '17', type: 'import' },
            { source: '34', target: '30', type: 'import' },

            // Scripts to Collections
            { source: '25', target: '18', type: 'db_write' },
            { source: '25', target: '19', type: 'db_write' },
            { source: '26', target: '18', type: 'db_write' },
            { source: '26', target: '19', type: 'db_write' },
            { source: '26', target: '20', type: 'db_write' },

            // Database connections
            { source: '39', target: '18', type: 'db_read' },
            { source: '39', target: '19', type: 'db_read' },
            { source: '39', target: '20', type: 'db_read' },
            { source: '40', target: '27', type: 'cache_read' },
            { source: '40', target: '28', type: 'cache_read' }
        ]
    };

    graph3d.loadData(sampleData);
}
