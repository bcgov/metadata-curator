const db = require('../db/db');

const createDataUpload = async (upload) => {
    try {
        // console.log("upload: ", upload);
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
        throw new Error(e.message)
    }
}

module.exports = {
    createDataUpload
}


