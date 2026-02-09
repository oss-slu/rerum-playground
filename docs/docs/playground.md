# Playground Script Reference: playground.js

This document describes the main application initialization and unique functionality provided by `playground.js` for the RERUM Playground web application.

## Overview and Purpose
`playground.js` contains app-specific functions for initializing the playground, loading shared UI components (footer and menu), and managing the sidebar menu. It enables dynamic loading of HTML fragments and provides a global function for toggling the sidebar, supporting a modular and interactive user experience.

---

## Function Descriptions

### Footer and Menu Loading
- **Purpose:** Dynamically loads the footer and menu HTML into designated placeholders in the DOM.
- **Implementation:**
  - Uses `fetch('footer.html')` and `fetch('menu.html')` to retrieve HTML content.
  - Inserts the content into elements with ids `footer-placeholder` and `menu-placeholder`.
  - Handles errors by logging to the console.
- **Parameters:** None
- **Returns:** `void`

### openCloseMenu()
- **Purpose:** Toggles the sidebar menu and shifts the main content area.
- **Parameters:** None
- **Returns:** `void`
- **Behavior:**
  - Toggles the `sidebar-open` class on the element with id `toolBar`.
  - Toggles the `shift` class on the main content container (tries `.content`, `.container`, or `#tool_set`).
- **Exported:** Globally as `window.openCloseMenu`.

---

## Example Usage/Workflow Snippet

```javascript
// Toggle the sidebar menu
openCloseMenu();

// Example: Load the footer and menu automatically on page load
// (This is handled by the script itself)
// <div id="footer-placeholder"></div>
// <div id="menu-placeholder"></div>
```

---

## Dependencies/Relationships
- Relies on the presence of `footer.html` and `menu.html` files in the same directory for dynamic loading.
- Expects DOM elements with ids `footer-placeholder`, `menu-placeholder`, and `toolBar`.
- The sidebar toggling interacts with main content containers (`.content`, `.container`, or `#tool_set`).
- No external JavaScript dependencies; uses browser `fetch` API and DOM manipulation.

---

For further details, see the source file: `web/js/playground.js`.
