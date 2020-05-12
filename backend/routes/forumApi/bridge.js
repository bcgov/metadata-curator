var addRoutes = function(router){
    const config = require('config');
    const axios = require('axios');
    router.get('/permissions', async function(req, res, next){
        const forumApiConfig = config.get('forumApi');
        const url = forumApiConfig.baseUrl + "/permission";
        console.log(req.user);
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
        
        console.log("permission put", req.params.id, req.body)

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
        const response = await axios.put(url, req.body, {withCredentials: true}, options);
        res.json(response.data);
    });

    router.post('/permission', async function(req, res, next){
        const forumApiConfig = config.get('forumApi');
        const url = forumApiConfig.baseUrl + "/permission"
        
        console.log("permission post", req.params.id, req.body)

        if (!req.user || !req.user.jwt){
            res.status(403);
            return res.json({error: "Forbidden"})
        }
        const options = {
            headers: {
                "Authorization": "Bearer " + req.user.jwt
            }
        };
        const response = await axios.post(url, req.body, {withCredentials: true}, options);
        res.json(response.data);
    });


    return router;
}

module.exports = addRoutes;