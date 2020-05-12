var addRoutes = function(router){
    const config = require('config');
    const formio = require('../../clients/formio_client');
    
    router.get('/forms', function(req, res, next){
        formio.getForms(function(err, form){
            if (err){
                res.status(500);
                return res.json({error: err});
            }
            return res.json(JSON.parse(form));
        })
    });


    return router;
}

module.exports = addRoutes;