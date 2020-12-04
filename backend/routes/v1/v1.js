var fs = require('fs');
var express = require('express');

var path = require('path');
var config = require('config');

let forumRouter = express.Router();
let forumBridge = require('./forumApi/bridge');
forumRouter = forumBridge(forumRouter);

let formioRouter = express.Router();
let formioBridge = require('./formio/bridge');
formioRouter = formioBridge(formioRouter);

let db = require('../../db/db');

let auth = require('../../modules/auth');

let dataUploadRoutes = require('./dataUploads/routes');
let dataPackagesRoutes = require('./dataPackages/routes');
let tableSchemasRoutes = require('./tableSchemas/routes');
let repositoriesRoutes = require('./repositories/routes');
let repoBranchesRoutes = require('./repoBranches/routes');
let dataProviderRoutes = require('./dataProviders/routes');
const { Router } = require('express');

module.exports = (router) => {

    //api spec
    router.use('/spec', express.static(path.join(__dirname, 'spec')));

    //api docs
    router.use('/api-docs', function(req, res){
        var docs = require('./docs/docs');
        res.send(docs.getDocHTML("v1"));
    });

    // const swaggerUi = require('swagger-ui-express');
    // var Converter = require('api-spec-converter');
    // let openapiFile = path.join(__dirname, 'spec') + "/api-docs.yaml";

    // var options = {
    //     explorer: true
    //     };

    // Converter.convert({
    //     from: 'openapi_3',
    //     to: 'swagger_2',
    //     source: openapiFile,
    // }, function(err, converted) {
    //     let swaggerDocument = JSON.parse(converted.stringify())

    //     swaggerDocument.securityDefinitions.api_auth.tokenUrl = config.get("oidc.tokenURL")
    //     swaggerDocument.securityDefinitions.api_auth.authorizationUrl = config.get("oidc.authorizationURL")

        
    //     console.log("Registered /swag-docs");
    //     router.use('/swag-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));
    // })

    router.use('/datauploads', auth.requireLoggedIn, dataUploadRoutes(express.Router()));
    router.use('/dataproviders', auth.requireLoggedIn, dataProviderRoutes(express.Router()));
    router.use('/datapackages', auth.requireLoggedIn, dataPackagesRoutes(express.Router()));
    router.use('/tableschemas', auth.requireLoggedIn, tableSchemasRoutes(express.Router()));
    router.use('/forum', auth.requireLoggedIn, forumRouter);
    router.use('/formio', auth.requireLoggedIn, formioRouter);

    router.use('/repos', auth.requireLoggedIn, repositoriesRoutes(express.Router()));
    router.use('/repobranches', auth.requireLoggedIn, repoBranchesRoutes(express.Router()));

    router.use('/token', function(req, res){
        if (req.user && req.user.jwt && req.user.refreshToken) {
            res.json(req.user);
        }else{
            res.json({error: "Not logged in"});
        }
    });

    var configRoutes = require('../base/config');
    var cfRouter = new Router();
    cfRouter = configRoutes.buildStatic(db, cfRouter);
    cfRouter = configRoutes.buildDynamic(db, cfRouter, auth);

    router.use('/config', cfRouter);

    return router;
}
