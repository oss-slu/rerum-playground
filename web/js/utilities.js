/* 
 * Utility functions.  These are functions used repeatedly by PLAYGROUND for various unit tasks. 
 * 
 */

import { default as PLAYGROUND } from 'https://centerfordigitalhumanities.github.io/rerum-playground/web/js/config.js'

const logger = {
    fatal(msg) {
        if (PLAYGROUND.LOGLEVEL > 0) console.error(`%c☠ ${msg}`, `color:crimson;font-weight:bold;font-size:2rem;`)
    },
    error(msg) {
        if (PLAYGROUND.LOGLEVEL > 1) console.error(`💣 ${msg}`)
    },
    warn(msg) {
        if (PLAYGROUND.LOGLEVEL > 2) console.warn(`⚠ ${msg}`)
    },
    info(msg) {
        if (PLAYGROUND.LOGLEVEL > 3) console.info(`ℹ %c${msg}`, `color:#061615;background:#3acabb;`)
    },
    debug(msg) {
        if (PLAYGROUND.LOGLEVEL > 4) console.debug(`🐞 ${msg}`)
    },
    trace(msg) {
        if (PLAYGROUND.LOGLEVEL > 5) console.trace(msg)
    }
}

/**
 * Logs any errors
 * @param {HTTPResponse} response from `fetch()`
 * @returns Promise(JSON) || Error
 */
const handleHTTPError = (response, getAs = "json") => {
    if (response.ok) return response[getAs]()
    const errorMessages = {
        400: "Bad Request",
        401: "Request was unauthorized",
        403: "Forbidden to make request",
        404: "Not found",
        500: "Internal server error",
        503: "Server down time",
    }
    logger.warn(errorMessages[response.status] ?? `Unhandled HTTP Error ${response.status}`)
    throw Error("HTTP Error: " + response.statusText)
}

const API = {
    create: async (obj) => {
        return fetch(PLAYGROUND.URLS.CREATE, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(obj)
        })
            .then(handleHTTPError)
            .catch(err => { return err })
    },
    update: async (obj) => {
        return fetch(PLAYGROUND.URLS.UPDATE, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(obj)
        })
            .then(handleHTTPError)
            .catch(err => { return err })
    },
    overwrite: async (obj) => {
        return fetch(PLAYGROUND.URLS.OVERWRITE, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(obj)
        })
            .then(handleHTTPError)
            .catch(err => { return err })
    },
    delete: async (uri) => {
        return fetch(PLAYGROUND.URLS.DELETE, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'text/plain'
            },
            body: uri
        })
            .then(handleHTTPError)
            .catch(err => { return err })
    },
    query: async (obj) => {
        return fetch(PLAYGROUND.URLS.QUERY, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(obj)
        })
            .then(handleHTTPError)
            .catch(err => { return err })
    },
    resolveJSON: async (uri) => {
        return fetch(uri)
            .then(handleHTTPError)
            .catch(err => { return err })
    },
    resolveString: async (uri) => {
        return fetch(uri)
            .then(response => handleHTTPError(response, "text"))
            .catch(err => { return err })
    }
}

export default {
        handleHTTPError,
        logger,
        API

        /**
         * Broadcast a message about PLAYGROUND
         */
        broadcast(event = {}, type = "message", element = document, obj = {}) {

            return element.dispatchEvent(new CustomEvent(type, { detail: Object.assign(obj, { target: event.target }), bubbles: true }))
        }

        /**
         * Behavior for when the user picks a tool. They may provide the data to take into that tool.
         * When the user picks a tool/interface/technology, we need to load up the view for the user to interact with.
         * We may want to handle internal views and external views separately.
         * What if the user had done some stuff and would like to take that data to the view?  It may not just be a URI.
         */
        useTool: function (tool, data) {
            return new Promise((res) => {
                // Make this the active tool for the user to interact with.
                document.location.href = tool.view
            })
        },

        /**
        *  Behavior for when the user picks an interface. They may provide the data to take into that interface.
        */
        useInterface: function (inter, data) {
            return new Promise((res) => {
                // Make this the active interface for the user to interact with.
            })
        },

        /**
        *  Behavior for when the user picks a technology. They may provide the data to take into that technology.
        */
        useTechnology: function (tech, data) {
            return new Promise((res) => {
                // Make this the active technology for the user to interact with.
            })
        },

        /**
        * Generate a thumbnail that represents an entry from the set of tools, interfaces, or technologies.
        */
        thumbnailGenerator: function (entry) {
            let thumbImg = `<img class="thumb" src="${entry.icon}" />`
            let label = `<div class="thumbLabel">${entry.label}</div>`
            let description = `<div class="thumbDescription">${entry.description}</div>`
            let linkedThumb = `<a class="catalogEntry" href="${entry.view}"> ${label} ${thumbImg} ${description} </a>`
            return linkedThumb
        }
    }



