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

    router.get('/form/:name', function(req, res, next){
        formio.getForm(req.params.name, function(err, form){
            if (err){
                res.status(500);
                return res.json({error: err});
            }
            return res.json(JSON.parse(form));
        });
    });

    router.put('/form/:name', function(req, res, next){
        formio.putForm(req.params.name, req.body, function(err, form){
            if (err){
                res.status(500);
                return res.json({error: err});
            }
            return res.json(form);
        });
    });

    router.delete('/form/:name', function(req, res, next){
        formio.deleteForm(req.params.name, function(err, form){
            if (err){
                res.status(500);
                return res.json({error: err});
            }
            return res.json(form);
        });
    });

    router.post('/form', function(req, res, next){
        formio.postForm(req.body, function(err, form){
            console.log("POST FORM", err, form);
            if (err){
                res.status(500);
                return res.json({error: err});
            }
            return res.json(form);
        });
    });


    return router;
}

module.exports = addRoutes;