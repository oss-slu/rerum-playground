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
- Substring matching: The search performs case-insensitive substring matching, as supported by the RERUM text search API
- Multi-word searches: Multi-word search behavior is dependent on the RERUM API and is not strictly defined in Iteration 1


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

Response Format: JSON array of annotation objects, returned in the order provided by the RERUM API

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
4. Matching behavior: Search behavior follows case-insensitive substring matching as provided by the RERUM API
5. Pagination required: Results may require pagination using limit (max 100) and skip parameters
6. Linguistic analysis: No assumptions are made about stemming, stop words, or linguistic normalization in Iteration 1
7. Expensive operation: Search operations are resource-intensive; caching and rate limiting should be considered

API Endpoint (Iteration 1):
GET https://store.rerum.io/v1/search/text

Notes:
- Phrase search is supported by RERUM but excluded from Iteration 1
- Requests use query parameters (q, limit, skip)
- Maximum limit per request is 100

