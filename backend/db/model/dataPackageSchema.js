const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var resourceSchema = new Schema({
   name: {type: String, required: false},
   data: {type: [String], required: false, default: []},
   path: {type: String, required: false},
   tableSchema:
       {
           type: Object,
           required: true
       }
}, { _id : false });

resourceSchema.set('strict', false);

var dataPackageSchema = new Schema({
    inferred: {
        type: String, 
        required: true,
        default: false,
    }, 
    profile: {type:String, required: true},
    version: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'repoBranch'
    },
    resources: {type: [resourceSchema], required: true}
});

dataPackageSchema.set('strict', false);

var model = mongoose.model('dataPackageSchema', dataPackageSchema, 'dataPackageSchema');

module.exports = {
    dataPackageSchema,
    model
}
