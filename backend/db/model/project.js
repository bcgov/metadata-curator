const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var projectSchema = new Schema({
    name: {type: String, required: true, unique: true},
    users: {type: [String], required: false},
    datasets: [{type: [Schema.Types.ObjectId], ref: 'repo'}],
    editions: [{type: [Schema.Types.ObjectId], ref: 'repo_branch'}],
    create_date: {type: Date, required: true, default: Date.now},
    created_by: {type: String, required: true},
    topic_id: {type: Schema.Types.ObjectId},
});

var model = mongoose.model('project', projectSchema, 'project');

module.exports = model;
