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
    created_date: {
        type: Date,
        required: true
    },
    description: {
        type: String,
        required: true
    }
});


var model = mongoose.model('repoBranch', repoBranchSchema, 'repo_branch');

module.exports = model;
