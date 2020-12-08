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

let tableSchemasRoutes = require('./tableSchemas/routes');

const { Router } = require('express');

module.exports = (router) => {

    //api spec
    router.use('/spec', express.static(path.join(__dirname, 'spec')));

    //api docs
    router.use('/api-docs', function(req, res){
        var docs = require('./docs/docs');
        res.send(docs.getDocHTML("v1"));
    });

    
    router.use('/tableschemas', auth.requireLoggedIn, tableSchemasRoutes(express.Router()));
    router.use('/forum', auth.requireLoggedIn, forumRouter);
    router.use('/formio', auth.requireLoggedIn, formioRouter);

    router.use('/token', function(req, res){
        if (req.user && req.user.jwt && req.user.refreshToken) {
            res.json(req.user);
        }else{
            res.json({error: "Not logged in"});
        }
    });

    var forumClient = require('./clients/forum_client');
    var formioClient = require('./clients/formio_client');

    var configRoutes = require('../base/config');
    var cfRouter = new Router();
    cfRouter = configRoutes.buildStatic(db, cfRouter);
    cfRouter = configRoutes.buildDynamic(db, cfRouter, auth);
    router.use('/config', cfRouter);

    var packageRoutes = require('../base/packages');
    var pRouter = new Router();
    const tableSchemaService = require('../../services/tableSchemaService');
    let ValidationError = require('../../modules/validationError');
    pRouter = packageRoutes.buildStatic(db, pRouter);
    pRouter = packageRoutes.buildDynamic(db, pRouter, auth, ValidationError, tableSchemaService);
    router.use('/datapackages', auth.requireLoggedIn, pRouter);

    var dataUploadRoutes = require('../base/uploads');
    var uRouter = new Router();
    uRouter = dataUploadRoutes.buildStatic(db, uRouter);
    uRouter = dataUploadRoutes.buildDynamic(db, uRouter, auth);
    router.use('/datauploads', auth.requireLoggedIn, uRouter);

    var dataProviderRoutes = require('../base/providers');
    var dpRouter = new Router();
    dpRouter = dataProviderRoutes.buildStatic(db, dpRouter);
    dpRouter = dataProviderRoutes.buildDynamic(db, dpRouter, auth);
    router.use('/dataproviders', auth.requireLoggedIn, dpRouter);

    var repositoriesRoutes = require('../base/repo');
    var repoRouter = new Router();
    repoRouter = repositoriesRoutes.buildStatic(db, repoRouter);
    repoRouter = repositoriesRoutes.buildDynamic(db, repoRouter, auth, forumClient);
    router.use('/repos', auth.requireLoggedIn, repoRouter);

    var repoBranchesRoutes = require('../base/branches');
    var branchRouter = new Router();
    branchRouter = repoBranchesRoutes.buildStatic(db, branchRouter);
    branchRouter = repoBranchesRoutes.buildDynamic(db, branchRouter, auth);
    router.use('/repobranches', auth.requireLoggedIn, branchRouter);


    return router;
}
