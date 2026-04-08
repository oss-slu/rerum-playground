/**
 * Search service for RERUM annotation text and phrase search.
 * Pure stateless API layer: fetch, paginate, and normalize results only.
 * Protection logic (cache, cooldown, deduplication) lives in searchProtection.js.
 */
import CONFIG from "../config.js";

const PAGE_LIMIT = Math.min(100, CONFIG.SEARCH_PAGE_LIMIT ?? 100);
const SEARCH_MAX_PAGES = CONFIG.SEARCH_MAX_PAGES ?? 50;

const FRIENDLY_MESSAGES = {
    network: "Unable to reach the search service. Check your connection and try again.",
    malformed: "Search service returned an unexpected response. Please try again.",
    empty: "Search service returned an empty response.",
    unknown: "Search failed unexpectedly. Please try again.",
};

/**
 * Normalize a single RERUM annotation hit into a consistent shape.
 * Handles Web Annotation and IIIF body/target shapes.
 * @param {object} hit - Raw annotation from RERUM search response
 * @returns {{ id: string, annotationId: string, bodyText: string, targetUri: string | null, score: number | null }}
 */
function normalizeHit(hit) {
    if (!hit || typeof hit !== "object") {
        return {
            id: "",
            annotationId: "",
            bodyText: "",
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
    // Pagination: fetches pages by incrementing skip until empty page or SEARCH_MAX_PAGES cap
    while (pages < SEARCH_MAX_PAGES) {
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
 * @param {string} searchType - "text" or "phrase"
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

export { normalizeHit, extractHits, sanitizeHits, toUserMessage, PAGE_LIMIT, fetchAllPagesWithFallback };
