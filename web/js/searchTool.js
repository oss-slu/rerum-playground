const RERUM_API_BASE = "https://store.rerum.io/v1";

/**
 * Client-side protections for RERUM search
 *
 * - Query-based cache stored in localStorage with a 20 minute TTL
 *   (within the requested 15–30 minute window) to avoid duplicate
 *   network calls for identical searches.
 * - Rate limiting per browser session:
 *   - Max 1 search per second.
 *   - Max 5 searches per rolling 60 second window.
 * - When limits are exceeded, the search control is temporarily
 *   disabled and a user-friendly status message explains why and
 *   when it will be available again.
 *
 * These protections are intentionally conservative to prevent
 * accidental overload of the RERUM API and to reduce the risk of
 * this interface being used as a conduit for automated abuse.
 */

const CACHE_TTL_MS = 20 * 60 * 1000; // 20 minutes
const CACHE_STORAGE_KEY = "rerumSearchCache_v1";

// In-memory view of the cache for fast access; persisted to localStorage.
let queryCache = {};

// Simple per-tab rate limit state.
const rateLimitState = {
  lastSearchTime: 0,
  recentSearches: [] // timestamps (ms) of searches within the last minute
};

function loadCache() {
  try {
    const raw = window.localStorage.getItem(CACHE_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      queryCache = parsed;
    }
  } catch (e) {
    console.warn("Unable to load search cache from localStorage.", e);
    queryCache = {};
  }
}

function persistCache() {
  try {
    window.localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(queryCache));
  } catch (e) {
    console.warn("Unable to persist search cache to localStorage.", e);
  }
}

function makeCacheKey(searchText, usePhrase, limit, skip) {
  return JSON.stringify({
    searchText: searchText.trim().toLowerCase(),
    phrase: !!usePhrase,
    limit,
    skip
  });
}

function getCachedResults(key) {
  const entry = queryCache[key];
  if (!entry) return null;
  const now = Date.now();
  if (now - entry.timestamp > CACHE_TTL_MS) {
    // Expired; clean up and treat as miss.
    delete queryCache[key];
    persistCache();
    return null;
  }
  return entry.results;
}

function setCachedResults(key, results) {
  queryCache[key] = {
    timestamp: Date.now(),
    results
  };
  persistCache();
}

/**
 * Enforce client-side rate limiting.
 *
 * Returns an object:
 * - { ok: true } when a search can proceed now.
 * - { ok: false, reason, retryAfterMs } when the caller should block.
 */
function checkRateLimit() {
  const now = Date.now();

  // Clean up any timestamps older than 60 seconds.
  rateLimitState.recentSearches = rateLimitState.recentSearches.filter(
    (t) => now - t <= 60 * 1000
  );

  // Enforce max 1 per second.
  if (now - rateLimitState.lastSearchTime < 1000) {
    return {
      ok: false,
      reason: "You can run at most 1 search per second.",
      retryAfterMs: 1000 - (now - rateLimitState.lastSearchTime)
    };
  }

  // Enforce max 5 per rolling minute.
  if (rateLimitState.recentSearches.length >= 5) {
    const oldest = rateLimitState.recentSearches[0];
    const retryAfterMs = 60 * 1000 - (now - oldest);
    return {
      ok: false,
      reason: "You can run at most 5 searches per minute.",
      retryAfterMs: retryAfterMs > 0 ? retryAfterMs : 0
    };
  }

  // Record successful slot reservation.
  rateLimitState.lastSearchTime = now;
  rateLimitState.recentSearches.push(now);
  return { ok: true };
}

function formatRetryTime(ms) {
  const seconds = Math.ceil(ms / 1000);
  if (seconds <= 1) return "about 1 second";
  if (seconds < 60) return `about ${seconds} seconds`;
  const minutes = Math.ceil(seconds / 60);
  return minutes === 1 ? "about 1 minute" : `about ${minutes} minutes`;
}

const PAGE_LIMIT = 50; // Never exceed 100 per RERUM guidance.

async function performRerumSearch({ searchText, usePhrase, limit = PAGE_LIMIT, skip = 0 }) {
  const cacheKey = makeCacheKey(searchText, usePhrase, limit, skip);

  const cached = getCachedResults(cacheKey);
  if (cached) {
    return {
      results: cached,
      fromCache: true
    };
  }

  const endpoint = usePhrase
    ? `${RERUM_API_BASE}/api/search/phrase?limit=${limit}&skip=${skip}`
    : `${RERUM_API_BASE}/api/search?limit=${limit}&skip=${skip}`;

  const resp = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    },
    body: JSON.stringify({
      searchText: searchText
    })
  });

  if (!resp.ok) {
    throw new Error(`RERUM search failed with status ${resp.status}`);
  }

  const data = await resp.json();
  if (!Array.isArray(data)) {
    throw new Error("Unexpected search response format from RERUM.");
  }

  setCachedResults(cacheKey, data);

  return {
    results: data,
    fromCache: false
  };
}

