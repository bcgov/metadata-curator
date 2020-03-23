const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let {tableSchema} = require('./tableSchema');

var resourceSchema = new Schema({
   profile: {type: String, required: true},
   data: {type: [String], required: true},
   tableSchema:
       {
           type: tableSchema,
           required: true
       }
});

var dataPackageSchema = new Schema({
    profile: {type:String, required: true},
    resources: {type: [resourceSchema], required: true}
});

var model = mongoose.model('dataPackageSchema', dataPackageSchema, 'dataPackageSchema');

module.exports = model;
