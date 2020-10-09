const mongoose = require('mongoose');
const db = require('../db/db');
const forumClient = require('../clients/forum_client');
let log = require('npmlog');

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
    try {
        const response = await forumClient.getTopic(user, dataUploadId);
        if(!response.data || response.data.length === 0) { throw new Error("User not authorized to update this data upload."); }
        let dataUpload = await db.DataUploadSchema.findOne({_id: dataUploadId});

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

module.exports = {
    createDataUpload,
    updateDataUpload,
    listDataUploads,
    getDataUploadById
}
