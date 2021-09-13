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
});


var model = mongoose.model('repo', repoSchema, 'repo');

module.exports = model;
