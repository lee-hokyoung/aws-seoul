const mongoose = require('mongoose');

const recommendSchema = new mongoose.Schema({
    title: {type:String, required:true},
    img: {type:String, required:true},
    link:{type:String, required:true}
});
module.exports = mongoose.model('Recommend', recommendSchema, 'mil_recommend_board');