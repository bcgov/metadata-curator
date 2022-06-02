var buildStatic = function(db, router){
    return router;
}


var buildDynamic = function(db, router, auth, forumClient){
    
    const log = require('npmlog');

    router.get('/', async function(req, res, next) {
            let user = req.user;
            let providers = [];
            try {
                if(!user.isApprover && !user.isAdmin) { throw new Error("User does not have access."); }
        
                let topics = [];
                const topicResponse = await forumClient.getTopics(user);
                topics = topicResponse.data.filter(item => item.parent_id);
        
                for(const topic of topics) {
                    for(const authorGroup of topic.author_groups) {
                        if (!providers.includes(authorGroup)) { providers.push(authorGroup); }
                    }
                }
        
            }catch(ex){
                return res.status(500).json({error: ex});
            }
            res.json(providers);
    }); 

    return router;
}

module.exports = {
    buildStatic: buildStatic,
    buildDynamic: buildDynamic
};