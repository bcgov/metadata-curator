var buildStatic = function(db, router){
    return router;
}


var buildDynamic = function(db, router, auth, forumClient){
    const mongoose = require('mongoose');

    router.get('/', auth.requireLoggedIn, async function(req, res, next) {

        var q = {};
        const topicResponse = await forumClient.getTopics(req.user, {});
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
        });

        const varClass = await db.VariableClassification.find({$or: [{_id: {$in: varClassIds}}, {published: true}] });

        res.status(200).json(varClass);
    });

    router.post('/', auth.requireLoggedIn, auth.isApprover, async function(req, res, next){
        let f = {...req.body};

        let error = [];
        if (!f.name){
            error.push("Name is required");
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
    
        try{
            varClass.save();
            res.status(201).json(varClass);
        }catch(ex){
            res.status(500).json(ex);
        }
    });

    router.get('/:varClassId', async function(req, res, next){
        let varClass = await db.VariableClassification.findOne({id: req.params.varClassId});

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
    });

    router.put('/:varClassId', auth.requireLoggedIn, auth.isApprover, async function(req, res, next){
        let f = {...req.body};
        let error = [];

        //check topic exists this checks for user permissions
        const response = await forumClient.getTopic(req.user, (req.params.varClassId+"varClass"));
        if (!response || response.length < 1){
            return res.status(404).json({error: "Not Found"});
        }
        
        let varClass = await db.VariableClassification.findOne({key: req.params.varClassId});;
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
        console.log("Updating ", varClass);
    
        try{
            varClass.save();
            res.status(200).json(varClass);
        }catch(ex){
            res.status(500).json(ex);
        }
    });

    router.delete('/:varClassId', auth.requireLoggedIn, auth.isApprover, async function(req, res, next){
        await db.VariableClassification.deleteOne({key: req.params.varClassId});
        res.status(204).send();
    });

    return router;
}

module.exports = {
    buildStatic: buildStatic,
    buildDynamic: buildDynamic
};