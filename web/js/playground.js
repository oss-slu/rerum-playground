/* 
 * App specific functions.  This is for unique functionality and application initialization.  
 */


// Identify playground configuration.  Will be available as github CDN.
import { default as PLAYGROUND } from './config.js'
    
// Playground scripting utilities.  Will be available as github CDN.
import { default as UTILS, initializeTools } from './utilities.js'

try {
    initializeTools(TOOLS)
} catch (err) {
    // silently fail if render or record is not loaded
}
    