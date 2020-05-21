const formatValidation = async function(rsrc) {
    const rsrcErrors = rsrc.errors;
    const validations = []

    for (const error of rsrcErrors) {
        let errorSections = error.message.split("\n");
        errorSections = errorSections.map(item => item.replace(/\s\s+/g, " ").trim());
        errorSections = errorSections.map(item => item.replace(/\"/g, ""));

        let msg = errorSections.join(" ");
        const err = {
            message: msg,
            //potentially useful if there is a need to make the validation errors returned by frictionless library
            //to be more humanly understandable
            validationErrorBySections: {
                desc: errorSections[0],
                field: errorSections[1],
                validationRule: errorSections[2]
            }
        };
        validations.push(err);
    }
    return validations;
}

module.exports = {
    formatValidation
}

