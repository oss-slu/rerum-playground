"use strict";

/**
 * searchService test suite
 *
 * Covers:
 *   - normalizeHit   (all body and target shapes)
 *   - extractHits    (all known response envelope shapes)
 *   - sanitizeHits   (filtering and edge inputs)
 *   - toUserMessage  (all error code paths)
 *   - searchAnnotations (input validation, special chars, success, errors,
 *                        caching, TTL expiry, cooldown, in-flight dedup,
 *                        pagination, duplicate-free aggregation)
 */

// ---------------------------------------------------------------------------
// Mock config.js before any require() so module-level constants are correct
// ---------------------------------------------------------------------------
jest.mock("../config.js", () => ({
    __esModule: true,
    default: {
        URLS: {
            SEARCH_TEXT: "https://mock.test/search",
            SEARCH_PHRASE: "https://mock.test/search/phrase",
        },
        SEARCH_PAGE_LIMIT: 10,
        SEARCH_COOLDOWN_MS: 500,
        SEARCH_CACHE_TTL_MS: 60_000,
        SEARCH_CACHE_MAX_ENTRIES: 200,
        SEARCH_MAX_PAGES: 3,
        SEARCH_MAX_QUERY_LENGTH: 512,
        SEARCH_DEBUG: false,
    },
}));

// ---------------------------------------------------------------------------
// Re-require the module before each test so module-level state is fresh
// (searchCache, lastSearchAt, inFlightSearches all reset to initial values)
// ---------------------------------------------------------------------------
let searchAnnotations, normalizeHit, extractHits, sanitizeHits, toUserMessage;

beforeEach(() => {
    jest.resetModules();
    ({ searchAnnotations, normalizeHit, extractHits, sanitizeHits, toUserMessage } =
        require("./searchService"));
    global.fetch = jest.fn();
});

