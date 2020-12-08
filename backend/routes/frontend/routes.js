let passport = require('passport');
let auth = require('../../modules/auth');

module.exports = (router) => {

    router.use('/login', auth.removeExpired, function(req, res, next){
        req.session.r = req.query.r;
        return res.redirect('/api/log');
    });
    
    router.use('/log', passport.authenticate('oidc'), function(req, res, next){
        console.log("log", req.user);
        next();
    });
    
    router.get('/callback', passport.authenticate('oidc', { failureRedirect: '/api/login' }), function(req, res, next){
        let config = require('config');
        if (req.session.r){
            return res.redirect(config.get('frontend')+'/'+req.session.r);
        }
        console.log("Redirect to "+config.get("frontend"));
        return res.redirect(config.get('frontend'));
        
    });
    
    router.use('/logout', auth.removeExpired,  function(req, res, next){
        req.logout();
        let config = require('config');

        let fe = config.get('frontend');

        if (config.has('oidc.logoutURL')){
            let logoutUrl = config.get('oidc.logoutURL');
            logoutUrl += "?redirect_uri=" + fe;
            res.redirect(logoutUrl);
        }else{
            res.redirect(fe);
        }
    });

    router.use('/oauth/token', auth.removeExpired, function(req, res){
        let config = require('config');
        res.redirect(config.get("oidc.tokenURL"));
    });

    router.use('/token', auth.removeExpired, function(req, res){
        if (req.user && req.user.jwt && req.user.refreshToken) {
            res.json(req.user);
        }else{
            req.user =  null;
            res.json({error: "Not logged in"});
        }
    });
    
    router.get('/', function(req, res){
        if (req.user && req.user.jwt && req.user.refreshToken) {
            res.send(`
                <html>
                    <body>
                        <pre>curl http://localhost:9090/api/v1/datauploads -H "Cookie: connect.sid=${req.cookies['connect.sid']}"
                        </pre>
                    </body>
                </html>`)
        }else{
            res.redirect('/api/login?r=' + encodeURIComponent('api/'));
        }
    });
    
    router.use('/v1/publickey', auth.removeExpired, auth.requireLoggedIn, function(req, res){
        var config = require('config');
        var atob = require('atob');
        if (!config.has('base64EncodedPGPPublicKey')){
            return res.json({error: "Not configured"});
        }
        let key = atob(config.get('base64EncodedPGPPublicKey'));
        return res.json({key: key});
    });
    
    router.use('/v1/uploadurl', auth.removeExpired, auth.requireLoggedIn, function(req, res){
        var config = require('config');
        if (!config.has('uploadUrl')){
            return res.json({error: "Not configured"});
        }
        let url = config.get('uploadUrl');
        return res.json({url: url});
    });
    
    
    return router;
}
