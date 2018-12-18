const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
    title: {type:String, required:true},
    img: {type:String, required:true},
    link:{type:String, required:true}
});
module.exports = mongoose.model('Recommend', noticeSchema, 'mil_recommend_board');