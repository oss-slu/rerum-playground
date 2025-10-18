
# Manifest Storage Reference: manifestStorage.js

This document describes the manifest storage utilities provided by `manifestStorage.js` for the RERUM Playground web application.

## Overview and Purpose
`manifestStorage.js` provides functions to store and retrieve manifest links using the browser's local storage. This enables persistent tracking of user-loaded manifests across sessions, supporting features like recently used manifests and manifest history.

---

## Function Descriptions

### MANIFEST_LINKS_KEY
- **Type:** `string`
- **Value:** `'storedManifestLinks'`
- **Purpose:** Key used for storing manifest links in local storage.

### storeManifestLink(manifestLink)
- **Parameters:**
	- `manifestLink` (`string`): The manifest URL to store.
- **Returns:** `void`
- **Behavior:**
	- Retrieves the current list of stored manifest links using `getStoredManifestLinks()`.
	- Adds the new link if it is not already present.
	- Updates local storage with the new list.

### getStoredManifestLinks()
- **Parameters:** None
- **Returns:** `Array<string>`
- **Behavior:**
	- Reads the manifest links from local storage.
	- Returns an array of manifest URLs, or an empty array if none are found.

---

## Example Usage/Workflow Snippet

```javascript
import { storeManifestLink, getStoredManifestLinks } from './manifestStorage.js';

// Store a new manifest link
storeManifestLink('https://example.org/manifest.json');

// Retrieve all stored manifest links
const links = getStoredManifestLinks();
console.log(links);
```

---

## Dependencies/Relationships
- No external dependencies; uses browser `localStorage` API.
- Used by other modules (e.g., `tools.js`) to persist and retrieve manifest links for user workflows.

---

For further details, see the source file: `web/js/manifestStorage.js`.
