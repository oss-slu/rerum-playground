
function prettifyJSON(input) {
  try {
    const obj = typeof input === "string" ? JSON.parse(input) : input;
    return JSON.stringify(obj, null, 2);
  } catch (error) {
    return `Invalid JSON: ${error.message}`;
  }
}


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
