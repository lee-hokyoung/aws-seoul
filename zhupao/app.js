const express = require('express');
const app = express();
const path = require('path');

const homeRoute = require('./router/home');
const authRoute = require('./router/auth');
const detailRoute = require('./router/detail');
const adminRoute = require('./router/admin');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/chart.js', express.static(path.join(__dirname, 'node_modules/chart.js/dist')));
// app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap')));

app.use('/', homeRoute);
app.use('/auth', authRoute);
app.use('/detail', detailRoute);
app.use('/admin', adminRoute);

app.listen(3000, ()=>{console.log('3000 port has started')});