// var newsBoard = mongoose.model('news_board', newsBoardSchema);

module.exports = function(app, fs, Schema)
{

    app.get('/admin', function(req, res){
        res.render('admin/dashboard', {
        });
    });
    app.get('/news_board', function(req, res){
        res.render('admin/news_board', {
        });
    });
    app.get('/data', function(req, res){
        res.render('admin/data', {
        });

    });
    app.post('/news_board/create', function(req, res){
        var board = new News_Board();
        board.title = req.body.title;
        board.author = req.body.author;
        board.content = req.body.content;
        board.published_date = new Date(req.body.published_date);

        board.save(function(err){
            if(err){
                console.error(err);
                res.json({result: 0});
                return;
            }
            res.json({result: 1});
        });

        // var session = req.session;
        // if(session.username !== req.body['username']) {
        //     session.status = 0;
        //     res.send({result:0})
        // }
        // else {
        //     session.status = 1;
        //     res.send({result:1});
        // }
    });
    app.get('/logout', function(req, res){
        var sess = req.session;
        if(sess.status === 1){
            req.session.destroy(function(err){
                if(err){
                    console.log(err);
                }else{
                    res.redirect('/');
                }
            })
        }else{
            res.redirect('/');
        }
    })
};