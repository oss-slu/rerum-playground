/**
 * Search service for RERUM annotation text and phrase search.
 * Uses /search and /search/phrase endpoints with pagination (limit ≤ 100)
 * and normalizes results for the frontend.
 */
import CONFIG from "../config.js";

const PAGE_LIMIT = Math.min(100, CONFIG.SEARCH_PAGE_LIMIT ?? 100);
const SEARCH_COOLDOWN_MS = CONFIG.SEARCH_COOLDOWN_MS ?? 500;
const SEARCH_CACHE_TTL_MS = CONFIG.SEARCH_CACHE_TTL_MS ?? 60_000;
const SEARCH_CACHE_MAX_ENTRIES = CONFIG.SEARCH_CACHE_MAX_ENTRIES ?? 200;
const SEARCH_MAX_PAGES = CONFIG.SEARCH_MAX_PAGES ?? 50;
const SEARCH_MAX_QUERY_LENGTH = CONFIG.SEARCH_MAX_QUERY_LENGTH ?? 512;

const searchCache = new Map();
let lastSearchAt = 0;
const inFlightSearches = new Map();

const FRIENDLY_MESSAGES = {
    network: "Unable to reach the search service. Check your connection and try again.",
    malformed: "Search service returned an unexpected response. Please try again.",
    empty: "Search service returned an empty response.",
    unknown: "Search failed unexpectedly. Please try again.",
};

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
 * Normalize a single RERUM annotation hit into a consistent shape.
 * Handles Web Annotation and IIIF body/target shapes.
 * @param {object} hit - Raw annotation from RERUM search response
 * @returns {{ id: string, annotationId: string, bodyText: string, snippet: string, targetUri: string | null, score: number | null }}
 */
function normalizeHit(hit) {
    if (!hit || typeof hit !== "object") {
        return {
            id: "",
            annotationId: "",
            bodyText: "",
            snippet: "",
            targetUri: null,
            score: null,
        };
    }
    const id = hit["@id"] ?? hit.id ?? "";
    const score = hit.__rerum?.score ?? null;

    let bodyText = "";
    if (typeof hit.bodyValue === "string") {
        bodyText = hit.bodyValue;
    } else if (hit.body?.value) {
        bodyText = typeof hit.body.value === "string" ? hit.body.value : "";
    } else if (Array.isArray(hit.body)) {
        const first = hit.body.find((b) => b?.value);
        bodyText = typeof first?.value === "string" ? first.value : "";
    }
    if (!bodyText && hit.resource?.chars) {
        bodyText = typeof hit.resource.chars === "string" ? hit.resource.chars : "";
    }
    if (!bodyText && hit.resource?.["cnt:chars"]) {
        bodyText = typeof hit.resource["cnt:chars"] === "string" ? hit.resource["cnt:chars"] : "";
    }

    let targetUri = null;
    const target = hit.target;
    if (typeof target === "string") {
        targetUri = target;
    } else if (target?.source) {
        targetUri = typeof target.source === "string" ? target.source : target.source?.id ?? null;
    } else if (target?.id) {
        targetUri = target.id;
    } else if (Array.isArray(target) && target.length) {
        const first = target[0];
        targetUri = typeof first === "string" ? first : first?.source ?? first?.id ?? null;
    }

    return {
        id,
        annotationId: id,
        bodyText,
        snippet: bodyText,
        targetUri,
        score,
    };
}

/**
 * Fetch one page of search results.
 * @param {string} url - Base URL (with optional query already)
 * @param {string} query - Search text
 * @param {number} skip - Offset for pagination
 * @param {{ mode: "object"|"string", bodyKey: string | null }} payload - How to encode the search body
 * @returns {Promise<object[]>} Raw annotation array (may be empty)
 */
async function fetchSearchPage(url, query, skip, payload) {
    const limit = PAGE_LIMIT;
    const sep = url.includes("?") ? "&" : "?";
    const pageUrl = `${url}${sep}limit=${limit}&skip=${skip}`;
    const body =
        payload.mode === "string"
            ? query
            : JSON.stringify({ [payload.bodyKey]: query });
    const contentType =
        payload.mode === "string"
            ? "text/plain; charset=utf-8"
            : "application/json; charset=utf-8";
    logSearch("debug", "api_request", { url: pageUrl, skip, payloadMode: payload.mode, bodyKey: payload.bodyKey });
    let response;
    try {
        response = await fetch(pageUrl, {
            method: "POST",
            headers: { "Content-Type": contentType },
            body,
        });
    } catch (err) {
        const networkError = new Error(FRIENDLY_MESSAGES.network);
        networkError.code = "NETWORK_FAILURE";
        networkError.cause = err;
        throw networkError;
    }
    if (!response.ok) {
        const err = new Error(`Search request failed (${response.status}). Please try again.`);
        err.status = response.status;
        err.code = "API_FAILURE";
        throw err;
    }
    const rawBody = await response.text();
    if (!rawBody || !rawBody.trim()) {
        const emptyErr = new Error(FRIENDLY_MESSAGES.empty);
        emptyErr.code = "EMPTY_RESPONSE";
        throw emptyErr;
    }
    let data;
    try {
        data = JSON.parse(rawBody);
    } catch (err) {
        const malformedErr = new Error(FRIENDLY_MESSAGES.malformed);
        malformedErr.code = "MALFORMED_RESPONSE";
        malformedErr.cause = err;
        throw malformedErr;
    }
    return extractHits(data);
}

