const mongoose = require('mongoose');

// define schema
const adminSchema = new mongoose.Schema({
        username: String,
        userpwd:String},
    {collection:'admin'});
adminSchema.statics.create = function(payload){
    const admin = new this(payload);
    return todo.save();
};
adminSchema.statics.findAll = function(){
    return this.find({});
};
adminSchema.statics.findOneByTodoid = function(todoid){
    return this.findOne({ todoid });
};
module.exports = mongoose.model('admin', adminSchema);