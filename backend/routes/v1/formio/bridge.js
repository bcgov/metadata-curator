var addRoutes = function(router){
    const config = require('config');
    const formio = require('../../../clients/formio_client');

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
            try{
                return res.json(JSON.parse(form));
            }catch(ex){
                return res.json({"error": ex});
            }
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

    router.get('/form/:name/submission/:submissionId', function(req, res, next){

        formio.getSubmission(req.params.name, req.params.submissionId, function(err, submission){
            if (err){
                res.status(500);
                return res.json({error: err});
            }
            return res.json(JSON.parse(submission));
        });
    });

    router.post('/form/:name/submission', function(req, res, next){
        const formName = req.params.name;
        console.log("formName: " + formName);

        formio.postSubmission(formName, req.body, function(formErr, formRes){
            // log.verbose("formio post resp", formErr, formRes);
            console.log("formio post resp", formErr, formRes);
            if (formErr){
                res.status(500);
                res.json({error: formErr});
                return;
            }

            if (typeof(formRes) === 'string'){
                try{
                    formRes = JSON.parse(formRes);
                }catch(e){
                }
            }

            if (formRes.name === "ValidationError") {
                res.status(500);
                res.json({error: "Critical form validation error"});
                return;
            }
            console.log("formRes: ", formRes);

            res.status(201);
            res.json(formRes);

        });

    });

    router.put('/form/:name/submission/:submissionId', function(req, res, next){

        formio.putSubmission(req.params.name, req.params.submissionId, req.body, function(formErr, formRes){
            // log.verbose("formio post resp", formErr, formRes);
            console.log("formio put resp", formErr, formRes);
            if (formErr){
                res.status(500);
                res.json({error: formErr});
                return;
            }

            if (typeof(formRes) === 'string'){
                try{
                    formRes = JSON.parse(formRes);
                }catch(e){
                }
            }

            if (formRes.name === "ValidationError") {
                res.status(500);
                res.json({error: "Critical form validation error"});
                return;
            }
            console.log("formRes: ", formRes);

            res.status(200);
            res.json(formRes);

        });

    });

    return router;
}

module.exports = addRoutes;
