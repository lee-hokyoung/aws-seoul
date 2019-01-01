const express = require('express');
const router = express();
// const bodyParser = require('body-parser');
//
// // router.use(bodyParser.urlencoded({ extended: false }));
// // router.use(bodyParser.json());
router.set('views', __dirname + '/views');
router.set('view engine', 'ejs');
router.engine('html', require('ejs').renderFile);

const RecommendSchema = require('../model/recommend');



module.exports = router;