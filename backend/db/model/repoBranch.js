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
        enum: ["standard", "reserve"]
    },
    name: {
        type: String,
        required: true
    },
    revisions: [{
        type: Schema.Types.ObjectId,
        ref: 'metadata_revision'
    }],
    create_date: {
        type: Date,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    data_upload_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'data_upload'
    },
});


var model = mongoose.model('repoBranch', repoBranchSchema, 'repo_branch');

module.exports = {
    model,
    repoBranchSchema
}
