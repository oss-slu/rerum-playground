# RERUM API Documentation

**Source:** [https://store.rerum.io/API.html]
API V1

- **RERUM Sandbox (public test):** [https://tinydev.rerum.io]

- Sandbox API links (development API; not for production):
  - [https://tinydev.rerum.io/app/create]— Create
  - [https://tinydev.rerum.io/app/update] — PUT update
  - [https://tinydev.rerum.io/app/delete] — Delete
  - [https://tinydev.rerum.io/app/query]— Custom query

**Important Warnings**
# Sandbox data is public and may be removed. It should not be used for production applications.
# Deleted records are removed from history trees. RERUM will do this automatically when a record is deleted. This cannot be undone.
# The __rerum, @id and _id properties are ignored on all PUT requests. In cases where the Linked Data @context property maps '@id' to 'id', the id property is also ignored.
#The __rerum, @id and _id properties are ignored on all PATCH requests. In cases where the Linked Data @context property maps '@id' to 'id', the id property is also ignored.
 
**Pagination:** 
`limit` (default 10), `skip`. Recommend `limit` <= 100; for more results, use paged requests.


## Text Search ##
**HTTP Method:** POST

[ Pattern   | Payload | Response ]
[`/search?limit=100&skip=0` | `{JSON}` or `"string"` | 200 `[{JSON}]` ]


**`{JSON}`** An object with a searchText property containing the text to search for, and an optional options property for search configuration
**`"string"`** Alternatively, a plain string to search for
**`Response: [{JSON}]`**An array of annotation objects matching the search, returned in the order provided by the RERUM API (includes an API-generated relevance score).



**Pagination** 
Same as Custom Query.

**Example Javascript (JSON)**
`const search_results = await fetch("https://devstore.rerum.io/v1/api/search?limit=50&skip=0", {method: "POST",headers:{"Content-Type": "application/json; charset=utf-8"},body: JSON.stringify({"searchText": "lorem ipsum"})}).then(resp => resp.json()).catch(err => {throw err})`

**URLs**
Dev: `https://devstore.rerum.io/v1/api/search`
Production: `https://store.rerum.io/v1/api/search`

## Phrase Search ##
**HTTP Method:** POST


[ Pattern   | Payload | Response ]
[`/search/phrase?limit=100&skip=0` | `{JSON}` or `"string"` | 200 `[{JSON}]`]

**`{JSON}`** An object with a searchText property containing the phrase to search for, and an optional options property (default slop: 2)
"string"—Alternatively, a plain string phrase to search for
**Response: [{JSON}]** An array of annotation objects matching the search, returned in the order provided by the RERUM API.


**Javascript Example (With Custom Slop)** 
`const phrase_results = await fetch("https://devstore.rerum.io/v1/api/search/phrase", {method: "POST",headers:{"Content-Type": "application/json; charset=utf-8"},body: JSON.stringify({"searchText": "illuminated manuscript","options": {"slop": 5}})}).then(resp => resp.json()).catch(err => {throw err})`


# **Phrase Search Response**
An empty array indicates that the request was successful but no matching annotations were found.


Based on the observed requests and responses, the RERUM search APIs are operational and suitable for use in development.


 ______                 
/vvvvvv\
 [ - -]
 [  O ] =}}}   

 
 
