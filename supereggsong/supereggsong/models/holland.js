const mongoose = require('mongoose');
const HollandSchema = new mongoose.Schema({
  act1:String,
  act2:String,
  act3:String,
  act4:String,
  act5:String,
  act6:String,
  act7:String,
  act8:String,
  act9:String,
  act10:String,
  act11:String,
  act12:String,

  com1:String,
  com2:String,
  com3:String,
  com4:String,
  com5:String,
  com6:String,
  com7:String,
  com8:String,
  com9:String,
  com10:String,
  com11:String,
  com12:String,

  job1:String,
  job2:String,
  job3:String,
  job4:String,
  job5:String,
  job6:String,
  job7:String,
  job8:String,
  job9:String,
  job10:String,
  job11:String,
  job12:String,
  job13:String,
  job14:String,
  job15:String,
  job16:String,
  job17:String,
  job18:String,

  ten1:String,
  ten2:String,
  ten3:String,
  ten4:String,
  ten5:String,
  ten6:String,
  ten7:String,
  ten8:String,
  ten9:String,
  ten10:String,
  ten11:String,
  ten12:String,

  user_name:String,
  user_age:Number,
  user_phone:String
});

module.exports = mongoose.model('Holland', HollandSchema);