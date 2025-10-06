
function prettifyJSON(input){
    try{
        const jsonString = JSON.stringify(input, null, 2);
        return jsonString;
    }
    catch (error) {
        return error;
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
