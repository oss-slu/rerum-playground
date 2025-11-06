/*
 * General utility functions used across the playground.
 * This file centralizes shared helpers such as logging, event broadcasting,
 * and small UI helpers (thumbnail generation).
 */

import { default as PLAYGROUND } from 'https://centerfordigitalhumanities.github.io/rerum-playground/web/js/config.js'

/**
 * Simple leveled logger. Levels are controlled by `PLAYGROUND.LOGLEVEL`.
 * Provided as a small wrapper to avoid repeating the same methods across files.
 *
 * Methods:
 *  - fatal(msg)
 *  - error(msg)
 *  - warn(msg)
 *  - info(msg)
 *  - debug(msg)
 *  - trace(msg)
 */
export const logger = {
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
 * Broadcast a CustomEvent from a DOM element (or document by default).
 * Falls back to `document` if an invalid element is provided.
 *
 * @param {Event|Object} event - Original event or an object with a `target` property
 * @param {String} [type="message"] - Event type/name
 * @param {Node} [element=document] - DOM element to dispatch the event from
 * @param {Object} [obj={}] - Extra detail data to include in the event
 * @returns {Boolean} whether dispatchEvent returned true
 */
export function broadcast(event = {}, type = "message", element = document, obj = {}) {
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
}

/**
 * Generate a small HTML thumbnail string for a catalog entry.
 * Kept as a helper so multiple modules can reuse the same markup.
 *
 * @param {Object} entry - Tool/interface/technology entry with {label, icon, view, description}
 * @returns {String} HTML string representing the thumbnail
 */
export function thumbnailGenerator(entry) {
    return `<a class="catalogEntry" href="${entry.view}">
            <figure class="thumb">
                <label>${entry.label}</label>
                <img src="${entry.icon}" />
                <figcaption>${entry.description}</figcaption>
            </figure>
            </a>`;
}

export default {
    logger,
    broadcast,
    thumbnailGenerator
}
