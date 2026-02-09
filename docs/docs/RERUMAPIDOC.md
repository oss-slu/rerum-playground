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



## Overview ##
**GET** (Single record by id, History tree before this version, History tree since this version)
**POST** (Access/Refresh Token Proxy, Create, Bulk Create, **Custom Query**, **Text Search**, **Phrase Search**, HTTP Method Override )
**PUT** (Update, Overwrite, Bulk Update )
**PATCH** (Patch Update, Add Properties, Remove Properties, RERUM released)
**DELETE** (Delete Record) 

## Registration ##

**Register:** [https://devstore.rerum.io/v1/]
**Access Tokens** are **required** in order to **communicate** with the **RERUM API**. These Access Tokens are for the application so that RERUM can verify which application is making an API request and attribute data properly. To register, one must visit the registration page at the link provided.

**Note:** Examples in this doc use the development API (`devstore.rerum.io`).

## Authorization ##

Create, Update, and Delete require a valid Access Token:

**Example**
Authorization: Bearer eyJz93a...k4laUWw


*Quick Version*
--------------------------------------------------------------------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------------------------------------------------------------------


--------------------------------------------------------------------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------------------------------------------------------------------

**GET**

## Single record by id ##

 [ Pattern   | Payload | Response ]
 [ `/id/_id` | empty   | 200 `{JSON}`]

**`_id`** — RERUM record id.

**`Response: {JSON}`** The record with identifier _id

**Javascript Example**
`const entity = await fetch("https://devstore.rerum.io/v1/id/11111").then(resp => resp.json()).catch(err => {throw err})`



## History tree before this version ##

[ Pattern    | Payload | Response ]
[ `/history/_id`| empty| 200 `[{JSON}]`]

**`_id`** — RERUM record id.

**`Response: [{JSON}]`** an array of the resolved records of all parent history records

**Javascript Example**
`const history_array = await fetch("https://devstore.rerum.io/v1/history/11111").then(resp => resp.json()).catch(err => {throw err})`


## History tree since this version ##

[ Pattern    | Payload | Response ]
[ `/history/_id`| empty| 200 `[{JSON}]`]

**`_id`** RERUM record id.

**`Response: [{JSON}]`** an array of the resolved records of all child history records

Returns descendants of the record (child history).

**Javascript Example**
`const since_array = await fetch("https://devstore.rerum.io/v1/since/11111").then(resp => resp.json()).catch(err => {throw err})`

--------------------------------------------------------------------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------------------------------------------------------------------

**POST**

## Access Token Proxy ##

[ Pattern   | Payload | Response ]
[ `/client/request-new-access-token`| `{JSON}`   | 200 `{JSON}`]

**`{JSON}`** Auth0 requirements
**`Response: {JSON}`** Containing the Auth0 /oauth/token JSON response


**Javascript Example**
`const access_token = await fetch("https://devstore.rerum.io/client/request-new-access-token", {method: "POST",headers:{"Content-Type": "application json; charset=utf-8" }, body: JSON.stringify({ "refresh_token": "faJw88b...l4leYIw" }) }).then(resp => resp.json()).then(info => info.access_token).catch(err => {throw err})`


## Create ##

[ Pattern |  Payload |                            Response                                    ]
[`/create`| `{JSON}` | `201 Location: https://devstore.rerum.io/v1/id/abcdef1234567890 {JSON}`]

**`{JSON}`** The object to create
**`Response:`** {JSON}—Containing various bits of information about the create.

**Javascript Example**
`const saved_obj = await fetch("https://devstore.rerum.io/v1/api/create", {method: "POST",headers:{"Authorization": "Bearer eyJz93a...k4laUWw" "Content-Type": "application/json; charset=utf-8"},body: JSON.stringify({"hello": "world"})}).then(resp => resp.json()).catch(err => {throw err})`

## Bulk Create ##

[ Pattern   | Payload | Response ]
[`/bulkCreate` | `[{JSON}]` | 201 `[{JSON}]`]

**`[{JSON}]`** an array of objects to create in RERUM
**`Response: [{JSON}]`** an array of the resolved records from the creation process

## Custom Query ##

[ Pattern   | Payload | Response ]
[`/query?limit=10&skip=0` | `{JSON}` | 200 `[{JSON}]`]

**`{JSON}`** the properties in JSON format for the query
**`Response: [{JSON}]`** an array of the resolved records that match the query

**Pagination:** 
`limit` (default 10), `skip`. Recommend `limit` <= 100; for more results, use paged requests.

**Javascript Example**
`const matched_objects = await fetch("https://devstore.rerum.io/v1/api/query", {method: "POST",headers:{"Content-Type": "application/json; charset=utf-8"},body: JSON.stringify({"type": "Object", "shape": "round"})}).then(resp => resp.json()).catch(err => {throw err})`

## Text Search ##

[ Pattern   | Payload | Response ]
[`/search?limit=100&skip=0` | `{JSON}` or `"string"` | 200 `[{JSON}]` ]


**`{JSON}`** An object with a searchText property containing the text to search for, and an optional options property for search configuration
**`"string"`** Alternatively, a plain string to search for
**`Response: [{JSON}]`** An array of annotation objects matching the search, sorted by relevance score


**Pagination** 
Same as Custom Query.

**Example Javascript (JSON)**
`const search_results = await fetch("https://devstore.rerum.io/v1/api/search?limit=50&skip=0", {method: "POST",headers:{"Content-Type": "applicationjson; charset=utf-8"},body: JSON.stringify({"searchText": "lorem ipsum"})}).then(resp => resp.json()).catch(err => {throw err})`

**URLs**
Dev: `https://devstore.rerum.io/v1/api/search`
Production: `https://store.rerum.io/v1/api/search`

## Phrase Search ##

[ Pattern   | Payload | Response ]
[`/search/phrase?limit=100&skip=0` | `{JSON}` or `"string"` | 200 `[{JSON}]`]

**`{JSON}`** An object with a searchText property containing the phrase to search for, and an optional options property (default slop: 2)
"string"—Alternatively, a plain string phrase to search for
**`Response: [{JSON}]`** An array of annotation objects matching the phrase search, sorted by relevance score

**Javascript Example (With Custom Slop)** 
`const phrase_results = await fetch("https://devstore.rerum.io/v1/api/search/phrase", {method: "POST",headers:{"Content-Type": "application/json; charset=utf-8"},body: JSON.stringify({"searchText": "illuminated manuscript","options": {"slop": 5}})}).then(resp => resp.json()).catch(err => {throw err})`

## HTTP POST Method Override ##

[ Pattern   | Payload | Response ]
[`/patch` | `{JSON}` | 200 `Location` + `{JSON}`]

{JSON}—The record to patch update.
Response: {JSON}—Containing various bits of information about the patch.

**Javascript Example (With Custom Slop)** 
`const patched_obj = await fetch("https://devstore.rerum.io/v1/api/patch", {method: "POST",headers:{"X-HTTP-Method-Override": "PATCH","Authorization":"Bearer eyJz93a...k4laUWw","Content-Type": "application/json; charset=utf-8"},body: JSON.stringify({"@id": "https://devstore.rerum.iov1/id/abcdef1234567890","existing_property": "new_value"})}).then(resp => resp.json()).catch(err => {throw err})`

--------------------------------------------------------------------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------------------------------------------------------------------

**PUT**

## Update ##

[ Pattern   | Payload | Response ]
[`/update` | `{JSON}` | `200 Location: https://devstore.rerum.io/v1/id/1234567890abcdef {JSON}`]

**`{JSON}`** The requested new state for the record.
**`Response:`** {JSON}—Containing various bits of information about the PUT update.

**Javascript Example**
`const updated = await fetch("https://devstore.rerum.io/v1/api/update", {method: "PUT",headers:{"Authorization": "Bearer eyJz93a...k4laUWw","Content-Type": "application/json; charset=utf-8"},body: JSON.stringify({"@id": "https://devstore.rerum.io/v1/id/abcdef1234567890","be": "kind"})}).then(resp => resp.json()).catch(err => {throw err})`


## Bulk Update ##

[ Pattern   | Payload | Response ]
[`/bulkUpdate` | `[{JSON}]` | 200 `[{JSON}]`]

**`[{JSON}]`** an array RERUM objects to be updated.
**`Response: [{JSON}]`** an array of the resolved records from the update process

**Javascript Example**
`const updated_objs = await fetch("https://devstore.rerum.io/v1/api/bulkUpdate", {method: "PUT",headers:{"Authorization": "Bearer eyJz93a...k4laUWw""Content-Type": "application/json; charset=utf-8"body: JSON.stringify([{"@id": "https://devstore.rerum.io/v1/id/abcdef1234567890","hello": "new world"},{"@id": "https://devstore.rerum.io/v1/id/1234567890abcdef","goodbye": "old planet"}]).then(resp => resp.json()).catch(err => {throw err})`

## Overwrite ##

[ Pattern   | Payload | Response ]
[`/overwrite` | `{JSON}` | `200 Location: https://devstore.rerum.io/v1/id/abcdef1234567890 {JSON}`]

**Javascript Example**
`const overwritten = await fetch("https://devstore.rerum.io/v1/api/overwrite", {method: "PUT",headers:{"Authorization": "Bearer eyJz93a...k4laUWw","Content-Type": "application/json; charset=utf-8"},body: JSON.stringify({"@id": "https://devstore.rerum.io/v1/id/abcdef1234567890","be": "kind"})}).then(resp => resp.json()).catch(err => {throw err})`

--------------------------------------------------------------------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------------------------------------------------------------------

**PATCH**

## Patch Update ##

[ Pattern   | Payload | Response ]
[`/patch` | `{JSON}` | `200 Location: https://devstore.rerum.io/v1/id/1234567890abcdef {JSON}`]

**`{JSON}`** The requested new state for the record. MUST contain an @id. In cases where the Linked Data @context property maps '@id' to 'id' either of these properties will be sufficient.

**`Response: {JSON}`** Containing various bits of information about the PATCH update.

**Javascript Example**
`const patched_obj = await fetch("https://devstore.rerum.io/v1/api/patch", {
method: "PATCH",
headers:{
"Authorization": "Bearer eyJz93a...k4laUWw",
"Content-Type": "application/json; charset=utf-8"
},
body: JSON.stringify(
{
"@id": "https://devstore.rerum.io/v1/id/abcdef1234567890",
"existing_property": "new_value",
"unmatched_property": "will be ignored"
}
)
})
.then(resp => resp.json())
.catch(err => {throw err})`

## Add Properties ##

[ Pattern   | Payload | Response ]
[`/set`	| `{JSON}` | `200 Location: https://devstore.rerum.io/v1/id/1234567890abcdef {JSON}`]

**`{JSON}`** The requested new state for the record MUST contain an @id. In cases where the Linked Data @context property maps '@id' to 'id' either of these properties will be sufficient.
**`Response: {JSON}`** Containing various bits of information about the PATCH update.

**Javascript Example**
`const patched_obj = await fetch("https://devstore.rerum.io/v1/api/set", {
method: "PATCH",
headers:{
"Authorization": "Bearer eyJz93a...k4laUWw",
"Content-Type": "application/json; charset=utf-8"
},
body: JSON.stringify(
{
"@id": "https://devstore.rerum.io/v1/id/abcdef1234567890",
"existing_property": "This value will be ignored",
"unmatched_property": "Some Value",
}
)
})
.then(resp => resp.json())
.catch(err => {throw err})`

## Remove Properties ##

[ Pattern   | Payload | Response ]
[`/unset`	| `{JSON}` | `200 Location: https://devstore.rerum.io/v1/id/1234567890abcdef {JSON}`]

**`{JSON}`** The requested new state for the record. MUST contain an @id. In cases where the Linked Data @context property maps '@id' to 'id' either of these properties will be sufficient.
**`{JSON}`** Containing various bits of information about the PATCH update.

**Javascript Example**
`const patched_obj = await fetch("https://devstore.rerum.io/v1/api/set", {
method: "PATCH",
headers:{
"Authorization": "Bearer eyJz93a...k4laUWw",
"Content-Type": "application/json; charset=utf-8"
},
body: JSON.stringify(
{
"@id": "https://devstore.rerum.io/v1/id/abcdef1234567890",
"existing_property": null,
"unmatched_property": "This property will be ignored"
}
)
})
.then(resp => resp.json())
.catch(err => {throw err})`

## RERUM released ##

[Pattern       | Payload | Response]
[`/release/_id`	empty	200 Location: https://devstore.rerum.io/v1/id/11111 {JSON}]

**Javascript Example**
`const releasedObj = await fetch("https://devstore.rerum.io/v1/api/release/abcdef1234567890", {
method: "PATCH",
headers:{
"Authorization": "Bearer eyJz93a...k4laUWw",
"Content-Type": "application/json; charset=utf-8"
}
})
.then(resp => resp.json())
.catch(err => {throw err})`

--------------------------------------------------------------------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------------------------------------------------------------------

**DELETE**

[ Pattern     | Payload  | Response ]
[`/delete`	|`{JSON}`	|`204`]

**`{JSON}`** The record to delete. Must contain @id or id.

There is no response body

**Javascript Example**
fetch("https://devstore.rerum.io/v1/api/delete", {
method: "DELETE",
headers:{
"Authorization": "Bearer eyJz93a...k4laUWw",
"Content-Type": "application/json; charset=utf-8"
},
body: JSON.stringify({"@id": "https://devstore.rerum.io/v1/id/abcdef1234567890"})
})
.catch(err => {throw err})


**ALT DELETE**
[ Pattern     | Payload  | Response ]
[`/delete/_id`	| `empty`	| `204`]

This delete behaves exactly the same as DELETE.

**Javascript Example**
fetch("https://devstore.rerum.io/v1/api/delete/abcdef1234567890", {
method: "DELETE",
headers:{
"Authorization": "Bearer eyJz93a...k4laUWw",
"Content-Type": "application/json; charset=utf-8"
}
})
.catch(err => {throw err})

--------------------------------------------------------------------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------------------------------------------------------------------

## IIIF & Web Annotation ##

RERUM supports the [IIIF Presentation API](https://iiif.io/api/presentation/3.0/).
RERUM follows the [W3C Annotation protocol](https://www.w3.org/TR/annotation-protocol/).

## Reference ##

**Full API (HTML)** 
[https://store.rerum.io/API.html]

--------------------------------------------------------------------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------------------------------------------------------------------

## API BEHAVIOR ## 

=- Steps -=
 *1* Go to your cmd/terminal.
 *2* Copy and paste the sample requests into terminal.
 *3* View the feedback.
 *4* Play around with the API to get a feel for it.

## SAMPLE REQUESTS ##

**Text Search**

curl -X POST "https://devstore.rerum.io/v1/api/search?limit=10&skip=0" \ -H "Content-Type: application/json; charset=utf-8" \ -d '{"searchText": "lorem ipsum"}'

**Custom Query (Property Match)**

curl -X POST "https://devstore.rerum.io/v1/api/query?limit=10&skip=0" -H "Content-Type: application/json; charset=utf-8" -d '{"type": "Object", "shape": "round"}'

**Phrase Search (Proximity Search)**
  curl -X POST "https://devstore.rerum.io/v1/api/search/phrase?limit=100&skip=0" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d '{"searchText": "illuminated manuscript", "options": {"slop": 5}}'


## LIVE RESPONSES ##
# **Text Search Response**
[{"@context":"http://iiif.io/api/presentation/3/context.json","id":"https://devstore.rerum.io/v1/id/68c4245f718ee294f194bdec","type":"Annotation","motivation":"transcribing","target":{"source":"https://tpen-project-examples.habesoftware.app/transcription-project/canvas-2.json","type":"SpecificResource","selector":{"type":"FragmentSelector","conformsTo":"http://www.w3.org/TR/media-frags/","value":"xywh=pixel:1219,2654,2561,202"}},"creator":"http://store.rerum.io/v1/id/62572ba71d974d1311abd673","body":{"type":"TextualBody","value":"Fourth line lorem ipsum","format":"text/plain"},"_createdAt":"2025-09-12T13:38:37.819Z","_modifiedAt":"2025-09-12T13:47:11.272Z","__rerum":{"@context":"http://store.rerum.io/v1/context.json","alpha":true,"APIversion":"1.0.0","createdAt":"2025-09-12T13:47:11.748","isOverwritten":"","isReleased":"","history":{"next":[],"previous":"https://devstore.rerum.io/v1/id/68c4225d9889a4aaae4a2b1c","prime":"https://devstore.rerum.io/v1/id/68c4225d9889a4aaae4a2b1c"},"releases":{"next":[],"previous":"","replaces":""},"generatedBy":"https://devstore.rerum.io/v1/id/65e75dc3f53d3372e08459e0","score":9.17419719696045}},{"@context":"http://iiif.io/api/presentation/3/context.json","id":"https://devstore.rerum.io/v1/id/68c4243e718ee294f194bdea","type":"Annotation","motivation":"transcribing","target":{"source":"https://tpen-project-examples.habesoftware.app/transcription-project/canvas-2.json","type":"SpecificResource","selector":{"type":"FragmentSelector","conformsTo":"http://www.w3.org/TR/media-frags/","value":"xywh=pixel:1219,1570,2561,344"}},"creator":"http://store.rerum.io/v1/id/62572ba71d974d1311abd673","body":{"type":"TextualBody","value":"First Line lorem ipsem","format":"text/plain"},"_createdAt":"2025-09-12T13:38:37.809Z","_modifiedAt":"2025-09-12T13:46:38.181Z","__rerum":{"@context":"http://store.rerum.io/v1/context.json","alpha":true,"APIversion":"1.0.0","createdAt":"2025-09-12T13:46:38.781","isOverwritten":"","isReleased":"","history":{"next":[],"previous":"https://devstore.rerum.io/v1/id/68c4225d9889a4aaae4a2b19","prime":"https://devstore.rerum.io/v1/id/68c4225d9889a4aaae4a2b19"},"releases":{"next":[],"previous":"","replaces":""},"generatedBy":"https://devstore.rerum.io/v1/id/65e75dc3f53d3372e08459e0","score":5.162811756134033}},{"@context":"http://iiif.io/api/presentation/3/context.json","id":"https://devstore.rerum.io/v1/id/686fdeb58f2a40d886f69bd2","type":"Annotation","motivation":"transcribing","target":"https://t-pen.org/TPEN/canvas/13250378#xywh=50,574,146,12","body":{"type":"TextualBody","format":"text/plain","language":["none"],"value":"ipsum condempnat"},"_createdAt":"2025-07-10T15:39:33.577Z","__rerum":{"@context":"http://store.rerum.io/v1/context.json","alpha":true,"APIversion":"1.0.0","createdAt":"2025-07-10T15:39:33.581","isOverwritten":"","isReleased":"","history":{"next":[],"previous":"","prime":"root"},"releases":{"next":[],"previous":"","replaces":""},"generatedBy":"https://devstore.rerum.io/v1/id/65e75dc3f53d3372e08459e0","score":4.6244072914123535}},{"@context":"http://iiif.io/api/presentation/3/context.json","id":"https://devstore.rerum.io/v1/id/6870099eae50769e5ddafda2","type":"Annotation","motivation":"transcribing","target":"https://t-pen.org/TPEN/canvas/13250378#xywh=50,574,146,12","body":{"type":"TextualBody","format":"text/plain","language":["none"],"value":"ipsum condempnat"},"_createdAt":"2025-07-10T18:42:38.431Z","__rerum":{"@context":"http://store.rerum.io/v1/context.json","alpha":true,"APIversion":"1.0.0","createdAt":"2025-07-10T18:42:38.435","isOverwritten":"","isReleased":"","history":{"next":[],"previous":"","prime":"root"},"releases":{"next":[],"previous":"","replaces":""},"generatedBy":"https://devstore.rerum.io/v1/id/65e75dc3f53d3372e08459e0","score":4.6244072914123535}},{"@context":"http://iiif.io/api/presentation/3/context.json","id":"https://devstore.rerum.io/v1/id/687009c70c72359f21b0eb96","type":"Annotation","motivation":"transcribing","target":"https://t-pen.org/TPEN/canvas/13250378#xywh=50,574,146,12","body":{"type":"TextualBody","format":"text/plain","language":["none"],"value":"ipsum condempnat"},"_createdAt":"2025-07-10T18:43:19.426Z","__rerum":{"@context":"http://store.rerum.io/v1/context.json","alpha":true,"APIversion":"1.0.0","createdAt":"2025-07-10T18:43:19.430","isOverwritten":"","isReleased":"","history":{"next":[],"previous":"","prime":"root"},"releases":{"next":[],"previous":"","replaces":""},"generatedBy":"https://devstore.rerum.io/v1/id/65e75dc3f53d3372e08459e0","score":4.6244072914123535}},{"@context":"http://iiif.io/api/presentation/3/context.json","id":"https://devstore.rerum.io/v1/id/686fe2ca72e73d7f0802bcfc","type":"Annotation","motivation":"transcribing","target":"https://t-pen.org/TPEN/canvas/13250378#xywh=50,574,146,12","body":{"type":"TextualBody","format":"text/plain","language":["none"],"value":"ipsum condempnat"},"_createdAt":"2025-07-10T15:56:58.466Z","__rerum":{"@context":"http://store.rerum.io/v1/context.json","alpha":true,"APIversion":"1.0.0","createdAt":"2025-07-10T15:56:58.470","isOverwritten":"","isReleased":"","history":{"next":[],"previous":"","prime":"root"},"releases":{"next":[],"previous":"","replaces":""},"generatedBy":"https://devstore.rerum.io/v1/id/65e75dc3f53d3372e08459e0","score":4.6244072914123535}},{"@context":"http://iiif.io/api/presentation/3/context.json","id":"https://devstore.rerum.io/v1/id/683f5cebdaf1dd0e1bf014c4","type":"Annotation","motivation":"transcribing","target":"https://t-pen.org/TPEN/canvas/13250378#xywh=50,574,146,12","body":{"type":"TextualBody","format":"text/plain","language":["none"],"value":"ipsum condempnat"},"_createdAt":"2025-06-03T20:36:59.234Z","__rerum":{"@context":"http://store.rerum.io/v1/context.json","alpha":true,"APIversion":"1.0.0","createdAt":"2025-06-03T20:36:59.238","isOverwritten":"","isReleased":"","history":{"next":[],"previous":"","prime":"root"},"releases":{"next":[],"previous":"","replaces":""},"generatedBy":"https://devstore.rerum.io/v1/id/65e75dc3f53d3372e08459e0","score":4.6244072914123535}},{"@context":"http://iiif.io/api/presentation/3/context.json","id":"https://devstore.rerum.io/v1/id/68e0594d792dcc098e010535","type":"Annotation","motivation":"transcribing","target":"http://localhost:8080/TPEN/canvas/13249532#xywh=426,430,341,18","creator":"https://store.rerum.io/v1/id/685c5cc9dc7a212bac75487f","body":{"type":"TextualBody","format":"text/plain","value":"solum tua sine altercatione sed te ipsum concede ei </Target>"},"_createdAt":"2025-10-03T23:16:29.560Z","__rerum":{"@context":"http://store.rerum.io/v1/context.json","alpha":true,"APIversion":"1.0.0","createdAt":"2025-10-03T23:16:22.912","isOverwritten":"","isReleased":"","history":{"next":[],"previous":"","prime":"root"},"releases":{"next":[],"previous":"","replaces":""},"generatedBy":"https://devstore.rerum.io/v1/id/65e75dc3f53d3372e08459e0","score":2.8700175285339355}},{"@context":"http://iiif.io/api/presentation/3/context.json","id":"https://devstore.rerum.io/v1/id/68e0571a7eb0ea5ab04ec4f9","type":"Annotation","motivation":"transcribing","target":"http://localhost:8080/TPEN/canvas/13249532#xywh=426,430,341,18","creator":"https://store.rerum.io/v1/id/685c5cc9dc7a212bac75487f","body":{"type":"TextualBody","format":"text/plain","value":"solum tua sine altercatione sed te ipsum concede ei </Target>"},"_createdAt":"2025-10-03T23:07:06.511Z","__rerum":{"@context":"http://store.rerum.io/v1/context.json","alpha":true,"APIversion":"1.0.0","createdAt":"2025-10-03T23:06:59.860","isOverwritten":"","isReleased":"","history":{"next":[],"previous":"","prime":"root"},"releases":{"next":[],"previous":"","replaces":""},"generatedBy":"https://devstore.rerum.io/v1/id/65e75dc3f53d3372e08459e0","score":2.8700175285339355}},{"@context":"http://iiif.io/api/presentation/3/context.json","id":"https://devstore.rerum.io/v1/id/68e06209bd84f9e25fcf67d1","type":"Annotation","motivation":"transcribing","target":"http://localhost:8080/TPEN/canvas/13249532#xywh=426,430,341,18","creator":"https://store.rerum.io/v1/id/685c5cc9dc7a212bac75487f","body":{"type":"TextualBody","format":"text/plain","value":"solum tua sine altercatione sed te ipsum concede ei </Target>"},"_createdAt":"2025-10-03T23:53:53.163Z","__rerum":{"@context":"http://store.rerum.io/v1/context.json","alpha":true,"APIversion":"1.0.0","createdAt":"2025-10-03T23:53:53.202","isOverwritten":"","isReleased":"","history":{"next":[],"previous":"","prime":"root"},"releases":{"next":[],"previous":"","replaces":""},"generatedBy":"https://devstore.rerum.io/v1/id/65e75dc3f53d3372e08459e0","score":2.8700175285339355}}]% 

# **Custom Query Response**
[] I got an empty response meaning 0 matches however it still works.

# **Phrase Search Response**
[] I got an empty response meaning 0 matches however it still works.


Based on the responses and requests we can safely say the api is still working fine and should be ready for use in development.

 ______                 
/vvvvvv\
 [ - -]
 [  O ] =}}}   

 
 