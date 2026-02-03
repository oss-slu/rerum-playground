Annotation Text Search Requirements

Overview

This document defines the expected behavior and scope of the annotation text search functionality for Iteration 1.

Search Scope

Which annotation fields are searchable: Body text only

The search functionality searches exclusively through the body text content of Web Annotations. Specifically, it searches text content in:
- Annotation.body.value
- Annotation.bodyValue
- Related text content fields within annotation bodies

The search does NOT include:
- Target URIs
- Motivation fields
- Creator information
- Creation dates
- Any other metadata fields

Search Type

Type: Plain-text, case-insensitive

- Plain-text search: The search operates on plain text content without special query syntax
- Case-insensitive: Search queries match regardless of case (e.g., "hello" matches "Hello", "HELLO", "HeLLo")
- Exact word matching: Searches for exact word matches (partial word matches and wildcards are not supported)
- Multi-word searches: When multiple words are provided, finds annotations containing all search terms (AND logic)

Input Format

Format: Single string

The search accepts a single string input containing the text to search for.

Example: "medieval manuscript"

Validation:
- Input must be a non-empty string
- Leading/trailing whitespace should be trimmed
- Empty strings after trimming should be rejected

Output Fields

For each matching annotation, the following fields are returned:

1. Annotation ID: The unique identifier (URI) of the annotation
   - Field name: @id
   - Type: String (URI)

2. Body text snippet: A portion of the annotation body text containing the matched search term
   - Field name: body.value or bodyValue (depending on annotation structure)
   - Type: String
   - Note: Contains the text content where the match was found

3. Target URI (if available): The URI of the resource that the annotation targets
   - Field name: target
   - Type: String (URI) or null
   - Note: May not be available for all annotations

Response Format: JSON array of annotation objects, sorted by relevance score (highest first)

Example Response:

[
  {
    "@id": "https://devstore.rerum.io/v1/id/abcdef1234567890",
    "body": {
      "value": "This is lorem ipsum test text"
    },
    "target": "https://example.org/manifest/canvas/1"
  },
  {
    "@id": "https://devstore.rerum.io/v1/id/1234567890abcdef",
    "bodyValue": "It has been said that 'Lorem Ipsum' is a good placeholder.",
    "target": null
  }
]

Assumptions and Limitations for Iteration 1

1. Body text only: Only the body text content of annotations is searched; no other fields are searchable
2. No phrase search: Phrase search functionality is not included in Iteration 1
3. No advanced query syntax: No support for boolean operators (AND, OR, NOT), wildcards, or regex patterns
4. No partial word matching: Only exact word matches are supported
5. Pagination required: Results may require pagination using limit (max 100) and skip parameters
6. Linguistic analysis: Standard linguistic analysis (stemming, stop words) is applied automatically by the API
7. Expensive operation: Search operations are resource-intensive; caching and rate limiting should be considered

API Endpoint: https://devstore.rerum.io/v1/api/search
HTTP Method: POST
Content-Type: application/json; charset=utf-8
