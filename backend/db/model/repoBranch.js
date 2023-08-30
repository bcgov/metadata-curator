const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var lifecycleDateSchema = mongoose.Schema({
    date: {
        type: Date,
        required: false
    },
    comment: {
        type: String,
        required: false,
    },
}, { _id : false });

var urlSchema = mongoose.Schema({
    name: {
        type: String,
        required: false
    },
    url: {
        type: String,
        required: true
    }

}, { _id : false });

var repoBranchSchema = new Schema({
    repo_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'repo'
    },
    supplemental_files: {
        type: [{
            name: {type: String},
            id: {type: String},
            public: {type: Boolean, required: false, default: false},
        }],
        required: false,
        default: [],
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
        // type: [Schema.Types.ObjectId],
        type: Schema.Types.ObjectId,
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
    lifecycle: {
        type: lifecycleDateSchema,
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
    },

    instructions:{
        type: String,
        required: false,
    },
    inclusions:{
        type: String,
        required: false,
    },
    exclusions:{
        type: String,
        required: false,
    },
    quality:{
        type: String,
        required: false,
    },
    delta_over_time:{
        type: String,
        required: false,
    },
    additional_info:{
        type: String,
        required: false,
    },
    references:{
        type: String,
        required: false,
    },
    keywords:{
        type: String,
        required: true,
    },
    more_information:{
        type: [urlSchema],
        required: false,
    },
    bcdc_record: {
        type: String,
        required: false,
    },
    bcdc_record_is_sunset: {
        type: Boolean,
        required: false,
        default: false,
    },
    linking_summary: {
        type: String,
        required: false
    },
    processing_summary: {
        type: String,
        required: false
    }



});


var model = mongoose.model('repoBranch', repoBranchSchema, 'repo_branch');

module.exports = {
    model,
    repoBranchSchema
}
