const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var dataUploadSchema = new Schema({
    name: {type: String, required: true},
    form_name: {type: String, required: false, default: "uploadForm"},
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
        num_records: {type: Number, required: false},
        title: {type: String, required: false},
        description: {type: String, required: false},
        type: {type: String, required: false},
        temporal_fields: {type: String, required: false},
        uploaded_name: {type: String, required: false},
    }],
    topic_id: {type: Schema.Types.ObjectId},
    opened_by_approver: {type: Boolean, required: true},
    approver_has_commented: {type: Boolean, required: true},
    upload_submission_id: {type: Schema.Types.ObjectId},
    old_submission: {type: Schema.Types.Mixed},
    ministry_organization: {
        type: String,
        required: true,
    },
    num_files: {
        type: Number,
        required: true,
    },
    data_create_date: {
        type: Date,
        required: true,
    },
    source: {
        type: String,
        required: false,
    },
    information: {
        type: String,
        required: false,
    },
    date_range_start: {
        type: Date,
        required: false,
    },
    date_range_end: {
        type: Date,
        required: false,
    },
    

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