/**
 * Extract array hits from known RERUM response shapes.
 * @param {unknown} data - Parsed JSON response
 * @returns {object[]} Raw hit array
 */
function extractHits(data) {
    if (Array.isArray(data)) return data;
    if (!data || typeof data !== "object") return [];
    if (Array.isArray(data.items)) return data.items;
    if (Array.isArray(data.results)) return data.results;
    if (Array.isArray(data.hits)) return data.hits;
    if (Array.isArray(data.docs)) return data.docs;
    if (Array.isArray(data["@graph"])) return data["@graph"];
    return [];
}

function sanitizeHits(hits) {
    if (!Array.isArray(hits)) return [];
    return hits.filter((hit) => hit && typeof hit === "object");
}

function toUserMessage(err) {
    if (!err) return FRIENDLY_MESSAGES.unknown;
    if (err.code === "NETWORK_FAILURE") return FRIENDLY_MESSAGES.network;
    if (err.code === "MALFORMED_RESPONSE") return FRIENDLY_MESSAGES.malformed;
    if (err.code === "EMPTY_RESPONSE") return FRIENDLY_MESSAGES.empty;
    if (err.code === "API_FAILURE" || typeof err.status === "number") {
        const status = err.status ?? "unknown";
        return `Search service returned an error (${status}). Please try again.`;
    }
    return err instanceof Error && err.message ? err.message : FRIENDLY_MESSAGES.unknown;
}

/**
 * Run paged search until no more results (limit applied per request, never > 100).
 * @param {string} baseUrl - CONFIG.URLS.SEARCH_TEXT or SEARCH_PHRASE
 * @param {string} query - Search text
 * @param {{ mode: "object"|"string", bodyKey: string | null }} payload - How to encode the search body
 * @param {number} startSkip - Initial offset for pagination
 * @param {object[]} initialResults - Optional already-fetched first page
 * @returns {Promise<object[]>} All raw annotation hits
 */
async function fetchAllPages(baseUrl, query, payload, startSkip = 0, initialResults = []) {
    const all = [...initialResults];
    let skip = startSkip;
    let pages = initialResults.length > 0 ? 1 : 0;
    while (pages < SEARCH_MAX_PAGES) {
        logSearch("debug", "pagination_fetch", { baseUrl, skip, page: pages + 1 });
        const page = await fetchSearchPage(baseUrl, query, skip, payload);
        if (!page.length) break;
        all.push(...page);
        skip += page.length;
        pages += 1;
    }
    return all;
}

function getPayloadCandidates(searchType) {
    const bodyKeys =
        searchType === "phrase"
            ? ["phrase", "searchText", "text", "query"]
            : ["searchText", "text", "query"];
    const objectPayloads = bodyKeys.map((bodyKey) => ({ mode: "object", bodyKey }));
    return [...objectPayloads, { mode: "string", bodyKey: null }];
}

/**
 * Try one or more endpoint URLs. If an endpoint responds with 404, try next.
 * @param {string[]} urls - candidate search endpoint URLs
 * @param {string} query - Search query
 * @returns {Promise<object[]>}
 */
async function fetchAllPagesWithFallback(urls, query, searchType) {
    let lastError = null;
    let sawEmptyResults = false;
    const payloadCandidates = getPayloadCandidates(searchType);

    for (const url of urls) {
        for (const payload of payloadCandidates) {
            try {
                const firstPage = await fetchSearchPage(url, query, 0, payload);
                if (firstPage.length > 0) {
                    const rest = await fetchAllPages(url, query, payload, firstPage.length, firstPage);
                    return rest;
                }
                sawEmptyResults = true;
            } catch (err) {
                lastError = err;
                if (err?.status === 404) {
                    break;
                }
                throw err;
            }
        }
    }
    if (sawEmptyResults) return [];
    throw lastError ?? new Error("Search API error: no usable endpoint.");
}

/**
 * Search RERUM annotations by text or phrase and return normalized results.
 * Pagination is handled internally (limit ≤ 100 per request); all pages are fetched.
 *
 * @param {string} query - Search query (plain text or phrase)
 * @param {"text"|"phrase"} searchType - "text" for full-text, "phrase" for phrase search
 * @returns {Promise<{ results: Array<{ id: string, annotationId: string, bodyText: string, snippet: string, targetUri: string | null, score: number | null }>, error: string | null }>}
 *   Normalized result object; `error` is set on API or empty-query failure, `results` empty in that case.
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
    const cached = searchCache.get(cacheKey);
    if (cached && now - cached.cachedAt < SEARCH_CACHE_TTL_MS) {
        logSearch("debug", "cache_hit", { searchType });
        return {
            error: cached.value.error,
            results: [...cached.value.results],
        };
    }
    const inFlight = inFlightSearches.get(cacheKey);
    if (inFlight) {
        logSearch("debug", "in_flight_reuse", { cacheKey });
        return inFlight;
    }
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

export { normalizeHit, extractHits, sanitizeHits, toUserMessage, PAGE_LIMIT, fetchAllPagesWithFallback };
