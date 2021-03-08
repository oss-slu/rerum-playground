/* 
 * App specific functions.  This is for unique functionality and application initialization.  
 */


// Identify playground configuration.  Will be available as github CDN.
import { default as PLAYGROUND } from 'https://centerfordigitalhumanities.github.io/rerum-playground/web/js/config.js'
    
// Playground scripting utilities.  Will be available as github CDN.
import { default as UTILS, initializeTools } from 'https://centerfordigitalhumanities.github.io/rerum-playground/web/js/utilities.js'

try {
    initializeTools(TOOLS)
} catch (err) {
    // silently fail if render or record is not loaded
}
    