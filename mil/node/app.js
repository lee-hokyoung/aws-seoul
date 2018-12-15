var fs = require('fs');
var express = require("express");
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var mongoUrl = "mongodb://localhost:27017/Khistory";

var $app = express();
$app.use(bodyParser.urlencoded({ extended: false }));
$app.use(bodyParser.json());
$app.use('/static', express.static(__dirname + '/static'));
$app.use('/bower_components', express.static(__dirname + '/bower_components'));

$app.set('views', __dirname + '/views');
$app.set('view engine', 'ejs');
$app.engine('html', require('ejs').renderFile);

// mongoDB 연결
var mongoose = require('mongoose');
mongoose.connect(mongoUrl, function(err, data){
    if(!err){
    	//console.log(data);
	}
});


$app.use(session({
    secret: 'secret_cheju',
    resave:false,
    saveUninitialized:true,
    store: new MongoStore({
        url:mongoUrl,
        ttl: 60*60*24*7  // 7 days (default: 14days)
    })
}));

$app.use(function(req, res, next){
    req.session.username = 'cheju_admin';
    req.session.userpwd = 'cheju_pwd';
    next();
});

// //define model
const Jeju = require('./model/jeju');
const router = require('./router/main')($app, fs, Jeju);

// const News_Board = require('./model/news_board');
// const news_board = require('./router/admin')($app, fs, Jeju);

$app.listen(8106);
console.log('node js server started with mongo. port number is 8106');