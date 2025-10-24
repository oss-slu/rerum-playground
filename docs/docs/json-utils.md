# JSON Utilities Reference: json-utils.js

This document describes the small JSON helper utilities provided by `json-utils.js` for the RERUM Playground project.

## Overview and Purpose
`json-utils.js` provides two focused helpers for working with JSON strings and objects:
- `prettifyJSON` — formats JSON with indentation for human-readable display, and returns a helpful error message when input is not valid JSON.
- `validateJSON` — returns a boolean indicating whether a string is valid JSON.

These helpers are useful when accepting JSON input from users, preparing JSON for display, or performing quick client-side validation before sending data to APIs.

---

## Function Descriptions

### prettifyJSON(input)
- **Parameters:**
  - `input` (`string | object`) — A JSON string or a plain JavaScript object.
- **Returns:** `string`
- **Behavior:**
  - If `input` is a string, attempts to `JSON.parse` it to an object. If parsing succeeds, returns `JSON.stringify(obj, null, 2)` (pretty-printed JSON with 2-space indentation).
  - If `input` is already an object, returns its pretty-printed JSON representation.
  - If parsing fails, returns a short error string that begins with `Invalid JSON:` and includes the parser's error message.

### validateJSON(input)
- **Parameters:**
  - `input` (`string`) — A string that should contain JSON.
- **Returns:** `boolean`
- **Behavior:**
  - Attempts to `JSON.parse(input)` and returns `true` when parsing succeeds, otherwise returns `false` when parsing throws an error.

---

## Example Usage / Workflow Snippet

```javascript
// CommonJS usage (as in this project)
const { prettifyJSON, validateJSON } = require('../web/js/json-utils.js');

const raw = '{"name":"Alice","age":30}';
if (validateJSON(raw)) {
  const pretty = prettifyJSON(raw);
  console.log(pretty);
} else {
  console.warn('Provided input is not valid JSON');
}

// Passing an object directly
const obj = { a: 1, b: [2,3] };
console.log(prettifyJSON(obj));
```

---

## Dependencies / Relationships
- No external dependencies — uses the built-in `JSON` global.
- The test file `web/js/json-utils.test.js` exercises these functions (see `json-utils.test.md`).
- Use these helpers in UI code that reads user-supplied JSON or displays API responses.

---

For further details, see the source file: `web/js/json-utils.js`.
