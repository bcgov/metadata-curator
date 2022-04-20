var buildStatic = function(db, router){
    return router;
}

var buildDynamic = function(db, router, auth, forumClient, cache){

    let mongoose = require('mongoose');

    let log = require('npmlog');

    const util = require('./util');
    const requiredPhase = 2;
    const bcdcPhase = 3;

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
        }else if (user.isApprover){
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
            repoBranchSchema.data_upload_id = upload_id;
            revision.revise('data_upload_id', '', repoBranchSchema.data_upload_id);  
            repoBranchSchema.published = typeof(fields.published) !== 'undefined' ? fields.published : false;
            revision.revise('published', '', repoBranchSchema.published);
            repoBranchSchema.faq = fields.faq;
            revision.revise('faq', '', repoBranchSchema.faq);
            repoBranchSchema.approved = typeof(fields.approved) !== 'undefined' ? fields.approved : false;
            revision.revise('approved', '', repoBranchSchema.approved);
        }

        repoBranchSchema.instructions = typeof(fields.instructions) !== 'undefined' ? fields.instructions : "";
        revision.revise('instructions', '', repoBranchSchema.instructions);

        repoBranchSchema.inclusions = typeof(fields.inclusions) !== 'undefined' ? fields.inclusions : "";
        revision.revise('inclusions', '', repoBranchSchema.inclusions);

        repoBranchSchema.exclusions = typeof(fields.exclusions) !== 'undefined' ? fields.exclusions : "";
        revision.revise('exclusions', '', repoBranchSchema.exclusions);

        repoBranchSchema.quality = typeof(fields.quality) !== 'undefined' ? fields.quality : "";
        revision.revise('quality', '', repoBranchSchema.quality);

        repoBranchSchema.delta_over_time = typeof(fields.delta_over_time) !== 'undefined' ? fields.delta_over_time : "";
        revision.revise('delta_over_time', '', repoBranchSchema.delta_over_time);

        repoBranchSchema.additional_info = typeof(fields.additional_info) !== 'undefined' ? fields.additional_info : "";
        revision.revise('additional_info', '', repoBranchSchema.additional_info);

        repoBranchSchema.references = typeof(fields.references) !== 'undefined' ? fields.references : "";
        revision.revise('references', '', repoBranchSchema.references);

        repoBranchSchema.keywords = typeof(fields.keywords) !== 'undefined' ? fields.keywords : "";
        revision.revise('keywords', '', repoBranchSchema.keywords);

        repoBranchSchema.more_information = typeof(fields.more_information) !== 'undefined' ? fields.more_information : "";
        revision.revise('more_information', '', repoBranchSchema.more_information);
    
        let r = await repoBranchSchema.save();
        await revision.save();
        return r;
    }
    
    const getBranches = async function(user, data_upload_id){
        var q = {};

        if (typeof(data_upload_id) !== "undefined"){
            q.data_upload_id = (data_upload_id === 'null') ? null : mongoose.Types.ObjectId(data_upload_id);
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
        let repoBranchSchema = await getBranchById(branchId, user);
        const topicResponse = await forumClient.getTopics(user, (repoBranchSchema.topic_id+"branch"));
        if (!topicResponse || topicResponse.length < 1){
            throw new Error('404');
        }

        if (!user.isAdmin && !user.isApprover && repoBranchSchema.approved){
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
        
        if (user.isAdmin || user.isApprover){
            if (upload_id){
                revision.revise('data_upload_id', repoBranchSchema.data_upload_id, upload_id);
                repoBranchSchema.data_upload_id = upload_id;
            }else if (fields.data_upload_id){
                revision.revise('data_upload_id', repoBranchSchema.data_upload_id, fields.data_upload_id);
                repoBranchSchema.data_upload_id = fields.data_upload_id;
            }
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

        if (fields.instructions){
            revision.revise('instructions', repoBranchSchema.instructions, fields.instructions);
            repoBranchSchema.instructions = fields.instructions;
        }

        if (fields.inclusions){
            revision.revise('inclusions', repoBranchSchema.inclusions, fields.inclusions);
            repoBranchSchema.inclusions = fields.inclusions;
        }

        if (fields.exclusions){
            revision.revise('exclusions', repoBranchSchema.exclusions, fields.exclusions);
            repoBranchSchema.exclusions = fields.exclusions;
        }

        if (fields.quality){
            revision.revise('quality', repoBranchSchema.quality, fields.quality);
            repoBranchSchema.quality = fields.quality;
        }

        if (fields.delta_over_time){
            revision.revise('delta_over_time', repoBranchSchema.delta_over_time, fields.delta_over_time);
            repoBranchSchema.delta_over_time = fields.delta_over_time;
        }

        if (fields.additional_info){
            revision.revise('additional_info', repoBranchSchema.additional_info, fields.additional_info);
            repoBranchSchema.additional_info = fields.additional_info;
        }

        if (fields.references){
            revision.revise('references', repoBranchSchema.references, fields.references);
            repoBranchSchema.references = fields.references;
        }

        if (fields.keywords){
            revision.revise('keywords', repoBranchSchema.keywords, fields.keywords);
            repoBranchSchema.keywords = fields.keywords;
        }

        if (fields.more_information){
            revision.revise('more_information', repoBranchSchema.more_information, fields.more_information);
            repoBranchSchema.more_information = fields.more_information;
        }
        
        //if change_summary is set there is at least one change
        if (revision.change_summary){
            await db.RepoBranchSchema.updateOne({_id: mongoose.Types.ObjectId(branchId)}, repoBranchSchema)
            await revision.save();
        }
        return repoBranchSchema;
    }
    
    const getBranchById = async (id, user) => {
        try {
            let res = await db.RepoBranchSchema.findOne({_id: id});
            let topicResponse = null;;
            if (user){
                topicResponse = await forumClient.getTopics(user, {name: res._id+"branch"});
                if (!topicResponse || !topicResponse.data || topicResponse.data.length < 1){
                    throw new Error('404');
                }
            }else{
                if (!res.published){
                    throw new Error('404');
                }
            }
            res = await db.RepoBranchSchema.findOne({_id: id}).populate('repo_id');
            if (user && (user.isApprover || user.isAdmin) ){
                res = JSON.parse(JSON.stringify(res));
                res.author_groups = topicResponse.data[0].author_groups;
            }
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
            if (user && (user.isAdmin || user.isApprover) ){
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
            console.error(ex);
            res.status(400).json({e: ex.message});
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

    router.post('/:branchId/bcdc', auth.requireLoggedIn, auth.isApprover, async function(req, res, next){
        const config = require('config');
        try{
            //version check
            if (!util.phaseCheck(cache, bcdcPhase, db)){
                return res.status(404).send(util.phaseText('GET', ('repobranches/'+req.params.repoId+"/bcdc")));
            }
            if (req.params.branchId === 'create'){
                return res.status(400).json({error: "The branch must be saved previously"});
            }
            if (!config.has('bcdc')){
                return res.status(400).json({error: "Metadata Curator is not hooked up to a catalogue"});
            }

            let body = req.body;
            if (!body.accessKey){
                return res.status(400).json({error: "You must enter your access key to use your api key"});
            }

            let existing = await db.User.findOne({email: req.user.email});
            let branch = await db.RepoBranchSchema.findOne({_id: req.params.branchId});

            if (!branch){
                return res.status(400).json({error: "No such branch " + req.params.branchId});
            }

            let repo = await db.RepoSchema.findOne({_id: branch.repo_id});
            
            if (!repo){
                return res.status(400).json({error: "Somehow branch does not have a repo"});
            }

            let providedSchema = await db.DataPackageSchema.findOne({version: branch._id, inferred: false});
            
            if (!providedSchema){
                return res.status(400).json({error: "Somehow branch does not have a repo"});
            }

            // let inferredSchema = await db.DataPackageSchema.findOne({version: branch._id, inferred: true});

            // if (!inferredSchema){
            //     return res.status(400).json({error: "Sorry we can't find your user record"});
            // }

            let upload = await db.DataUploadSchema.findOne({_id: branch.data_upload_id});

            if (!upload){
                return res.status(400).json({error: "Sorry we can't find your upload"});
            }

            if ( (existing.bcdc_apiKey) && (!existing.bcdc_accessKey) ){
                return res.status(400).json({error: "You have not configured your account to use the bcdc, enter your api and access key on your profile page"});
            }

            var md5 = require('md5'); 
            let hashedKey = md5(body.accessKey);
            if (hashedKey !== existing.bcdc_accessKey){
                return res.status(403).json({error: "Your access key did not match your account"});
            }


            var CryptoJS = require("crypto-js");
            // Decrypt
            let apiKey  = CryptoJS.AES.decrypt(existing.bcdc_apiKey, body.accessKey.toString()).toString(CryptoJS.enc.Utf8);

            const axios = require('axios');
            const axiosConfig = {
                headers: {'Authorization': apiKey},
                
                validateStatus: function(){ return true; }
            }

            //this is how to get the bcdc schema, it can technically change
            // let schemaUrl = config.get('bcdc');
            // schemaUrl += schemaUrl[schemaUrl.length-1] === "/" ? '' : "/";
            // schemaUrl += "api/3/action/scheming_dataset_schema_show?type=bcdc_dataset"
            // let schemaResp = await axios.get(schemaUrl, axiosConfig);

            let ckanDataset = {};
            if (!repo.name){
                return res.status(400).json({error: "Dataset name is required for bcdc publishing"});
            }
            ckanDataset.title = 'Metadata for ' + repo.name.trim();
            ckanDataset.name = ckanDataset.title.toLowerCase().replace(/ /g, "-");

            if (!repo.ministry_organization){
                return res.status(400).json({error: "Dataset Ministry / Organization is required for bcdc publishing"});
            }

            //need guid for owner org
            let orgUrl = config.get('bcdc');
            orgUrl += orgUrl[orgUrl.length-1] === "/" ? '' : "/";
            orgUrl += "api/3/action/organization_show?id=" + repo.ministry_organization.replace(/ /g, "-").toLowerCase();
            let ckanOrgRes = await axios.get(orgUrl, axiosConfig);

            if (!ckanOrgRes || !ckanOrgRes.data || !ckanOrgRes.data.result || !ckanOrgRes.data.result.id){
                return res.status(400).json({error: "Could not find organization for '"+repo.ministry_organization+"' in catalogue"});
            }
            ckanDataset.owner_org = ckanOrgRes.data.result.id;

            if (!repo.description){
                return res.status(400).json({error: "Dataset description is required for bcdc publishing"});
            }

            ckanDataset.notes = repo.description;
            ckanDataset.license_id = 22; //Access Only
            
            let contacts = [{
                name: "Data Innovation Program",
                email: "data@gov.bc.ca",
                org: "d8e38fa3-e522-4d65-9ae1-b1402dd342c3", // data-innovation-program-dip
                //org: "49e9b9e2-9007-4827-b974-e506b529dafe", // data-innovation-program-dip
                role: "distributor",
                displayed: true,

            }];

            ckanDataset['contacts'] = JSON.stringify(contacts);

            ckanDataset.purpose = "This record describes the fields (variables) in a collection of administrative data files ";
            ckanDataset.purpose += "created for statistical analysis. Access to the data in this record is granted through the ";
            ckanDataset.purpose += "Data Innovation Program. For more information about the program please visit "
            ckanDataset.purpose += "[https://www2.gov.bc.ca/gov/content?id=2F6E3BF426034EDBA62F3F016EE2313D](https://www2.gov.bc.ca/gov/content?id=2F6E3BF426034EDBA62F3F016EE2313D)";

            if (branch.quality){
                ckanDataset.data_quality = branch.quality;
            }

            let files = providedSchema.resources;
            
            ckanDataset.lineage_statement = "The data was extracted from the ";
            ckanDataset.lineage_statement += repo.ministry_organization;
            ckanDataset.lineage_statement += " and provided to the Data Innovation Program for use and stewardship";
            

            if (branch.more_information){
                let desc = branch.more_information
                let pos = desc.lastIndexOf("/");
                if ( (pos !== -1) && ((pos+1) < desc.length) ){
                    desc = desc.substring(pos+1);
                }
                desc.replace(/-/g, " ");
                desc[0] = desc[0].toUpperCase();
                let more_info = [{
                    description: desc,
                    url: branch.more_information
                }];
                ckanDataset.more_info = JSON.stringify(more_info);
            }

            ckanDataset.security_class = "PROTECTED B";
            ckanDataset.view_audience = "Named users";
            ckanDataset.download_audience = "Not downloadable";
            ckanDataset.metadata_visibility = "Public";
            ckanDataset.tag_string = branch.keywords.replace(/, /g, ",");

            ckanDataset.publish_state = "DRAFT";

            ckanDataset.resource_status = "onGoing"; //???

            let recordDates = [
                {
                    type: "Created",
                    date: (new Date()).toISOString().split('T')[0]//upload.data_create_date.toISOString().split('T')[0]
                }
            ]
            ckanDataset['dates'] = JSON.stringify(recordDates);

            let origRecord = branch.bcdc_record;

            if (origRecord){
                ckanDataset.id = origRecord.substring(origRecord.lastIndexOf('/')+1);
                ckanDataset.resources = [];
            }

            let url = config.get('bcdc');
            url += url[url.length-1] === "/" ? '' : "/";
            url += "api/3/action/"
            url += origRecord ? "package_update" : "package_create";

            let ckanRes = await axios.post(url, ckanDataset, axiosConfig);

            if (!ckanRes || !ckanRes.data || !ckanRes.data.result || !ckanRes.data.result.id){
                let rv = {
                    error: "Failed to create dataset"
                };
                if (ckanRes.data){
                    rv[ex] = JSON.stringify(ckanRes.data)
                };
                return res.status(500).json(rv);
            }

            let datasetId = ckanRes.data.result.id

            let recordUrl = config.get('bcdc');
            recordUrl += recordUrl[recordUrl.length-1] === "/" ? '' : "/";
            recordUrl += "dataset/"+datasetId;
            branch.bcdc_record = recordUrl
            try{
                await branch.save();
            }catch(e){
                return res.status(500).json({error: "Failed to save branch with catalogue dataset id" + datasetId, ex: e.message});
            }

            
            let errors = [];

            for (let i=0; i<files.length; i++){
                var FormData = require('form-data');
                let ckanResource = new FormData();
                let file = JSON.parse(JSON.stringify(files[i]));
                ckanResource.append('name', file.name);
                ckanResource.append('bcdc_type', "document");
                if (file.description){
                    ckanResource.append('description', file.description);
                }
                ckanResource.append('resource_update_cycle', "annually");
                
                let temporal_extent = {};
                if (file.temporal_start){
                    temporal_extent.beginning_date = file.temporal_start;
                }
                if (file.temporal_end){
                    temporal_extent.end_date = file.temporal_end;
                }

                if (Object.keys(temporal_extent).length > 0){
                    ckanResource.append('temporal_extent', JSON.stringify(temporal_extent));
                }

                ckanResource.append('isUrl', 'false');

                const tableSchemaBlackList = ['notes', 'highlight'];
                
                if (file.tableSchema && file.tableSchema.fields){
                    for (let j=0; j<file.tableSchema.fields.length; j++){
                        for (let k=0; k<tableSchemaBlackList.length; k++){
                            delete file.tableSchema.fields[j][tableSchemaBlackList[k]];
                        }
                    }
                }
                
                
                let jsonFileString = JSON.stringify(file.tableSchema);
                let jsonFile = Buffer.from(jsonFileString, 'utf8');
                ckanResource.append('upload', jsonFile, {
                    filename: file.name+"-schema.json",
                    contentType: 'application/json',
                });

                //ckanResource.append('format', "csv");
                ckanResource.append('format', "json");

                ckanResource.append('resource_storage_location', "catalogue data store");

                ckanResource.append('json_table_schema', jsonFileString);
                ckanResource.append('resource_type', "data");
                ckanResource.append('resource_access_method', "direct access");
                ckanResource.append('package_id', datasetId);

                let url = config.get('bcdc');
                url += url[url.length-1] === "/" ? '' : "/";
                url += "api/3/action/"
                url += /*origRecord ? "resource_update" : */"resource_create";
                let options = {
                    url: url,
                    method: "POST",
                    headers: {
                        'Content-Type': ckanResource.getHeaders()['content-type'],
                        'Authorization': apiKey
                    },
                    withCredentials: true,
                    data: ckanResource.getBuffer(),
                    validateStatus: function(){ return true; }
                };
                
                let ckanResRes = await axios(options);

                if (!ckanResRes || !ckanResRes.data || !ckanResRes.data.result || !ckanResRes.data.result.id){
                    errors.push("Failed to create resource " + file.name + " " + JSON.stringify(ckanResRes.data.error));
                }

            }

            return res.status(200).json({url: branch.bcdc_record, resourceErrors: errors});
            
        }catch(e){
            console.log("bcdc e", e);
            res.status(500).json(e);
        }
    });

    return router;
}

module.exports = {
    buildStatic: buildStatic,
    buildDynamic: buildDynamic
};