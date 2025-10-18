
# Configuration Reference: config.js

This document describes the configuration options available in `config.js` for the RERUM Playground web application.

## Overview and Purpose
`config.js` exports a global configuration object for the app, centralizing URLs, event names, logging levels, version info, and catalogs for tools, interfaces, and technologies. This module enables consistent configuration and integration across the playground.

---

## Property Descriptions

### URLS
- **Type:** `object`
- **Purpose:** Endpoints for interacting with RERUM services.
- **Properties:**
	- `CREATE`, `UPDATE`, `PATCH`, `OVERWRITE`, `QUERY`, `SINCE`, `HISTORY` (all `string` URLs)

### EVENTS
- **Type:** `object`
- **Purpose:** Event names used throughout the app for broadcasting and handling UI/application state changes.
- **Properties:**
	- `CREATED`, `UPDATED`, `LOADED`, `NEW_VIEW`, `VIEW_RENDERED`, `CLICKED` (all `string` event names)

### APPAGENT
- **Type:** `string`
- **Purpose:** Identifier for the registered app agent. Should be set after registering a new app with RERUM.

### LOGLEVEL
- **Type:** `number`
- **Purpose:** Controls the verbosity of logging throughout the app.
- **Values:**
	- `0`: OFF
	- `6`: TRACE
	- `5`: DEBUG
	- `4`: INFO
	- `3`: WARNING (default)
	- `2`: ERROR
	- `1`: FATAL

### VERSION
- **Type:** `string`
- **Purpose:** Current version of the playground app.

### TOOLS
- **Type:** `object`
- **Purpose:** Catalog of available tools for the playground.
- **Properties:**
	- `id` (`string`): DOM id for the tool set container.
	- `catalog` (`array`): Imported from `toolsCatalog.js`.

### INTERFACES
- **Type:** `object`
- **Purpose:** Catalog of available interfaces (currently empty).
- **Properties:**
	- `id` (`string`): DOM id for the interface set container.
	- `catalog` (`array`): Intended for interface definitions.

### TECHNOLOGIES
- **Type:** `object`
- **Purpose:** Catalog of available technologies (currently empty).
- **Properties:**
	- `id` (`string`): DOM id for the technology set container.
	- `catalog` (`array`): Intended for technology definitions.

---

## Example Usage/Workflow Snippet

```javascript
import config from './config.js';

// Access the CREATE endpoint
fetch(config.URLS.CREATE, { method: 'POST', body: JSON.stringify({}) });

// Use an event name
document.dispatchEvent(new CustomEvent(config.EVENTS.CREATED));

// List all tool labels
config.TOOLS.catalog.forEach(tool => console.log(tool.label));
```

---

## Dependencies/Relationships
- Imports `ToolsCatalog` from `toolsCatalog.js` for the tools catalog.
- Used by most modules for configuration, event names, and endpoint URLs.
- Can be extended to import interface/technology catalogs from other repositories.

---

For further details, see the source file: `web/js/config.js`.
