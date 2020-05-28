const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var fieldSchema = new Schema({
    name: {type: String, required: true},
    type: {type: String, required: true},
}, { _id : false });

var tableSchema = new Schema({
   fields: {type: [fieldSchema], required: true}
}, { _id : false });

module.exports = {
    tableSchema
};
