# Search Edge Case Test Plan

Use this checklist to validate search stability and production-readiness safeguards.

## Setup

- Open `web/sandbox.html`.
- Ensure browser devtools Console is visible.
- Optional debug logs (local only): in console run `localStorage.setItem("rerum:search-debug", "1")` and refresh.

## Edge Cases

- [ ] **Very long query**: paste a string over 512 chars and run search.
  - Expected: user sees "Search query is too long..." and UI stays responsive.
- [ ] **Special characters**: search values like `?+[]()^$.*|` and mixed unicode.
  - Expected: no crash, no rendering breakage, and result highlighting still works.
- [ ] **Rapid repeated queries**: click Search repeatedly with same query.
  - Expected: no unhandled promise errors; repeated in-flight query is reused and cooldown messaging remains clear.
- [ ] **Pagination edge**: run a query known to return >100 results.
  - Expected: multiple pages are fetched without duplicates or UI failures.
- [ ] **Network failure**: disable network and run search.
  - Expected: clear message "Unable to reach the search service...".
- [ ] **API failure**: force a 4xx/5xx response (bad endpoint or mocked failure).
  - Expected: clear message "Search service returned an error (status)...".
- [ ] **Empty/malformed response**: mock empty body and invalid JSON response.
  - Expected: clear user-friendly error and no UI breakage.

## Logging Lifecycle (Console)

Confirm logs include these events during one search lifecycle:

- `search_start`
- `cache_hit` (on repeated identical query)
- `api_request`
- `pagination_fetch` (on multi-page results)
- `search_failure` (on failures)
