const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let {branchSchema} = require('./repoBranch');

var repoSchema = new Schema({
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
