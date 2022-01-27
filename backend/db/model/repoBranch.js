const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var repoBranchSchema = new Schema({
    repo_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'repo'
    },
    type: {
        type: String,
        required: true,
        enum: ["standard", "unmasked"]
    },
    name: {
        type: String,
        required: true
    },
    create_date: {
        type: Date,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    data_upload_id: {
        type: [Schema.Types.ObjectId],
        required: false,
        ref: 'data_upload'
    },

    collectionMethod: {
        type: String,
        required: false,
    },

    availability: {
        type: String,
        required: false,
    },
    variable_classification: {
        type: String,
        required: false,
    },
    notes: {
        type: String,
        required: false,
    },
    citation:{
        type: String,
        required: false,
    },
    short_title: {
        type: String,
        required: false,
    },
    published: {
        type: Boolean,
        required: false,
        default: false,
    },
    approved: {
        type: Boolean,
        required: false,
        default: false,
    },
    topic_id: {
        type: Schema.Types.ObjectId
    },
    faq: {
        type: String,
        required: false,
    }
});


var model = mongoose.model('repoBranch', repoBranchSchema, 'repo_branch');

module.exports = {
    model,
    repoBranchSchema
}