afterEach(() => {
    delete global.fetch;
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns a mock fetch response whose .text() resolves to JSON.stringify(data). */
function pageResponse(data, status = 200) {
    return {
        ok: status >= 200 && status < 300,
        status,
        text: jest.fn().mockResolvedValue(JSON.stringify(data)),
    };
}

// ===========================================================================
// normalizeHit
// ===========================================================================

describe("normalizeHit", () => {
    test("returns empty shape for null", () => {
        expect(normalizeHit(null)).toEqual({
            id: "",
            annotationId: "",
            bodyText: "",
            snippet: "",
            targetUri: null,
            score: null,
        });
    });

    test("returns empty shape for undefined", () => {
        expect(normalizeHit(undefined).bodyText).toBe("");
    });

    test("returns empty shape for non-object (string)", () => {
        expect(normalizeHit("bad").id).toBe("");
    });

    test("reads @id field", () => {
        expect(normalizeHit({ "@id": "http://example.com/1" }).id).toBe("http://example.com/1");
    });

    test("falls back to id when @id is absent", () => {
        expect(normalizeHit({ id: "http://example.com/2" }).id).toBe("http://example.com/2");
    });

    test("id is empty string when neither @id nor id present", () => {
        expect(normalizeHit({ bodyValue: "text" }).id).toBe("");
    });

    // --- body text extraction ---

    test("reads bodyValue string", () => {
        expect(normalizeHit({ bodyValue: "hello" }).bodyText).toBe("hello");
    });

    test("reads body.value string", () => {
        expect(normalizeHit({ body: { value: "body val" } }).bodyText).toBe("body val");
    });

    test("reads first array body element .value", () => {
        expect(normalizeHit({ body: [{ value: "first" }, { value: "second" }] }).bodyText).toBe(
            "first"
        );
    });

    test("reads resource.chars (IIIF fallback)", () => {
        expect(normalizeHit({ resource: { chars: "iiif text" } }).bodyText).toBe("iiif text");
    });

    test("reads resource['cnt:chars'] fallback", () => {
        expect(normalizeHit({ resource: { "cnt:chars": "cnt text" } }).bodyText).toBe("cnt text");
    });

    test("bodyText is empty string when no body field present", () => {
        expect(normalizeHit({ "@id": "http://example.com/1" }).bodyText).toBe("");
    });

    test("snippet equals bodyText", () => {
        const result = normalizeHit({ bodyValue: "some text" });
        expect(result.snippet).toBe(result.bodyText);
    });

    // --- target URI extraction ---

    test("reads string target", () => {
        expect(normalizeHit({ target: "http://canvas.example.com" }).targetUri).toBe(
            "http://canvas.example.com"
        );
    });

    test("reads target.source string", () => {
        expect(normalizeHit({ target: { source: "http://source.example.com" } }).targetUri).toBe(
            "http://source.example.com"
        );
    });

    test("reads target.source.id when source is object", () => {
        expect(
            normalizeHit({ target: { source: { id: "http://source-id.example.com" } } }).targetUri
        ).toBe("http://source-id.example.com");
    });

    test("reads target.id", () => {
        expect(normalizeHit({ target: { id: "http://target-id.example.com" } }).targetUri).toBe(
            "http://target-id.example.com"
        );
    });

    test("reads first element of array target (string)", () => {
        expect(normalizeHit({ target: ["http://arr-target.example.com"] }).targetUri).toBe(
            "http://arr-target.example.com"
        );
    });

    test("targetUri is null when target absent", () => {
        expect(normalizeHit({ bodyValue: "text" }).targetUri).toBeNull();
    });

    // --- score ---

    test("reads __rerum.score", () => {
        expect(normalizeHit({ __rerum: { score: 0.95 } }).score).toBe(0.95);
    });

    test("score is null when __rerum absent", () => {
        expect(normalizeHit({ bodyValue: "text" }).score).toBeNull();
    });
});

// ===========================================================================
// extractHits
// ===========================================================================

describe("extractHits", () => {
    test("returns array input directly", () => {
        const arr = [{ id: 1 }];
        expect(extractHits(arr)).toBe(arr);
    });

    test("extracts data.items", () => {
        const items = [{ id: 1 }];
        expect(extractHits({ items })).toBe(items);
    });

    test("extracts data.results", () => {
        const results = [{ id: 1 }];
        expect(extractHits({ results })).toBe(results);
    });

    test("extracts data.hits", () => {
        const hits = [{ id: 1 }];
        expect(extractHits({ hits })).toBe(hits);
    });

    test("extracts data.docs", () => {
        const docs = [{ id: 1 }];
        expect(extractHits({ docs })).toBe(docs);
    });

    test("extracts data['@graph']", () => {
        const graph = [{ id: 1 }];
        expect(extractHits({ "@graph": graph })).toBe(graph);
    });

    test("returns [] for null", () => {
        expect(extractHits(null)).toEqual([]);
    });

    test("returns [] for a primitive string", () => {
        expect(extractHits("bad")).toEqual([]);
    });

    test("returns [] for plain object with no known array fields", () => {
        expect(extractHits({ foo: "bar" })).toEqual([]);
    });
});

// ===========================================================================
// sanitizeHits
// ===========================================================================

describe("sanitizeHits", () => {
    test("keeps valid objects", () => {
        const hits = [{ id: 1 }, { id: 2 }];
        expect(sanitizeHits(hits)).toEqual(hits);
    });

    test("filters out null entries", () => {
        expect(sanitizeHits([null, { id: 1 }, undefined])).toEqual([{ id: 1 }]);
    });

    test("filters out primitive entries", () => {
        expect(sanitizeHits(["string", 42, { id: 1 }])).toEqual([{ id: 1 }]);
    });

    test("returns [] for non-array input (null)", () => {
        expect(sanitizeHits(null)).toEqual([]);
    });

    test("returns [] for non-array input (string)", () => {
        expect(sanitizeHits("bad")).toEqual([]);
    });

    test("returns [] for empty array", () => {
        expect(sanitizeHits([])).toEqual([]);
    });
});

// ===========================================================================
// toUserMessage
// ===========================================================================

describe("toUserMessage", () => {
    test("returns unknown fallback for null", () => {
        expect(toUserMessage(null)).toMatch(/try again/i);
    });

    test("NETWORK_FAILURE → connection message", () => {
        const err = Object.assign(new Error("net"), { code: "NETWORK_FAILURE" });
        expect(toUserMessage(err)).toMatch(/connection|reach/i);
    });

    test("MALFORMED_RESPONSE → unexpected response message", () => {
        const err = Object.assign(new Error("mal"), { code: "MALFORMED_RESPONSE" });
        expect(toUserMessage(err)).toMatch(/unexpected response/i);
    });

    test("EMPTY_RESPONSE → empty response message", () => {
        const err = Object.assign(new Error("emp"), { code: "EMPTY_RESPONSE" });
        expect(toUserMessage(err)).toMatch(/empty response/i);
    });

    test("API_FAILURE → includes HTTP status code", () => {
        const err = Object.assign(new Error("api"), { code: "API_FAILURE", status: 503 });
        expect(toUserMessage(err)).toContain("503");
    });

    test("plain Error returns its .message", () => {
        expect(toUserMessage(new Error("something went wrong"))).toBe("something went wrong");
    });

    test("object with numeric .status uses API_FAILURE format", () => {
        expect(toUserMessage({ status: 429, message: "rate limited" })).toContain("429");
    });
});

// ===========================================================================
// searchAnnotations — input validation
// ===========================================================================

describe("searchAnnotations — input validation", () => {
    test("returns error for empty string query", async () => {
        const result = await searchAnnotations("");
        expect(result.error).toBe("Search query is required.");
        expect(result.results).toEqual([]);
        expect(global.fetch).not.toHaveBeenCalled();
    });

    test("returns error for whitespace-only query", async () => {
        const result = await searchAnnotations("   ");
        expect(result.error).toBe("Search query is required.");
        expect(global.fetch).not.toHaveBeenCalled();
    });

    test("returns error for query exceeding 512 characters", async () => {
        const result = await searchAnnotations("a".repeat(513));
        expect(result.error).toMatch(/too long/i);
        expect(result.results).toEqual([]);
        expect(global.fetch).not.toHaveBeenCalled();
    });

    test("accepts query at exactly 512 characters", async () => {
        global.fetch = jest.fn().mockResolvedValue(pageResponse([]));
        const result = await searchAnnotations("a".repeat(512));
        expect(result.error).toBeNull();
        expect(global.fetch).toHaveBeenCalled();
    });

    test("returns error for invalid searchType", async () => {
        const result = await searchAnnotations("hello", "fuzzy");
        expect(result.error).toMatch(/text.*phrase|phrase.*text/i);
        expect(result.results).toEqual([]);
        expect(global.fetch).not.toHaveBeenCalled();
    });

    test("accepts 'text' searchType", async () => {
        global.fetch = jest.fn().mockResolvedValue(pageResponse([]));
        const result = await searchAnnotations("hello", "text");
        expect(result.error).toBeNull();
    });

    test("accepts 'phrase' searchType", async () => {
        global.fetch = jest.fn().mockResolvedValue(pageResponse([]));
        const result = await searchAnnotations("hello phrase", "phrase");
        expect(result.error).toBeNull();
    });

    test("defaults to 'text' searchType when omitted", async () => {
        global.fetch = jest.fn().mockResolvedValue(pageResponse([]));
        const result = await searchAnnotations("hello");
        expect(result.error).toBeNull();
    });
});

// ===========================================================================
// searchAnnotations — special characters
// ===========================================================================

describe("searchAnnotations — special characters", () => {
    test.each([
        ["XSS attempt", '<script>alert("xss")</script>'],
        ["ampersand", "fish & chips"],
        ["percent", "100% complete"],
        ["double quotes", '"quoted phrase"'],
        ["backslash", "path\\to\\file"],
        ["unicode", "日本語テスト"],
        ["null byte", "test\u0000value"],
        ["newlines", "multi\nline\nquery"],
    ])("does not throw for %s", async (_label, query) => {
        global.fetch = jest.fn().mockResolvedValue(pageResponse([]));
        const result = await searchAnnotations(query);
        expect(result).toHaveProperty("results");
        expect(result).toHaveProperty("error");
        expect(global.fetch).toHaveBeenCalled();
    });
});

// ===========================================================================
// searchAnnotations — successful results
// ===========================================================================

describe("searchAnnotations — successful results", () => {
    test("returns normalized results from a single page", async () => {
        global.fetch = jest.fn()
            .mockResolvedValueOnce(
                pageResponse([{ "@id": "http://anno.example.com/1", bodyValue: "annotation text" }])
            )
            .mockResolvedValue(pageResponse([]));

        const result = await searchAnnotations("annotation text");
        expect(result.error).toBeNull();
        expect(result.results).toHaveLength(1);
        expect(result.results[0].bodyText).toBe("annotation text");
        expect(result.results[0].id).toBe("http://anno.example.com/1");
    });

    test("returns empty results with null error when API returns nothing", async () => {
        global.fetch = jest.fn().mockResolvedValue(pageResponse([]));
        const result = await searchAnnotations("nothing here");
        expect(result.error).toBeNull();
        expect(result.results).toEqual([]);
    });

    test("aggregates results from multiple pages without duplication", async () => {
        const page1 = Array.from({ length: 5 }, (_, i) => ({
            "@id": `http://anno.example.com/${i}`,
            bodyValue: `text ${i}`,
        }));
        const page2 = Array.from({ length: 5 }, (_, i) => ({
            "@id": `http://anno.example.com/${i + 5}`,
            bodyValue: `text ${i + 5}`,
        }));

        global.fetch = jest.fn()
            .mockResolvedValueOnce(pageResponse(page1))
            .mockResolvedValueOnce(pageResponse(page2))
            .mockResolvedValue(pageResponse([]));

        const result = await searchAnnotations("text");
        expect(result.results).toHaveLength(10);
        const ids = result.results.map((r) => r.id);
        expect(new Set(ids).size).toBe(10);
    });

    test("stops paginating once API returns empty page", async () => {
        const fullPage = Array.from({ length: 10 }, (_, i) => ({
            "@id": `http://anno.example.com/${i}`,
            bodyValue: "text",
        }));

        global.fetch = jest.fn()
            .mockResolvedValueOnce(pageResponse(fullPage))
            .mockResolvedValueOnce(pageResponse(fullPage))
            .mockResolvedValue(pageResponse([]));

        const result = await searchAnnotations("text");
        expect(result.results).toHaveLength(20);
    });

    test("respects SEARCH_MAX_PAGES limit (3 pages in test config)", async () => {
        // Always return a full page — pagination should stop at max pages
        const fullPage = Array.from({ length: 10 }, (_, i) => ({
            "@id": `http://anno.example.com/${i}`,
            bodyValue: "text",
        }));
        global.fetch = jest.fn().mockResolvedValue(pageResponse(fullPage));

        const result = await searchAnnotations("text");
        expect(result.results.length).toBeLessThanOrEqual(30);
    });
});

// ===========================================================================
// searchAnnotations — error scenarios
// ===========================================================================

describe("searchAnnotations — error scenarios", () => {
    test("returns connection error on network failure", async () => {
        global.fetch = jest.fn().mockRejectedValue(new TypeError("Failed to fetch"));
        const result = await searchAnnotations("query");
        expect(result.error).toMatch(/connection|reach/i);
        expect(result.results).toEqual([]);
    });

    test("returns API error with status on non-OK HTTP response", async () => {
        global.fetch = jest.fn().mockResolvedValue(pageResponse(null, 500));
        const result = await searchAnnotations("query");
        expect(result.error).toMatch(/500/);
        expect(result.results).toEqual([]);
    });

    test("returns error for blank response body", async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            status: 200,
            text: jest.fn().mockResolvedValue("   "),
        });
        const result = await searchAnnotations("query");
        expect(result.error).toMatch(/empty response/i);
    });

    test("returns error for non-JSON response body", async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            status: 200,
            text: jest.fn().mockResolvedValue("not valid json {{{"),
        });
        const result = await searchAnnotations("query");
        expect(result.error).toMatch(/unexpected response/i);
    });

    test("returns error on 404 response", async () => {
        global.fetch = jest.fn().mockResolvedValue(pageResponse(null, 404));
        const result = await searchAnnotations("query");
        expect(result.error).toMatch(/404/);
        expect(result.results).toEqual([]);
    });
});

