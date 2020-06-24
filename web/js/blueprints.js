/* 
 * The global config for the app.
 * There should be no functions or HTML template literals here.
 * 
 */


export default {
    URLS: {
        CREATE: "create",
        UPDATE: "update",
        PATCH: "patch",
        OVERWRITE: "overwrite",
        QUERY: "query",
        SINCE: "http://devstore.rerum.io/v1/since",
        HISTORY: "http://devstore.rerum.io/v1/history"
    },
    EVENTS: {
        CREATED: "created",
        UPDATED: "updated",
        LOADED: "completely_loaded",
        NEW_VIEW: "view_called",
        VIEW_RENDERED : "view_loaded",
        CLICKED: "clicked"
    },
    APPAGENT : "", //TODO register a new app with RERUM.
    ROBUSTFEEDBACK: true, //Show warnings along with errors in the web console.  Set to false to only see errors. 
    VERSION: "0.0.0"
}