const fs = require('fs');
const express = require("express");
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const mongoUrl = "mongodb://localhost:27017/Khistory";

const $app = express();
$app.use(bodyParser.urlencoded({ extended: false }));
$app.use(bodyParser.json());
$app.use('/static', express.static(__dirname + '/static'));
$app.use('/bower_components', express.static(__dirname + '/bower_components'));

$app.set('views', __dirname + '/views');
$app.set('view engine', 'ejs');
$app.engine('html', require('ejs').renderFile);

// mongoDB 연결
const mongoose = require('mongoose');
mongoose.connect(mongoUrl, function(err, data){if(err) console.log(data)});

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
    req.session.username = 'mil_admin';
    req.session.userpwd = 'mil_pwd';
    next();
});

// require('./router/state');
const _mil = require('./model/jeju');
// require('./router/init');
require('./router/main')($app, fs, _mil);
require('./router/admin')($app, fs, _mil);


$app.listen(8106);
console.log('node js server started with mongo. port number is 8106');