// ===========================================================================
// searchAnnotations — caching
// ===========================================================================

describe("searchAnnotations — caching", () => {
    test("returns cached result without re-fetching within TTL", async () => {
        global.fetch = jest.fn()
            .mockResolvedValueOnce(
                pageResponse([{ "@id": "http://example.com/1", bodyValue: "hello" }])
            )
            .mockResolvedValue(pageResponse([]));

        await searchAnnotations("cache-test");
        const fetchCountAfterFirst = global.fetch.mock.calls.length;

        // Second call — should hit cache, no new fetch
        const cached = await searchAnnotations("cache-test");
        expect(global.fetch.mock.calls.length).toBe(fetchCountAfterFirst);
        expect(cached.results[0].bodyText).toBe("hello");
    });

    test("re-fetches after cache TTL expires (60 s)", async () => {
        const dateSpy = jest.spyOn(Date, "now");
        const t0 = 1_000_000_000;
        dateSpy.mockReturnValue(t0);

        global.fetch = jest.fn()
            .mockResolvedValueOnce(
                pageResponse([{ "@id": "http://example.com/1", bodyValue: "hello" }])
            )
            .mockResolvedValue(pageResponse([]));

        await searchAnnotations("ttl-test");

        // Advance time past 60 s TTL
        dateSpy.mockReturnValue(t0 + 61_000);

        const freshFetch = jest.fn().mockResolvedValue(pageResponse([]));
        global.fetch = freshFetch;

        await searchAnnotations("ttl-test");
        expect(freshFetch).toHaveBeenCalled();

        dateSpy.mockRestore();
    });

    test("different queries use independent cache entries", async () => {
        const dateSpy = jest.spyOn(Date, "now");
        const t0 = 1_000_000_000;
        dateSpy.mockReturnValue(t0);

        global.fetch = jest.fn()
            .mockResolvedValueOnce(
                pageResponse([{ "@id": "http://example.com/1", bodyValue: "alpha result" }])
            )
            .mockResolvedValueOnce(pageResponse([]))
            .mockResolvedValueOnce(
                pageResponse([{ "@id": "http://example.com/2", bodyValue: "beta result" }])
            )
            .mockResolvedValue(pageResponse([]));

        const r1 = await searchAnnotations("alpha");

        // Advance past the 500 ms cooldown so the second query is not rate-limited
        dateSpy.mockReturnValue(t0 + 600);

        const r2 = await searchAnnotations("beta");
        expect(r1.results[0].bodyText).toBe("alpha result");
        expect(r2.results[0].bodyText).toBe("beta result");

        dateSpy.mockRestore();
    });
});

