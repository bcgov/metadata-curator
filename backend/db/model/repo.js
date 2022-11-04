const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var lifecycleDateSchema = mongoose.Schema({
    type: {
        type: String,
        // enum : ['created','published', 'modified', 'archived', 'destroyed', 'comment'],
        required: true
    },
    date_comments: {
        type: String,
        required: true
    },
}, { _id : false });

var contactSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: false
    },
    phone: {
        type: String,
        required: false,
    },
    role: {
        type: [String],
        required: false,
    }
}, { _id : false });

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
    ministry_organization: {
        type: String,
        required: false,
    },


    //added may 11, 2022
    sector: {
        type: String,
        required: false,
        default: "",
    },
    data_type: {
        type: String,
        required: false,
        default: "",
    },
    restrictions_comments: {
        type: String,
        required: false,
        default: "",
    },
    contact: {
        type: [contactSchema],
        required: false,
        default: [],
    },
    refresh_schedule: {
        type: String,
        required: false,
        default: "",
    },
    lifecycle_status: {
        type: String,
        required: true
    },
    lifecycle_dates: {
        type: [lifecycleDateSchema],
        required: false,
        default: [],
    },
    refresh_status: {
        type: String,
        required: false,
    }
});

var model = mongoose.model('repo', repoSchema, 'repo');

module.exports = {
    repoSchema,   
    model
};
