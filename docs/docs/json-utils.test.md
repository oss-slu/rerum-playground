# JSON Utilities Tests: json-utils.test.js

This document describes the Jest test cases for `json-utils.js` found in `web/js/json-utils.test.js`.

## Overview and Purpose
The test file verifies the correctness of the JSON helper functions (`prettifyJSON` and `validateJSON`). Tests cover:
- That `prettifyJSON` returns a non-undefined formatted output for valid objects.
- That `validateJSON` returns `true` for valid JSON strings.
- That invalid JSON strings return `false` from `validateJSON`.
- That `prettifyJSON` returns a helpful `Invalid JSON:` message when given an invalid JSON string.

These tests ensure the utilities behave predictably for both valid and invalid inputs and provide useful error messaging for consumers.

---

## Test Cases (from `json-utils.test.js`)

### Test: 'JSON is formatted.'
- **Purpose:** Ensure `prettifyJSON` can accept a plain object and return a formatted JSON string.
- **Assertion:** The result of `prettifyJSON(Student)` is not `undefined`.

### Test: 'JSON is validated.'
- **Purpose:** Verify `validateJSON` returns `true` for a valid JSON string.
- **Assertion:** `validateJSON(JSON.stringify(Student,null,2))` is `true`.

### Test: 'Invalid JSON should return false'
- **Purpose:** Ensure `validateJSON` returns `false` for malformed JSON.
- **Assertion:** `validateJSON("{name: 'Brian'}")` is `false`.

### Test: 'Invalid JSON should show helpful message'
- **Purpose:** When given invalid JSON, `prettifyJSON` should return a string beginning with `Invalid JSON:`.
- **Assertion:** The returned string matches `/Invalid JSON/`.

---

## Example: Running the Tests

These tests use Jest-style assertions. To run them in this project, use the repository's test script (if present) or run Jest directly; for example:

```powershell
# from repository root
npm test
# or run jest for the specific file
npx jest web/js/json-utils.test.js
```

If your project does not have Jest configured globally, using `npx jest` will download and run it temporarily for the command.

---

## Dependencies / Relationships
- Depends on `web/js/json-utils.js` functions: `prettifyJSON` and `validateJSON`.
- The tests are a lightweight sanity check; they do not require network access and rely only on Jest and Node.

For further details, see the source test file: `web/js/json-utils.test.js`.