// ===========================================================================
// searchAnnotations — cooldown
// ===========================================================================

describe("searchAnnotations — cooldown", () => {
    test("rate-limits a second query made within the 500 ms cooldown window", async () => {
        // First call succeeds (lastSearchAt starts at 0, so Date.now() >> 0 + 500)
        global.fetch = jest.fn().mockResolvedValue(pageResponse([]));
        await searchAnnotations("first query");

        // Second call (different query, no in-flight dedup) — immediate, within cooldown
        const result = await searchAnnotations("second query");
        expect(result.error).toBe("Please wait a moment before searching again.");
        expect(result.results).toEqual([]);
    });

    test("allows a new query after the cooldown window has elapsed", async () => {
        const dateSpy = jest.spyOn(Date, "now");
        const t0 = 1_000_000_000;
        dateSpy.mockReturnValue(t0);

        global.fetch = jest.fn().mockResolvedValue(pageResponse([]));
        await searchAnnotations("first query");

        // Advance time past the 500 ms cooldown
        dateSpy.mockReturnValue(t0 + 600);

        const result = await searchAnnotations("second query");
        expect(result.error).toBeNull();

        dateSpy.mockRestore();
    });
});

// ===========================================================================
// searchAnnotations — in-flight deduplication
// ===========================================================================

