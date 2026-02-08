# 🌐 Code Graph Viewer

A stunning **3D interactive visualization tool** for exploring code relationships and dependencies. Built with Three.js and 3d-force-graph.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)

## ✨ Features

- 🎮 **3D Interactive Graph** - Rotate, zoom, and pan with mouse controls
- 🔍 **Search & Filter** - Find nodes by name, filter by type
- 📊 **Multiple Node Types** - 12 distinct node types with unique colors
- 🔗 **Edge Visualization** - 11 relationship types with directional arrows
- 📋 **Detail Panel** - Click nodes to see connections and metadata
- 📁 **Codebase Scanner** - Analyze folders and auto-generate graphs
- 📤 **Export Options** - Save as PNG, SVG, or JSON

## 🚀 Quick Start

### Option 1: GitHub Pages (Recommended)
Simply visit the live demo: **[https://yourusername.github.io/code-graph-viewer](https://yourusername.github.io/code-graph-viewer)**

### Option 2: Run Locally
```bash
# Clone the repository
git clone https://github.com/yourusername/code-graph-viewer.git
cd code-graph-viewer

# Serve with any static file server
npx serve .

# Open http://localhost:3000
```

## 🎮 Controls

| Action | Control |
|--------|---------|
| **Rotate** | Left-click + drag |
| **Zoom** | Mouse wheel |
| **Pan** | Right-click + drag |
| **Select node** | Click on node |
| **Close detail** | Click ✕ or background |

## 📁 Project Structure

```
code-graph-viewer/
├── index.html          # Main HTML
├── css/
│   └── styles.css      # Dark theme styling
└── js/
    ├── app.js          # Main application logic
    ├── graph.js        # 3D visualization (Three.js)
    ├── scanner.js      # Codebase analyzer
    ├── exporter.js     # Export PNG/SVG/JSON
    └── utils.js        # Helper functions
```

## 📊 Node Types

| Type | Color | Description |
|------|-------|-------------|
| `endpoint` | 🔴 Red | API endpoints |
| `collection` | 🟠 Orange | Database collections |
| `file` | 🔵 Blue | Source files |
| `router` | 🟢 Green | Route handlers |
| `script` | 🟣 Purple | Scripts |
| `task` | 🟡 Yellow | Background tasks |
| `cache_key` | 💗 Pink | Cache keys |
| `service` | 🩵 Teal | Services |
| `utility` | 💜 Indigo | Utility modules |
| `webhook` | 🌸 Rose | Webhooks |
| `event` | 🟢 Lime | Events |
| `external_api` | 🌊 Cyan | External APIs |

## 📤 Custom Data Format

Upload your own graph data in JSON format:

```json
{
  "nodes": [
    { "id": "1", "name": "app.js", "type": "file", "path": "src/app.js" },
    { "id": "2", "name": "UserService", "type": "service", "path": "src/services/UserService.js" }
  ],
  "edges": [
    { "source": "1", "target": "2", "type": "import" }
  ]
}
```

### Edge Types
- `import` - Module imports
- `db_read` / `db_write` - Database operations
- `api_call` - External API calls
- `endpoint_handler` - Route to endpoint mapping
- `cache_read` / `cache_write` - Cache operations
- `webhook_receive` / `webhook_send` - Webhook connections
- `event_publish` - Event publishing

## 🔧 Technologies

- [Three.js](https://threejs.org/) - 3D rendering
- [3d-force-graph](https://github.com/vasturiano/3d-force-graph) - Force-directed graph
- [html2canvas](https://html2canvas.hertzen.com/) - PNG export
- Vanilla JavaScript, HTML5, CSS3

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Inspired by code visualization tools like Madge and Dependency Cruiser
- Built with ❤️ for the developer community

---

**Star ⭐ this repo if you find it useful!**
