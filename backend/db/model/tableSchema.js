const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var fieldSchema = new Schema({
    name: {type: String, required: true},
    type: {type: String, required: true},
});

var tableSchema = new Schema({
   fields: {type: [fieldSchema], required: true}
});

var model = mongoose.model('tableSchema', tableSchema, 'tableSchema');

module.exports = model;
