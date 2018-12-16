const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
    title: {type:String, required:true},
    author: {type:String, required:true},
    content:{type:String, required:true},
    published_date: { type: String},
    isoDate:{type:Date, default:Date.now}
});
noticeSchema.index({title:1, published_date:1});
module.exports = mongoose.model('Notice', noticeSchema, 'mil_notice_board');