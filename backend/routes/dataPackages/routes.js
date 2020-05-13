let db = require('../db/db');
const {Table, Schema, validate} = require('tableschema');
const {Package, Profile, Resource, validate:dataPackageValidate} = require('datapackage');

module.exports = (router) => {

    router.post('', async (req, res, next) => {

        try {
            let errs = [];
            let resourceErrsMap = new Map();
            let err = {};
            // console.log("req.body: ", req.body);
    
            let descriptor = {...req.body};
            descriptor.profile = "tabular-data-package";
    
            const dataPackage = await Package.load(descriptor, {strict: false});
            console.log('valid: ' + dataPackage.valid);
    
    
            if (!dataPackage.valid) {
    
                if (descriptor.resources && descriptor.resources.length > 0) {
                    console.log("resources property exists");
    
                    for (const resource of descriptor.resources) {
                        const rsrc = Resource.load(resource);
                        const rsrcValid = (await rsrc).valid;
                        const rsrcErrors = (await rsrc).errors;
    
                        console.log("rsrc valid: ", rsrcValid);
                        for (const error of rsrcErrors) {
                            // console.log("error: ", error);
                            let errorSections = error.message.split("\n");
                            errorSections = errorSections.map(item => item.replace(/\s\s+/g, " ").trim());
                            errorSections = errorSections.map(item => item.replace(/\"/g, ""));
    
                            let msg = errorSections.join(" ");
                            const err = {
                                resourceName: resource.name,
                                message: msg,
                                //potentially useful if there is a need to make the validation errors returned by frictionless library
                                //to be more humanly understandable
                                validationErrorBySections: {
                                    desc: errorSections[0],
                                    field: errorSections[1],
                                    validationRule: errorSections[2]
                                }
                            };
    
                            console.log("rsrc err: ", err);
                            let val = resourceErrsMap.get(resource.name);
                            if (val) {
                                val.push(err);
                                resourceErrsMap.set(resource.name, val);
                            } else {
                                // console.log("else...")
                                let newVal = [];
                                newVal.push(err);
                                resourceErrsMap.set(resource.name, newVal);
                            }
                        }
                    }
                    console.log("resourceErrsMap: ", resourceErrsMap);
                } else {
                    console.log("resources property does not exist");
                    for (const error of dataPackage.errors) {
                        // console.log("error: ", error);
                        let errorSections = error.message.split("\n");
                        errorSections = errorSections.map(item => item.replace(/\s\s+/g, " ").trim());
                        errorSections = errorSections.map(item => item.replace(/\"/g, ""));
    
                        let msg = errorSections.join(" ");
                        err = {
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
    
                }
    
                res.status(400);
                res.json({
                    status: 400,
                    error: {
                        message: "Unable to save tabular data package.  Failed validation.",
                        validationErrors: errs,
                        validationErrorsByResource: [...resourceErrsMap]
                    }
                });
                return;
    
            }
    
            let dataPackageSchema = new db.DataPackageSchema;
            let resources = [...descriptor.resources];
    
            console.log("resources: ", resources);
            resources = resources.map(item => {
                let newItem = {...item, tableSchema: {...item.schema}};
                console.log("newItem: ", newItem);
                return newItem;
            });
    
            dataPackageSchema.profile = descriptor.profile;
            dataPackageSchema.resources = resources;
    
            await dataPackageSchema.save();
            res.status(201);
            res.json({
                status: 201,
                message: 'Successfully saved tabular data package'
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
