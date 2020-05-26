var express = require('express');
var router = express.Router();
var path = require('path');

let forumRouter = express.Router();
let forumBridge = require('./forumApi/bridge');
forumRouter = forumBridge(forumRouter);

let formioRouter = express.Router();
let formioBridge = require('./formio/bridge');
formioRouter = formioBridge(formioRouter);

let dataUploadRoutes = require('./dataUploads/routes');
let dataPackagesRoutes = require('./dataPackages/routes');
let tableSchemasRoutes = require('./tableSchemas/routes');
let repositoriesRoutes = require('./repositories/routes');
let repoBranchesRoutes = require('./repoBranches/routes');

//api spec
router.use('/spec', express.static(path.join(__dirname, 'spec')));

//api docs
router.use('/api-docs', function(req, res){
    var docs = require('./docs/docs');
    res.send(docs.getDocHTML("v1"));
});


router.use('/datauploads', dataUploadRoutes(express.Router()));
router.use('/datapackages', dataPackagesRoutes(express.Router()));
router.use('/tableschemas', tableSchemasRoutes(express.Router()));
router.use('/forum', forumRouter);
router.use('/formio', formioRouter);

router.use('/repos', repositoriesRoutes(express.Router()));
router.use('/repobranches', repoBranchesRoutes(express.Router()));

module.exports = router;
