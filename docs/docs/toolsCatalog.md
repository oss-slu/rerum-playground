
# Tools Catalog Reference: toolsCatalog.js

This document describes the tools catalog defined in `toolsCatalog.js` for the RERUM Playground web application.

## Overview and Purpose
`toolsCatalog.js` exports an array of tool objects, each representing a web-based utility available in the playground. The catalog enables dynamic listing and launching of tools for user workflows.

---

## Tool Object Structure
Each tool in the catalog contains:
- **label** (`string`): The name of the tool.
- **icon** (`string`): Path to the tool's icon image.
- **view** (`string`): URL for the tool's web interface.
- **description** (`string`): Brief summary of the tool's purpose.

---

## Tools List

### 1. TinyNode
- **Icon**: `./images/rerum_logo.png`
- **View**: [https://tiny.rerum.io/](https://tiny.rerum.io/)
- **Description**: Flexible tool for interacting with RERUM objects, allowing users to experiment with data.

### 2. Geolocating Web Annotation Tool
- **Icon**: `./images/rerum_logo.png`
- **View**: [https://geo.rerum.io/](https://geo.rerum.io/)
- **Description**: Annotate data with geolocation coordinates by selecting points on a map.

### 3. navPlace Object Tool
- **Icon**: `./images/rerum_logo.png`
- **View**: [https://geo.rerum.io/](https://geo.rerum.io/)
- **Description**: Interact with place-based objects in a spatial context.

### 4. TPEN
- **Icon**: `./images/T-PEN_logo.png`
- **View**: [https://t-pen.org/TPEN/](https://t-pen.org/TPEN/)
- **Description**: Transcribe manuscripts by aligning text with scanned images for research and accuracy.

### 5. Adno
- **Icon**: `./images/adno-logo.png`
- **View**: [https://w.adno.app/](https://w.adno.app/)
- **Description**: View and edit IIIF and static images within archives and heritage collections.

### 6. Universal Viewer
- **Icon**: `./images/uv-logo.png`
- **View**: [https://universalviewer.io/](https://universalviewer.io/)
- **Description**: Viewer for web objects, allowing users to share their media with the world.

---

## Example Usage/Workflow Snippet

```javascript
import ToolsCatalog from './toolsCatalog.js';

// List all tool labels
ToolsCatalog.forEach(tool => {
	console.log(tool.label);
});

// Open the first tool's view in a new tab
window.open(ToolsCatalog[0].view, '_blank');
```

---

## Dependencies/Relationships
- Imported by `config.js` and referenced as `TOOLS.catalog`.
- Used by UI modules (e.g., `tools.js`) to render tool lists and handle tool launching.
- No external dependencies; each tool entry is a plain object.

---

For further details, see the source file: `web/js/toolsCatalog.js`.
