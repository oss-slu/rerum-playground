# Annotation Search — Testing Checklist

Validation checklist for the annotation search feature before final merge of `133-refactor-and-modularize-search-code`.

Automated tests live in [`web/js/services/searchService.test.js`](../web/js/services/searchService.test.js).  
Run them with:
```bash
cd web/js && npm test
cd web/js && npx jest --verbose searchService
cd web/js && npx jest --coverage
```

---

## Automated Tests (Jest)

### `normalizeHit()` — body text extraction
- [ ] `null` input returns empty shape without throwing
- [ ] `undefined` input returns empty shape without throwing
- [ ] Non-object input (string) returns empty shape
- [ ] `bodyValue` string path extracted
- [ ] `body.value` string path extracted
- [ ] Array `body` — first element's `.value` used
- [ ] `resource.chars` IIIF fallback extracted
- [ ] `resource["cnt:chars"]` fallback extracted
- [ ] No body field → `bodyText` is empty string (not undefined)
- [ ] `snippet` equals `bodyText`

### `normalizeHit()` — ID and score
- [ ] `@id` field read correctly
- [ ] Falls back to `id` when `@id` absent
- [ ] `id` is empty string when neither `@id` nor `id` present
- [ ] `__rerum.score` extracted as a number
- [ ] `score` is `null` when `__rerum` absent

### `normalizeHit()` — target URI shapes
- [ ] String `target` used directly
- [ ] `target.source` string used
- [ ] `target.source.id` used when `source` is an object
- [ ] `target.id` used as fallback
- [ ] First element of array `target` used
- [ ] `targetUri` is `null` when `target` absent

### `extractHits()` — response envelope shapes
- [ ] Raw array returned as-is
- [ ] `data.items` array extracted
- [ ] `data.results` array extracted
- [ ] `data.hits` array extracted
- [ ] `data.docs` array extracted
- [ ] `data["@graph"]` array extracted
- [ ] `null` input → `[]`
- [ ] String input → `[]`
- [ ] Plain object with no known array fields → `[]`

### `sanitizeHits()`
- [ ] Valid objects kept
- [ ] `null` entries filtered out
- [ ] Primitive entries (strings, numbers) filtered out
- [ ] Non-array input → `[]`
- [ ] Empty array → `[]`

### `toUserMessage()`
- [ ] `null` → fallback "try again" message
- [ ] `NETWORK_FAILURE` code → connection message
- [ ] `MALFORMED_RESPONSE` code → unexpected response message
- [ ] `EMPTY_RESPONSE` code → empty response message
- [ ] `API_FAILURE` code → message includes HTTP status number
- [ ] Plain `Error` → returns its `.message`
- [ ] Object with numeric `.status` → API failure format with status

### `searchAnnotations()` — input validation
- [ ] Empty string query → error, no fetch
- [ ] Whitespace-only query → error, no fetch
- [ ] Query > 512 chars → "too long" error, no fetch
- [ ] Query exactly 512 chars → accepted, fetch called
- [ ] Invalid `searchType` → error mentioning "text" and "phrase"
- [ ] `searchType = "text"` → accepted
- [ ] `searchType = "phrase"` → accepted
- [ ] `searchType` omitted → defaults to "text", accepted

### `searchAnnotations()` — special characters
- [ ] `<script>alert("xss")</script>` — no throw, fetch called
- [ ] Ampersand (`&`) — handled without error
- [ ] Percent (`%`) — handled without error
- [ ] Double quotes (`"`) — handled without error
- [ ] Backslash (`\`) — handled without error
- [ ] Unicode (`日本語`) — handled without error
- [ ] Null byte (`\u0000`) — handled without error
- [ ] Newlines — handled without error

### `searchAnnotations()` — successful results
- [ ] Single-page result returns normalized items
- [ ] API returning `[]` → empty results, null error
- [ ] Multi-page results aggregated correctly across pages
- [ ] No duplicate IDs across pages
- [ ] Pagination stops when API returns empty page
- [ ] Pagination stops at `SEARCH_MAX_PAGES` even if results keep coming

### `searchAnnotations()` — error scenarios
- [ ] Network failure (fetch rejects) → connection error message
- [ ] HTTP 500 response → error includes status code "500"
- [ ] Blank response body → "empty response" error
- [ ] Non-JSON response body → "unexpected response" error
- [ ] HTTP 404 response → error includes "404"

### `searchAnnotations()` — caching
- [ ] Same query within TTL → no second fetch
- [ ] Cached results match original results
- [ ] After TTL expiry (60 s) → re-fetches
- [ ] Different queries use independent cache entries

### `searchAnnotations()` — cooldown
- [ ] Second different query within 500 ms cooldown → "wait a moment" error
- [ ] Second query after cooldown window → allowed, null error

### `searchAnnotations()` — in-flight deduplication
- [ ] Two concurrent identical queries return the same Promise object
- [ ] Both callers receive identical results
- [ ] Two concurrent different queries are NOT deduplicated

---

## Manual Browser Tests

Open `sandbox.html` via VS Code Live Server before running these.

### Empty / invalid queries
- [ ] Submit empty input — no spinner appears, no fetch fires, no results rendered
- [ ] Submit whitespace-only input — same behavior as empty
- [ ] Submit a 513-character string — error message shown in results area

### Special character rendering (XSS safety)
- [ ] Submit `<script>alert(1)</script>` — renders as plain text in results, no alert fires
- [ ] Submit `<img src=x onerror=alert(1)>` — renders as plain text, no alert fires
- [ ] Submit `" onmouseover="alert(1)` — renders as plain text

### Rapid clicking (UI guard)
- [ ] Click Search button rapidly multiple times — button disables after first click, re-enables only after response returns
- [ ] Pressing Enter rapidly in query field — same behavior as rapid clicking

### Loading state
- [ ] Spinner / "Searching…" message appears while request is in flight
- [ ] Spinner disappears and results render on completion
- [ ] Spinner disappears and error message renders on failure (e.g., disconnect network and search)

### Clear button
- [ ] Clicking Clear empties the query input
- [ ] Clicking Clear removes all rendered results
- [ ] Focus returns to query input after clear

### Result rendering
- [ ] Results show ID, body text, target URI, and score fields
- [ ] Body text longer than 250 characters is truncated with ellipsis
- [ ] "Read More" link expands to full text
- [ ] Search terms are highlighted in results
- [ ] Valid URLs in ID and target fields render as clickable links
- [ ] Non-URL IDs render as plain text (not broken links)

### Pagination edge cases (manual, live API)
- [ ] Query with known large result set (>100) returns paginated results correctly
- [ ] Result count displayed matches actual number of cards rendered

### Network failure
- [ ] Disconnect network mid-search — error message shown, search button re-enabled
- [ ] Reconnect and search again — works normally

### Caching (manual)
- [ ] Search for a term, note result count, search again immediately — second response appears noticeably faster
- [ ] Wait 60+ seconds and repeat — network request fires again (visible in DevTools Network tab)
