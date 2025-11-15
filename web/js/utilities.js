/* 
 * Utility functions.  These are functions used repeatedly by PLAYGROUND for various unit tasks. 
 * 
 */

import { create, update, overwrite, deleteObject, query, resolveJSON, resolveString } from './services/objectService.js';
import { logger, broadcast, thumbnailGenerator } from './utils/generalUtils.js'


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
        broadcast,

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
        thumbnailGenerator
    }