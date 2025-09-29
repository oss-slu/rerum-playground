function prettifyJSON(input){
    try{
        const jsonString = JSON.stringify(input);
        return jsonString;
    }
    catch (error) {
        return false;
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