function extractDisplayData(result) {
  const id = result["@id"] || result.id || "";
  const type = result.type || "";

  let bodyText = "";
  if (result.body && typeof result.body === "object") {
    if (typeof result.body.value === "string") {
      bodyText = result.body.value;
    } else if (Array.isArray(result.body)) {
      const firstVal = result.body.find((b) => typeof b.value === "string");
      bodyText = firstVal ? firstVal.value : "";
    }
  }
  if (!bodyText && typeof result.bodyValue === "string") {
    bodyText = result.bodyValue;
  }

  // Attempt to surface an associated IIIF or Web Annotation target.
  let target = result.target || result.on || null;

  return {
    id,
    type,
    bodyText,
    target
  };
}

function renderResults(results, filterText) {
  const container = document.getElementById("results-container");
  const summary = document.getElementById("results-summary");
  if (!container || !summary) return;

  container.innerHTML = "";

  const trimmedFilter = (filterText || "").trim().toLowerCase();

  const processed = results.map(extractDisplayData);
  const visible = trimmedFilter
    ? processed.filter((item) => {
        const haystack = [
          item.bodyText,
          item.id,
          item.type,
          typeof item.target === "string" ? item.target : JSON.stringify(item.target || "")
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(trimmedFilter);
      })
    : processed;

  summary.textContent =
    results.length === 0
      ? "No results."
      : `${visible.length} of ${results.length} results shown${trimmedFilter ? " after client-side filtering" : ""
        }.`;

  if (visible.length === 0) {
    return;
  }

  const list = document.createElement("div");
  list.className = "search-results";

  visible.forEach((item) => {
    const card = document.createElement("article");
    card.className = "card search-result";

    const header = document.createElement("header");
    const title = document.createElement("h4");
    title.textContent = item.bodyText || "(No body text found)";
    header.appendChild(title);

    const meta = document.createElement("p");
    meta.className = "text-small";
    const typeText = item.type ? `Type: ${item.type}` : "Type: (unknown)";
    const idLink =
      item.id && typeof item.id === "string"
        ? `<a href="${item.id}" target="_blank" rel="noopener noreferrer">${item.id}</a>`
        : "(no @id)";
    meta.innerHTML = `${typeText}<br />@id: ${idLink}`;

    const targetEl = document.createElement("p");
    targetEl.className = "text-small";
    if (item.target) {
      if (typeof item.target === "string") {
        targetEl.innerHTML = `Target: <a href="${item.target}" target="_blank" rel="noopener noreferrer">${item.target}</a>`;
      } else if (typeof item.target === "object") {
        const id = item.target.id || item.target["@id"];
        if (typeof id === "string") {
          targetEl.innerHTML = `Target: <a href="${id}" target="_blank" rel="noopener noreferrer">${id}</a>`;
        } else {
          targetEl.textContent = "Target: (complex IIIF / Web Annotation target)";
        }
      } else {
        targetEl.textContent = "Target: (unrecognized format)";
      }
    } else {
      targetEl.textContent = "Target: (not provided)";
    }

    card.appendChild(header);
    card.appendChild(meta);
    card.appendChild(targetEl);

    list.appendChild(card);
  });

  container.appendChild(list);
}

function wireUpSearchUI() {
  const form = document.getElementById("search-form");
  const searchInput = document.getElementById("search-text");
  const phraseCheckbox = document.getElementById("phrase-search");
  const searchButton = document.getElementById("search-button");
  const clearButton = document.getElementById("clear-results");
  const status = document.getElementById("search-status");
  const clientFilter = document.getElementById("client-filter");
  const loadMoreButton = document.getElementById("load-more");
  const paginationRow = document.getElementById("pagination-row");

  if (
    !form ||
    !searchInput ||
    !phraseCheckbox ||
    !searchButton ||
    !clearButton ||
    !status ||
    !clientFilter ||
    !loadMoreButton ||
    !paginationRow
  ) {
    console.error("Search UI elements are missing from the DOM.");
    return;
  }

  // Prevent any automatic search on page load; searches only run
  // in response to this explicit form submission.
  let lastResults = [];
  let totalLoaded = 0;
  let lastQuery = null;
  let rateLimitTimeoutId = null;
  let isSearching = false;

  function setStatus(message, type = "info") {
    status.textContent = message;
    status.className = `text-small status-${type}`;
  }

  function setSearching(isSearching) {
    searchButton.disabled = isSearching;
    loadMoreButton.disabled = isSearching;
    form.querySelectorAll("input,button").forEach((el) => {
      if (el === clientFilter || el === clearButton) return;
      if (isSearching) {
        el.setAttribute("aria-busy", "true");
      } else {
        el.removeAttribute("aria-busy");
      }
    });
  }

  function disableSearchTemporarily(reason, retryAfterMs) {
    searchButton.disabled = true;
    const when = formatRetryTime(retryAfterMs);
    setStatus(`${reason} Please wait ${when} before trying again.`, "warning");

    if (rateLimitTimeoutId) {
      clearTimeout(rateLimitTimeoutId);
    }
    rateLimitTimeoutId = window.setTimeout(() => {
      searchButton.disabled = false;
      setStatus("You can run a new search now.", "info");
      rateLimitTimeoutId = null;
    }, retryAfterMs);
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (isSearching) {
      // A search is already in progress; ignore rapid repeat submits.
      return;
    }

    const searchText = searchInput.value.trim();
    if (!searchText) {
      setStatus("Please enter text to search.", "error");
      return;
    }

    // Check limits before doing anything.
    const limitCheck = checkRateLimit();
    if (!limitCheck.ok) {
      disableSearchTemporarily(limitCheck.reason, limitCheck.retryAfterMs || 1000);
      return;
    }

    const usePhrase = phraseCheckbox.checked;

    try {
      isSearching = true;
      setSearching(true);
      setStatus("Running search…", "info");

      const { results, fromCache } = await performRerumSearch({
        searchText,
        usePhrase,
        limit: PAGE_LIMIT,
        skip: 0
      });

      lastQuery = { searchText, usePhrase };
      lastResults = results;
      totalLoaded = results.length;
      clientFilter.value = "";
      renderResults(lastResults, "");

      // Show or hide pagination controls based on whether we might have more.
      if (results.length >= PAGE_LIMIT) {
        paginationRow.style.display = "";
        loadMoreButton.disabled = false;
      } else {
        paginationRow.style.display = "none";
      }

      if (fromCache) {
        setStatus(
          `Loaded ${results.length} result${results.length === 1 ? "" : "s"} from cache (no new API call).`,
          "success"
        );
      } else {
        setStatus(
          `Fetched ${results.length} result${results.length === 1 ? "" : "s"} from RERUM.`,
          "success"
        );
      }
    } catch (err) {
      console.error("Search failed:", err);
      setStatus(
        "Search failed. Please try again in a moment. If this persists, RERUM may be unavailable.",
        "error"
      );
    } finally {
      isSearching = false;
      setSearching(false);
    }
  });

  loadMoreButton.addEventListener("click", async () => {
    if (isSearching || !lastQuery) {
      return;
    }

    // Check limits before doing anything.
    const limitCheck = checkRateLimit();
    if (!limitCheck.ok) {
      disableSearchTemporarily(limitCheck.reason, limitCheck.retryAfterMs || 1000);
      return;
    }

    try {
      isSearching = true;
      setSearching(true);
      setStatus("Loading more results…", "info");

      const { searchText, usePhrase } = lastQuery;
      const { results, fromCache } = await performRerumSearch({
        searchText,
        usePhrase,
        limit: PAGE_LIMIT,
        skip: totalLoaded
      });

      // Append new page and update counters.
      if (results.length > 0) {
        lastResults = lastResults.concat(results);
        totalLoaded = lastResults.length;
        renderResults(lastResults, clientFilter.value);
      }

      if (results.length < PAGE_LIMIT) {
        // No more pages expected.
        paginationRow.style.display = "none";
        setStatus(
          `All results loaded (${lastResults.length} total).${fromCache ? " Additional pages came from cache where available." : ""
          }`,
          "success"
        );
      } else {
        setStatus(
          `${lastResults.length} results loaded so far.${fromCache ? " This page was served from cache." : ""
          }`,
          "success"
        );
      }
    } catch (err) {
      console.error("Load more failed:", err);
      setStatus(
        "Loading more results failed. Please try again in a moment.",
        "error"
      );
    } finally {
      isSearching = false;
      setSearching(false);
    }
  });

  clientFilter.addEventListener("input", () => {
    renderResults(lastResults, clientFilter.value);
  });

  clearButton.addEventListener("click", () => {
    lastResults = [];
    lastQuery = null;
    totalLoaded = 0;
    renderResults(lastResults, "");
    clientFilter.value = "";
    paginationRow.style.display = "none";
    setStatus("Results cleared. Enter text and press Search to run a new query.", "info");
  });

  // Initial UI state.
  renderResults([], "");
  paginationRow.style.display = "none";
  setStatus(
    "Enter text and press Search to query RERUM annotations. Results may be cached for up to 20 minutes.",
    "info"
  );
}

document.addEventListener("DOMContentLoaded", () => {
  loadCache();
  wireUpSearchUI();
});

