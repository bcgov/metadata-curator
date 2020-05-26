let express = require('express');
let router = express.Router();

let frontendRoutes = require('./frontend/routes');

global.catchAsync = fn => {
    return (req, res, next) => {
      fn(req, res, next).catch(next)
    };
};

let v1 = require('./v1/v1');
router.use('/v1', v1);

frontendRoutes(router);

module.exports = router;
