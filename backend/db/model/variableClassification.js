const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var possibleValues = new Schema({
    code: {type: String, required: true},
    title: {type: String, required: true},
    examples: {type: String, required: false},
    description: {type: String, required: false},
    status: {type: String, required: false},

})

var variableClassificationSchema = new Schema({
    name: {type: String, required: true},
    values: {type: [possibleValues]},
    create_date: {type: Date, required: true, default: Date.now},
    created_by: {type: String, required: true},
    topic_id: {type: Schema.Types.ObjectId},
    published: {type: Boolean, default: false}
});

var model = mongoose.model('variableClassification', variableClassificationSchema, 'variable_classification');

module.exports = model;
