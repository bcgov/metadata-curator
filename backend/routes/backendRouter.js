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
let repoBranchesRoutes = require('./repoBranches/routes');

global.catchAsync = fn => {
    return (req, res, next) => {
      fn(req, res, next).catch(next)
    };
};

router.use('/v1/datauploads', dataUploadRoutes(express.Router()));
router.use('/v1/datapackages', dataPackagesRoutes(express.Router()));
router.use('/v1/tableschemas', tableSchemasRoutes(express.Router()));
router.use('/v1/forum', forumRouter);
router.use('/v1/formio', formioRouter);

router.use('/v1/repos', repositoriesRoutes(express.Router()));
router.use('/v1/repobranches', repoBranchesRoutes(express.Router()));

/*

router.use('/v1/repositories/xx/branches/yy')
router.use('/v1/repositories/xx/branches/yy/revisions/1')
router.use('/v1/repositories/xx/branches/yy/revisions?q=current')
*/
frontendRoutes(router);

module.exports = router;
