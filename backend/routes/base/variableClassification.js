var buildStatic = function(db, router){
    return router;
}


var buildDynamic = function(db, router, auth, forumClient){
    const mongoose = require('mongoose');

    const addComment = async (varClassId, user, comment) => {
        try {
            const topicResponse = await forumClient.getTopics(user, {});
            topics = topicResponse.data.filter(item => item.parent_id);

            const varClassIds = topics.map( (item) => {
                let id = item.name;
                if (!id || id.indexOf("varClass") === -1){
                    return;
                }
                
                id = id.substring(0,id.length-8);
                let oid = mongoose.Types.ObjectId(id);
                return oid;

            }).filter( (item) => { 
                return (item && String(item).length > 0)
            }).filter( (item) => {
                return item.toString() == varClassId.toString()
            });

            if (varClassIds.length < 1){
                throw new Error(404);
            }

            let varClass = await db.VariableClassification.findOne({_id: varClassId});

            if (varClass == null) {
                throw new Error("Invalid var class ID")
            }

            await forumClient.addComment(varClass.topic_id, comment, user);
    
            
        } catch(e) {
            console.error(e);
            throw new Error(e.message)
        }
    }
    
    const getComments = async (varClassId, user) => {
        try {
            if (user){
                const topicResponse = await forumClient.getTopics(user, {});
                topics = topicResponse.data.filter(item => item.parent_id);

                const varClassIds = topics.map( (item) => {
                    let id = item.name;
                    if (!id || id.indexOf("varClass") === -1){
                        return;
                    }
                    
                    id = id.substring(0,id.length-8);
                    let oid = mongoose.Types.ObjectId(id);
                    return oid;

                }).filter( (item) => { 
                    return (item && String(item).length > 0)
                }).filter( (item) => {
                    return item.toString() == varClassId.toString()
                });

                if (varClassIds.length < 1){
                    throw new Error(404);
                }
                let varClass = await db.VariableClassification.findOne({_id: varClassId});
                if (varClass == null) {
                    throw new Error("Invalid var class ID")
                }
                return await forumClient.getComments (varClass.topic_id, user);
            }
        } catch(e) {
            console.error(e);
            throw new Error(e.message)
        }
    }

    router.get('/', async function(req, res, next) {

        var q = {};
        let varClassIds = []
        try{
            if (req.user){
              const topicResponse = await forumClient.getTopics(req.user, {});
              topics = topicResponse.data.filter(item => item.parent_id);

              varClassIds = topics.map( (item) => {
                  let id = item.name;
                  if (!id || id.indexOf("varClass") === -1){
                      return;
                  }
                  
                  id = id.substring(0,id.length-8);
                  let oid = mongoose.Types.ObjectId(id);
                  return oid;

              }).filter( (item) => { 
                  return (item && String(item).length > 0)
              });
            }

            const varClass = await db.VariableClassification.find({$or: [{_id: {$in: varClassIds}}, {published: true}] });

            res.status(200).json(varClass);
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
                let existing = await db.VariableClassification.find({name: f.name});
                if (existing.length > 0){
                    error.push("Name must be unique");
                }
            }
            
            let varClass = new db.VariableClassification;
            
            let id = mongoose.Types.ObjectId();
            varClass.name = f.name;
            varClass._id = id;
            varClass.values = [];
            varClass.published = (f.published) ? f.published : false;
            varClass.created_by = req.user.id;
            const topic = await forumClient.addTopic((id+"varClass"), req.user);
            varClass.topic_id = topic._id

            if (f.values){
                for (let i=0; i<f.values.length; i++){
                    let val = f.values[i];
                    if (!val.code){
                        error.push("Value " + i + " code is required");
                    }
                    if (!val.title){
                        error.push("Value " + i + " title is required");
                    }
                    varClass.values.push(val);
                }
            }

            if (error.length > 0){
                console.log(error);
                return res.status(400).json({error: error})
            }
    
        
            varClass.save();
            res.status(201).json(varClass);
        }catch(ex){
            res.status(500).json(ex);
        }
    });

    router.get('/:varClassId', async function(req, res, next){
        try{
            let id = mongoose.Types.ObjectId(req.params.varClassId);
            let varClass = await db.VariableClassification.findOne({_id: id});

            if (!varClass.published){
                if (!req.user){
                    res.status(404);
                    return res.json({error: "Not Found"});
                }
                //check topic exists this checks for user permissions
                const response = await forumClient.getTopic(req.user, (id+"varClass"));
                if (!response || response.length < 1){
                    return res.status(404).json({error: "Not Found"});
                }
            }
            
            res.status(200).json(varClass);
        }catch(ex){
            res.status(500).json({error: ex});
        }
    });

    router.put('/:varClassId', auth.requireLoggedIn, auth.isApprover, async function(req, res, next){
        try{
            let f = {...req.body};
            let error = [];

            //check topic exists this checks for user permissions
            const response = await forumClient.getTopic(req.user, (req.params.varClassId+"varClass"));
            if (!response || response.length < 1){
                return res.status(404).json({error: "Not Found"});
            }
            
            let varClass = {};

            if (f.name !== varClass.name){
                let existing = await db.VariableClassification.find({name: f.name});
                
                console.log("UPDATING VAR CLASS", mongoose.Types.ObjectId(req.params.varClassId), existing[0]._id, (existing[0]._id != req.params.varClassId) );
                
                if (existing.length > 1){
                    error.push("Name must be unique");
                }else if ( (existing.length === 1) && (existing[0]._id != req.params.varClassId) ){
                    error.push("Name must be unique");
                }
                console.log("UPDATING, errors", error, error.length);
            }

            if (f.name){
                varClass.name = f.name;
            }

            if (f.values){
                varClass.values = [];

                for (let i=0; i<f.values.length; i++){
                    let val = f.values[i];
                    if (!val.code){
                        error.push("Value " + i + " code is required");
                    }
                    if (!val.title){
                        error.push("Value " + i + " title is required");
                    }
                    varClass.values.push(val);
                }
            }

            if (typeof(f.published) !== "undefined"){
                varClass.published = (f.published) ? f.published : false;
            }

            if (error.length > 0){
                return res.status(400).json({error: error})
            }
            
            let newV = await db.VariableClassification.updateOne({_id: req.params.varClassId}, varClass);
            newV = await db.VariableClassification.findOne({key: req.params.varClassId});
            res.status(200).json(newV);
        }catch(ex){
            res.status(500).json(ex);
        }
    });

    router.delete('/:varClassId', auth.requireLoggedIn, auth.isApprover, async function(req, res, next){
        try{
            await db.VariableClassification.deleteOne({key: req.params.varClassId});
            res.status(204).send();
        }catch(ex){
            res.status(500).json({error: ex});
        }
    });

    router.get('/:varClassId/comments', auth.requireLoggedIn, async function(req, res, next){
        try{
            if (req.params.varClassId !== 'create'){
                const comments = await getComments (req.params.varClassId, req.user);
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

    router.post('/:varClassId/comments', auth.requireLoggedIn, async function(req, res, next){
        try{
            await addComment (req.params.varClassId, req.user, req.body.content);
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