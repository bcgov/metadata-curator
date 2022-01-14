var buildStatic = function(db, router){
    return router;
}

var buildDynamic = function(db, router, auth, forumClient, cache){
    const log = require('npmlog');
    const mongoose = require('mongoose');

    const util = require('./util');
    const requiredPhase = 2;

    const getRepoById = async function(user, id){
        let record = await db.RepoSchema.findOne({_id: mongoose.Types.ObjectId(id)});
        if (!record){
            return null;
        }
        const response = await forumClient.getTopic(user, record.topic_id);
        if (!response || response.length < 1){
            return null;
        }
        return record;
    }

    const addComment = async (repoId, user, comment) => {
        try {
            let repo = await getRepoById(user, repoId);

            if (repo == null) {
                throw new Error("Invalid repo ID")
            }

            await forumClient.addComment(repo.topic_id, comment, user);
    
            
        } catch(e) {
            console.error(e);
            throw new Error(e.message)
        }
    }
    
    const getComments = async (repoId, user) => {
        try {
            let repo = await getRepoById(user, repoId);
            if (repo == null) {
                throw new Error("Invalid repo ID")
            }
            return await forumClient.getComments (repo.topic_id, user);
        } catch(e) {
            console.error(e);
            throw new Error(e.message)
        }
    }

    const createRepo = async function(user, fields) {
        const id = mongoose.Types.ObjectId();
        const topic = await forumClient.addTopic((id+"repo"), user);
        const repoSchema = new db.RepoSchema;
        repoSchema._id = id;
        repoSchema.name = fields.name;
        if (fields.description){
            repoSchema.description = fields.description
        }
        repoSchema.create_date = new Date();
        repoSchema.created_by = user.id;
        repoSchema.topic_id = topic._id;

        if (fields.gov_allow_publish){
            repoSchema.gov_allow_publish = fields.gov_allow_publish;
        }

        if (fields.aca_allow_publish){
            repoSchema.aca_allow_publish = fields.aca_allow_publish;
        }

        if (fields.gov_approval_needed){
            repoSchema.gov_approval_needed = fields.gov_approval_needed;
        }

        if (fields.aca_approval_needed){
            repoSchema.aca_approval_needed = fields.aca_approval_needed;
        }

        if (fields.in_bc_catalogue){
            repoSchema.in_bc_catalogue = fields.in_bc_catalogue;
        }

        if (fields.data_collection_type){
            repoSchema.data_collection_type = fields.data_collection_type;
        }
    
    
        return await repoSchema.save();
    }
    
    const updateRepo = async function(user, id, body) {
        //check topic exists this checks for user permissions
        const response = await forumClient.getTopic(user, (id+"repo"));
        if (!response || response.length < 1){
            throw new Error('404');
        }

        const fields = {...body};
        var record = {};
        try{
            record = await db.RepoSchema.findOne({_id: mongoose.Types.ObjectId(id)});
        }catch(ex){
            //record doesn't exist
            log.error(ex);
            throw new Error(ex.message);
        }
    
        //record exists
        if (fields.name){
            record.name = fields.name;
        }

        if (fields.description){
            
            record.description = fields.description;
        }

        if (fields.gov_allow_publish){
            record.gov_allow_publish = fields.gov_allow_publish;
        }

        if (fields.aca_allow_publish){
            record.aca_allow_publish = fields.aca_allow_publish;
        }

        if (fields.gov_approval_needed){
            record.gov_approval_needed = fields.gov_approval_needed;
        }

        if (fields.aca_approval_needed){
            record.aca_approval_needed = fields.aca_approval_needed;
        }

        if (fields.in_bc_catalogue){
            record.in_bc_catalogue = fields.in_bc_catalogue;
        }

        if (fields.data_collection_type){
            record.data_collection_type = fields.data_collection_type;
        }
    
        return await record.save();
    }
    
    const listRepositories = async (user, query) => {
        try {
            const topicResponse = await forumClient.getTopics(user, query);
            topics = topicResponse.data.filter(item => item.parent_id);

            const repoIds = topics.map( (item) => {
                let id = item.name;
                if (!id || id.indexOf("repo") === -1){
                    return;
                }
                
                id = id.substring(0,id.length-4);
                let oid = mongoose.Types.ObjectId(id);
                return oid;

            }).filter( (item) => { 
                return (item && String(item).length > 0)
            });

            if(query && query.upload_id) {
                //return await db.RepoSchema.find({data_upload_id: mongoose.Types.ObjectId(query.filterBy)}).sort({ "create_date": 1});
                let data = await db.RepoBranchSchema.find({repo_id: {$in: repoIds}, data_upload_id: query.upload_id}).populate('repo_id').sort({ "create_date": -1});
                if (!data){
                    return [];
                }
                let res = [];
                
                for (let i=0; i<data.length; i++){
                    res.push(data[i].repo_id);
                }
                return res;
                //return await db.RepoSchema.find({_id: {$in: repoIds}}).sort({ "create_date": 1});
            }else{
                return await db.RepoSchema.find({_id: {$in: repoIds}}).sort({ "create_date": -1});
            }
        } catch (e) {
            log.error(e);
            throw new Error(e.message)
        }
    }
    
    router.get('/', async function(req, res, next) {
        //version check
        if (!util.phaseCheck(cache, requiredPhase, db)){
            return res.status(404).send(util.phaseText('GET', 'repos'));
        }
        try{
            let repos = await listRepositories(req.user, req.query);
            res.status(200).json(repos);
        }catch(ex){
            res.status(500).json({error: ex});
        }
    });

    router.post('/', async function(req, res, next){
        //version check
        if (!util.phaseCheck(cache, requiredPhase, db)){
            return res.status(404).send(util.phaseText('POST', 'repos'));
        }
        
        let fields = {...req.body};

        if (!fields.name){
            return res.status(400).json({error: "Name is required"});
        }
    
        try{
            const repo = await createRepo(req.user, fields);
            res.status(201).json({id: repo._id.toString()});
        }catch(ex){
            console.error(ex);
            res.status(500).json({error: "Unknown error"});
        }
    });

    router.put('/:repoId', async function(req, res, next){
        //version check
        if (!util.phaseCheck(cache, requiredPhase, db)){
            return res.status(404).send(util.phaseText('PUT', ('repos/'+req.params.repoId)));
        }
        try{
            const repo = await updateRepo(req.user, req.params.repoId, req.body);
            res.status(200).json(repo);
        }catch(ex){
            res.status(500).json({error: ex});
        }
    });

    router.get('/:repoId/comments', async function(req, res, next){
        try{
            if (req.params.repoId !== 'create'){
                const comments = await getComments (req.params.repoId, req.user);
                return res.json(comments);
            }else{
                return res.json([]);
            }
        }catch(ex){
            res.status(500).json({error: ex});
        }
    });

    router.post('/:repoId/comments', async function(req, res, next){
        try{
            await addComment (req.params.repoId, req.user, req.body.content);
            return res.status(201).json({
                message: 'Comment saved successfully.'
            });
        }catch(ex){
            res.status(500).json({error: ex});
        }
    });

    return router;
}

module.exports = {
    buildStatic: buildStatic,
    buildDynamic: buildDynamic
};