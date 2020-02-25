let auth = {};
let atob = require('atob');
let bent = require('bent')


auth.isTokenExpired = function(token){
    let currDate = new Date();

    let base64Url = token.split('.')[1];
    let base64 = base64Url.replace('-', '+').replace('_', '/');
    let jwtObj = JSON.parse(atob(base64));
    let exp = new Date(0);
    exp.setUTCSeconds(jwtObj.exp);

    return (currDate > exp);
}

auth.isRenewable = function(token){

    //tokens haven't had exp in them lately
    return true;
    // let currDate = new Date();
    //
    // let base64Url = token.split('.')[1];
    // let base64 = base64Url.replace('-', '+').replace('_', '/');
    // let jwtObj = JSON.parse(atob(base64));
    // let exp = new Date(0);
    // exp.setUTCSeconds(jwtObj.exp);
    //
    // console.log("Refresh Token expires at ", exp, jwtObj);
    //
    // return (exp > currDate);
}


auth.renew = async function(jwt, token, cb){
    let config = require('config');

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

auth.removeExpired = function(req, res, next){
    if ( (typeof(req.user) !== "undefined") && (typeof(req.user.jwt) !== "undefined") && (req.user.jwt !== null) ){
        if (req.user.jwt === null){
            req.user = null;
            delete req.user;
            next();
        }

        if (auth.isTokenExpired(req.user.jwt)){
            if ( (typeof(req.user.refreshToken) !== "undefined") && (req.user.refreshToken !== null) ){

                if (req.user.refreshToken === null){
                    req.user = null;
                    delete req.user;
                    next();
                }

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
            next()
        }
    } else {
        next()
    }
}

module.exports = auth