
# Tools Script Reference: tools.js

This document describes the main playground scripting utilities provided by `tools.js` for the RERUM Playground web application.

## Overview and Purpose
`tools.js` manages the rendering and interaction logic for tools, interfaces, technologies, and manifest links in the playground. It tracks recently used tools, handles manifest loading, and provides event handlers for user interactions, supporting a dynamic and personalized playground experience.

---

## Function Descriptions

### getRecentlyUsedTools()
- **Parameters:** None
- **Returns:** `Array<object>`
- **Behavior:** Retrieves recently used tools from local storage, or returns an empty array if none are found.

### saveRecentlyUsedTools(recentTools)
- **Parameters:**
	- `recentTools` (`Array<object>`): Array of tool objects to save.
- **Returns:** `void`
- **Behavior:** Saves the array of recently used tools to local storage.

### updateRecentlyUsedTools(clickedTool)
- **Parameters:**
	- `clickedTool` (`object`): The tool object that was clicked.
- **Returns:** `void`
- **Behavior:** Moves the clicked tool to the top of the recently used list and updates local storage.

### initializeInterfaces(config)
- **Parameters:**
	- `config` (`object`): Configuration object for interfaces.
- **Returns:** `Promise<void>`
- **Behavior:** Renders interface thumbnails to the DOM and broadcasts a loaded event.

### initializeTechnologies(config)
- **Parameters:**
	- `config` (`object`): Configuration object for technologies.
- **Returns:** `Promise<void>`
- **Behavior:** Renders technology thumbnails to the DOM and broadcasts a loaded event.

### renderTools()
- **Parameters:** None
- **Returns:** `void`
- **Behavior:** Renders the tool catalog to the DOM, highlighting recently used tools.

### renderStoredManifests()
- **Parameters:** None
- **Returns:** `void`
- **Behavior:** Renders stored manifest links to the DOM.

### handleToolClick(toolLabel)
- **Parameters:**
	- `toolLabel` (`string`): The label of the clicked tool.
- **Returns:** `void`
- **Behavior:** Updates recently used tools, re-renders the tool list, and opens the tool's view in a new tab.

### window.updateToolOrder(toolLabel)
- **Parameters:**
	- `toolLabel` (`string`): The label of the tool to update.
- **Returns:** `void`
- **Behavior:** Updates the order of tools and re-renders the tool list.

---

## Example Usage/Workflow Snippet

```javascript
import { getRecentlyUsedTools, saveRecentlyUsedTools, updateRecentlyUsedTools } from './tools.js';

// Mark a tool as recently used
const tool = { label: 'TinyNode', icon: 'icon.png', view: 'https://tiny.rerum.io/', description: 'Flexible tool.' };
updateRecentlyUsedTools(tool);

// Render the tool list
renderTools();

// Handle manifest link storage
import { storeManifestLink } from './manifestStorage.js';
storeManifestLink('https://example.org/manifest.json');
```

---

## Dependencies/Relationships
- Imports utility functions from `utilities.js` (as `UTILS`).
- Imports configuration from `config.js` (as `PLAYGROUND`).
- Imports tool catalog from `toolsCatalog.js`.
- Imports manifest storage functions from `manifestStorage.js`.
- Used by the playground UI to manage tool, interface, and technology rendering and user interactions.

---

For further details, see the source file: `web/js/tools.js`.