describe("searchAnnotations — in-flight deduplication", () => {
    test("concurrent identical queries share the in-flight promise (fetch not doubled)", async () => {
        // Return real results on first fetch so the payload-fallback loop exits immediately,
        // then return empty to stop pagination. Without dedup, p2 would double the call count.
        global.fetch = jest.fn()
            .mockResolvedValueOnce(
                pageResponse([{ "@id": "http://example.com/1", bodyValue: "dedup result" }])
            )
            .mockResolvedValue(pageResponse([]));

        // Both calls are made synchronously before any microtask flush, so the
        // second call sees the in-flight entry from the first and reuses it.
        const p1 = searchAnnotations("dedup-query");
        const p2 = searchAnnotations("dedup-query");

        const [r1, r2] = await Promise.all([p1, p2]);

        // 2 fetches: page 1 (results) + page 2 (empty stop). Without dedup it would be 4.
        expect(global.fetch).toHaveBeenCalledTimes(2);
        // Both callers should see the same result
        expect(r1.results).toHaveLength(1);
        expect(r2.results).toHaveLength(1);
    });

    test("both callers receive identical results via deduplication", async () => {
        global.fetch = jest.fn()
            .mockResolvedValueOnce(
                pageResponse([{ "@id": "http://example.com/1", bodyValue: "shared result" }])
            )
            .mockResolvedValue(pageResponse([]));

        const p1 = searchAnnotations("dedup-query");
        const p2 = searchAnnotations("dedup-query");

        const [r1, r2] = await Promise.all([p1, p2]);
        expect(r1.results).toHaveLength(1);
        expect(r1.results[0].bodyText).toBe("shared result");
        expect(r2.results[0].bodyText).toBe(r1.results[0].bodyText);
    });

    test("different queries are not deduplicated", async () => {
        global.fetch = jest.fn().mockResolvedValue(pageResponse([]));

        const p1 = searchAnnotations("query-a");
        const p2 = searchAnnotations("query-b");

        expect(p1).not.toBe(p2);

        await Promise.all([p1, p2]);
    });
});
