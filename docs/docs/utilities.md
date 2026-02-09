
# Utilities Script Reference: utilities.js

This document describes the utility functions provided by `utilities.js` for the RERUM Playground web application.

## Overview and Purpose
`utilities.js` exports a set of utility functions and objects for logging, API requests, broadcasting events, and generating UI thumbnails. These utilities support modular, reusable, and maintainable code throughout the playground.

---

## Function Descriptions

### logger
- **Type:** `object`
- **Purpose:** Logging utility with multiple levels, controlled by the app's log level (`config.LOGLEVEL`).
- **Methods:**
	- `fatal(msg)`, `error(msg)`, `warn(msg)`, `info(msg)`, `debug(msg)`, `trace(msg)`
	- **Parameters:** `msg` (`string`): Message to log.
	- **Returns:** `void`

### handleHTTPError(response, getAs = "json")
- **Parameters:**
	- `response` (`HTTPResponse`): Response from `fetch()`.
	- `getAs` (`string`, optional): "json" or "text".
- **Returns:** `Promise<any>`
- **Behavior:** Returns parsed response if successful, throws error and logs warning otherwise.

### API
- **Type:** `object`
- **Purpose:** Methods for making HTTP requests to RERUM endpoints.
- **Methods:**
	- `create(obj)`, `update(obj)`, `overwrite(obj)`, `delete(uri)`, `query(obj)`, `resolveJSON(uri)`, `resolveString(uri)`
	- **Parameters:**
		- `obj` (`object`): Data to send (for create/update/overwrite/query).
		- `uri` (`string`): URI to delete or resolve.
	- **Returns:** `Promise<any>`

### broadcast(event = {}, type = "message", element = document, obj = {})
- **Parameters:**
	- `event` (`object`): Event object.
	- `type` (`string`): Event type name.
	- `element` (`HTMLElement`): Element to dispatch event on.
	- `obj` (`object`): Additional event details.
- **Returns:** `boolean` (true if event dispatched)

### useTool(tool, data)
- **Parameters:**
	- `tool` (`object`): Tool object from catalog.
	- `data` (`any`): Optional data to pass.
- **Returns:** `Promise<void>`
- **Behavior:** Navigates to the tool's view URL.

### useInterface(inter, data)
### useTechnology(tech, data)
- **Parameters:**
	- `inter`/`tech` (`object`): Interface/technology object.
	- `data` (`any`): Optional data to pass.
- **Returns:** `Promise<void>`
- **Behavior:** Placeholder for navigation logic.

### thumbnailGenerator(entry)
- **Parameters:**
	- `entry` (`object`): Tool/interface/technology object with `label`, `icon`, `view`, `description`.
- **Returns:** `string` (HTML markup)
- **Behavior:** Generates HTML for a catalog entry thumbnail.

---

## Example Usage/Workflow Snippet

```javascript
import UTILS from './utilities.js';

// Log an info message
UTILS.logger.info('App started');

// Make a create API call
UTILS.API.create({ label: 'Example' }).then(result => console.log(result));

// Broadcast a custom event
UTILS.broadcast({}, 'custom_event', document, { foo: 'bar' });

// Generate a thumbnail for a tool
const html = UTILS.thumbnailGenerator({ label: 'TinyNode', icon: 'icon.png', view: 'https://tiny.rerum.io/', description: 'Flexible tool.' });
document.body.innerHTML += html;
```

---

## Dependencies/Relationships
- Imports `config.js` for configuration and endpoint URLs.
- Used by most modules for logging, API calls, event broadcasting, and UI generation.
- No external dependencies beyond browser APIs (`fetch`, `CustomEvent`).

---

For further details, see the source file: `web/js/utilities.js`.
