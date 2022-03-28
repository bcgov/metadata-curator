let passport = require('passport');
let auth = require('../../modules/auth');

let env = process.env.NODE_ENV || 'development';
let strategy = 'oidc';
if (env === "test"){
    strategy = ['oidc', 'jwt'];
}

module.exports = (router) => {

    router.get('/login', auth.removeExpired, function(req, res, next){
        req.session.r = req.query.r;
        return res.redirect('/api/log');
    });
    
    router.get('/log', passport.authenticate(strategy), function(req, res, next){
        next();
    });
    
    router.get('/callback', passport.authenticate(strategy, { failureRedirect: '/api/login' }), function(req, res, next){
        let config = require('config');
        if (req.session.r){
            let r = req.session.r;
            delete req.session.r;
            return res.redirect(config.get('frontend')+'/'+r);
        }
        return res.redirect(config.get('frontend'));
        
    });
    
    router.get('/logout', auth.removeExpired,  function(req, res, next){
        req.logout();
        req.session.destroy( () => {
            res.clearCookie('mc');
            let config = require('config');

            let fe = config.get('frontend') + '/loggedout';

            if (config.has('oidc.logoutURL')){
                let logoutUrl = config.get('oidc.logoutURL');
                logoutUrl += "?redirect_uri=" + fe;
                res.redirect(logoutUrl);
            }else{
                res.redirect(fe);
            }
        });
    });

    router.get('/oauth/token', auth.removeExpired, function(req, res){
        let config = require('config');
        res.redirect(config.get("oidc.tokenURL"));
    });

    router.get('/token', auth.removeExpired, async function(req, res){
        if (req.user && req.user.jwt && req.user.refreshToken) {
            return res.json(req.user);
        }else if (req.headers.authorization){
            passport.authenticate('jwt', { session: true }, function(err, user, info){
                if (!err && user){
                    req.user = user;
                    req.session.passport = {};
                    req.session.passport.user = JSON.parse(JSON.stringify(user));
                    res.json(req.user);
                }else{
                    res.json({error: "Not logged in"});
                }
            })(req, res, function(){});
        }else{
            req.user =  null;
            res.json({error: "Not logged in"});
        }
    });
    
    router.get('/', function(req, res){
        if (req.user && req.user.jwt && req.user.refreshToken) {
            return res.send(`
                <html>
                    <body>
                        <pre>curl http://localhost:9090/api/v1/datauploads -H "Cookie: connect.sid=${req.cookies['connect.sid']}"
                        </pre>
                    </body>
                </html>`)
        }else{
            return res.redirect('/api/login?r=' + encodeURIComponent('api/'));
        }
    });
    
    router.get('/v1/publickey', auth.removeExpired, auth.requireLoggedIn, function(req, res){
        var config = require('config');
        var atob = require('atob');
        if (!config.has('base64EncodedPGPPublicKey')){
            return res.json({error: "Not configured"});
        }
        let key = atob(config.get('base64EncodedPGPPublicKey'));
        return res.json({key: key});
    });
    
    router.get('/v1/uploadurl', auth.removeExpired, auth.requireLoggedIn, function(req, res){
        var config = require('config');
        if (!config.has('uploadUrl')){
            return res.json({error: "Not configured"});
        }
        let url = config.get('uploadUrl');
        return res.json({url: url});
    });
    
    
    return router;
}
