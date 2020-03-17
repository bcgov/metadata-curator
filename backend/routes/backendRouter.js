let passport = require('passport');
let db = require('./db/db');
let express = require('express');
let router = express.Router();
let auth = require('../modules/auth');
const {Package} = require('datapackage');
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


router.put('/v1/validateDataPackage', async (req, res, next) => {
    const descriptor = {
        resources: [
            {
                name: 'example',
                profile: 'tabular-data-resource',
                data: [
                //     ['height', 'age', 'name'],
                //     ['180', '18', 'Tony'],
                //     ['192', '32', 'Jacob'],
                ],
                schema:  {
                    fields: [
                        {name: 'height', type: 'integder'},
                        {name: 'age', type: 'integer'},
                        {name: 'name', type: 'string'},
                    ],
                }
            }
        ]
    };
    console.log("req.body: ", req.body);

    // const dataPackage = await Package.load(req.body);
    const dataPackage = await Package.load(descriptor, strict = true);
    // const resource = dataPackage.getResource('example');
    // const result = await resource.read();
    // console.log("result: ", result);
    console.log("dataPackage.valid: " + dataPackage.valid);
    console.log("dataPackage.errors: ", JSON.stringify(dataPackage.errors));
    for (const error of dataPackage.errors) {
        // inspect Error objects
         console.log("error: ", error.message);
    }

    // const {valid, errors} = await validate(descriptor);
    // console.log("valid: ", valid);
    // console.log("errors: ", JSON.stringify(errors));
    // for (const error of errors) {
    //     // inspect Error objects
    //     console.log("error: ", JSON.stringify(error));
    // }

    // profile = await Profile.load('tabular-data-resource')
    // profile.name // data-package
    // profile.jsonschema // JSON Schema contents

    // result = { test: "ajskfj"};
    // res.json(result);
    res.status(400);
    res.json({error: "No need to withdraw a request that hasn't been submitted"});

});

router.post('/v1/schemas', async (req, res, next) => {
    console.log("req.body: ", req.body);

    let errs = [];
    const schema = await Schema.load(req.body);
    if(!schema.valid) {
        for (const error of schema.errors) {
            // console.log("error: ", error);
            let errorSections = error.message.split("\n");
            errorSections = errorSections.map(item => item.replace(/\s\s+/g, " ").trim());
            errorSections = errorSections.map(item => item.replace(/\"/g, ""));

            let msg = errorSections.join(" ");
            const err = {
                error: msg,
                validationErrorDetails: {
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

    const mdcSchema = new db.MdcSchema;
    mdcSchema.fields = req.body.fields;

    mdcSchema.save(function (err) {
        if (err) {
            console.log("err: ", err);
            // log.debug(err);
            res.status(500);
            res.json({
                status: 500,
                error: err.message
            });
        } else {
            console.log("3");
            res.status(201);
            res.json({
                status: 201,
                message: 'Schema saved successfully.'
            });
        }
    });

});

module.exports = router;
