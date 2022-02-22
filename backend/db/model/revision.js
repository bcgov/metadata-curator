const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let {dataPackageSchema} = require('./dataPackageSchema');
let {repoSchema} = require('./repo');
let {repoBranchSchema} = require('./repoBranch');

var revisionSchema = new Schema({
    source_id: {
        type: Schema.Types.ObjectId,
        required: true,
        //ref: 'repo_branch' or 'repo' or 'datapackage'
    },
    type: {
        type: String,
        required: true,
        enum: ["tabular_data_package", "table_schema", "repo", "branch"]
    },
    revision_number: {
        type: Number,
        required: true
    },
    change_summary: {
        type: String,
        required: true
    },
    old_content: {
        type: Object,
        required: false
    },
    changes: {
        type: Object,
        required: true
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

revisionSchema.methods.revise = function(fieldName, previousValue, newValue){
    if (typeof(previousValue) === 'object'){
        previousValue = JSON.stringify(previousValue);
    }

    if (typeof(newValue) === 'object'){
        newValue = JSON.stringify(newValue);
    }

    if (previousValue !== newValue){
        if ( (!this.change_summary) || (this.change_summary.length === 0) ){
            this.change_summary = "";
        }else{
            this.change_summary += ", ";
        }

        if ( (previousValue === '') || (previousValue === 'undefined') ){
            this.change_summary += fieldName + " added as " + newValue;    
        }else if ( (newValue === '') || (newValue === 'undefined') ){
            this.change_summary += fieldName + " removed"
        }else{
            this.change_summary += fieldName + " changed from " + previousValue + " to " + newValue;
        }

        if (!this.changes){
            this.changes = {};
        }
        this.changes[fieldName] = newValue;
    }
}

var model = mongoose.model('revision', revisionSchema, 'revision');

module.exports = model;
