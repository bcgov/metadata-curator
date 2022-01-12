var buildStatic = function(db, router){
    return router;
}

var buildDynamic = function(db, router, auth, forumClient, notify, revisionService){
    const log = require('npmlog');
    const mongoose = require('mongoose');
    const config = require('config');

    const createDataUpload = async (user, upload) => {
        try {
            const dataUploadSchema = new db.DataUploadSchema;
            const id = mongoose.Types.ObjectId();
            dataUploadSchema._id = id;
            if (!upload.name){
                throw new Error("Name is required");
            }

            if (!user.groups.some( (el) => el === config.get('requiredRoleToCreateRequest'))){
                throw new Error("Not permitted to create an upload");
            }

            let originalGroups = JSON.parse(JSON.stringify(user.groups));
            let originalJWT = user.jwt;

            if (user.isApprover && !upload.provider_group){
                throw new Error("Data Approvers must provide a data provider group");
            }else if (user.isApprover){
                if (!user.groups.some( (el) => el === upload.provider_group) ){
                    throw new Error("Data Approvers must select a data provider group they belong to");
                }
            }

            dataUploadSchema.name = upload.name;
            dataUploadSchema.description = upload.description;
            dataUploadSchema.uploader = user.id;

            if (upload.files){
                dataUploadSchema.files = upload.files;
                for (let i=0; i<dataUploadSchema.files.length; i++){
                    dataUploadSchema.files[i] = (dataUploadSchema.files[i]) ? dataUploadSchema.files[i] : false;
                }
            }

            if (upload.form_name){
                dataUploadSchema.form_name = upload.form_name;
            }
            dataUploadSchema.create_date = new Date();
            dataUploadSchema.opened_by_approver = false;
            dataUploadSchema.approver_has_commented = false;

            if (upload.upload_submission_id){
                dataUploadSchema.upload_submission_id = upload.upload_submission_id ? upload.upload_submission_id : null;
            }

            if (user.isApprover){
                user.groups = [];
                // if (user.organization){
                //     user.groups.push(user.organization);
                // }
                
                user.groups.push(config.get('requiredRoleToCreateRequest'));   
                user.groups.push(upload.provider_group);
                
                var jwtlib = require('jsonwebtoken');
                user.jwt = jwtlib.sign(user, config.get('jwtSecret'));
            }
            
            const topic = await forumClient.addTopic(id, user); 

            if (user.isApprover){
                user.groups = JSON.parse(JSON.stringify(originalGroups));
                user.jwt = originalJWT;
            }
            dataUploadSchema.topic_id = topic._id;
            return await dataUploadSchema.save();
        } catch(e) {
            if (user.isApprover){
                user.groups = JSON.parse(JSON.stringify(originalGroups));
                user.jwt = originalJWT;
            }
            throw new Error(e.message)
        }
    }
    
    const updateDataUpload = async (user, dataUploadId, updatedData) => {
        let dataUpload = null;
        try {
            const response = await forumClient.getTopic(user, dataUploadId);
            if(!response.data || response.data.length === 0) { throw new Error("User not authorized to update this data upload."); }
            dataUpload = await db.DataUploadSchema.findOne({_id: dataUploadId});
    
            if(!dataUpload) {
                throw new Error('Data Upload(' + dataUploadId + ') not found')
            }
        } catch(e) {
            log.error(e);
        }
    
        if (updatedData.name){
            dataUpload.name = updatedData.name;
        }

        if (updatedData.description){
            dataUpload.description = updatedData.description;
        }

        if (updatedData.files){
            dataUpload.files = updatedData.files;
            for (let i=0; i<dataUpload.files.length; i++){
                dataUpload.files = (dataUpload.files) ? dataUpload.files : false;
            }
        }

        if (updatedData.status){
            dataUpload.status = updatedData.status;
        }

        if (updatedData.opened_by_approver){
            dataUpload.opened_by_approver = updatedData.opened_by_approver;
        }

        if (updatedData.approver_has_commented){
            dataUpload.approver_has_commented = updatedData.approver_has_commented;
        }

        if (updatedData.upload_submission_id){
            dataUpload.upload_submission_id = updatedData.upload_submission_id ? updatedData.upload_submission_id : null;
        }
        
        try{
            if (dataUpload.status === "submitted"){
                dataUpload.upload_date = new Date();
                notify.notify(dataUpload, user);
            }
        }catch(ex){
            log.error("Exception emailing", ex);
        }

        if (dataUpload.status === "submitted"){
            const confQ = {key: "uploadHook"};
            const configs = await db.ConfigSchema.findOne(confQ);
            try{
                if (configs && configs.value){
                    const url = `${configs.value}`;
                    const axios = require('axios');
                    console.log("Calling hook", url, dataUpload);
                    axios.post(url, dataUpload).catch( (err) => log.error("Error calling hook", err)).then( () => {
                        log.debug("Called uploadHook", url);
                    });
                }
            }catch(ex){
                log.error("Error calling upload hook", ex);
            }
        }
    
        try{
            return await dataUpload.save();
        }catch(ex){
            log.error(ex);
            throw new Error(e.message);
        }
        
    }
    
    const listDataUploads = async (user, query) => {
        try {
            let topics = [];
            
            let currentData = await forumClient.getTopics(user, query);
            
            let topicResponse = {data: []};
            topicResponse.data = topicResponse.data.concat(currentData.data);
            
            if(query && query.filterBy) {
                if(query.filterBy === 'me') {
                    topics = topicResponse.data.filter( (item) => {
                        return (item.contributors.indexOf(user.id) !== -1 && item.parent_id);
                    });
                } else if(query.filterBy === 'provider') {
                    if(!query.providerGroups || query.providerGroups.includes('all') ) {
                        topics = topicResponse.data.filter(item => item.parent_id); }
                    else {
                        topics = topicResponse.data.filter(item => item.parent_id && item.author_groups.some(r => query.providerGroups.includes(r)));
                    }
                } else {
                    topics = topicResponse.data.filter(item => item.parent_id);
    
                }
            }
            else {
                topics = topicResponse.data.filter(item => item.parent_id);
            }
    
            const uploadIds = topics.map( (item) => {
                
                if ( (item) && (item.name) && (String(item.name).indexOf("repo") === -1) && (String(item.name).indexOf("branch") ===-1) && (String(item.name).indexOf("varClass") === -1)){
                    return item.name
                }

                return ""
            }).filter( (item) => {
                return (item && String(item).length > 0)
            });

            if(query && query.filterBy === 'provider') {
                let results = await db.DataUploadSchema.find({_id: {$in: uploadIds}}).sort({ "create_date": -1});
                // results = results.filter( (item) => {
                //     return item.status === "submitted";
                // });
                return results;
            }else{
                let results = await db.DataUploadSchema.find({_id: {$in: uploadIds}}).sort({ "create_date": -1});
                return results;
            }
    
        } catch (e) {
            log.error(e);
            throw new Error(e.message)
        }
    }
    
    
    const getDataUploadById = async (user, id) => {
        try {
            const response = await forumClient.getTopic(user, id);
            if(!response.data || response.data.length === 0) { throw new Error("User not authorized to retrieve this data upload."); }
            return await db.DataUploadSchema.findOne({_id: id});
        } catch (e) {
            log.error(e);
            throw new Error(e.message)
        }
    }

    const addComment = async (dataUploadId, user, comment) => {
        try {
            let dataUpload = await getDataUploadById(user, dataUploadId);
            if (dataUpload == null) {
                throw new Error("Invalid data upload ID")
            }
            const alwaysNotifyUninvolvedOnCommentAdd = config.has("alwaysNotifyUninvolvedOnCommentAdd")
                && config.get("alwaysNotifyUninvolvedOnCommentAdd") === true;
            const notifyAllApprovers = alwaysNotifyUninvolvedOnCommentAdd && dataUpload.opened_by_approver
                && !dataUpload.approver_has_commented && user.isDataProvider;
    
            await forumClient.addComment(dataUpload.topic_id, comment, user);
    
            if(user.isApprover) {
                if(!dataUpload.approver_has_commented) {
                    dataUpload.approver_has_commented = true;
                    await dataUpload.save();
                }
            }
    
            //send out notifications if req'd to approvers
            if(notifyAllApprovers) {
                notify.notify(dataUpload, user);
                dataUpload.opened_by_approver = false;
                await dataUpload.save();
            }
        } catch(e) {
            console.error(e);
            throw new Error(e.message)
        }
    }
    
    const getComments = async (dataUploadId, user) => {
        try {
            let dataUpload = await getDataUploadById(user, dataUploadId);
            if (dataUpload == null) {
                throw new Error("Invalid data upload ID")
            }
            return await forumClient.getComments (dataUpload.topic_id, user);
        } catch(e) {
            console.error(e);
            throw new Error(e.message)
        }
    }
    
    router.get('/', async function(req, res, next) {
        let list = null;
        
        list = await listDataUploads(req.user, req.query);
        
        return res.status(200).json(list);
    });

    router.post('/', async function(req, res, next){
        try{
            const dataUpload = await createDataUpload(req.user, req.body);
            return res.status(201).json(dataUpload);
        }catch(e){
            return res.status(400).json({error: e});
        }
    });

    router.get('/:dataUploadId', async function(req, res, next){
        const dataUploadId = req.params.dataUploadId;
        let result = null;
        try{
            result = await getDataUploadById(req.user, dataUploadId);
        }catch(e){
            return res.status(404).json({error: "Not found"});
        }
        return res.json(result);
    });

    router.put('/:dataUploadId', async function(req, res, next){
        const dataUpload = await updateDataUpload(req.user, req.params.dataUploadId, req.body);
        return res.status(200).json(dataUpload);
    });

    router.get('/:dataUploadId/comments', async function(req, res, next){
        const comments = await getComments (req.params.dataUploadId, req.user);
        return res.json(comments);
    });

    router.post('/:dataUploadId/comments', async function(req, res, next){
        await addComment (req.params.dataUploadId, req.user, req.body.content);
        return res.status(201).json({
            message: 'Comment saved successfully.'
        });
    });

    router.get('/:dataUploadId/revisions', async function(req, res, next){
        const result = await revisionService.listRevisionsByDataUpload(req.params.dataUploadId);
        return res.json(result);
    });

    return router;
}

module.exports = {
    buildStatic: buildStatic,
    buildDynamic: buildDynamic
};