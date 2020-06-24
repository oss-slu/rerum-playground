/* 
 * Utility functions.  These are functions used repeatedly by PLAYGROUND for various unit tasks. 
 * 
 */

import { default as PLAYGROUND } from './blueprints.js'

export default {
    /**
     * An error handler for various HTTP traffic scenarios
     */
    handleHTTPError: function (response) {
        let UTILS = this
        if (!response.ok) {
            let status = response.status
            switch (status) {
                case 400:
                    UTILS.warning("Bad Request")
                    break
                case 401:
                    UTILS.warning("Request was unauthorized")
                    break
                case 403:
                    UTILS.warning("Forbidden to make request")
                    break
                case 404:
                    UTILS.warning("Not found")
                    break
                case 500:
                    UTILS.warning("Internal server error")
                    break
                case 503:
                    UTILS.warning("Server down time")
                    break
                default:
                    UTILS.warning("unahndled HTTP ERROR")
            }
            throw Error("HTTP Error: " + response.statusText)
        }
        return response
    },
    /**
     * Broadcast a message about PLAYGROUND
     */
    broadcast: function (event = {}, type, element, obj = {}) {
        let e = new CustomEvent(type, { detail: Object.assign(obj, { target: event.target }), bubbles: true })
        element.dispatchEvent(e)
    },
    /**
     * Send a warning message to the console if dev has this feature turned on through the ROBUSTFEEDBACK config option.
     */
    warning: function (msg, logMe) {
        if (PLAYGROUND.ROBUSTFEEDBACK.valueOf() && msg) {
            console.warn(msg)
            if (logMe) {
                console.log(logMe)
            }
        }
    },
    /**
     * Load view of and script for a particular tool.  
     * @param {type} elem
     * @param {type} tool
     * @param {type} data
     * @return {Promise}
     */
    initializeView: function (elem, tool, data) {
        return new Promise((res) => {
            UTILS.broadcast(undefined, PLAYGROUND.EVENTS.VIEW_RENDERED, elem, data)
            /**
             * Really each render should be a promise and we should return a Promise.all() here of some kind.
             * That would only work if Plsyground render resulted in a Promise where we could return Promise.all(renderPromises).
             */
            setTimeout(res, 200) //A small hack to ensure all the HTML generated by processing the views enters the DOM before this says it has resolved.
        })
    },
    /**
     * Load all included playground tools icon buttons on the playground landing page.  
     * @param {type} catalog_config
     * @return {Promise}
     */
    initializePlaygroundCatalog(catalog_config) {
        return new Promise((res) => {
            const setContainer = document.getElementById(catalog_config.id)
            Array.from(catalog_config).forEach(catalog_item => {
                setContainer.innerHTML += `<div class="tool"> <div class="lbl">Catalog Item ${catalog_item.label}</div><img class="pictoral" src="${catalog_item.icon}"/> </div>`
            })
            UTILS.broadcast(undefined, PLAYGROUND.EVENTS.LOADED, setContainer, catalog_config)
            /**
             * Really each render should be a promise and we should return a Promise.all() here of some kind.
             * That would only work if PlaygroundRender resulted in a Promise where we could return Promise.all(renderPromises).
             */
            setTimeout(res, 200) //A small hack to ensure all the HTML generated by processing the views enters the DOM before this says it has resolved.
        })
    }
}
    
