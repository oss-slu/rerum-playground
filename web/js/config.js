/* 
 * The global config for the app.
 * There should be no functions or HTML template literals here.
 * 
 */
export default {
    URLS: {
        //TODO Bring in internal TT.  Register as a new application for RERUM dev.  
        CREATE: "http://tinydev.rerum.io/app/create",
        UPDATE: "http://tinydev.rerum.io/app/update",
        PATCH: "http://tinydev.rerum.io/app/patch",
        OVERWRITE: "http://tinydev.rerum.io/app/overwrite",
        QUERY: "http://tinydev.rerum.io/app/query",
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
        catalog : [
            {"label":"Example A", "icon":"https://iconsplace.com/wp-content/uploads/_icons/ffc0cb/256/png/letter-a-icon-12-256.png", "view":"https://thehabes.github.io/playground_create/create.html", "description" : "Lorem Ipsem" },
            {"label":"Example B", "icon":"https://images.clipartlogo.com/files/istock/previews/9099/90999371-b-letter-icon-in-circle-with-speed-line.jpg", "view":"https://thehabes.github.io/playground_create/view_B.html", "description" : "Epsom Saltum" },
            {"label":"Example C", "icon":"https://cdn2.iconfinder.com/data/icons/letters-and-numbers-1/32/lowercase_letter_c_red-512.png", "view":"https://thehabes.github.io/playground_create/view_C.html", "description" : "If they could SEE me now..." },
            {"label":"RERUM Geolocator", "icon":"http://geo.rerum.io/geolocate/images/earth.gif", "view":"http://geo.rerum.io/geolocate/annotate.html", "description" : "A water bear that knows where it is." }
        ]
    },
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
