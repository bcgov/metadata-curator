let auth = {};
let atob = require('atob');
let bent = require('bent');
let passport = require('passport');
const logger = require('npmlog');
let env = process.env.NODE_ENV || 'development';
const buildProfile = require('../auth/auth').buildProfile;
const config = require('config')
const jwt = require('jsonwebtoken');

auth.validToken = function(req){
  if (!config.has('jwtSecret')){
    throw new Error("Invalid Token, not configured");
  }

  if (!req.headers['authorization']){
    throw new Error("Invalid Token, no auth header");
  }
  var secret = config.get("jwtSecret");
  const originalJwt = req.headers['authorization'].substring("Bearer ".length);
  decodedJWT = jwt.verify(originalJwt, secret);
  decodedJWT.aud = config.get('jwtAud');
  decodedJWT._json = JSON.parse(JSON.stringify(decodedJWT));
  decodedJWT = buildProfile(decodedJWT, 'a');
  req.user = decodedJWT;
  return decodedJWT;
}

auth.requireLoggedIn = async function(req, res, next){
    if (!req.user){
        logger.debug('No user, checking token');
        try{
          const token = auth.validToken(req);
          return next();
        }catch(e){}
        res.status(401);
        return res.json({error: "Not Authorized"});
    }
    next();
}

auth.requireAdmin = async function(req, res, next){
    if (!req.user){
        res.status(401);
        return res.json({error: "Not Authorized"});
    }
    let adminGroup = config.get('adminGroup');

    if ( (!req.user.groups) || (req.user.groups.indexOf(adminGroup) === -1) ){
        res.status(404);
        return res.json({error: "Not Found"});
    }

    next();
}

auth.requireGroup = async function(groupName){

    return function(req, res, next){
        if ( (!req.user) || (!req.user.groups) || (req.user.groups.indexOf(groupName) === -1) ){
            res.status(403);
            return res.json({error: "Forbidden"});
        }
        next();
    }

}

auth.isApprover = function(req, res, next){
    let approverGroups = config.get('approverGroups');
    let adminGroup = config.get('adminGroup');
    if ( (!req.user) || (!req.user.groups) ){
        res.status(403);
        return res.json({error: "Forbidden"});
    }else{
        const intersection = req.user.groups.filter(element => approverGroups.includes(element));
        if ( (intersection.length <= 0) && (req.user.groups.indexOf(adminGroup) === -1) ){
            res.status(403);
            return res.json({error: "Forbidden"});
        }
    }

    next();
}

auth.isTokenExpired = function(token){
    const log = require('npmlog');
    let currDate = new Date();

    let base64Url = token.split('.')[1];
    let base64 = base64Url.replace('-', '+').replace('_', '/');
    let jwtObj = JSON.parse(atob(base64));
    let exp = new Date(0);
    exp.setUTCSeconds(jwtObj.exp);

    log.verbose("TOK EXP?", (currDate>exp), currDate, exp )

    return (currDate > exp);
}

auth.isRenewable = function(token){

    //tokens haven't had exp in them lately    
    let currDate = new Date();
    
    let base64Url = token.split('.')[1];
    let base64 = base64Url.replace('-', '+').replace('_', '/');
    let jwtObj = JSON.parse(atob(base64));
    let exp = new Date(0);
    exp.setUTCSeconds(jwtObj.exp);

     return ( (exp > currDate) || (jwtObj.exp === 0) );
}


auth.renew = async function(jwt, token, cb){

    let refresh = config.get('oidc.tokenURL')
    let scope = config.get('oidc.scope')
    let client_id = config.get('oidc.clientID')
    let client_secret = config.get('oidc.clientSecret')

    let authObj = {
        form: {
            grant_type: "refresh_token",
            scope: scope,
            refresh_token: token,
            client_id: client_id,
            client_secret: client_secret
        }
    }

    let headers = {
        accept: "application/json",
        "cache-control": "no-cache",
        "content-type": "application/x-www-form-urlencoded",
        "Authorization": "Bearer " + jwt
    };

    console.log("renew headers", headers);

    const post = bent('POST')
    let response = null;
    try{
        response = await post(refresh, authObj.form, headers);
    }catch(err){
        cb(err, null, null);
        return;
    }
    
    let at = null;
    let rt = null;

    if (typeof(response.access_token) !== "undefined"){
        at = response.access_token
    }

    if (typeof(response.refresh_token) !== "undefined"){
        rt = response.refresh_token
    }

    cb(null, at, rt);
}

auth.removeExpired = async function(req, res, next){
    const log = require('npmlog');
    if (env === 'test' && !req.user){
        passport.authenticate('jwt', function(err, user, info){
            if (!err && user){
                req.user = user;
            }
        })(req, res, next);
    }

    if ( (typeof(req.user) !== "undefined") && (typeof(req.user.jwt) !== "undefined") && (req.user.jwt !== null) ){
        log.verbose("remove expired not undef");
        if (auth.isTokenExpired(req.user.jwt)){
            
            if ( (typeof(req.user.refreshToken) !== "undefined") && (req.user.refreshToken !== null) ){
                

                if (auth.isRenewable(req.user.refreshToken)){
                    
                    auth.renew(req.user.jwt, req.user.refreshToken, function(refreshErr, accessToken, refreshToken){
                        if (refreshErr){
                            console.error("refresh token error", refreshErr);
                            next();
                            return;

                        }

                        req.user.jwt = accessToken;
                        req.user.refreshToken =  refreshToken;
                        next();
                    });
                } else {
                    req.user = null;
                    delete req.user;
                    next();
                }
            } else {
                req.user = null;
                delete req.user;
                next();
            }
        }else {
            log.verbose("remove expired not expired");
            next()
        }
    } else {
        log.verbose("remove expired not signed in");
        req.user = null;
        delete req.user;
        next()
    }
}

module.exports = auth