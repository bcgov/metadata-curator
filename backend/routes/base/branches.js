var buildStatic = function(db, router){
    return router;
}

var buildDynamic = function(db, router, auth, forumClient, revisionService, cache){

    let mongoose = require('mongoose');

    let log = require('npmlog');

    const util = require('./util');
    const requiredPhase = 2;

    const addBranch = async function(repoId, type, name, description, upload_id, fields, user) {
        if (typeof(repoId) === "undefined"){
            throw new Error ("repo id is required")
        }

        const id = mongoose.Types.ObjectId();

        const topic = await forumClient.addTopic((id+"branch"), user);
        
        const repoBranchSchema = new db.RepoBranchSchema;
        repoBranchSchema._id = id;
        repoBranchSchema.topic_id = topic._id;
        repoBranchSchema.repo_id = repoId;
        repoBranchSchema.type = type;
        repoBranchSchema.name = name;
        repoBranchSchema.description = description;
        repoBranchSchema.data_upload_id = upload_id;
        repoBranchSchema.create_date = new Date();

        repoBranchSchema.availability = fields.availability;
        repoBranchSchema.variable_classification = fields.variable_classification;
        repoBranchSchema.notes = fields.notes;
        repoBranchSchema.citation = fields.citation;
        repoBranchSchema.short_title = fields.short_title;

        if (user.isApprover){
            repoBranchSchema.published = typeof(fields.published) !== 'undefined' ? fields.published : false;
            repoBranchSchema.faq = fields.faq;
            repoBranchSchema.approved = typeof(fields.approved) !== 'undefined' ? fields.approved : false;
        }
    
        return await repoBranchSchema.save();
    }
    
    const getBranches = async function(user, data_upload_id){
        var q = {};

        if (typeof(data_upload_id) !== "undefined"){
            q.data_upload_id = mongoose.Types.ObjectId(data_upload_id);
        }
        
        let topics = [];
        if (user){
            const topicResponse = await forumClient.getTopics(user, {});
            topics = topicResponse.data.filter(item => item.parent_id);
        }
        
        const branchIds = topics.map( (item) => {
            let id = item.name;
            if (id.indexOf("branch") === -1){
                return "";
            }
            id = id.substring(0,id.length-6);
            let oid = mongoose.Types.ObjectId(id)
            return oid;
        }).filter( item => (item.length > 0) );

        q.$or = [
            { _id: {$in: branchIds} },
            { published: true }
        ]

        let res = await db.RepoBranchSchema.find(q).sort({ create_date: "desc"});
        return res;
    }
    
    const updateBranch = async function(branchId, type, name, description, upload_id, fields, user) {
        const repoBranchSchema = await getBranchById(branchId, req.user);
        const topicResponse = await forumClient.getTopics(user, (repoBranchSchema.topic_id+"branch"));
        if (!topicResponse || topicResponse.length < 1){
            throw new Error('404');
        }

        if (repoBranchSchema.approved){
            throw new Error('approved');
        }

        if (type){
            repoBranchSchema.type = type;
        }
        
        if (name){
            repoBranchSchema.name = name;
        }
    
        if (description){
            repoBranchSchema.description = description;
        }
        
        if (upload_id){
            repoBranchSchema.data_upload_id = upload_id;
        }

        if (fields.availability){
            repoBranchSchema.availability = fields.availability;
        }

        if (fields.variable_classification){
            repoBranchSchema.variable_classification = fields.variable_classification;
        }

        if (fields.notes){
            repoBranchSchema.notes = fields.notes;
        }

        if (fields.citation){
            repoBranchSchema.citation = fields.citation;
        }

        if (fields.short_title){
            repoBranchSchema.short_title = fields.short_title;
        }

        if ( (user.isApprover) && (typeof(fields.published) !== 'undefined') ){
            repoBranchSchema.published = fields.published;
        }

        if ( (user.isApprover) && (typeof(fields.approved) !== 'undefined') ){
            repoBranchSchema.approved = fields.approved;
        }

        if ( (user.isApprover) && (typeof(fields.faq) !== 'undefined') ){
            repoBranchSchema.faq = fields.faq;
        }
        
        return await repoBranchSchema.save();
    }
    
    const getBranchById = async (id, user) => {
        try {
            let res = await db.RepoBranchSchema.findOne({_id: id});
            if (user){
                const topicResponse = await forumClient.getTopics(user, res.topic_id+"branch");
                if (!topicResponse || topicResponse.length < 1){
                    throw new Error('404');
                }
            }else{
                if (!res.published){
                    throw new Error('404');
                }
            }
            res = await db.RepoBranchSchema.findOne({_id: id}).populate('repo_id');
            return res;
        } catch (e) {
            log.error(e);
            throw new Error(e.message)
        }
    }
    
    const deleteBranch = async (id) => {
        const branch = await db.RepoBranchSchema.findOne({_id: id});
        return await db.RepoBranchSchema.deleteOne({_id: id});
    }

    const listBranches = async (repoId) => {
        let id = mongoose.Types.ObjectId(repoId);
        try {
            return await db.RepoBranchSchema.find({repo_id: id}).sort({ "create_date": -1});
        } catch (e) {
            log.error(e);
            throw new Error(e.message)
        }
    }
    
    router.get('/', auth.requireLoggedIn, async function(req, res, next) {
        //version check
        if (!util.phaseCheck(cache, requiredPhase, db)){
            return res.status(404).send(util.phaseText('GET', 'repobranches'));
        }

        const branches = await getBranches(req.user, req.query.data_upload_id);
        res.status(200).json(branches);
    });

    router.get('/:branchId', async function(req, res, next) {
        //version check
        if (!util.phaseCheck(cache, requiredPhase, db)){
            return res.status(404).send(util.phaseText('GET', ('repobranches/'+req.params.branchId)));
        }
        const branch = await getBranchById(req.params.branchId, req.user);
        res.status(200).json(branch);
    });

    router.put('/:branchId', auth.requireLoggedIn, async function(req, res, next) {
        //version check
        if (!util.phaseCheck(cache, requiredPhase, db)){
            return res.status(404).send(util.phaseText('PUT', ('repobranches/'+req.params.branchId)));
        }
        let f = {...req.body};
        try{
            const result = await updateBranch(req.params.branchId, f.type, f.name, f.description, f.upload_id, f, req.user);
        }catch(ex){
            if (ex.message === 'approved'){
                res.status(403).json({error: "Can't edit already published"})
            }else{
                res.status(500).json({error: ex});
            }
        }
        res.status(200).json(result);
    });

    router.delete('/:branchId', auth.requireLoggedIn, auth.requireAdmin, async function(req, res, next) {
        //version check
        if (!util.phaseCheck(cache, requiredPhase, db)){
            return res.status(404).send(util.phaseText('DELETE', ('repobranches/'+req.params.branchId)));
        }
        await deleteBranch(req.params.branchId);
        res.status(200).json({status: "ok"});
    });

    router.post('/:repoId/branches', auth.requireLoggedIn,  async function(req, res, next){
        //version check
        if (!util.phaseCheck(cache, requiredPhase, db)){
            return res.status(404).send(util.phaseText('POST', ('repobranches/'+req.params.repoId+"/branches")));
        }
        let f = {...req.body};
        const repoId = req.params.repoId;

        let error = false;
        if (!f.name){
            error = true;
            error = "Name is required"
        }else if (!f.type){
            error = true;
            error = "Type is required"
        }else if (!f.upload_id){
            error = true;
            error = "Upload id is required";
        }else if (!f.description){
            error = true;
            error = "Description is required";
        }

        if (error){
            return res.status(400).json({error: error});
        }

        try{
            const branch = await addBranch(repoId, f.type, f.name, f.description, f.upload_id, f, req.user);
            res.status(201).json({
                id: branch._id.toString()
            });
        }catch(ex){
            res.status(400).json({e: ex});
        }
    });

    router.get('/:repoId/branches', async function(req, res, next){
        //version check
        if (!util.phaseCheck(cache, requiredPhase, db)){
            return res.status(404).send(util.phaseText('GET', ('repobranches/'+req.params.repoId+"/branches")));
        }

        const repoId = req.params.repoId;
        const branches = await listBranches(repoId);
        res.status(200).json(branches);
    });

    router.post('/:branchId/revisions', auth.requireLoggedIn,  async function(req, res, next) {
        //version check
        if (!util.phaseCheck(cache, requiredPhase, db)){
            return res.status(404).send(util.phaseText('POST', ('repobranches/'+req.params.branchId+"/revisions")));
        }
        let f = {...req.body};
        const branchId = req.params.branchId;
        const branch = await getBranchById(branchId, req.user);
        const rev = await revisionService.createRevisionWithDataPackage(branch, f.change_summary, f.updater, f.descriptor)
    
        res.status(201).json({
            id: rev._id.toString()
        });
    });

    router.get('/:branchId/revisions', async function(req, res, next) {
        //version check
        if (!util.phaseCheck(cache, requiredPhase, db)){
            return res.status(404).send(util.phaseText('GET', ('repobranches/'+req.params.branchId+"/revisions")));
        }
        const branchId = req.params.branchId;
        await getBranchById(branchId, req.user);
        const revisions = await revisionService.listRevisionsByBranch(branchId);
        res.status(200).json(revisions);
    });

    router.put('/:branchId/revisions/:revId', auth.requireLoggedIn,  async function(req, res, next) {
        //version check
        if (!util.phaseCheck(cache, requiredPhase, db)){
            return res.status(404).send(util.phaseText('PUT', ('repobranches/'+req.params.branchId+"/revisions/"+req.params.revId)));
        }
        let f = {...req.body};
        const branchId = req.params.branchId;
        const revId = req.params.revId;
        await getBranchById(branchId, req.user);
        const rev = await revisionService.updateRevision(revId, f.changeSummary, f.updater)
    
        res.status(200).json(rev);
    });

    router.delete('/:branchId/revisions/:revId', auth.requireLoggedIn,  async function(req, res, next) {
        //version check
        if (!util.phaseCheck(cache, requiredPhase, db)){
            return res.status(404).send(util.phaseText('DELETE', ('repobranches/'+req.params.branchId+"/revisions/"+req.params.revId)));
        }
        const branchId = req.params.branchId;
        const revId = req.params.revId;
        await getBranchById(branchId, req.user);
        await revisionService.deleteRevision(revId)
        res.status(204).send();
    });

    return router;
}

module.exports = {
    buildStatic: buildStatic,
    buildDynamic: buildDynamic
};