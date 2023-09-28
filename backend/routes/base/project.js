var buildStatic = function(db, router){
    return router;
}


var buildDynamic = function(db, router, auth, forumClient){
    const mongoose = require('mongoose');

    const addComment = async (projectId, user, comment) => {
        try {
            const topicResponse = await forumClient.getTopics(user, {});
            topics = topicResponse.data.filter(item => item.parent_id);

            const projectIds = topics.map( (item) => {
                let id = item.name;
                if (!id || id.indexOf("project") === -1){
                    return;
                }
                
                id = id.substring(0,id.length-7);
                let oid = mongoose.Types.ObjectId(id);
                return oid;

            }).filter( (item) => { 
                return (item && String(item).length > 0)
            }).filter( (item) => {
                return item.toString() == projectId.toString()
            });

            if (projectIds.length < 1){
                throw new Error(404);
            }

            let project = await db.Project.findOne({_id: projectId});

            if (project == null) {
                throw new Error("Invalid project ID")
            }

            await forumClient.addComment(project.topic_id, comment, user);
    
            
        } catch(e) {
            console.error(e);
            throw new Error(e.message)
        }
    }
    
    const getComments = async (projectId, user) => {
        try {
            if (user){
                const topicResponse = await forumClient.getTopics(user, {});
                topics = topicResponse.data.filter(item => item.parent_id);

                const projectIds = topics.map( (item) => {
                    let id = item.name;
                    if (!id || id.indexOf("project") === -1){
                        return;
                    }
                    
                    id = id.substring(0,id.length-7);
                    let oid = mongoose.Types.ObjectId(id);
                    return oid;

                }).filter( (item) => { 
                    return (item && String(item).length > 0)
                }).filter( (item) => {
                    return item.toString() == projectId.toString()
                });

                if (projectIds.length < 1){
                    throw new Error(404);
                }
                let project = await db.Project.findOne({_id: projectId});
                if (project == null) {
                    throw new Error("Invalid project ID")
                }
                return await forumClient.getComments (project.topic_id, user);
            }
        } catch(e) {
            console.error(e);
            throw new Error(e.message)
        }
    }

    router.get('/', async function(req, res, next) {

        var q = {};
        let projectIds = []
        try{
            if (req.user){
              const topicResponse = await forumClient.getTopics(req.user, {});
              topics = topicResponse.data.filter(item => item.parent_id);

              projectIds = topics.map( (item) => {
                  let id = item.name;
                  if (!id || id.indexOf("project") === -1){
                      return;
                  }
                  
                  id = id.substring(0,id.length-7);
                  let oid = mongoose.Types.ObjectId(id);
                  return oid;

              }).filter( (item) => { 
                  return (item && String(item).length > 0)
              });
            }

            const project = await db.Project.find({_id: {$in: projectIds}});

            res.status(200).json(project);
        }catch(ex){
            res.status(500).json({error: ex});
        }
    });

    router.post('/', auth.requireLoggedIn, auth.isApprover, async function(req, res, next){
        try{
            let f = {...req.body};

            let error = [];
            if (!f.name){
                error.push("Name is required");
            }else{
                let existing = await db.Project.find({name: f.name});
                if (existing.length > 0){
                    error.push("Name must be unique");
                }
            }
            
            let project = new db.Project;
            
            let id = mongoose.Types.ObjectId();
            project.name = f.name;
            project._id = id;
            
            project.created_by = req.user.id;
            const topic = await forumClient.addTopic((id+"project"), req.user);
            project.topic_id = topic._id;

            project.users = f.users;
            project.datasets = f.datasets;
            project.editions = f.editions;
        
            project.save();
            res.status(201).json(project);
        }catch(ex){
            res.status(500).json(ex);
        }
    });

    router.get('/:projectId', async function(req, res, next){
        try{
            let id = mongoose.Types.ObjectId(req.params.projectId);
            let project = await db.Project.findOne({_id: id});
            
            if (!req.user){
                res.status(404);
                return res.json({error: "Not Found"});
            }
            
            //check topic exists this checks for user permissions
            const response = await forumClient.getTopic(req.user, (id+"project"));
            if (!response || response.length < 1){
                return res.status(404).json({error: "Not Found"});
            }
            
            res.status(200).json(project);
        }catch(ex){
            res.status(500).json({error: ex});
        }
    });

    router.put('/:projectId', auth.requireLoggedIn, auth.isApprover, async function(req, res, next){
        try{
            let f = {...req.body};
            let error = [];

            //check topic exists this checks for user permissions
            const response = await forumClient.getTopic(req.user, (req.params.projectId+"project"));
            if (!response || response.length < 1){
                return res.status(404).json({error: "Not Found"});
            }
            
            let project = await db.Project.findOne({_id: req.params.projectId});

            if (f.name !== project.name){
              let existing = await db.Project.find({name: f.name});
                if (existing.length > 1){
                    error.push("Name must be unique");
                }else if ( (existing.length === 1) && (existing[0]._id != req.params.projectId) ){
                    error.push("Name must be unique");
                }
            }

            if (f.name){
                project.name = f.name;
            }

            if (typeof(f.users) !== 'undefined'){
              project.users = f.users;
            }

            if (typeof(f.datasets) !== 'undefined'){
              project.datasets = f.datasets;
            }

            if (typeof(f.editions) !== 'undefined'){
              project.editions = f.editions;
            }

            
            let newP = await db.Project.updateOne({_id: req.params.projectId}, project);
            newP = await db.Project.findOne({key: req.params.projectId});
            res.status(200).json(newP);
        }catch(ex){
          console.error("Exception ", ex);
            res.status(500).json(ex);
        }
    });

    router.delete('/:projectId', auth.requireLoggedIn, auth.isApprover, async function(req, res, next){
        try{
            await db.Project.deleteOne({key: req.params.projectId});
            res.status(204).send();
        }catch(ex){
            res.status(500).json({error: ex});
        }
    });

    router.get('/:projectId/comments', auth.requireLoggedIn, async function(req, res, next){
        try{
            if (req.params.projectId !== 'create'){
                const comments = await getComments (req.params.projectId, req.user);
                return res.json(comments);
            }else{
                return res.json([]);
            }
        }catch(ex){
            if (ex.message == 404){
                res.status(404).json({error: "Not Found"});
            }
            res.status(500).json({error: ex});
        }
    });

    router.post('/:projectId/comments', auth.requireLoggedIn, async function(req, res, next){
        try{
            await addComment (req.params.projectId, req.user, req.body.content);
            return res.status(201).json({
                message: 'Comment saved successfully.'
            });
        }catch(ex){
            if (ex.message == 404){
                res.status(404).json({error: "Not Found"});
            }
            res.status(500).json({error: ex});
        }
    });

    return router;
}

module.exports = {
    buildStatic: buildStatic,
    buildDynamic: buildDynamic
};