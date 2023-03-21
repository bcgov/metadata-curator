const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var fieldSchema = new Schema({
    name: {type: String, required: true},
    type: {type: String, required: true},
}, { _id : false });

var foreignKeySchema = new Schema({
    fields: {type: String, required: true},
    reference: {type: referenceSchema, required: false}
});

var referenceSchema = new Schema({
    resource: {type: String, required: false},
    fields: {type: String, required: false}
});

var tableSchema = new Schema({
    fields: {type: [fieldSchema], required: true},
    primaryKey: {type: String, required: false},
    foreignKey: {type: [foreignKeySchema], required: false}
}, { _id : false });

module.exports = {
    tableSchema
};
