import { default as UTILS } from "https://centerfordigitalhumanities.github.io/rerum-playground/web/js/utilities.js";

function showSection(id) {
  document
    .querySelectorAll(".sandbox-section")
    .forEach((sec) => sec.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

window.showSection = showSection;

// Search caching and rate limiting for the RERUM API.

const SEARCH_CACHE_KEY = "rerumSandboxSearchCache";
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes
const MAX_SEARCHES_PER_SECOND = 1;
const MAX_SEARCHES_PER_MINUTE = 5;

// Cache Map for storing search results.
const inMemorySearchCache = new Map();

// Timestamps for tracking network searches to enforce rate limits.
let searchTimestamps = [];

function loadCacheFromStorage() {
  try {
    const raw = window.localStorage.getItem(SEARCH_CACHE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    const now = Date.now();
    Object.entries(parsed).forEach(([key, entry]) => {
      if (entry && typeof entry.timestamp === "number") {
        if (now - entry.timestamp < CACHE_TTL_MS) {
          inMemorySearchCache.set(key, entry);
        }
      }
    });
    persistCacheToStorage();
  } catch {
    // Clear Cache on error.
    inMemorySearchCache.clear();
  }
}

function persistCacheToStorage() {
  try {
    const obj = {};
    inMemorySearchCache.forEach((value, key) => {
      obj[key] = value;
    });
    window.localStorage.setItem(SEARCH_CACHE_KEY, JSON.stringify(obj));
  } catch {
    
  }
}

function canonicalizeQuery(queryObj) {
  if (!queryObj || typeof queryObj !== "object") {
    return "";
  }
  const sortedKeys = Object.keys(queryObj).sort();
  const canonical = {};
  sortedKeys.forEach((k) => {
    canonical[k] = queryObj[k];
  });
  return JSON.stringify(canonical);
}

function getCachedResult(queryKey) {
  const entry = inMemorySearchCache.get(queryKey);
  if (!entry) return null;
  const now = Date.now();
  if (now - entry.timestamp >= CACHE_TTL_MS) {
    inMemorySearchCache.delete(queryKey);
    persistCacheToStorage();
    return null;
  }
  return entry.result;
}

function cacheResult(queryKey, result) {
  inMemorySearchCache.set(queryKey, {
    timestamp: Date.now(),
    result,
  });
  persistCacheToStorage();
}

function evaluateRateLimit() {
  const now = Date.now();
  searchTimestamps = searchTimestamps.filter((ts) => now - ts < 60 * 1000);

  let blocked = false;
  let reason = "";
  let retryAfterMs = 0;

  const lastTimestamp = searchTimestamps[searchTimestamps.length - 1];

  //Max 1 search per second
  if (lastTimestamp) {
    const diff = now - lastTimestamp;
    if (diff < 1000 && searchTimestamps.length >= MAX_SEARCHES_PER_SECOND) {
      blocked = true;
      reason = "You can only run one search per second.";
      retryAfterMs = Math.max(retryAfterMs, 1000 - diff);
    }
  }

  //Max 5 search per minute
  if (!blocked && searchTimestamps.length >= MAX_SEARCHES_PER_MINUTE) {
    blocked = true;
    reason = "You can only run five searches per minute.";
    const windowStart = searchTimestamps[0];
    const diff = now - windowStart;
    retryAfterMs = Math.max(retryAfterMs, 60 * 1000 - diff);
  }

  return {
    allowed: !blocked,
    reason,
    retryAfterMs,
  };
}

async function performSearch(queryObj) {
  const key = canonicalizeQuery(queryObj);

  // Checkcache first
  const cached = getCachedResult(key);
  if (cached !== null) {
    return {
      result: cached,
      fromCache: true,
      rateLimited: false,
      message: "Results loaded from cache (no new API call).",
    };
  }

  // Enforce rate limits 
  const { allowed, reason, retryAfterMs } = evaluateRateLimit();
  if (!allowed) {
    return {
      result: null,
      fromCache: false,
      rateLimited: true,
      message:
        reason +
        (retryAfterMs > 0
          ? ` Please wait about ${Math.ceil(
              retryAfterMs / 1000
            )} second(s) and try again.`
          : ""),
      retryAfterMs,
    };
  }

  // Record
  searchTimestamps.push(Date.now());

  // Query
  try {
    const result = await UTILS.API.query(queryObj);
    cacheResult(key, result);
    return {
      result,
      fromCache: false,
      rateLimited: false,
      message: "Results loaded from the RERUM API.",
    };
  } catch (err) {
    return {
      result: err,
      fromCache: false,
      rateLimited: false,
      message: "An error occurred while querying the RERUM API.",
    };
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadCacheFromStorage();

  const readSection = document.getElementById("read");
  if (!readSection) {
    return;
  }

  const keyInput = readSection.querySelector('input[placeholder="Key"]');
  const valueInput = readSection.querySelector('input[placeholder="Value"]');
  const readButton = Array.from(
    readSection.querySelectorAll("button.action-btn")
  ).find((btn) => btn.textContent.trim().toLowerCase() === "read");
  const messageEl = document.getElementById("search-message");
  const resultsEl = document.getElementById("search-results");

  if (!keyInput || !valueInput || !readButton || !messageEl || !resultsEl) {
    return;
  }

  readButton.addEventListener("click", async () => {
    const key = keyInput.value.trim();
    const value = valueInput.value.trim();

    messageEl.textContent = "";
    resultsEl.textContent = "";

    if (!key || !value) {
      messageEl.textContent = "Please provide both a key and a value.";
      return;
    }

    const queryObj = {
      [key]: value,
    };

    readButton.disabled = true;

    const {
      result,
      fromCache,
      rateLimited,
      message,
      retryAfterMs,
    } = await performSearch(queryObj);

    if (rateLimited) {
      messageEl.textContent = message;

      // Disable search temporarily when limits are exceeded
      const delay = typeof retryAfterMs === "number" && retryAfterMs > 0
        ? retryAfterMs
        : 1000;
      setTimeout(() => {
        readButton.disabled = false;
      }, delay);
      return;
    }

    // Re-enable the button.
    readButton.disabled = false;

    if (result instanceof Error) {
      messageEl.textContent =
        "The RERUM API is not available. Please try again later.";
      return;
    }

    messageEl.textContent = message || (fromCache
      ? "Results loaded from cache."
      : "Results loaded from the RERUM API.");
    try {
      resultsEl.textContent = JSON.stringify(result, null, 2);
    } catch {
      resultsEl.textContent = String(result);
    }
  });
});