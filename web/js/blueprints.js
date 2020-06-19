/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
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

    /**
     * The registry of available equiptment.  These are the preview or thumbnail representation of the tools.
     */
    REGISTRY: {
        jsonViewer: () => `<pre class="registry json">Pretty JSON</pre>`,
        APIreader : () => `<div class="registry">API Reader</div>`,
        ddToMirador : () => `<div class="registry">View in Mirador</div>`,
        ddToUV : () => `<div class="registry">View in UV</div>`,
        validators : () => `<div class="registry">Validate Objects</div>`,
        LDN : () => `<div class="registry">Linked Data Notifications</div>`,
        geoAnno : () => `<div class="registry"> Geospatial Annotation </div>`,
        aybee : () => `<div class="registry">Alphabetized T-PEN Transcriptions</div>`,
        history : () => `<div class="registry">Track Historty</div>`
    },
    
    /**
     * Templates to build registered equiptment views. 
     */
    EQUIPTMENT:{
        jsonViewer: (obj) => `<pre class="equiptment json">${obj}</pre>`,
        APIreader : () => `<iframe class="equiptment container apiViewer" src="https://github.com/CenterForDigitalHumanities/rerum_server/blob/master/API.md"></iframe>`,
        ddToMirador : () => `<div class="equiptment">A D&D to bring in and object and go view it in Mirador.</div>`,
        ddToUV : () => `<div class="equiptment">A D&D to bring in and object and go view it in UV.</div>`,
        validators : () => `<div class="equiptment">A D&D to bring in and object and go view it in UV.</div>`,
        LDN : () => `<div class="equiptment">LDN Inbox</div>`,
        geoAnno : () => `<div class="equiptment"> Geospatial Annotation </div>`,
        aybee : () => `<div class="equiptment">Alphabetized T-PEN Transcriptions</div>`,
        history : () => `<div class="equiptment">Some history rendering of the object</div>`
    },
    ROBUSTFEEDBACK: true, //Show warnings along with errors in the web console.  Set to false to only see errors. 
    VERSION: "0.0.0"
}