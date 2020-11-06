let express = require('express');
let router = express.Router();
let passport = require('passport');
let auth = require('../modules/auth');
let frontendRoutes = require('./frontend/routes');

global.catchAsync = fn => {
    return (req, res, next) => {
      fn(req, res, next).catch(next)
    };
};

const v1 = require('./v1/v1');
router.use('/v1', auth.removeExpired, v1(express.Router()));

frontendRoutes(router);

module.exports = router;
