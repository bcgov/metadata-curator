const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var dataUploadSchema = new Schema({
    name: {type: String, required: true},
    description: {type: String},
    create_date: {type: Date, required: true},
    uploader: {type: String, required: true},
    files: [{
        name: {type: String, required: true}, size: {type: Number, required: true}
    }]
});

var model = mongoose.model('dataUpload', dataUploadSchema, 'data_upload');

module.exports = model;
