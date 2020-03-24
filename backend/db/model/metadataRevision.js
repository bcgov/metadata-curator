const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var metadataRevisionSchema = new Schema({
    repo_branch_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'repo_branch'
    },
    type: {
        type: String,
        required: true,
        enum: ["tabular_data_package", "table_schema"]
    },
    revision_number: {
        type: Number,
        required: true
    },
    change_summary: {
        type: String,
        required: true
    },
    content: {
        type: Object,
        required: false
    },
    create_date: {
        type: Date,
        required: true
    },
    updater: {
        type: String,
        required: true
    }
});

var model = mongoose.model('metadataRevision', metadataRevisionSchema, 'metadata_revision');

module.exports = model;
