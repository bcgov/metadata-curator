const db = require('../db/db');
const config = require('config');
const dataUploadService = require('./dataUploadService');
const forumClient = require('../clients/forum_client');
let notify = require('../notifications/notifications')();

const addComment = async (dataUploadId, user, comment) => {
    try {
        let dataUpload = await dataUploadService.getDataUploadById(dataUploadId);
        if (dataUpload == null) {
            throw new Error("Invalid data upload ID")
        }
        const alwaysNotifyUninvolvedOnCommentAdd = config.has("alwaysNotifyUninvolvedOnCommentAdd")
            && config.has("alwaysNotifyUninvolvedOnCommentAdd") === true;
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
        let dataUpload = await dataUploadService.getDataUploadById(dataUploadId);
        if (dataUpload == null) {
            throw new Error("Invalid data upload ID")
        }
        return await forumClient.getComments (dataUpload.topic_id, user);
    } catch(e) {
        console.error(e);
        throw new Error(e.message)
    }
}

module.exports = {
    addComment,
    getComments
}
