/* 
 * Utility functions.  These are functions used repeatedly by PLAYGROUND for various unit tasks. 
 * 
 */

import { default as PLAYGROUND } from 'https://centerfordigitalhumanities.github.io/rerum-playground/web/js/config.js'
import { create, update, overwrite, deleteObject, query, resolveJSON, resolveString } from './services/objectService.js';

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

// RERUM API operations moved to services/objectService.js
const API = {
    create,
    update,
    overwrite,
    delete: deleteObject,
    query,
    resolveJSON,
    resolveString
}

export default {
    logger,
    API,
        /**
         * Broadcast a message about PLAYGROUND
         */
        broadcast(event = {}, type = "message", element = document, obj = {}) {
            // If caller passed a null/undefined element (e.g. container not found),
            // fall back to document so dispatchEvent is always called on a valid node.
            // This mirrors previous tolerant behavior and prevents uncaught TypeErrors.
            if (!element || typeof element.dispatchEvent !== 'function') {
                logger.warn('broadcast called with invalid element; falling back to document.');
                element = document;
            }

            try {
                return element.dispatchEvent(new CustomEvent(type, { detail: Object.assign(obj, { target: (event && event.target) || null }), bubbles: true }))
            } catch (err) {
                logger.error('Error broadcasting event: ' + err.message)
                return false
            }
        },

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
        *
        * @param {Object} entry - each tool/interface/technology object with properties like label, icon, view, and description
        * @returns {String} HTML structure for the thumbnail
        */
        thumbnailGenerator: (entry) => {
            return `<a class="catalogEntry" href="${entry.view}">
            <figure class="thumb">
                <label>${entry.label}</label>
                <img src="${entry.icon}" />
                <figcaption>${entry.description}</figcaption>
            </figure>
            </a>`;
        }
    }



