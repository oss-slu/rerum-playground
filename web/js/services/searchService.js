/**
 * Search service for RERUM annotation text and phrase search.
 * Uses /search/text and /search/phrase endpoints with pagination (limit ≤ 100)
 * and normalizes results for the frontend.
 */
import CONFIG from "../config.js";

const PAGE_LIMIT = Math.min(100, CONFIG.SEARCH_PAGE_LIMIT ?? 100);
const SEARCH_COOLDOWN_MS = CONFIG.SEARCH_COOLDOWN_MS ?? 500;
const SEARCH_CACHE_TTL_MS = CONFIG.SEARCH_CACHE_TTL_MS ?? 60_000;

const searchCache = new Map();
let lastSearchAt = 0;

/**
 * Normalize a single RERUM annotation hit into a consistent shape.
 * Handles Web Annotation and IIIF body/target shapes.
 * @param {object} hit - Raw annotation from RERUM search response
 * @returns {{ id: string, bodyText: string, targetUri: string | null, score: number | null }}
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
 * @returns {Promise<object[]>} Raw annotation array (may be empty)
 */
async function fetchSearchPage(url, query, skip) {
    const limit = PAGE_LIMIT;
    const sep = url.includes("?") ? "&" : "?";
    const pageUrl = `${url}${sep}limit=${limit}&skip=${skip}`;
    const body = JSON.stringify({ searchText: query });
    const response = await fetch(pageUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body,
    });
    if (!response.ok) {
        const msg = `Search API error: ${response.status} ${response.statusText}`;
        throw new Error(msg);
    }
    const data = await response.json();
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
    return [];
}

/**
 * Run paged search until no more results (limit applied per request, never > 100).
 * @param {string} baseUrl - CONFIG.URLS.SEARCH_TEXT or SEARCH_PHRASE
 * @param {string} query - Search text
 * @returns {Promise<object[]>} All raw annotation hits
 */
async function fetchAllPages(baseUrl, query) {
    const all = [];
    let skip = 0;
    while (true) {
        const page = await fetchSearchPage(baseUrl, query, skip);
        if (!page.length) break;
        all.push(...page);
        skip += page.length;
    }
    return all;
}

/**
 * Search RERUM annotations by text or phrase and return normalized results.
 * Pagination is handled internally (limit ≤ 100 per request); all pages are fetched.
 *
 * @param {string} query - Search query (plain text or phrase)
 * @param {"text"|"phrase"} searchType - "text" for full-text, "phrase" for phrase search
 * @returns {Promise<{ results: Array<{ id: string, bodyText: string, targetUri: string | null, score: number | null }>, error: string | null }>}
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

    if (searchType !== "text" && searchType !== "phrase") {
        normalized.error = "searchType must be 'text' or 'phrase'.";
        return normalized;
    }

    const url = searchType === "phrase" ? CONFIG.URLS.SEARCH_PHRASE : CONFIG.URLS.SEARCH_TEXT;
    if (!url) {
        normalized.error = "Search endpoint not configured.";
        return normalized;
    }

    const cacheKey = `${searchType}::${trimmed}`;
    const now = Date.now();
    const cached = searchCache.get(cacheKey);
    if (cached && now - cached.cachedAt < SEARCH_CACHE_TTL_MS) {
        return { ...cached.value };
    }
    if (now - lastSearchAt < SEARCH_COOLDOWN_MS) {
        normalized.error = "Please wait a moment before searching again.";
        return normalized;
    }
    lastSearchAt = now;

    try {
        const rawHits = await fetchAllPages(url, trimmed);
        normalized.results = rawHits.map(normalizeHit);
        searchCache.set(cacheKey, { cachedAt: Date.now(), value: { ...normalized } });
        return normalized;
    } catch (err) {
        normalized.error = err instanceof Error ? err.message : String(err);
        normalized.results = [];
        return normalized;
    }
}

export { normalizeHit, extractHits, PAGE_LIMIT };
