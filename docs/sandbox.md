
# Sandbox Script Reference: sandbox.js

This document describes the functionality provided by `sandbox.js` for the RERUM Playground web application.

## Overview and Purpose
`sandbox.js` manages the visibility of sandbox sections and provides placeholder action handlers for UI buttons. It enables dynamic section switching and basic feedback for user actions in the sandbox interface.

---

## Function Descriptions

### showSection(id)
- **Parameters:**
	- `id` (`string`): The DOM id of the section to show.
- **Returns:** `void`
- **Behavior:**
	- Hides all elements with the class `.sandbox-section`.
	- Shows the section with the given `id` by removing the `hidden` class.
- **Exported:** Globally as `window.showSection`.

### Action Handlers (DOMContentLoaded)
- **Parameters:** None
- **Returns:** `void`
- **Behavior:**
	- Adds click event listeners to all elements with the class `.action-btn`.
	- On click, logs and alerts the action name (button text) as a placeholder.

---

## Example Usage/Workflow Snippet

```javascript
// Show a specific sandbox section
showSection('section1');

// Example HTML:
// <button class="action-btn">Save</button>
// Clicking this button will trigger a log and alert.
```

---

## Dependencies/Relationships
- No external dependencies.
- Relies on DOM structure with `.sandbox-section` and `.action-btn` classes.
- Can be used by other scripts to control sandbox UI behavior.

---

For further details, see the source file: `web/js/sandbox.js`.
