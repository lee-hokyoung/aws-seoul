const mongoose = require('mongoose');

// define schema
const jejuSchema = new mongoose.Schema({
    title: String,
    object:String,
    content: String,
    published_date: String},
    // {strict:false},
    {collection:'mil'});
jejuSchema.statics.create = function(payload){
    const jeju = new this(payload);
    return todo.save();
};
jejuSchema.statics.findAll = function(){
    return this.find({});
};
jejuSchema.statics.findOneByTodoid = function(todoid){
    return this.findOne({ todoid });
};
module.exports = mongoose.model('mil', jejuSchema);