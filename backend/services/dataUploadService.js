const db = require('../db/db');
let log = require('npmlog');

const createDataUpload = async (upload) => {
    try {
        const dataUploadSchema = new db.DataUploadSchema;
        dataUploadSchema.name = upload.name;
        dataUploadSchema.description = upload.description;
        dataUploadSchema.uploader = upload.uploader;
        dataUploadSchema.files = upload.files;
        dataUploadSchema.topic_id = upload.topic_id;
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

        return await dataUpload.save();

    } catch(e) {
        log.error(e);
        throw new Error(e.message)
    }
}

const listDataUploads = async () => {
    try {
        return await db.DataUploadSchema.find({}).sort({ "create_date": 1});
    } catch (e) {
        log.error(e);
        throw new Error(e.message)
    }
}

const getDataUploadById = async (id) => {
    try {
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
