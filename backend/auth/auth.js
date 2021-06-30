const passport = require('passport');
const passJwt = require('passport-jwt');
const JWTStrategy = passJwt.Strategy;
const ExtractJWT = passJwt.ExtractJwt;
var config = require('config');
var logger = require('npmlog');
var jwt = require('jsonwebtoken');
//let OidcStrategy = require('passport-openidconnect').Strategy;
let OidcStrategy = require('../modules/passport-openidconnect').Strategy;
var secret = config.get("jwtSecret");

passport.use('jwt', new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey: secret,
        passReqToCallback: true,
    }, function(req, jwtPayload, cb) {

        var originalJwt = req.headers['authorization'].substring("Bearer ".length);
        var encodedJWT = originalJwt;
        if (!encodedJWT){
            cb("No JWT", null);
        }
        var decodedJWT = null;

        // invalid token - synchronous
        try {
            decodedJWT = jwt.verify(originalJwt, secret);
            decodedJWT.aud = config.get('jwtAud');
            decodedJWT._json = JSON.parse(JSON.stringify(decodedJWT));
            decodedJWT = buildProfile(decodedJWT, 'a');
        } catch(err) {
            console.log("Error resigning", err);
            return cb(err, null);
        }
        //var userConf = config.get('user');
        if (!decodedJWT){
            cb("No JWT", null);
        }
            
        logger.verbose('user ' + decodedJWT.jwt + ' authenticated successfully');
        
        cb(null, decodedJWT);
    }
));

var buildProfile = function(token, refreshToken){
    let profile = token;
    profile._json['aud'] = config.get('jwtAud');
    profile.jwt = jwt.sign(token._json, config.get('jwtSecret'));
    profile.isAdmin = false;
  
    profile.isDataProvider = false;
    profile.isApprover = false;
    profile.groups = [];

    if ((typeof(token._json) !== "undefined") && (typeof(token._json.groups) !== "undefined")){
        profile.groups = token._json.groups;
    }

    if ((typeof(token._json) !== "undefined") && (typeof(token._json.email) !== "undefined")){
        profile.email = token._json.email;
    }
    
    if (config.has('adminGroup')){
        profile.isAdmin = (token.groups.indexOf(config.get('adminGroup')) !== -1);
    }

    if ( (config.has('orgAttribute')) && (token._json[config.get('orgAttribute')]) ){
        profile.organization = token._json[config.get('orgAttribute')];
    }

    if ((config.has('requiredRoleToCreateRequest')) && (profile.groups.length>0)){
      profile.canUpload = (profile.groups.indexOf(config.get('requiredRoleToCreateRequest')) !== -1);
    }
    
    
    profile.refreshToken = refreshToken;

    const approverGroups = config.get("approverGroups");
    
    const foundApprover = token.groups.some(group => approverGroups.includes(group));
    
    if(foundApprover) {
        profile.isApprover = true; 
    }

    if(profile.organization) {
        const alwaysNotifyList = new Map(Object.entries(config.get("alwaysNotifyList")));
        // console.log("alwaysNotifyList: ", alwaysNotifyList);
        profile.isDataProvider = alwaysNotifyList.has(profile.organization) ? true : false;
    }

    return profile;
}


var strategy = new OidcStrategy(config.get('oidc'), async function(issuer, sub, profile, accessToken, refreshToken, done){
    
    if ( (typeof(accessToken) === "undefined") || (accessToken === null) || (typeof(refreshToken) === "undefined") || (refreshToken === null) ){
      console.log("No token");
      return done("No access token", null);
    }

    profile = buildProfile(profile, refreshToken);
  
    var db = require('../db/db');
  
    if (profile.email){
      try{
        var u = await db.User.findOne({email: profile.email});
        profile.lastLogin = u.lastLogin;
      }catch(ex){
        console.log("No previous user info", ex);
      }
      
    }
  
    var user = {
      email: profile.email,
      name: profile.displayName,
      groups: profile.groups,
      lastLogin: new Date()
    }
  
    if (profile.email){
      db.User.update({email: profile.email}, user, {upsert: true, setDefaultsOnInsert: true}, function(e,r){
        if (e){
          console.log("Error updating user info", e);
        }else{
          console.log("Updated user info");
        }
  
      });
    }
    
  
    console.log("setting profile");
    done(null, profile);
});
  
  
// set up passport
passport.use('oidc', strategy);

module.exports = passport;