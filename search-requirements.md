Annotation Text Search Requirements

Overview

This document defines the expected behavior and scope of the annotation text search functionality for Iteration 1. It distinguishes between what the RERUM Text Search API provides and what our Iteration 1 product/UI will implement.

RERUM API Endpoint

Endpoint: https://devstore.rerum.io/v1/api/search
HTTP Method: POST
Content-Type: application/json; charset=utf-8
Pagination Parameters:
- limit: Maximum number of results per request (max 100, recommended)
- skip: Number of results to skip for pagination

Search Scope

What the RERUM API searches:

The RERUM Text Search API searches through text content fields within Web Annotations and IIIF resources. Specifically, it searches:

Web Annotation & IIIF Presentation API 3.0 fields:
- Annotation.body.value - Text content in annotation body
- Annotation.bodyValue - Direct text value in annotation body
- Nested text structures in AnnotationPage items, Canvas annotations, and Manifest items

IIIF Presentation API 2.1 fields:
- oa:Annotation resource.chars - Character content
- oa:Annotation resource.cnt:chars - Character content
- Nested structures in sc:AnnotationList resources, sc:Canvas otherContent, and sc:Manifest sequences

The API does NOT search:
- Target URIs
- Motivation fields
- Creator information
- Creation dates
- Other metadata fields

Iteration 1 Product Scope:

For Iteration 1, our product will focus on displaying and working with Annotation type objects. The API may return other IIIF resource types (AnnotationPage, Canvas, Manifest items), but our UI will filter or display only Annotation objects. This filtering is a client-side implementation decision, not an API limitation.

Search Type

What the RERUM API does:

- Case-insensitive: Search queries are matched regardless of case (e.g., "hello" matches "Hello", "HELLO", "HeLLo")
- Tokenized search: The search text is tokenized (split into words)
- Exact word matching: Searches for exact word matches (partial word matches and wildcards are NOT supported)
- Multi-word AND logic: When multiple words are provided, finds documents containing ALL search terms anywhere in the text content (AND logic)
- Linguistic analysis: Standard linguistic analysis is applied automatically, including:
  - Stemming (word root matching)
  - Stop word filtering
  - Tokenization
- Relevance ranking: Results include a __rerum.score property indicating match quality
- Results sorting: Results are sorted by relevance score in descending order (highest score first)

Input Format

What the RERUM API accepts:

The RERUM Text Search API accepts search queries in two formats:

Format 1: JSON Object
{
  "searchText": "medieval manuscript"
}
- Field: searchText (required) - Contains the text to search for
- Optional: options property for future search configuration (not used in Iteration 1)

Format 2: Plain String
- Direct string input: "medieval manuscript"
- The API accepts the search text as a plain string in the request body

Iteration 1 Product Input:

For Iteration 1, our product will accept a single string input from users. The application will handle formatting this input appropriately for the API (either as JSON object with searchText property or as plain string).

Validation (client-side):
- Input must be a non-empty string
- Leading/trailing whitespace should be trimmed before sending
- Empty strings after trimming should be rejected

Example Queries:
- Single word: "manuscript"
- Multiple words: "medieval manuscript" (finds annotations containing both "medieval" AND "manuscript" anywhere in the text)

Output Format

What the RERUM API returns:

The RERUM API returns a JSON array of full resource objects (Web Annotations, IIIF resources, etc.). Each result includes:

1. @id: The unique identifier (URI) of the resource
2. type: The resource type (e.g., "Annotation")
3. Body text content: The full text content where the match was found
   - Field: body.value or bodyValue (depending on resource structure)
4. __rerum.score: Relevance score indicating match quality (higher = better match)
5. target: The URI of the resource that the annotation targets (if available)
6. Other fields: Complete resource object with all original fields

Response Format:
- Type: JSON Array [{JSON}]
- Ordering: Results sorted by relevance score in descending order (highest score first)
- Empty results: Returns empty array [] if no matches found

Example API Response:

[
  {
    "@id": "https://devstore.rerum.io/v1/id/abcdef1234567890",
    "type": "Annotation",
    "body": {
      "value": "This is lorem ipsum test text"
    },
    "target": "https://example.org/manifest/canvas/1",
    "__rerum": {
      "score": 4.567
    }
  },
  {
    "@id": "https://devstore.rerum.io/v1/id/1234567890abcdef",
    "type": "Annotation",
    "bodyValue": "It has been said that 'Lorem Ipsum' is a good placeholder.",
    "target": null,
    "__rerum": {
      "score": 3.892
    }
  }
]

Iteration 1 Product Output:

For each matching annotation displayed to users, our product will show:

1. Annotation ID (@id): The unique identifier (URI) of the annotation
2. Body text snippet: A portion of the annotation body text containing the matched search term
   - Note: This snippet will be extracted client-side from the full body.value or bodyValue field returned by the API. The API does not provide pre-formatted snippets.
3. Target URI (if available): The URI of the resource that the annotation targets

The snippet extraction and display formatting are client-side implementation details, not API features.

Assumptions and Limitations for Iteration 1

API Capabilities (what RERUM provides):

1. Text search endpoint: Standard text search with tokenized AND logic and exact word matching
2. Phrase search endpoint: RERUM also provides a /search/phrase endpoint for phrase-based searches (out of scope for Iteration 1)
3. Linguistic analysis: Applied automatically (cannot be disabled)
4. Relevance scoring: __rerum.score property added to all results
5. Pagination: Supported via limit (max 100) and skip parameters

Iteration 1 Product Limitations:

1. Annotation type focus: Our UI will focus on displaying Annotation type objects, filtering other resource types client-side if needed
2. No phrase search: Iteration 1 uses only the standard text search endpoint; phrase search endpoint is not used
3. No advanced query syntax: No support for boolean operators (AND, OR, NOT), wildcards, or regex patterns
4. No partial word matching: Only exact word matches are supported (API limitation)
5. Pagination required: Results may require pagination using limit (max 100) and skip parameters
6. Expensive operation: Search operations are resource-intensive; caching and rate limiting should be considered

Implementation Notes (Iteration 1)

1. Resource type filtering: The RERUM API may return various IIIF resource types (Annotation, AnnotationPage, Canvas, Manifest items). Our Iteration 1 product will filter or display only Annotation type objects. This filtering is a client-side implementation decision.

2. Snippet generation: The API returns full annotation objects with complete body text content. Our product will extract and display snippets client-side from the body.value or bodyValue fields. Snippet truncation and context highlighting are UI implementation details, not API features.

3. Phrase search endpoint: RERUM provides a /search/phrase endpoint for phrase-based searches with configurable slop values. This endpoint exists and is documented, but is explicitly out of scope for Iteration 1. We will use only the standard /search endpoint.

4. Input handling: Users will provide a single string input. Our application will format this appropriately for the API (as JSON object with searchText property or as plain string body).

5. Pagination: When expecting more than 100 results, implement paged queries using limit (max 100) and skip parameters. Continue fetching until no more results are returned.
