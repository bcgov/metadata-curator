let passport = require('passport');
let auth = require('../../modules/auth');

module.exports = (router) => {

    router.use('/login', function(req, res, next){
        req.session.r = req.query.r;
        return res.redirect('/api/log');
    });
    
    router.use('/log', passport.authenticate('oidc'), function(req, res, next){
        console.log("log", req.user);
        next();
    });
    
    router.use('/callback', passport.authenticate('oidc'), function(req, res, next){
        let config = require('config');
        if (req.session.r){
            return res.redirect(config.get('frontend')+'/'+req.session.r);
        }
        return res.redirect(config.get('frontend')+'/');
        
    });
    
    router.use('/logout', function(req, res, next){
        req.logout();
        let config = require('config');
        res.redirect(config.get('frontend'));
    });
    
    router.use('/token', auth.removeExpired, function(req, res){
        if (req.user && req.user.jwt && req.user.refreshToken) {
            res.json(req.user);
        }else{
            res.json({error: "Not logged in"});
        }
    });
    
    
    router.use('/v1/publickey', auth.removeExpired, function(req, res){
        var config = require('config');
        var atob = require('atob');
        if (!config.has('base64EncodedPGPPublicKey')){
            return res.json({error: "Not configured"});
        }
        let key = atob(config.get('base64EncodedPGPPublicKey'));
        return res.json({key: key});
    });
    
    router.use('/v1/uploadurl', auth.removeExpired, function(req, res){
        var config = require('config');
        if (!config.has('uploadUrl')){
            return res.json({error: "Not configured"});
        }
        let url = config.get('uploadUrl');
        return res.json({url: url});
    });
    
    
    return router;
}
