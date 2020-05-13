const {Table, Schema, validate} = require('tableschema');
let db = require('../db/db');

module.exports = (router) => {
    router.post('', async (req, res, next) => {
    
        try {
            // console.log("req.bodys: ", req.body);
    
            let errs = [];
            let schemaDescriptor = {...req.body};
    
            const schema = await Schema.load(schemaDescriptor);
            if (!schema.valid) {
                for (const error of schema.errors) {
                    // console.log("error: ", error);
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
                    // console.log("err: ", err);
                    errs.push(err);
                }
                res.status(400);
                res.json({
                    status: 400,
                    error: {
                        message: "Unable to save schema.  Failed validation.",
                        validationErrors: errs
                    }
                });
                return;
            }
    
            const dataPackageSchema = new db.DataPackageSchema;
            // console.log("schemaDescriptor: ", schemaDescriptor);
    
            dataPackageSchema.profile = "tabular-data-package";
            dataPackageSchema.resources = [
                {
                    profile: "tabular-data-resource",
                    data: [],
                    tableSchema: schemaDescriptor
                }
            ];
    
            await dataPackageSchema.save();
            res.status(201);
            res.json({
                status: 201,
                message: 'Schema saved successfully.'
            });
        } catch(err) {
            console.log("err: ", err);
            // log.debug(err);
            res.status(500);
            res.json({
                status: 500,
                error: err.message
            });
        }
    
    });
    
    
    return router;
}
