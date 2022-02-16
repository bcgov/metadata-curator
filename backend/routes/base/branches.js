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

        let originalGroups = JSON.parse(JSON.stringify(user.groups));
        let originalJWT = user.jwt;
        const config = require('config');

        if (!user.groups.some( (el) => el === config.get('requiredRoleToCreateRequest'))){
            throw new Error("Not permitted to create a branch");
        }

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

        const topic = await forumClient.addTopic((id+"branch"), user);

        if ( (user.isApprover) || (user.isAdmin) ){
            user.groups = JSON.parse(JSON.stringify(originalGroups));
            user.jwt = originalJWT;
        }

        let revision = new db.RevisionSchema();
        revision.old_content = {}
        revision.source_id = id;
        revision.updater = user.id;
        revision.type = "branch";
        revision.revision_number = 0;
        revision.create_date = new Date();
        
        const repoBranchSchema = new db.RepoBranchSchema;
        repoBranchSchema._id = id;
        revision.revise('_id', '', repoBranchSchema._id);
        repoBranchSchema.topic_id = topic._id;
        revision.revise('topic_id', '', repoBranchSchema.topic_id);
        repoBranchSchema.repo_id = repoId;
        revision.revise('repo_id', '', repoBranchSchema.repo_id);
        repoBranchSchema.type = type;
        revision.revise('type', '', repoBranchSchema.type);
        repoBranchSchema.name = name;
        revision.revise('name', '', repoBranchSchema.name);
        repoBranchSchema.description = description;
        revision.revise('description', '', repoBranchSchema.description);
        repoBranchSchema.data_upload_id = upload_id;
        revision.revise('data_upload_id', '', repoBranchSchema.data_upload_id);
        repoBranchSchema.create_date = new Date();
        revision.revise('create_date', '', repoBranchSchema.create_date);
        
        repoBranchSchema.collectionMethod = fields.collectionMethod;
        revision.revise('collectionMethod', '', repoBranchSchema.collectionMethod);
        

        repoBranchSchema.availability = fields.availability;
        revision.revise('availability', '', repoBranchSchema.availability);
        repoBranchSchema.variable_classification = fields.variable_classification;
        revision.revise('variable_classification', '', repoBranchSchema.variable_classification);
        repoBranchSchema.notes = fields.notes;
        revision.revise('notes', '', repoBranchSchema.notes);
        repoBranchSchema.citation = fields.citation;
        revision.revise('citation', '', repoBranchSchema.citation);
        repoBranchSchema.short_title = fields.short_title;
        revision.revise('short_title', '', repoBranchSchema.short_title);

        if ( (user.isApprover) || (user.isAdmin) ){
            repoBranchSchema.published = typeof(fields.published) !== 'undefined' ? fields.published : false;
            revision.revise('published', '', repoBranchSchema.published);
            repoBranchSchema.faq = fields.faq;
            revision.revise('faq', '', repoBranchSchema.faq);
            repoBranchSchema.approved = typeof(fields.approved) !== 'undefined' ? fields.approved : false;
            revision.revise('approved', '', repoBranchSchema.approved);
        }
    
        let r = await repoBranchSchema.save();
        await revision.save();
        return r;
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
        }).filter( item => (String(item).length > 0) );

        q.$or = [
            { _id: {$in: branchIds} },
            { published: true }
        ]

        let res = await db.RepoBranchSchema.find(q).sort({ create_date: "desc"});
        return res;
    }
    
    const updateBranch = async function(branchId, type, name, description, upload_id, fields, user) {
        const repoBranchSchema = await getBranchById(branchId, user);
        const topicResponse = await forumClient.getTopics(user, (repoBranchSchema.topic_id+"branch"));
        if (!topicResponse || topicResponse.length < 1){
            throw new Error('404');
        }

        if (!user.isAdmin && repoBranchSchema.approved){
            throw new Error('approved');
        }

        let existingRevisions = await db.RevisionSchema.find({source_id: mongoose.Types.ObjectId(branchId), type: 'branch'});
        let revision = new db.RevisionSchema();
        revision.old_content = JSON.parse(JSON.stringify(repoBranchSchema));
        revision.source_id = mongoose.Types.ObjectId(branchId);
        revision.updater = user.id;
        revision.type = "branch";
        revision.revision_number = (existingRevisions && existingRevisions.length) ? existingRevisions.length : 0;
        revision.create_date = new Date();

        if (type){
            revision.revise('type', repoBranchSchema.type, type);
            repoBranchSchema.type = type;
        }
        
        if (name){
            revision.revise('name', repoBranchSchema.name, name);
            repoBranchSchema.name = name;
        }
    
        if (description){
            revision.revise('description', repoBranchSchema.description, description);
            repoBranchSchema.description = description;
        }
        
        if (upload_id){
            revision.revise('data_upload_id', repoBranchSchema.data_upload_id, upload_id);
            repoBranchSchema.data_upload_id = upload_id;
        }

        if (fields.availability){
            revision.revise('availability', repoBranchSchema.availability, fields.availability);
            repoBranchSchema.availability = fields.availability;
        }

        if (fields.variable_classification){
            revision.revise('variable_classification', repoBranchSchema.variable_classification, fields.variable_classification);
            repoBranchSchema.variable_classification = fields.variable_classification;
        }

        if (fields.notes){
            revision.revise('notes', repoBranchSchema.notes, fields.notes);
            repoBranchSchema.notes = fields.notes;
        }

        if (fields.citation){
            revision.revise('citation', repoBranchSchema.citation, fields.citation);
            repoBranchSchema.citation = fields.citation;
        }

        if (fields.collectionMethod){
            revision.revise('collectionMethod', repoBranchSchema.collectionMethod, fields.collectionMethod);
            repoBranchSchema.collectionMethod = fields.collectionMethod;
        }

        if (fields.short_title){
            revision.revise('short_title', repoBranchSchema.short_title, fields.short_title);
            repoBranchSchema.short_title = fields.short_title;
        }

        if ( ( (user.isApprover) || (user.isAdmin) ) && (typeof(fields.published) !== 'undefined') ){
            revision.revise('published', repoBranchSchema.published, fields.published);
            repoBranchSchema.published = fields.published;
        }

        if ( ( (user.isApprover) || (user.isAdmin) ) && (typeof(fields.approved) !== 'undefined') ){
            revision.revise('approved', repoBranchSchema.approved, fields.approved);
            repoBranchSchema.approved = fields.approved;
        }

        if ( ( (user.isApprover) || (user.isAdmin) ) && (typeof(fields.faq) !== 'undefined') ){
            revision.revise('faq', repoBranchSchema.faq, fields.faq);
            repoBranchSchema.faq = fields.faq;
        }
        
        let r = await repoBranchSchema.save();
        await revision.save();
        return r;
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

    const listBranches = async (user, repoId) => {
        const topicResponse = await forumClient.getTopics(user, {});
        let topics = topicResponse.data.filter(item => item.parent_id);
        let author_groups = {};
        
        const branchIds = topics.map( (item) => {
            let id = item.name;
            if (!id || id.indexOf("branch") === -1){
                return;
            }
            
            id = id.substring(0,id.length-6);
            let oid = mongoose.Types.ObjectId(id);
            
            author_groups[item._id] = item.author_groups;
            return oid;
    
        }).filter( (item) => { 
            return (item && String(item).length > 0)
        });

        let id = mongoose.Types.ObjectId(repoId);
        try {
            let r = await db.RepoBranchSchema.find({_id: {$in: branchIds}, repo_id: id}).sort({ "create_date": -1});
            if (user.isAdmin || user.isApprover){
                for (let i=0; i<r.length; i++){
                    r[i] = JSON.parse(JSON.stringify(r[i]));
                    r[i].author_groups = author_groups[r[i].topic_id];
                }
            }
            return r;
        } catch (e) {
            log.error(e);
            throw new Error(e.message)
        }
    }

    const addComment = async (branchId, user, comment) => {
        try {
            let branch = await getBranchById(branchId, user);

            if (branch == null) {
                throw new Error("Invalid branch ID")
            }

            await forumClient.addComment(branch.topic_id, comment, user);
    
            
        } catch(e) {
            console.error(e);
            throw new Error(e.message)
        }
    }
    
    const getComments = async (branchId, user) => {
        try {
            if ( (branchId == null) || (typeof(branchId) === "undefined") || (branchId === "undefined") ) {
                throw new Error("Invalid branch ID")
            }
            
            let branch = await getBranchById(branchId, user);
            if (branch == null) {
                throw new Error("Invalid branch ID")
            }
            
            return await forumClient.getComments (branch.topic_id, user);
        } catch(e) {
            console.error(e);
            throw new Error(e.message)
        }
    }
    
    router.get('/', auth.requireLoggedIn, async function(req, res, next) {
        try{
            //version check
            if (!util.phaseCheck(cache, requiredPhase, db)){
                return res.status(404).send(util.phaseText('GET', 'repobranches'));
            }

            const branches = await getBranches(req.user, req.query.data_upload_id);
            res.status(200).json(branches);
        }catch(ex){
            res.status(500).json({error: ex});
        }
    });

    router.get('/:branchId', async function(req, res, next) {
        //version check
        if (!util.phaseCheck(cache, requiredPhase, db)){
            return res.status(404).send(util.phaseText('GET', ('repobranches/'+req.params.branchId)));
        }
        try{
            const branch = await getBranchById(req.params.branchId, req.user);
           res.status(200).json(branch);
        }catch(e){
            res.status(500).json(e);
        }
    });

    router.get('/:branchId/revisions', async function(req, res, next){
        try{
            let revs = await db.RevisionSchema.find({source_id: mongoose.Types.ObjectId(req.params.branchId), type: 'branch'});
            return res.json({revisions: revs});
        }catch(ex){
            res.status(500).json({error: ex});
        }
    });

    router.put('/:branchId/copy-schema', async function(req, res, next){
        //version check
        if (!util.phaseCheck(cache, requiredPhase, db)){
            return res.status(404).send(util.phaseText('GET', ('repobranches/'+req.params.branchId+'/copy-schemna')));
        }
        try{
            let copyTo = req.params.branchId;
            let copyFrom = req.body.copyFrom;

            let original = await db.DataPackageSchema.findOne({version: copyFrom, inferred: false});
            if (original){
                original._id = mongoose.Types.ObjectId();
                original.version = copyTo;
                let newSchema = await db.DataPackageSchema.insertMany(original);
                return res.status(201).json(newSchema);
            }else{
                return res.status(400).json({error: "No such schema to copy: "+copyFrom});
            }

        }catch(e){
            console.log("copy-schema", e);
            res.status(500).json(e);
        }
    });

    router.put('/:branchId', auth.requireLoggedIn, async function(req, res, next) {
        //version check
        if (!util.phaseCheck(cache, requiredPhase, db)){
            return res.status(404).send(util.phaseText('PUT', ('repobranches/'+req.params.branchId)));
        }
        let f = {...req.body};
        try{
            const result = await updateBranch(req.params.branchId, f.type, f.name, f.description, f.data_upload_id, f, req.user);
            res.status(200).json(result);
        }catch(ex){
            if (ex.message === 'approved'){
                res.status(403).json({error: "Can't edit already published"})
            }else{
                console.log("ERROR", ex);
                res.status(500).json({error: ex});
            }
        }
        
    });

    router.delete('/:branchId', auth.requireLoggedIn, auth.requireAdmin, async function(req, res, next) {
        //version check
        if (!util.phaseCheck(cache, requiredPhase, db)){
            return res.status(404).send(util.phaseText('DELETE', ('repobranches/'+req.params.branchId)));
        }
        try{
            if (req.user.isAdmin){
                await deleteBranch(req.params.branchId);
                res.status(200).json({status: "ok"});
            }else{
                res.status(401).json({error: "Not authorized"});
            }
        }catch(ex){
            res.status(500).json({error: ex});
        }
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
            error = "Name is required"
        }else if (!f.type){
            error = "Type is required"
        }else if (!f.description){
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
            console.log("X", ex);
            res.status(400).json({e: ex});
        }
    });

    router.get('/:repoId/branches', async function(req, res, next){
        //version check
        if (!util.phaseCheck(cache, requiredPhase, db)){
            return res.status(404).send(util.phaseText('GET', ('repobranches/'+req.params.repoId+"/branches")));
        }

        try{
            const repoId = req.params.repoId;
            const branches = await listBranches(req.user, repoId);
            res.status(200).json(branches);
        }catch(ex){
            res.status(500).json({error: ex});
        }
    });

    router.get('/:branchId/comments', async function(req, res, next){
        try{
            if (req.params.branchId !== 'create'){
                const comments = await getComments (req.params.branchId, req.user);
                return res.json(comments);
            }
        }catch(e){}
        return res.json([]);
        
    });

    router.post('/:branchId/comments', async function(req, res, next){
        try{
            if (req.params.branchId !== 'create'){
                await addComment (req.params.branchId, req.user, req.body.content);
                return res.status(201).json({
                    message: 'Comment saved successfully.'
                });
            }
        }catch(e){
            res.status(500).json(e);
        }
        
        return res.status(400).json({error: "Cant add comments to a branch that doesn't exist"});
        
    });

    router.post('/:branchId/revisions', auth.requireLoggedIn,  async function(req, res, next) {
        //version check
        if (!util.phaseCheck(cache, requiredPhase, db)){
            return res.status(404).send(util.phaseText('POST', ('repobranches/'+req.params.branchId+"/revisions")));
        }
        try{
            let f = {...req.body};
            const branchId = req.params.branchId;
            const branch = await getBranchById(branchId, req.user);
            const rev = await revisionService.createRevisionWithDataPackage(branch, f.change_summary, f.updater, f.descriptor)
        
            res.status(201).json({
                id: rev._id.toString()
            });
        }catch(ex){
            res.status(500).json({error: ex});
        }
    });

    router.get('/:branchId/revisions', async function(req, res, next) {
        //version check
        if (!util.phaseCheck(cache, requiredPhase, db)){
            return res.status(404).send(util.phaseText('GET', ('repobranches/'+req.params.branchId+"/revisions")));
        }
        try{
            const branchId = req.params.branchId;
            await getBranchById(branchId, req.user);
            const revisions = await revisionService.listRevisionsByBranch(branchId);
            res.status(200).json(revisions);
        }catch(ex){
            res.status(500).json({error: ex});
        }
    });

    router.put('/:branchId/revisions/:revId', auth.requireLoggedIn,  async function(req, res, next) {
        //version check
        if (!util.phaseCheck(cache, requiredPhase, db)){
            return res.status(404).send(util.phaseText('PUT', ('repobranches/'+req.params.branchId+"/revisions/"+req.params.revId)));
        }
        try{
            let f = {...req.body};
            const branchId = req.params.branchId;
            const revId = req.params.revId;
            await getBranchById(branchId, req.user);
            const rev = await revisionService.updateRevision(revId, f.changeSummary, f.updater)
        
            res.status(200).json(rev);
        }catch(ex){
            res.status(500).json({error: ex});
        }
    });

    router.delete('/:branchId/revisions/:revId', auth.requireLoggedIn,  async function(req, res, next) {
        //version check
        if (!util.phaseCheck(cache, requiredPhase, db)){
            return res.status(404).send(util.phaseText('DELETE', ('repobranches/'+req.params.branchId+"/revisions/"+req.params.revId)));
        }
        try{
            const branchId = req.params.branchId;
            const revId = req.params.revId;
            await getBranchById(branchId, req.user);
            await revisionService.deleteRevision(revId)
            res.status(204).send();
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