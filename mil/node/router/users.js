const express = require('express');
const router = express();
// const bodyParser = require('body-parser');
//
// // router.use(bodyParser.urlencoded({ extended: false }));
// // router.use(bodyParser.json());
router.set('views', __dirname + '../../views');
router.set('view engine', 'ejs');
router.engine('html', require('ejs').renderFile);

router.get('/test', (req, res) => {
    res.render('users/list', {
        list:'회원 리스트'
    });
});

module.exports = router;