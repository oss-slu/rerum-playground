# Web Annotator

## Purpose

The Web Annotator page (`annotator.html`) lets users build, preview, and save
[W3C Web Annotations](https://www.w3.org/TR/annotation-model/) against the RERUM API.
It is the interactive companion to the Sandbox for annotation-specific work.

---

## Module Architecture

```
annotator.html
├── js/features/playground.js       (shared — menu/footer injection, sidebar toggle)
└── js/components/annotatorUI.js   (form wiring, live preview, RERUM save)
    ├── js/annotationTemplate.js   (JSON-LD template constant + buildAnnotation())
    ├── js/services/objectService.js  (create() — POST to RERUM)
    └── js/config.js               (URLS.CREATE, EVENTS.CREATED)
```

**Data flow:**
1. User fills form fields (body text, target URI, motivation, language).
2. `annotatorUI.js` calls `buildAnnotation()` on each `input` event → updates the live `<pre>` preview.
3. "Save to RERUM" button (enabled only when required fields are filled) calls `create(annotation)`.
4. On success, the RERUM-assigned URI is shown and a `EVENTS.CREATED` CustomEvent is dispatched on `document`.

---

## JSON-LD 1.1 Annotation Template

Minimal valid Web Annotation per [https://www.w3.org/ns/anno.jsonld](https://www.w3.org/ns/anno.jsonld):

```json
{
  "@context": "http://www.w3.org/ns/anno.jsonld",
  "type": "Annotation",
  "motivation": "commenting",
  "body": {
    "type": "TextualBody",
    "value": "",
    "format": "text/plain",
    "language": "en"
  },
  "target": ""
}
```

### Required fields

| Field | Maps to (Linked Data) | Notes |
|---|---|---|
| `@context` | — | `"http://www.w3.org/ns/anno.jsonld"` — JSON-LD 1.1 context declaration |
| `type` | `oa:Annotation` | Identifies the resource as a Web Annotation |
| `body` | `oa:hasBody` | The annotation content |
| `target` | `oa:hasTarget` | URI of the resource being annotated |

### Body properties with context definitions

| Property | Linked Data URI | Description |
|---|---|---|
| `body.type` (`TextualBody`) | `oa:TextualBody` — http://www.w3.org/ns/oa#TextualBody | Body resource type |
| `body.value` | `rdf:value` — http://www.w3.org/1999/02/22-rdf-syntax-ns#value | The plain-text content |
| `body.format` | `dc:format` — http://purl.org/dc/elements/1.1/format | MIME type (always `text/plain` here) |
| `body.language` | `dc:language` — http://purl.org/dc/elements/1.1/language | BCP47 language tag |
| `motivation` | `oa:motivatedBy` — http://www.w3.org/ns/oa#motivatedBy | Reason for the annotation |

The `id` field (`@id`) is assigned by RERUM after a successful `CREATE` call.

---

## `annotationTemplate.js` Exports

| Export | Type | Description |
|---|---|---|
| `ANNOTATION_CONTEXT` | `string` | `"http://www.w3.org/ns/anno.jsonld"` |
| `MOTIVATIONS` | frozen object | Allowed `oa:motivatedBy` values: `commenting`, `tagging`, `describing`, `identifying`, `classifying` |
| `MINIMAL_ANNOTATION_TEMPLATE` | frozen object | Empty template for reference and display |
| `buildAnnotation(bodyText, targetUri, motivation?, language?)` | function | Returns a new annotation object; throws if required fields are missing |

---

## Validation

To manually validate the JSON-LD structure:

1. Build an annotation using the form.
2. Copy the preview JSON.
3. Paste it into the [JSON-LD Playground](https://json-ld.org/playground/).
4. Confirm that all body properties expand to their full linked-data URIs under the `http://www.w3.org/ns/anno.jsonld` context.

---

## Linked Files

**JavaScript**
- `js/features/playground.js`
- `js/components/annotatorUI.js`
- `js/annotationTemplate.js`
- `js/services/objectService.js`
- `js/config.js`

**CSS**
- `css/playground.css`
- `css/annotator.css`
- `css/index.css`
- `css/footer.css`
