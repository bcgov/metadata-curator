var addRoutes = function(router){
    const config = require('config');
    const axios = require('axios');
    router.get('/permissions', async function(req, res, next){
        const forumApiConfig = config.get('forumApi');
        const url = forumApiConfig.baseUrl + "/permission";
        if (!req.user || !req.user.jwt){
            res.status(403);
            return res.json({error: "Forbidden"})
        }
        const options = {
            headers: {
                "Authorization": "Bearer " + req.user.jwt
            }
        };
        const response = await axios.get(url, options);
        res.json(response.data);
    });

    router.put('/permission/:id', async function(req, res, next){
        const forumApiConfig = config.get('forumApi');
        const url = forumApiConfig.baseUrl + "/permission/" + req.params.id;

        delete req.body._id;

        if (!req.user || !req.user.jwt){
            res.status(403);
            return res.json({error: "Forbidden"})
        }
        const options = {
            headers: {
                "Authorization": "Bearer " + req.user.jwt
            }
        };
        const response = await axios.put(url, req.body, options);
        res.json(response.data);
    });

    router.post('/permission', async function(req, res, next){
        const forumApiConfig = config.get('forumApi');
        const url = forumApiConfig.baseUrl + "/permission"

        if (!req.user || !req.user.jwt){
            res.status(403);
            return res.json({error: "Forbidden"})
        }
        const options = {
            headers: {
                "Authorization": "Bearer " + req.user.jwt
            }
        };
        const response = await axios.post(url, req.body, options);
        res.json(response.data);
    });

    router.delete('/permission/:id', async function(req, res, next){
        const forumApiConfig = config.get('forumApi');
        const url = forumApiConfig.baseUrl + "/permission/" + req.params.id;

        if (!req.user || !req.user.jwt){
            res.status(403);
            return res.json({error: "Forbidden"})
        }
        
        const options = {
            headers: {
                "Authorization": "Bearer " + req.user.jwt
            }
        };

        const response = await axios.delete(url, options);
        res.json(response.data);
    });


    //topics
    router.get('/topics', async function(req, res, next){
        const forumApiConfig = config.get('forumApi');
        let url = forumApiConfig.baseUrl + "/";
        if (!req.user || !req.user.jwt){
            res.status(403);
            return res.json({error: "Forbidden"})
        }
        const options = {
            headers: {
                "Authorization": "Bearer " + req.user.jwt
            }
        };

        if (req.query && req.query.page){
            url += "?page=" + req.query.page;
        }

        console.log("URL ", url);

        const response = await axios.get(url, options);
        res.json(response.data);
    });

    router.put('/topics/:id', async function(req, res, next){
        const forumApiConfig = config.get('forumApi');
        const url = forumApiConfig.baseUrl + "/" + req.params.id;

        delete req.body._id;

        if (!req.user || !req.user.jwt){
            res.status(403);
            return res.json({error: "Forbidden"})
        }
        const options = {
            headers: {
                "Authorization": "Bearer " + req.user.jwt
            }
        };
        const response = await axios.put(url, req.body, options);
        res.json(response.data);
    });

    router.post('/topics', async function(req, res, next){
        const forumApiConfig = config.get('forumApi');
        const url = forumApiConfig.baseUrl + "/"

        if (!req.user || !req.user.jwt){
            res.status(403);
            return res.json({error: "Forbidden"})
        }
        const options = {
            headers: {
                "Authorization": "Bearer " + req.user.jwt
            }
        };
        const response = await axios.post(url, req.body, options);
        res.json(response.data);
    });

    router.delete('/topics/:id', async function(req, res, next){
        const forumApiConfig = config.get('forumApi');
        const url = forumApiConfig.baseUrl + "/" + req.params.id;

        if (!req.user || !req.user.jwt){
            res.status(403);
            return res.json({error: "Forbidden"})
        }
        
        const options = {
            headers: {
                "Authorization": "Bearer " + req.user.jwt
            }
        };

        const response = await axios.delete(url, options);
        res.json(response.data);
    });

    //comments
    router.get('/comments/topic/:topicId', async function(req, res, next){
        const forumApiConfig = config.get('forumApi');
        const url = forumApiConfig.baseUrl + "/comment/" + req.params.topicId;
        if (!req.user || !req.user.jwt){
            res.status(403);
            return res.json({error: "Forbidden"})
        }
        const options = {
            headers: {
                "Authorization": "Bearer " + req.user.jwt
            }
        };

        
        const response = await axios.get(url, options);
        
        res.json(response.data);
    });

    router.put('/comments/:id', async function(req, res, next){
        const forumApiConfig = config.get('forumApi');
        const url = forumApiConfig.baseUrl + "/comment/" + req.params.id;

        delete req.body._id;

        if (!req.user || !req.user.jwt){
            res.status(403);
            return res.json({error: "Forbidden"})
        }
        const options = {
            headers: {
                "Authorization": "Bearer " + req.user.jwt
            }
        };
        const response = await axios.put(url, req.body, options);
        res.json(response.data);
    });

    router.post('/comments', async function(req, res, next){
        const forumApiConfig = config.get('forumApi');
        const url = forumApiConfig.baseUrl + "/comment"

        if (!req.user || !req.user.jwt){
            res.status(403);
            return res.json({error: "Forbidden"})
        }
        const options = {
            headers: {
                "Authorization": "Bearer " + req.user.jwt
            }
        };
        const response = await axios.post(url, req.body, options);
        res.json(response.data);
    });

    router.delete('/comments/:id', async function(req, res, next){
        const forumApiConfig = config.get('forumApi');
        const url = forumApiConfig.baseUrl + "/comment" + req.params.id;

        if (!req.user || !req.user.jwt){
            res.status(403);
            return res.json({error: "Forbidden"})
        }
        
        const options = {
            headers: {
                "Authorization": "Bearer " + req.user.jwt
            }
        };

        const response = await axios.delete(url, options);
        res.json(response.data);
    });


    return router;
}

module.exports = addRoutes;