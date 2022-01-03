const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var repoSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    create_date: {
        type: Date,
        required: true
    },
    created_by: {type: String, required: true},
    topic_id: {type: Schema.Types.ObjectId},
    description: {type: String, required: false},

    gov_allow_publish: {
        type: Boolean,
        required: false,
        default: false,
    },

    aca_allow_publish: {
        type: Boolean,
        required: false,
        default: false,
    },

    gov_approval_needed: {
        type: Boolean,
        required: false,
        default: false,
    },

    aca_approval_needed: {
        type: Boolean,
        required: false,
        default: false,
    },

    in_bc_catalogue: {
        type: Boolean,
        required: false,
        default: false,
    },
    data_collection_type: {
        type: String,
        required: false,
    },
});

var model = mongoose.model('repo', repoSchema, 'repo');

module.exports = model;
