const _state = require('../router/state');
const NoticeSchema = require('../model/notice');
const RecommendSchema = require('../model/recommend');
require('moment/locale/ko');

module.exports = function(app, fs, Schema, _commObj)
{
    /*  -----------------------------------------------------------------------------------------
    *   admin Page 관련
    -------------------------------------------------------------------------------------------*/
    app.post('/admin/check', (req, res) => {
        if(req.session.username=== req.body.id && req.session.userpwd === req.body.pwd){
            req.session.status = 1;
            res.send({result:1});
        }else{
            res.send({result:0});
        }
    });
    app.get('/admin/login', (req, res) =>{
        res.render('admin/login', {
            session:req.session
        });
    });
    app.get('/admin/logout', (req, res) => {
        req.session.status = 0;
        res.render('admin/login',{
            session:req.session
        });
    });
    app.get('/admin/data', (req, res) =>{
        if(req.session.status === 1){
            res.render('admin/data', {
                menu:_state.menu,
                left:_commObj.__left,
                facet_list:_commObj.__facet_list,
                collection:_commObj.collection,
                session:req.session
            });
        }else{
            res.render('admin/login', {
                session:req.session
            });
        }
    });
    app.get('/admin/write', (req, res) =>{
        if(req.session.status === 1){
            res.render('admin/write', {
                session:req.session
            });
        }else{
            res.render('admin/login', {
                session:req.session
            })
        }
    });


    /*  --------------------------------------------------------------
    *   공지사항
    *   ------------------------------------------------------------*/
    app.get('/admin/news_board', (req, res) =>{
        if(req.session.status === 1){
            NoticeSchema.find({}).sort({isoDate:'desc'}).then((docs) => {
                res.render('admin/news_board', {
                    list:docs,
                    session:req.session
                });
            });
        }else {
            res.render('admin/login', {
                session:req.session
            });
        }
    });
    // 공지사항 CRUD
    app.post('/admin/notice/insert', (req, res) =>{
        if(req.session.status === 1){
            const newNoticeObj = new NoticeSchema({
                title:req.body.title,
                author:req.body.author,
                content:req.body.content,
                published_date:moment().format('L')
            });
            newNoticeObj.save(function(err){
                if(err) return res.status(500).send(err);
                return res.status(200).send(newNoticeObj);
            });
        }else{
            res.send({result:'error', comment:'권한없음'});
        }
    });
    app.post('/admin/notice/read', (req, res) => {
        if(req.session.status === 1){
            var cursor = NoticeSchema.find({_id:req.body._id}).cursor(), result;
            cursor.on('data', (docs) => {
                result = docs;
            });
            cursor.on('close', () => {
                res.send(result);
            });
        }else{
            res.send({result:'error', comment:'권한없음'});
        }
    });
    app.post('/admin/notice/update', (req, res) => {
        if(req.session.status === 1){
            NoticeSchema.updateOne({_id:req.body._id}, {$set:{title:req.body.title,author:req.body.author, content:req.body.content}}).then((docs) => {
                res.send(docs);
            });
        }else{
            res.send({result:'error', comment:'권한없음'});
        }
    });
    app.post('/admin/notice/delete', (req, res) => {
        if(req.session.status === 1){
            NoticeSchema.deleteOne({_id:req.body._id}).then((docs) => {
                res.send(docs);
            });
        }else{
            res.send({result:'error', comment:'권한없음'});
        }
    });

    /*  --------------------------------------------------------------
    *   추천 기록자료 관리
    *   ------------------------------------------------------------*/

    app.get('/admin/recommend', (req, res) => {
        if(req.session.status === 1){
            RecommendSchema.find({}).then((docs) => {
                res.render('admin/recommend', {
                    list:docs,
                    session:req.session
                });
            });
        }else{
            res.render('admin/login', {
                session:req.session
            })
        }
    });
    app.get('/admin/recommend/list', (req, res) => {
        RecommendSchema.find({}).then((docs) => {res.send(docs)});
    });

    // 추천기록 관리 CRUD
    app.post('/admin/recommend/create', (req, res) => {
        if(req.session.status === 1){
            const recommendObj = new RecommendSchema(req.body);
            recommendObj.save((err) => {
                if(err) return res.status(500).send(err);
                return res.status(200).send(recommendObj);
            })
        }else{
            res.send({result:'error', comment:'권한없음'});
        }
    });
    app.post('/admin/recommend/read', (req, res) => {
        if(req.session.status === 1){
            RecommendSchema.find({_id:req.body._id}).then((docs) => {res.send(docs[0])});
        }else{
            res.send({result:'error', comment:'권한없음'});
        }
    });
    app.post('/admin/recommend/update', (req, res) => {
        if(req.session.status === 1){
            RecommendSchema.updateOne({_id:req.body._id}, {$set:{title:req.body.title, img:req.body.img, link:req.body.link}}).then((docs) => {res.send(docs);});
        }else{
            res.send({result:'error', comment:'권한없음'});
        }
    });
    app.post('/admin/recommend/delete', (req, res) => {
        if(req.session.status === 1){
            RecommendSchema.deleteOne({_id:req.body._id}).then((docs) =>{res.send(docs)});
        }else{
            res.send({result:'error', comment:'권한없음'});
        }
    });
};