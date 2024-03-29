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
            throw new Error("Not permitted to create a repo");
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

        //added may 11 2022
        if (typeof(fields.sector) !== 'undefined'){
            revision.revise('sector', '', fields.sector);
            repoSchema.sector = fields.sector;
        }
        if (typeof(fields.data_type) !== 'undefined'){
            revision.revise('data_type', '', fields.data_type);
            repoSchema.data_type = fields.data_type;
        }
        if (typeof(fields.restrictions_comments) !== 'undefined'){
            revision.revise('restrictions_comments', '', fields.restrictions_comments);
            repoSchema.restrictions_comments = fields.restrictions_comments;
        }
        if (typeof(fields.contact) !== 'undefined'){
            revision.revise('contact', '', fields.contact);
            repoSchema.contact = fields.contact;
        }
        if (typeof(fields.refresh_schedule) !== 'undefined'){
            revision.revise('refresh_schedule', '', fields.refresh_schedule);
            repoSchema.refresh_schedule = fields.refresh_schedule;
        }
        if (typeof(fields.lifecycle_status) !== 'undefined'){
            revision.revise('lifecycle_status', '', fields.lifecycle_status);
            repoSchema.lifecycle_status = fields.lifecycle_status;
        }

        if (fields.lifecycle_dates && Array.isArray(fields.lifecycle_dates)){
            let valid = true;
            
            for (let i=0; i<fields.lifecycle_dates.length; i++){
                if (fields.lifecycle_dates[i].type !== 'comment'){
                    fields.lifecycle_dates[i].date_comments = new Date(fields.lifecycle_dates[i].date_comments);
                }
            }
            if (valid){
                revision.revise('lifecycle_dates', '', fields.lifecycle_dates);
                repoSchema.lifecycle_dates = fields.lifecycle_dates;
            }
        }
        //done fields added may 11 2022

        //fields added oct 11 2022
        if (typeof(fields.refresh_status) !== 'undefined'){
            revision.revise('refresh_status', '', fields.refresh_status);
            repoSchema.refresh_status = fields.refresh_status;
        }
        //done fields added oct 11 2022
    
    
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
        if ( typeof(fields.name) !== 'undefined' ){
            revision.revise('name', record.name, fields.name);
            record.name = fields.name;
        }

        if ( typeof(fields.description) !== 'undefined' ){
            revision.revise('description', record.description, fields.description);
            record.description = fields.description;
        }

        if ( typeof(fields.gov_allow_publish) !== 'undefined'){
            revision.revise('gov_allow_publish', record.gov_allow_publish, fields.gov_allow_publish);
            record.gov_allow_publish = fields.gov_allow_publish;
        }

        if ( typeof(fields.aca_allow_publish) !== 'undefined'){
            revision.revise('aca_allow_publish', record.aca_allow_publish, fields.aca_allow_publish);
            record.aca_allow_publish = fields.aca_allow_publish;
        }

        if ( typeof(fields.gov_approval_needed) !== 'undefined'){
            revision.revise('gov_approval_needed', record.gov_approval_needed, fields.gov_approval_needed);
            record.gov_approval_needed = fields.gov_approval_needed;
        }

        if ( typeof(fields.aca_approval_needed) !== 'undefined'){
            revision.revise('aca_approval_needed', record.aca_approval_needed, fields.aca_approval_needed);
            record.aca_approval_needed = fields.aca_approval_needed;
        }

        if ( typeof(fields.in_bc_catalogue) !== 'undefined'){
            revision.revise('in_bc_catalogue', record.in_bc_catalogue, fields.in_bc_catalogue);
            record.in_bc_catalogue = fields.in_bc_catalogue;
        }

        if (typeof(fields.data_collection_type) !== 'undefined'){
            revision.revise('data_collection_type', record.data_collection_type, fields.data_collection_type);
            record.data_collection_type = fields.data_collection_type;
        }

        if ( (!fields.ministry_organization) && (!record.ministry_organization) ){
            throw new Error("Ministry / Organization is required");
        }

        if (typeof(fields.ministry_organization) !== 'undefined'){
            revision.revise('ministry_organization', record.ministry_organization, fields.ministry_organization);
            record.ministry_organization = fields.ministry_organization
        }

        //added may 11 2022
        if (typeof(fields.sector) !== 'undefined'){
            revision.revise('sector', record.sector, fields.sector);
            record.sector = fields.sector;
        }
        if (typeof(fields.data_type) !== 'undefined'){
            revision.revise('data_type', record.data_type, fields.data_type);
            record.data_type = fields.data_type;
        }
        if (typeof(fields.restrictions_comments) !== 'undefined'){
            revision.revise('restrictions_comments', record.restrictions_comments, fields.restrictions_comments);
            record.restrictions_comments = fields.restrictions_comments;
        }
        if (typeof(fields.contact) !== 'undefined'){
            revision.revise('contact', record.contact, fields.contact);
            record.contact = fields.contact;
        }
        if (typeof(fields.refresh_schedule) !== 'undefined'){
            revision.revise('refresh_schedule', record.refresh_schedule, fields.refresh_schedule);
            record.refresh_schedule = fields.refresh_schedule;
        }
        if (typeof(fields.lifecycle_status) !== 'undefined'){
            revision.revise('lifecycle_status', record.lifecycle_status, fields.lifecycle_status);
            record.lifecycle_status = fields.lifecycle_status;
        }

        if (fields.lifecycle_dates && Array.isArray(fields.lifecycle_dates)){
            let valid = true;
            
            for (let i=0; i<fields.lifecycle_dates.length; i++){
                if (fields.lifecycle_dates[i].type !== 'comment'){
                    fields.lifecycle_dates[i].date_comments = new Date(fields.lifecycle_dates[i].date_comments);
                }
            }
            if (valid){
                revision.revise('lifecycle_dates', record.lifecycle_dates, fields.lifecycle_dates);
                record.lifecycle_dates = fields.lifecycle_dates;
            }
        }
        //done fields added may 11 2022

        //fields added oct 11 2022
        if (typeof(fields.refresh_status) !== 'undefined'){
            revision.revise('refresh_status', '', fields.refresh_status);
            record.refresh_status = fields.refresh_status;
        }
        //done fields added oct 11 2022
    
        let r = {};
        //if change_summary is set there is at least one change
        if (revision.change_summary){
            r = await record.save();
            await revision.save();
        }
        return r;
    }

    const listRepositoriesEditionFull = async (user, query) => {
      let topicResponse = false;
      let repoIds = [];//await publishedRepositories();
      let authorGroupsLookup = {};
      let topics = [];
        try {
          if (user) {
            topicResponse = await forumClient.getTopics(user, {});
            topics = topicResponse.data.filter(item => item.parent_id);
          }

            repoIds = repoIds.concat(topics.map( (item) => {
                let id = item.name;
                if (!id || id.indexOf("repo") === -1){
                    return;
                }
                
                id = id.substring(0,id.length-4);
                let oid = id;
                return oid;

            }).filter( (item) => { 
                return (item && item.length > 0)
            }));

            const branchIds = topics.map( (item) => {
                let id = item.name;
                if (!id || id.indexOf("branch") === -1){
                    return;
                }
                
                id = id.substring(0,id.length-6);
                let oid = mongoose.Types.ObjectId(id);
                return oid;

            }).filter( (item) => { 
                return (item && String(item).length > 0)
            });
            
            //let data = await db.RepoBranchSchema.find({repo_id: {$in: repoIds}, data_upload_id: query.upload_id}).populate('repo_id').sort({ "create_date": -1});
            let topQ = {inferred: {$in: ['false', false, null]}, version: {$in: branchIds}};
            let fullDPS = await db.DataPackageSchema.find(topQ).populate({
                path: 'version', 
                populate: 'repo_id',
            });
            
            fullDPS = fullDPS.filter( (item) => {
              if (item && item.version && item.version.repo_id && item.version.repo_id._id){
                  let id = String(item.version.repo_id._id);
                  return (item && repoIds.indexOf(id) !== -1);
              }
              return false;
            });

            for (let i=0; i<topics.length; i++){
                authorGroupsLookup[topics[i]._id] = topics[i].author_groups;
            }

            for (let i=0; i<fullDPS.length; i++){
                        
                if (fullDPS[i].version && fullDPS[i].version.topic_id){
                    let res = fullDPS[i];
                    try{
                        res = JSON.parse(JSON.stringify(fullDPS[i]));
                    }catch(e){}
                    let topicStr = res.version.topic_id.toString();
                    res.version.author_groups = authorGroupsLookup[topicStr];
                    res.version.providerGroup = authorGroupsLookup[topicStr];
                    fullDPS[i] = res;
                }

                if (fullDPS[i].version && fullDPS[i].version.repo_id && fullDPS[i].version.repo_id.topic_id){
                    let res = fullDPS[i];
                    try{
                        res = JSON.parse(JSON.stringify(fullDPS[i]));
                    }catch(e){}
                    let topicStr = res.version.repo_id.topic_id.toString();
                    res.version.repo_id.author_groups = authorGroupsLookup[topicStr];
                    res.version.repo_id.providerGroup = authorGroupsLookup[topicStr];
                    fullDPS[i] = res;
                }
            }

            return fullDPS;
            //.sort({ "create_date": -1});
            
            
        } catch (e) {
            log.error(e);
            throw new Error(e.message)
        }
    }

    const publishedRepositories = async () => {
      let editions = await db.RepoBranchSchema.find({published: true});
      return editions.map( (item) => {
        return item.repo_id;
      });
    }
    
    const listRepositories = async (user, query) => {
      let topicResponse = false;
      let repoIds = await publishedRepositories();
      let authorGroupsLookup = {};
        try {
          if (user){
            topicResponse = await forumClient.getTopics(user, {});
            let topics = topicResponse.data.filter(item => item.parent_id);

            repoIds = repoIds.concat(topics.map( (item) => {
                let id = item.name;
                if (!id || id.indexOf("repo") === -1){
                    return;
                }
                
                id = id.substring(0,id.length-4);
                let oid = mongoose.Types.ObjectId(id);
                return oid;

            }).filter( (item) => { 
                return (item && String(item).length > 0)
            }));

            repoIds = await util.userProjectsAccess(db, user, repoIds, false);

            for (let i=0; i<topics.length; i++){
                authorGroupsLookup[topics[i]._id] = topics[i].author_groups;
            }
          }

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
                
                let results = await db.RepoSchema.find({_id: {$in: repoIds}}).sort({ "create_date": -1});
                if (user && (user.isApprover || user.isAdmin) ){
                    for (let i=0; i<results.length; i++){
                        
                        if (results[i].topic_id){
                            let res = JSON.parse(JSON.stringify(results[i]));
                            let topicStr = res.topic_id.toString();
                            res.author_groups = authorGroupsLookup[topicStr];
                            res.providerGroup = authorGroupsLookup[topicStr];
                            results[i] = res;
                        }
                    }
                }
                return results
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

    router.get('/editionfull', auth.requireLoggedIn, async function(req, res, next) {
        //version check
        if (!util.phaseCheck(cache, requiredPhase, db)){
            return res.status(404).send(util.phaseText('GET', 'repos'));
        }
        try{

            let repos = await listRepositoriesEditionFull(req.user, req.query);
            res.status(200).json(repos);
        }catch(ex){
            res.status(500).json({error: ex.message});
        }
    });

    router.post('/', auth.requireLoggedIn, async function(req, res, next){
        //version check
        if (!util.phaseCheck(cache, requiredPhase, db)){
            return res.status(404).send(util.phaseText('POST', 'repos'));
        }
        
        let fields = {...req.body};
        let error = [];

        if(!fields.providerGroup){
            error.push("Data Provider Group is Required.");
        }
        if (!fields.name){
            error.push("Dataset Name is Required.")
        }
        if (!fields.ministry_organization){
            error.push("Ministry / Organization is required");
        }

        if(!fields.lifecycle_status){
            error.push("Dataset Lifecycle Status is required");
        }

        if(error.length > 0){
            return res.status(400).json({error: error});
        }
    
        try{
            const repo = await createRepo(req.user, fields);
            res.status(201).json({id: repo._id.toString()});
        }catch(ex){
            console.error(ex);
            res.status(500).json({error: "Unknown error"});
        }
    });

    router.put('/:repoId', auth.requireLoggedIn, async function(req, res, next){
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

    router.get('/:repoId/revisions', auth.requireLoggedIn, async function(req, res, next){
        try{
            let revs = await db.RevisionSchema.find({source_id: mongoose.Types.ObjectId(req.params.repoId), type: 'repo'});
            return res.json({revisions: revs});
        }catch(ex){
            console.log(ex);
            res.status(500).json({error: ex});
        }
    });

    router.get('/:repoId/comments', auth.requireLoggedIn, async function(req, res, next){
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

    router.post('/:repoId/comments', auth.requireLoggedIn, async function(req, res, next){
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