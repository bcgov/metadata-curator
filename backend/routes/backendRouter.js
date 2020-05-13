let express = require('express');
let router = express.Router();

let forumRouter = express.Router();
let forumBridge = require('./forumApi/bridge');
forumRouter = forumBridge(forumRouter);

let formioRouter = express.Router();
let formioBridge = require('./formio/bridge');
formioRouter = formioBridge(formioRouter);

let frontendRoutes = require('./frontend/routes');
let dataUploadRoutes = require('./dataUploads/routes');
let dataPackagesRoutes = require('./dataPackages/routes');
let tableSchemasRoutes = require('./tableSchemas/routes');
let repositoriesRoutes = require('./repositories/routes');
let metadataRevisionsRoutes = require('./metadataRevisions/routes');

router.use('/v1/datauploads', dataUploadRoutes(express.Router()));
router.use('/v1/datapackageschemas', dataPackagesRoutes(express.Router()));
router.use('/v1/tableschemas', tableSchemasRoutes(express.Router()));
router.use('/v1/metadatarevisions', metadataRevisionsRoutes(express.Router()));
router.use('/v1/forum', forumRouter);
router.use('/v1/formio', formioRouter);

frontendRoutes(router);
repositoriesRoutes(router);


module.exports = router;
