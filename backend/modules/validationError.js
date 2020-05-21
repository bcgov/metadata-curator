function mapToObj(inputMap) {
    let obj = {};

    inputMap.forEach(function(value, key){
        obj[key] = value
    });

    return obj;
}

const ValidationError = function (message, errors) {
    return {
        statusCode: 400,
        message: message,
        errors: errors instanceof Map ? mapToObj(errors) : errors
    }
}

module.exports = ValidationError;