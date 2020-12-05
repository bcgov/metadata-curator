const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var userSchema = new Schema({
    email: {type: String, required: true, unique: true},
    name: {type: String, required: false},
    groups: {type: [String], required: true, default: []},
    lastLogin: {type: Date, required: true},
});

var model = mongoose.model('user', userSchema, 'user');

module.exports = model;
