const passport = require('passport');
const passJwt = require('passport-jwt');
const JWTStrategy = passJwt.Strategy;
const ExtractJWT = passJwt.ExtractJwt;
var config = require('config');
var logger = require('npmlog');
var jwtLib = require('jsonwebtoken');
var secret = config.get("jwtSecret");

passport.use('jwt', new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey: secret,
        passReqToCallback: true,
    }, function(req, jwtPayload, cb) {

        var originalJwt = req.headers['authorization'].substring("Bearer ".length);
        var encodedJWT = originalJwt;

        // invalid token - synchronous
        try {
            let decodedJWT = jwt.verify(originalJwt, secret);
            decodedJWT.aud = config.get('jwtAud');
            encodedJWT = jwt.sign(decodedJWT, secret);
            console.log("Resignined jwt");
        } catch(err) {
            console.log("Error resigning");
        }
        //var userConf = config.get('user');
        var user = {
            jwt: encodedJWT,
            // email: jwtPayload[userConf.emailField],
            // firstName: jwtPayload[userConf.givenNameField],
            // lastName: jwtPayload[userConf.surNameField],
            // name: jwtPayload[userConf.givenNameField] + " " + jwtPayload[userConf.surNameField],
            // groups: jwtPayload[userConf.groupField],
            // id: jwtPayload[userConf.idField],
        };
        logger.verbose('user ' + user.jwt + ' authenticated successfully');

        cb(null, user);
    }
));

module.exports = passport;