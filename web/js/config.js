/* 
 * The global config for the app.
 * There should be no functions or HTML template literals here.
 * 
 */
import ToolsCatalog from './toolsCatalog.js';

export default {
    URLS: {
        //TODO Bring in internal TT.  Register as a new application for RERUM dev.  
        CREATE: "https://tinydev.rerum.io/app/create",
        UPDATE: "https://tinydev.rerum.io/app/update",
        PATCH: "https://tinydev.rerum.io/app/patch",
        OVERWRITE: "https://tinydev.rerum.io/app/overwrite",
        QUERY: "https://tinydev.rerum.io/app/query",
        SINCE: "https://devstore.rerum.io/v1/since",
        HISTORY: "https://devstore.rerum.io/v1/history",
        SEARCH_TEXT: "https://devstore.rerum.io/v1/api/search",
        SEARCH_PHRASE: "https://devstore.rerum.io/v1/api/search/phrase"
    },
    /** Max page size for RERUM search (API recommends ≤ 100). */
    SEARCH_PAGE_LIMIT: 100,
    /** Prevent burst submissions from repeatedly hammering search endpoints. */
    SEARCH_COOLDOWN_MS: 500,
    /** Cache repeated identical queries briefly to reduce expensive duplicate calls. */
    SEARCH_CACHE_TTL_MS: 60_000,
    /** Safety cap for page fetches per search request. */
    SEARCH_MAX_PAGES: 50,
    /** Guardrail for very long search inputs. */
    SEARCH_MAX_QUERY_LENGTH: 512,
    /** Optional verbose search logs (best used only in local development). */
    SEARCH_DEBUG: false,
    EVENTS: {
        CREATED: "created",
        UPDATED: "updated",
        LOADED: "completely_loaded",
        NEW_VIEW: "view_called",
        VIEW_RENDERED : "view_loaded",
        CLICKED: "clicked"
    },
    APPAGENT : "", //TODO register a new app with RERUM.
    /**
     * 0: OFF
     * 6: TRACE
     * 5: DEBUG
     * 4: INFO
     * 3: WARNING
     * 2: ERROR
     * 1: FATAL
     */
    LOGLEVEL: 3,
    VERSION: "0.0.1",
    //Of NOTE, it is possible for these to be in their own repository.  We could gather these from those repos.
    //Then just adding one of these things to the repos will make it show up in the playground.  Just a thought for now. 
    TOOLS:{
        id : "tool_set",
        catalog : ToolsCatalog // importing the tool catalog from toolsCatalog.js
    },

    // What are these here for? Do the users know about these?
    INTERFACES:{
        id : "interface_set",
        catalog : [

        ]
    },
    TECHNOLOGIES:{
        id : "technology_set",
        catalog : [

        ]
    }
}
