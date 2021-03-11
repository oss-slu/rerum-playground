/* 
 * Utility functions.  These are functions used repeatedly by PLAYGROUND for various unit tasks. 
 * 
 */

import { default as PLAYGROUND } from 'https://centerfordigitalhumanities.github.io/rerum-playground/web/js/config.js'

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
     * Available CRUD operations for logic in tool views.
     */
    CRUD:{
        CREATE : async function(obj){
            return fetch(PLAYGROUND.URLS.CREATE,  {
                method: 'POST',
                headers: {
                   'Content-Type': 'application/json'
                },
                body: JSON.stringify(obj)
            })
            .then(resp => resp.json())
            .catch(err => {return err})
        },
        UPDATE : async function(obj){
            return fetch(PLAYGROUND.URLS.UPDATE,  {
                method: 'POST',
                headers: {
                   'Content-Type': 'application/json'
                },
                body: JSON.stringify(obj)
            })
            .then(resp => resp.json())
            .catch(err => {return err})
        },
        OVERWRITE : async function(obj){
            return fetch(PLAYGROUND.URLS.OVERWRITE,  {
                method: 'POST',
                headers: {
                   'Content-Type': 'application/json'
                },
                body: JSON.stringify(obj)
            })
            .then(resp => resp.json())
            .catch(err => {return err})
        },
        DELETE : async function(uri){
            return fetch(PLAYGROUND.URLS.DELETE,  {
                method: 'DELETE',
                headers: {
                   'Content-Type': 'text/plain'
                },
                body: uri
            })
            .then(resp => {
                if(!resp.ok){
                    return new Error("Object not deleted")
                }
            })
            .catch(err => {return err})
        }
    },

    QUERY : async function(obj){
        return fetch(PLAYGROUND.URLS.QUERY,  {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json'
            },
            body: JSON.stringify(obj)
        })
        .then(resp => resp.json())
        .catch(err => {return err})
    },

    RESOLVEJSON: async function(uri){
        return fetch(uri)
            .then(resp => {
                if(resp.ok){
                    return resp.json()
                }
                else{
                    return new Error("Could not resolve "+uri+" as JSON")
                }
            })
            .catch(err => {return err})
    },

    RESOLVESTRING: async function(uri){
        return fetch(uri)
            .then(resp => {
                if(resp.ok){
                    return resp.text()
                }
                else{
                    return new Error("Could not resolve "+uri+" as String")
                }
            })
            .catch(err => {return err})
    },

    RESOLVE: async function(uri){
        return fetch(uri)
            .then(resp => {
                if(resp.ok){
                    return resp
                }
                else{
                    return new Error("Could not resolve "+uri)
                }
            })
            .catch(err => {return err})
    }
}

/**
 * Behavior for when the user picks a tool. They may provide the data to take into that tool.
 * When the user picks a tool/interface/technology, we need to load up the view for the user to interact with.
 * We may want to handle internal views and external views separately.
 * What if the user had done some stuff and would like to take that data to the view?  It may not just be a URI.
 */
export function useTool(tool, data) {
    return new Promise((res) => {
        // Make this the active tool for the user to interact with.
        document.location.href = tool.view
    })
}

/**
*  Behavior for when the user picks an interface. They may provide the data to take into that interface.
*/
export function useInterface(interface, data) {
    return new Promise((res) => {
        // Make this the active interface for the user to interact with.
    })
}

/**
*  Behavior for when the user picks a technology. They may provide the data to take into that technology.
*/
export function useTechnology(tech, data) {
    return new Promise((res) => {
        // Make this the active technology for the user to interact with.
    })
}
  
