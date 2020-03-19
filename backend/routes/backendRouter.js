let passport = require('passport');
let db = require('./db/db');
let express = require('express');
let router = express.Router();
let auth = require('../modules/auth');
const {Package, Profile, Resource, validate:dataPackageValidate} = require('datapackage');
const {Table, Schema, validate} = require('tableschema');

router.use('/login', function(req, res, next){
    req.session.r = req.query.r;
    return res.redirect('/api/log');
});

router.use('/log', passport.authenticate('oidc'), function(req, res, next){
    next();
});

router.use('/callback', passport.authenticate('oidc'), function(req, res, next){
    let config = require('config');
    if (req.session.r){
        return res.redirect(config.get('frontend')+'/'+req.session.r);
    }
    return res.redirect(config.get('frontend')+'/');
    
});

router.use('/logout', function(req, res, next){
    req.logout();
    let config = require('config');
    res.redirect(config.get('frontend'));
});

router.use('/token', auth.removeExpired, function(req, res){
    if (req.user && req.user.jwt && req.user.refreshToken) {
        res.json(req.user);
    }else{
        res.json({error: "Not logged in"});
    }
});

router.use('/v1/publickey', auth.removeExpired, function(req, res){
    var config = require('config');
    var atob = require('atob');
    if (!config.has('base64EncodedPGPPublicKey')){
        return res.json({error: "Not configured"});
    }
    let key = atob(config.get('base64EncodedPGPPublicKey'));
    return res.json({key: key});
});

router.use('/v1/uploadurl', auth.removeExpired, function(req, res){
    var config = require('config');
    if (!config.has('uploadUrl')){
        return res.json({error: "Not configured"});
    }
    let url = config.get('uploadUrl');
    return res.json({url: url});
});


router.post('/v1/datapackageschemas', async (req, res, next) => {
    let errs = [];
    let resourceErrsMap = new Map();
    let err = {};
    console.log("req.body: ", req.body);

    let descriptor = {...req.body};
    descriptor.profile = "tabular-data-package";

    const dataPackage = await Package.load(descriptor, {strict: false});
    console.log('valid: ' + dataPackage.valid);


    if(!dataPackage.valid) {

        if(descriptor.resources && descriptor.resources.length > 0) {
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
                    if(val) {
                        val.push(err);
                        resourceErrsMap.set(resource.name, val);
                    }
                    else {
                        console.log("else...")
                        let newVal = [];
                        newVal.push(err);
                        resourceErrsMap.set(resource.name, newVal);
                    }
                }
            }
            console.log("resourceErrsMap: ", resourceErrsMap);
        }
        else {
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

    dataPackageSchema.save(function (err) {
        if (err) {
            console.log("err: ", err);
            // log.debug(err);
            res.status(500);
            res.json({
                status: 500,
                error: err.message
            });
        } else {
            res.status(201);
            res.json({
                status: 201,
                message: 'Successfully saved tabular data package'
            });
        }
    });

    // res.status(200);
    // res.json({message: "Successfully validated tabular data package"});

});

router.post('/v1/tableschemas', async (req, res, next) => {
    console.log("req.bodys: ", req.body);

    let errs = [];
    let schemaDescriptor = {...req.body};

    const schema = await Schema.load(schemaDescriptor);
    if(!schema.valid) {
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

    dataPackageSchema.save(function (err) {
        if (err) {
            console.log("err: ", err);
            // log.debug(err);
            res.status(500);
            res.json({
                status: 500,
                error: err.message
            });
        } else {
            res.status(201);
            res.json({
                status: 201,
                message: 'Schema saved successfully.'
            });
        }
    });
});

module.exports = router;
