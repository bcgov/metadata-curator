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
        const repoSchema = new db.RepoSchema;
        repoSchema._id = id;
        repoSchema.name = fields.name;

        let revision = new db.RevisionSchema();
        revision.old_content = {};
        revision.source_id = id;
        revision.updater = user.id;
        revision.type = "repo";
        revision.revision_number = 0;
        revision.create_date = new Date();
        revision.revise('name', '', fields.name);
        

        if (fields.description){
            revision.revise('description', '', fields.description);
            repoSchema.description = fields.description
        }
        const config = require('config');

        if (!user.groups.some( (el) => el === config.get('requiredRoleToCreateRequest'))){
            throw new Error("Not permitted to create an repo");
        }

        let originalGroups = JSON.parse(JSON.stringify(user.groups));
        let originalJWT = user.jwt;

        if (( (user.isApprover) || (user.isAdmin) ) && !fields.providerGroup){
            throw new Error("Data Approvers must provide a data provider group");
        }else if ( (user.isApprover) || (user.isAdmin) ){
            if (!user.groups.some( (el) => el === fields.providerGroup) ){
                throw new Error("Data Approvers must select a data provider group they belong to");
            }
        }

        if ( (user.isApprover) || (user.isAdmin) ){
            user.groups = [];
            // if (user.organization){
            //     user.groups.push(user.organization);
            // }
            
            user.groups.push(config.get('requiredRoleToCreateRequest'));   
            user.groups.push(fields.providerGroup);
            
            var jwtlib = require('jsonwebtoken');
            user.jwt = jwtlib.sign(user, config.get('jwtSecret'));
        }

        const topic = await forumClient.addTopic((id+"repo"), user);

        if ( (user.isApprover) || (user.isAdmin) ){
            user.groups = JSON.parse(JSON.stringify(originalGroups));
            user.jwt = originalJWT;
        }

        repoSchema.create_date = new Date();
        revision.revise('create_date', '', repoSchema.create_date);
        repoSchema.created_by = user.id;
        revision.revise('created_by', '', repoSchema.created_by);
        repoSchema.topic_id = topic._id;
        revision.revise('topic_id', '', repoSchema.topic_id);

        repoSchema.ministry_organization = fields.ministry_organization
        revision.revise('ministry_organization', '', fields.ministry_organization);

        if (fields.gov_allow_publish){
            revision.revise('gov_allow_publish', '', fields.gov_allow_publish);
            repoSchema.gov_allow_publish = fields.gov_allow_publish;
        }

        if (fields.aca_allow_publish){
            revision.revise('aca_allow_publish', '', fields.aca_allow_publish);
            repoSchema.aca_allow_publish = fields.aca_allow_publish;
        }

        if (fields.gov_approval_needed){
            revision.revise('gov_approval_needed', '', fields.gov_approval_needed);
            repoSchema.gov_approval_needed = fields.gov_approval_needed;
        }

        if (fields.aca_approval_needed){
            revision.revise('aca_approval_needed', '', fields.aca_approval_needed);
            repoSchema.aca_approval_needed = fields.aca_approval_needed;
        }

        if (fields.in_bc_catalogue){
            revision.revise('in_bc_catalogue', '', fields.in_bc_catalogue);
            repoSchema.in_bc_catalogue = fields.in_bc_catalogue;
        }

        if (fields.data_collection_type){
            revision.revise('data_collection_type', '', fields.data_collection_type);
            repoSchema.data_collection_type = fields.data_collection_type;
        }
    
    
        let r = await repoSchema.save();
        await revision.save();
        return r;
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

        let existingRevisions = await db.RevisionSchema.find({source_id: mongoose.Types.ObjectId(id), type: 'repo'});
        let revision = new db.RevisionSchema();
        revision.old_content = JSON.parse(JSON.stringify(record));
        revision.source_id = mongoose.Types.ObjectId(id);
        revision.updater = user.id;
        revision.type = "repo";
        revision.revision_number = (existingRevisions && existingRevisions.length) ? existingRevisions.length : 0;
        revision.create_date = new Date();
    
        //record exists
        if (fields.name){
            revision.revise('name', record.name, fields.name);
            record.name = fields.name;
        }

        if (fields.description){
            revision.revise('description', record.description, fields.description);
            record.description = fields.description;
        }

        if (fields.gov_allow_publish){
            revision.revise('gov_allow_publish', record.gov_allow_publish, fields.gov_allow_publish);
            record.gov_allow_publish = fields.gov_allow_publish;
        }

        if (fields.aca_allow_publish){
            revision.revise('aca_allow_publish', record.aca_allow_publish, fields.aca_allow_publish);
            record.aca_allow_publish = fields.aca_allow_publish;
        }

        if (fields.gov_approval_needed){
            revision.revise('gov_approval_needed', record.gov_approval_needed, fields.gov_approval_needed);
            record.gov_approval_needed = fields.gov_approval_needed;
        }

        if (fields.aca_approval_needed){
            revision.revise('aca_approval_needed', record.aca_approval_needed, fields.aca_approval_needed);
            record.aca_approval_needed = fields.aca_approval_needed;
        }

        if (fields.in_bc_catalogue){
            revision.revise('in_bc_catalogue', record.in_bc_catalogue, fields.in_bc_catalogue);
            record.in_bc_catalogue = fields.in_bc_catalogue;
        }

        if (fields.data_collection_type){
            revision.revise('data_collection_type', record.data_collection_type, fields.data_collection_type);
            record.data_collection_type = fields.data_collection_type;
        }

        if (fields.ministry_organization){
            revision.revise('ministry_organization', record.ministry_organization, fields.ministry_organization);
            record.ministry_organization = fields.ministry_organization
        }
    
        let r = {};
        //if change_summary is set there is at least one change
        if (revision.change_summary){
            r = await record.save();
            await revision.save();
        }
        return r;
    }
    
    const listRepositories = async (user, query) => {
        try {
            const topicResponse = await forumClient.getTopics(user, {});
            let topics = topicResponse.data.filter(item => item.parent_id);

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
            console.log(ex);
            res.status(500).json({error: ex});
        }
    });

    router.get('/:repoId/revisions', async function(req, res, next){
        try{
            let revs = await db.RevisionSchema.find({source_id: mongoose.Types.ObjectId(req.params.repoId), type: 'repo'});
            return res.json({revisions: revs});
        }catch(ex){
            console.log(ex);
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