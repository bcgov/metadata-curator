const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var resourceSchema = new Schema({
   name: {type: String, required: false},
   profile: {type: String, required: true},
   data: {type: [String], required: true},
   tableSchema:
       {
           type: Object,
           required: true
       }
}, { _id : false });

var dataPackageSchema = new Schema({
    profile: {type:String, required: true},
    version: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'repo_branch'
    },
    resources: {type: [resourceSchema], required: true}
});

dataPackageSchema.set('strict', false);

var model = mongoose.model('dataPackageSchema', dataPackageSchema, 'dataPackageSchema');

module.exports = {
    dataPackageSchema,
    model
}
