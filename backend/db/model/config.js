const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var configSchema = new Schema({
    key: {type: String, required: true, unique: true},
    value: {type: String, required: true}
});

var model = mongoose.model('config', configSchema, 'config');

module.exports = model;
