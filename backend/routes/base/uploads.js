var buildStatic = function(db, router){
    return router;
}

var buildDynamic = function(db, router, auth){

    const forumClient = require('../../clients/forum_client');
    let notify = require('../../notifications/notifications')();
    let revisionService = require('../../services/revisionService');

    const createDataUpload = async (user, upload) => {
        try {
            const dataUploadSchema = new db.DataUploadSchema;
            const id = mongoose.Types.ObjectId();
            const topic = await forumClient.addTopic(id, user);
            dataUploadSchema._id = id;
            dataUploadSchema.name = upload.name;
            dataUploadSchema.description = upload.description;
            dataUploadSchema.uploader = user._json.email;
            dataUploadSchema.files = upload.files;
            if (upload.form_name){
                dataUploadSchema.form_name = upload.form_name;
            }
            dataUploadSchema.topic_id = topic._id;
            dataUploadSchema.create_date = new Date();
            dataUploadSchema.opened_by_approver = false;
            dataUploadSchema.approver_has_commented = false;
            return await dataUploadSchema.save();
        } catch(e) {
            console.log("err data upload");
            log.error(e)
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
    
        dataUpload.name = updatedData.name;
        dataUpload.description = updatedData.description;
        dataUpload.files = updatedData.files;
        dataUpload.status = updatedData.status;
        dataUpload.opened_by_approver = updatedData.opened_by_approver;
        dataUpload.approver_has_commented = updatedData.approver_has_commented;
        dataUpload.upload_submission_id = updatedData.upload_submission_id ? updatedData.upload_submission_id : null;
    
        try{
            if (dataUpload.status === "submitted"){
                let notify = require('../notifications/notifications')();
                dataUpload.upload_date = new Date();
                notify.notify(dataUpload, user);
            }
        }catch(ex){
            console.log("Exception emailing", ex);
        }
    
        try{
            return await dataUpload.save();
        }catch(ex){
            log.error(e);
            throw new Error(e.message);
        }
        
    }
    
    const listDataUploads = async (user, query) => {
        console.log("X");
        try {
            let topics = [];
            const topicResponse = await forumClient.getTopics(user, query);
            if(query && query.filterBy) {
                if(query.filterBy === 'me') {
                    topics = topicResponse.data.filter( (item) => {
                        return (item.contributors.indexOf(user.email) !== -1 && item.parent_id);
                    });
                } else if(query.filterBy === 'provider') {
                    if(query.providerGroups && query.providerGroups.includes('all') ) {
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
    
            const uploadIds = topics.map(item => item.name);
            if(query.filterBy === 'provider') {
                let results = await db.DataUploadSchema.find({_id: {$in: uploadIds}}).sort({ "create_date": 1});
                results = results.filter( (item) => {
                    return item.status === "submitted";
                });
                return results;
            }else{
                return await db.DataUploadSchema.find({_id: {$in: uploadIds}}).sort({ "create_date": 1});
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
        console.log("HI");
        const list = await listDataUploads(req.user, req.query);
        res.json(list);
    });

    router.post('/', async function(req, res, next){
        const dataUpload = await createDataUpload(req.user, req.body);
        res.status(201).json(dataUpload);
    });

    router.get('/:dataUploadId', async function(req, res, next){
        const dataUploadId = req.params.dataUploadId;
        let result = await getDataUploadById(req.user, dataUploadId);
        if(!result) {
            throw new Error("Data Upload not found")
        }
        res.json(result);
    });

    router.put('/:dataUploadId', async function(req, res, next){
        const dataUpload = await updateDataUpload(req.user, req.params.dataUploadId, req.body);
        res.status(200).json(dataUpload);
    });

    router.get('/:dataUploadId/comments', async function(req, res, next){
        const comments = await getComments (req.params.dataUploadId, req.user);
        res.json(comments);
    });

    router.post('/:dataUploadId/comments', async function(req, res, next){
        await addComment (req.params.dataUploadId, req.user, req.body.content);
        res.status(201).json({
            message: 'Comment saved successfully.'
        });
    });

    router.get('/:dataUploadId/revisions', async function(req, res, next){
        const result = await revisionService.listRevisionsByDataUpload(req.params.dataUploadId);
        res.json(result);
    });

    return router;
}

module.exports = {
    buildStatic: buildStatic,
    buildDynamic: buildDynamic
};