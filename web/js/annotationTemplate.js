/**
 * W3C Web Annotation Data Model — JSON-LD 1.1 template and builder.
 * Context reference: https://www.w3.org/ns/anno.jsonld
 */

/** JSON-LD 1.1 context URI for the W3C Web Annotation vocabulary. */
export const ANNOTATION_CONTEXT = "http://www.w3.org/ns/anno.jsonld";

/**
 * Allowed values for oa:motivatedBy.
 * Each maps to a term defined in the W3C anno context.
 */
export const MOTIVATIONS = Object.freeze({
    COMMENTING:   "commenting",   // oa:commenting
    TAGGING:      "tagging",      // oa:tagging
    DESCRIBING:   "describing",   // oa:describing
    IDENTIFYING:  "identifying",  // oa:identifying
    CLASSIFYING:  "classifying"   // oa:classifying
});

/**
 * Minimal valid Web Annotation template (frozen — do not mutate).
 *
 * Required fields per https://www.w3.org/TR/annotation-model/:
 *   @context  — declares JSON-LD 1.1 Web Annotation vocabulary
 *   type      — "Annotation" → oa:Annotation
 *   body      — annotation content → oa:hasBody
 *   target    — URI of the resource being annotated → oa:hasTarget
 *
 * Body properties with linked-data context definitions:
 *   body.type     "TextualBody"  → oa:TextualBody
 *   body.value    ""             → rdf:value  (http://www.w3.org/1999/02/22-rdf-syntax-ns#value)
 *   body.format   "text/plain"   → dc:format  (http://purl.org/dc/elements/1.1/format)
 *   body.language "en"           → dc:language (http://purl.org/dc/elements/1.1/language)
 *   motivation    "commenting"   → oa:motivatedBy (http://www.w3.org/ns/oa#motivatedBy)
 *
 * The `id` field is assigned by RERUM after a successful CREATE call.
 */
export const MINIMAL_ANNOTATION_TEMPLATE = Object.freeze({
    "@context": ANNOTATION_CONTEXT,
    "type": "Annotation",
    "motivation": MOTIVATIONS.COMMENTING,
    "body": Object.freeze({
        "type": "TextualBody",
        "value": "",
        "format": "text/plain",
        "language": "en"
    }),
    "target": ""
});

/**
 * Build a minimal valid JSON-LD 1.1 Web Annotation object.
 *
 * @param {string} bodyText   - Plain-text annotation content (required, non-empty)
 * @param {string} targetUri  - URI of the resource being annotated (required, non-empty)
 * @param {string} [motivation="commenting"] - oa:motivatedBy value; use MOTIVATIONS constants
 * @param {string} [language="en"]           - BCP47 language tag for the body text
 * @returns {Object} A new annotation object ready to POST to RERUM
 * @throws {Error} if bodyText or targetUri is empty or not a string
 */
export function buildAnnotation(bodyText, targetUri, motivation = MOTIVATIONS.COMMENTING, language = "en") {
    if (typeof bodyText !== "string" || !bodyText.trim()) {
        throw new Error("bodyText must be a non-empty string.");
    }
    if (typeof targetUri !== "string" || !targetUri.trim()) {
        throw new Error("targetUri must be a non-empty string.");
    }
    return {
        "@context": ANNOTATION_CONTEXT,
        "type": "Annotation",
        "motivation": motivation,
        "body": {
            "type": "TextualBody",
            "value": bodyText.trim(),
            "format": "text/plain",
            "language": language || "en"
        },
        "target": targetUri.trim()
    };
}
