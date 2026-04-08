/**
 * Search protection layer for RERUM annotation search.
 * Wraps the pure search service with caching, cooldown, and in-flight deduplication.
 */
import CONFIG from "../config.js";
import { fetchAllPagesWithFallback, sanitizeHits, normalizeHit, toUserMessage } from "./searchService.js";

const SEARCH_COOLDOWN_MS = CONFIG.SEARCH_COOLDOWN_MS ?? 500;
const SEARCH_CACHE_TTL_MS = CONFIG.SEARCH_CACHE_TTL_MS ?? 60_000;
const SEARCH_CACHE_MAX_ENTRIES = CONFIG.SEARCH_CACHE_MAX_ENTRIES ?? 200;
const SEARCH_MAX_QUERY_LENGTH = CONFIG.SEARCH_MAX_QUERY_LENGTH ?? 512;

const searchCache = new Map();
let lastSearchAt = 0;
const inFlightSearches = new Map();

function isDebugEnabled() {
    const configDebug = Boolean(CONFIG.SEARCH_DEBUG);
    if (configDebug) return true;
    if (typeof window === "undefined" || typeof window.location === "undefined") return false;
    const isDevHost = ["localhost", "127.0.0.1"].includes(window.location.hostname);
    if (!isDevHost) return false;
    const queryDebug = new URLSearchParams(window.location.search).get("searchDebug");
    const localToggle = window.localStorage?.getItem("rerum:search-debug");
    return queryDebug === "1" || localToggle === "1";
}

function logSearch(level, event, details = {}) {
    const payload = {
        event,
        ts: new Date().toISOString(),
        ...details,
    };
    const debugEnabled = isDebugEnabled();
    if (!debugEnabled && (level === "debug" || level === "info")) return;
    const logger = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
    logger("[search]", payload);
}

function pruneSearchCache(now = Date.now()) {
    for (const [key, value] of searchCache.entries()) {
        if (now - value.cachedAt >= SEARCH_CACHE_TTL_MS) {
            searchCache.delete(key);
        }
    }
    while (searchCache.size > SEARCH_CACHE_MAX_ENTRIES) {
        const oldestKey = searchCache.keys().next().value;
        if (!oldestKey) break;
        searchCache.delete(oldestKey);
    }
}

/**
 * Search RERUM annotations by text or phrase and return normalized results.
 * Pagination is handled internally (limit ≤ 100 per request); all pages are fetched.
 *
 * @param {string} query - Search query (plain text or phrase)
 * @param {"text"|"phrase"} searchType - "text" for full-text, "phrase" for phrase search
 * @returns {Promise<{ results: Array<{ id: string, annotationId: string, bodyText: string, targetUri: string | null, score: number | null }>, error: string | null }>}
 */
export async function searchAnnotations(query, searchType = "text") {
    const normalized = {
        results: [],
        error: null,
    };

    const trimmed = typeof query === "string" ? query.trim() : "";
    if (!trimmed) {
        normalized.error = "Search query is required.";
        return normalized;
    }
    if (trimmed.length > SEARCH_MAX_QUERY_LENGTH) {
        normalized.error = `Search query is too long. Please keep it under ${SEARCH_MAX_QUERY_LENGTH} characters.`;
        return normalized;
    }

    if (searchType !== "text" && searchType !== "phrase") {
        normalized.error = "searchType must be 'text' or 'phrase'.";
        return normalized;
    }

    const endpointCandidates =
        searchType === "phrase"
            ? [CONFIG.URLS.SEARCH_PHRASE]
            : [CONFIG.URLS.SEARCH_TEXT];
    const urls = endpointCandidates.filter(Boolean);

    if (!urls.length) {
        normalized.error = "Search endpoint not configured.";
        return normalized;
    }

    const cacheKey = `${searchType}::${trimmed}`;
    const now = Date.now();
    pruneSearchCache(now);
    logSearch("debug", "search_start", { searchType, queryLength: trimmed.length });

    // Cache: return stored result if same query ran within SEARCH_CACHE_TTL_MS
    const cached = searchCache.get(cacheKey);
    if (cached && now - cached.cachedAt < SEARCH_CACHE_TTL_MS) {
        logSearch("debug", "cache_hit", { searchType });
        return {
            error: cached.value.error,
            results: [...cached.value.results],
        };
    }

    // Deduplication: reuse pending Promise for concurrent identical requests
    const inFlight = inFlightSearches.get(cacheKey);
    if (inFlight) {
        logSearch("debug", "in_flight_reuse", { cacheKey });
        const shared = await inFlight;
        return { error: shared.error, results: [...shared.results] };
    }

    // Cooldown: reject if last request was within SEARCH_COOLDOWN_MS
    if (now - lastSearchAt < SEARCH_COOLDOWN_MS) {
        normalized.error = "Please wait a moment before searching again.";
        return normalized;
    }
    lastSearchAt = now;

    const requestPromise = (async () => {
        try {
            const rawHits = await fetchAllPagesWithFallback(urls, trimmed, searchType);
            normalized.results = sanitizeHits(rawHits).map(normalizeHit);
            searchCache.set(cacheKey, {
                cachedAt: Date.now(),
                value: {
                    error: normalized.error,
                    results: [...normalized.results],
                },
            });
            pruneSearchCache();
            return normalized;
        } catch (err) {
            logSearch("error", "search_failure", { error: err instanceof Error ? err.message : String(err) });
            normalized.error = toUserMessage(err);
            normalized.results = [];
            return normalized;
        } finally {
            inFlightSearches.delete(cacheKey);
        }
    })();
    inFlightSearches.set(cacheKey, requestPromise);
    return requestPromise;
}
