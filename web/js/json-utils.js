
/**
 * prettifyJSON
 * Convert a JS object or JSON string into a pretty-printed JSON string.
 * Keeps JSON-specific logic in this module.
 *
 * @param {Object|string} input - JS object or JSON string to prettify
 * @returns {string} Pretty-printed JSON or an error message starting with "Invalid JSON:"
 */
function prettifyJSON(input) {
  try {
    const obj = typeof input === "string" ? JSON.parse(input) : input;
    return JSON.stringify(obj, null, 2);
  } catch (error) {
    return `Invalid JSON: ${error.message}`;
  }
}


/**
 * validateJSON
 * Check whether a string is valid JSON.
 *
 * @param {string} input - JSON string to validate
 * @returns {boolean} true if valid JSON, false otherwise
 */
function validateJSON(input){
    try {
        JSON.parse(input);
        return true;
    }
    catch (error) {
        return false;
    }
}

module.exports = {
    prettifyJSON: prettifyJSON,
    validateJSON: validateJSON
}
