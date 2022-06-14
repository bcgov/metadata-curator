const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var possibleValues = new Schema({
    text: {type: String, required: true},
    value: {type: Schema.Types.Mixed, required: true},
});

var optionSchema = new Schema({
    type: {type: String, required: true, unique: true},
    values: {type: [possibleValues]},
    create_date: {type: Date, required: true, default: Date.now},
    created_by: {type: String, required: true},
});

var model = mongoose.model('option', optionSchema, 'option');

module.exports = model;
