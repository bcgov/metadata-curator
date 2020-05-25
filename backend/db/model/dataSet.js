const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var dataSetEditionSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    create_date: {
        type: Date,
        required: true
    }
 }, { _id : false });
 
var dataSetSchema = new Schema({
   editions: {type: [dataSetEditionSchema], required: true}
});

module.exports = {
    dataSetSchema
};
