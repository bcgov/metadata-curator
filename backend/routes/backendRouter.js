let express = require('express');
let router = express.Router();
let auth = require('../modules/auth');
let frontendRoutes = require('./frontend/routes');

global.catchAsync = fn => {
    return (req, res, next) => {
      fn(req, res, next).catch(next)
    };
};


frontendRoutes(router);

const NodeCache = require( "node-cache" );
const cache = new NodeCache( { /*stdTTL: 100, checkperiod: 120*/ } );

const v1 = require('./v1/v1');
router.use('/v1', auth.removeExpired, v1(express.Router(), cache));

module.exports = router;
