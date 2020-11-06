const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let {branchSchema} = require('./repoBranch');

var repoSchema = new Schema({
    data_upload_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'data_upload'
    },
    name: {
        type: String,
        required: true
    },
    create_date: {
        type: Date,
        required: true
    },
    branches: {type: [branchSchema], required: true}
});


var model = mongoose.model('repo', repoSchema, 'repo');

module.exports = model;
