const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var dataUploadSchema = new Schema({
    name: {type: String, required: true},
    form_name: {type: String, required: true, default: "uploadForm"},
    description: {type: String},
    create_date: {type: Date, required: true},
    uploader: {type: String, required: true},
    files: [{
        name: {type: String, required: true}, 
        size: {type: Number, required: true}, 
        id: {type: String, required: true}, 
        data: {type: Boolean, required: true}, 
        sig: {type: String, required: false},
        start_date: {type: Date, required: false},
        end_date: {type: Date, required: false},
        num_records: {type: Number, required: true},
        title: {type: String, required: false},
        description: {type: String, required: false},
        type: {type: String, required: false},
    }],
    topic_id: {type: Schema.Types.ObjectId},
    opened_by_approver: {type: Boolean, required: true},
    approver_has_commented: {type: Boolean, required: true},
    upload_submission_id: {type: Schema.Types.ObjectId},
    upload_date: {type: Date, required: false},
    status: {
        type: String,
        enum : ['not_submitted','upload_in_progress', 'upload_error', 'submitted'],
        default: 'not_submitted',
        required: true
    },
});

var model = mongoose.model('dataUpload', dataUploadSchema, 'data_upload');

module.exports = model;
