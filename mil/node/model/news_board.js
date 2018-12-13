var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var newsBoardSchema = new Schema({
    title: String,
    author: String,
    content:String,
    published_date: { type: Date, default: Date.now  }
});

module.exports = mongoose.model('news_board', newsBoardSchema);