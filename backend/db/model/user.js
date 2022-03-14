const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var userSchema = new Schema({
    email: {type: String, required: true, unique: true},
    name: {type: String, required: false},
    groups: {type: [String], required: true, default: []},
    lastLogin: {type: Date, required: true},
    bcdc_apiKey: {type: String, required: false},
    bcdc_accessKey: {type: String, required: false},
});

var model = mongoose.model('mc_user', userSchema, 'mc_user');

module.exports = model;
