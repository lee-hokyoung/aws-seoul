var mongoose = require('mongoose');

// define schema
var Schema = mongoose.Schema;
var pageSchema = new Schema({
    title: String,
    content: String,
    published_date: String
});
module.exports = mongoose.model('page', pageSchema);