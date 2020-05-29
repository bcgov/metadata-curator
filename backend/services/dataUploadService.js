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
        dataUploadSchema.uploader = upload.uploader;
        dataUploadSchema.files = upload.files;
        dataUploadSchema.topic_id = topic._id;
        dataUploadSchema.create_date = new Date();
        dataUploadSchema.opened_by_approver = false;
        dataUploadSchema.approver_has_commented = false;
        return await dataUploadSchema.save();
    } catch(e) {
        log.error(e)
        throw new Error(e.message)
    }
}

const updateDataUpload = async (dataUploadId, updatedData) => {
    try {
        let dataUpload = await db.DataUploadSchema.findOne({_id: dataUploadId});

        if(!dataUpload) {
            throw new Error('Data Upload(' + dataUploadId + ') not found')
        }

        dataUpload.name = updatedData.name;
        dataUpload.description = updatedData.description;
        dataUpload.files = updatedData.files;
        dataUpload.opened_by_approver = updatedData.opened_by_approver;
        dataUpload.approver_has_commented = updatedData.approver_has_commented;
        dataUpload.upload_submission_id = updatedData.upload_submission_id ? updatedData.upload_submission_id : null;

        return await dataUpload.save();

    } catch(e) {
        log.error(e);
        throw new Error(e.message)
    }
}

const listDataUploads = async (user, query) => {
    try {
        let topics = [];
        const topicResponse = await forumClient.getTopics(user, query);
        if(query && query.filterBy) {
            if(query.filterBy === 'me') {
                topics = topicResponse.data.filter(item => item.contributors.indexOf(user.email) !== -1 && item.parent_id);
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
        return await db.DataUploadSchema.find({_id: {$in: uploadIds}}).sort({ "create_date": 1});

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
