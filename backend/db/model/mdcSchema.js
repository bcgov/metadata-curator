const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var fieldSchema = new Schema({
    name: {type: String, required: true},
    type: {type: String, required: true},
});

var mdcSchema = new Schema({
    fields: {type: [fieldSchema], required: true}
});

// var mdcSchema = new Schema({
//     name: {type: String, required: true}
// });
//

var model = mongoose.model('mdcSchema', mdcSchema, 'mdcSchema');

module.exports = model;
