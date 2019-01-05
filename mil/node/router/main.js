const _state = require('../router/state');
const Promise = require('promise');
const NoticeSchema = require('../model/notice');
const RecommendSchema = require('../model/recommend');

var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/';
var searchList;
require('moment/locale/ko');

module.exports = function(app, fs, Schema, _commObj) {
    // 데이터에 필수로 들어갈 내용들을 서버 구동시 작성함.
    const structure_data = _commObj.structure_data;
    app.get(/^\/intro\/(.*)/, function(req, res){
        res.render('intro/'+req.params[0], {
            menu:_state.menu,
            searchList:_commObj.searchList
        });
    });
    // 메인 화면에 각 패싯별 카운트를 구한다.
    app.get(/^\/(|index\.html)$/, function(req, res){
        var total = [], recommend_list, notice_list;
        var facets = [{title:'기록물건명', idx:0},{title:'생산기관', idx:1},{title:'핵심키워드', idx:2},{title:'결재권자', idx:3},{title:'대외자료', idx:4},{title:'이벤트', idx:5},{title:'사람', idx:6}];
        RecommendSchema.find({}).sort({isoDate:'desc'}).then((docs) => {recommend_list = docs;});
        NoticeSchema.find({}).then((docs) => {notice_list = docs;});
        function callback(){
            total = total.sort(function(a, b){
                return a.idx - b.idx;
            });
            res.render('home', {
                menu:_state.menu,
                total:JSON.stringify(total),
                data:total,
                searchList:_commObj.searchList,
                recommend_list:recommend_list,
                notice_list:notice_list
            });
        }
        fnGetSubClass();
        function fnGetSubClass(){
            var subClass = [], idx = 0;
            facets.forEach(function(v, i){
                var list = [];
                var cursor = Schema.find({}).where(_state._subClassOf + '.@id').equals(_state._resource+v.title).cursor();
                cursor.on('data', function(docs){
                    list.push(docs.toObject());
                });
                cursor.on('close', function(){
                    idx++;
                    var sub_list = [];
                    if(list.length > 0) {
                        sub_list = list.map(function(item){return {'@type':item['@id']}});
                    }
                    subClass.push({parent:v.title, sub_list:sub_list, idx:v.idx});
                    if(idx === facets.length) fnGetHorizonFacet(subClass);
                });
            });
        }
        function fnGetHorizonFacet(data){
            var idx = 0, subClass = [];
            data.forEach(function(v, i){
                var list = [], or_list = [];
                or_list.push({'@type':_state._resource+v.parent});
                if(v.sub_list.length > 0) or_list = or_list.concat(v.sub_list);
                var cursor = Schema.find({}).or(or_list).cursor();
                cursor.on('data', function(docs){
                    list.push(docs.toObject());
                });
                cursor.on('close', function(){
                    idx++;
                    subClass.push({parent:v.parent, list:list, idx:v.idx});
                    if(idx === facets.length) fnGetHorizonCount(subClass);
                });
            });
        }
        function fnGetHorizonCount(data){
            data.forEach(function(v){
                var sub_list = {};
                sub_list['parent'] = v.parent;
                sub_list['count'] = v.list.length;
                sub_list['idx'] = v.idx;
                total.push(sub_list);
            });
            callback();
        }
    });
    // 몽고 디비
    app.get(/^\/mongo\/((.*)|\/:id)/,function(req, res){
        var left_data = [];
        var left, body = [], left_menu = [];
        var body_data = [], req_id;
        if(req.params[0].indexOf('/') > -1) {
            var reqs = req.params[0].split('/');
            req.params[0] = reqs[0];
            req_id = reqs[1];
        }
        // 모든 데이터가 불러와지면 callback 함수 호출하기.
        function callback(subClassList){
            if(req.params[0]==='시간'){
                res.render('timeline', {
                    left:JSON.stringify(left),
                    sub_class:JSON.stringify(subClassList),
                    left_store:JSON.stringify(left_data),
                    store:JSON.stringify(body_data),
                    menu:_state.menu,
                    left_menu:JSON.stringify(left_menu),
                    body:JSON.stringify(body),
                    searchList:_commObj.searchList,
                    subProductList:_commObj.subProductList,
                    facet_count_list:JSON.stringify(_commObj.facet_count_list)
                })
            }else{
                res.render('index', {
                    left:JSON.stringify(left),
                    sub_class:JSON.stringify(subClassList),
                    left_store:JSON.stringify(left_data),
                    store:JSON.stringify(body_data),
                    menu:_state.menu,
                    left_menu:JSON.stringify(left_menu),
                    body:JSON.stringify(body),
                    searchList:_commObj.searchList,
                    subProductList:_commObj.subProductList,
                    facet_count_list:JSON.stringify(_commObj.facet_count_list)
                });
            }
        }
        // 왼쪽 카테고리 만들기
        function getLeftFacet(){
            /* ----------------------------------------------------------------------
            *   최초에 default_facets에 있는 모든 자료들을 불러 온다.
            *   향토자료_장소, 향토자료_관련이벤트 등..
            *   그리고 inverse 관계를 직접 만들어서 나중에 query에 추가한다.
            * ----------------------------------------------------------------------*/
            var match = {}, arr = [];
            match['@id'] = _state._resource + req.params[0];
            // cursor 만들기
            var left_facets = Schema.find({'@id':_state._resource + req.params[0]}).cursor();
            left_facets.on('data', function(docs){
                if(docs.toObject().hasOwnProperty(_state._defaultFacets)){
                    docs.toObject()[_state._defaultFacets]['@list'].forEach(function(list){
                        var inverse = _state._resource + list['@id'].split('/resource/')[1].split('_')[1] + '_' + list['@id'].split('/resource/')[1].split('_')[0];
                        arr.push(inverse);
                        arr.push(list['@id']);
                        left_menu.push(list['@id']);
                    });
                    /* ----------------------------------------------------------------------
                    *   'http://mil[dot]k-history[dot]kr/resource/장소_향토자료.@id': { '$exists': true }'
                    *   위와 같은 형태의 자료로 만들어 list에 넣어준다.
                    * ----------------------------------------------------------------------*/
                    var list = [];
                    arr.forEach(function(v, i){
                        var or = {};
                        or[v + '.@id'] = {"$exists":true};
                        list.push(or);
                    });
                    list.push({'@type':_state._resource+req.params[0]});
                    Schema.find({}).or(list).exec(function(err, docs){
                        if(err) return console.error('err : ', err);
                        left = docs;
                        fnGenBody();
                    });
                }else{
                    res.send('<script type="text/javascript">alert("defaultFacet이 설정되어 있지 않습니다."); history.back();</script>');
                }
            });
        }
        /* ----------------------------------------------------------------------
        *   본문 내용을 불러온다.
        *   핵심은 type을 기준으로 불러오되, subClass를 먼저 참조해서 type을 알아낸다
        * ----------------------------------------------------------------------*/
        function fnGenBody(){
            var subClassList = [], type_list = [];
            structure_data[req.params[0]].forEach(function(item){
                if(typeof(item) === 'object'){
                    item[Object.keys(item)].forEach(function(v){
                        type_list.push({'@id':_state._resource + v});
                    });
                }else type_list.push({'@id':_state._resource + item});
            });
            var subClass = Schema.find({}).or({'$or':type_list}).cursor();
            subClass.on('data', function(docs){
                subClassList.push({'@type':docs.toObject()['@id']});
            });
            subClass.on('close', function(){
                subClassList.push({'@type':_state._resource+req.params[0]});
                Schema.aggregate().match({'$or':subClassList}).unwind('@type').then(function(docs){
                    body = docs;
                    callback(subClassList);
                });
            });
        }
        getLeftFacet();
    });
    /* ----------------------------------------------------------------------
    *   ajax 호출을 위한 함수 left facet 클릭시 발생함
    *   subClass와 inverse 관계의 모든 자료를 불러온다.
    * ----------------------------------------------------------------------*/
    app.post(/^\/mongoAjax\/left_facet/, function(request, res){
        var sort = {}, ori = {}, inv = {}, or_match = {}, def = {}, lbl1 = {}, lbl2 = {}, subClass = {}, or_list = [], search;
        sort[_state._label + '.@value'] = 1;
        if(request.body.hasOwnProperty('facet_title[]')){
            var title = request.body['facet_title[]'];
            var link = request.body['facet_link[]'];
            if(typeof(title) === 'string'){ // 싱글패싯 검색
                var prev = _state._default_title + '_' + link.split('_')[0];
                var inverse = link.split('_')[1] + '_' + link.split('_')[0];
                ori[_state._resource + link + '.@id'] = _state._resource + title;
                inv[_state._resource + inverse + '.@id'] = _state._resource + title;
                def[_state._resource + prev + '.@id'] = _state._resource + title;
                lbl1[_state._label] = title;
                lbl2[_state._label+'.@value'] = title;
                or_list.push(ori, inv, def, lbl1, lbl2);
                if(request.body.hasOwnProperty('subClass')){
                    subClass['@id'] = request.body['subClass'];
                    or_list.push(subClass);
                }
                if(request.body.hasOwnProperty('searchData')){  // 싱글패싯 + 결과내 재검색
                    search = _state._search_list.map(function(item){
                        var obj = {};
                        obj[item] = {$regex:request.body['searchData'], $options:'i'};
                        return obj;
                    });
                    Schema.aggregate().match({'$and':[{'$or':or_list}, {'$or':search}]}).unwind('@type').sort(sort).then(function(docs){
                        res.send(docs);
                    });
                }
                else if(request.body.hasOwnProperty('now_time')){   // 싱글패싯 + 타임라인
                    var time = {}, chart_left = request.body['chart_left'];
                    time[_resource + chart_left + '_시간.@id'] = request.body['now_time'];
                    Schema.aggregate().match({'$and':[time, {'$or':or_list}]}).unwind('@type').sort(sort).then(function(docs){
                        res.send(docs);
                    });
                }
                else{  // 싱글패싯
                    Schema.aggregate().match({'$or':or_list}).unwind('@type').sort(sort).then(function(docs){
                        res.send(docs);
                    });
                }
            }
            else if(typeof(title) === 'object'){   // 멀티 패싯 검색
                var match = title.map(function(v, i){
                    ori = {}, inv = {}, or_match = {}, def= {}, lbl1 = {}, lbl2 = {};s
                    var prev = _default_title + '_' + link[i].split('_')[0];
                    var inverse = link[i].split('_')[1] + '_' + link[i].split('_')[0];
                    ori[_state._resource + link[i] + '.@id'] = _state._resource + v;
                    def[_state._resource + prev + '.@id'] = _state._resource + v;
                    inv[_state._resource + inverse + '.@id'] = _state._resource + v;
                    lbl1[_label] = title[i];
                    lbl2[_label+'.@value'] = title[i];
                    or_match['$or'] = [ori, inv, def, lbl1, lbl2];
                    return or_match;
                });
                var and_match = match.map(function(v){return v});
                if(request.body.hasOwnProperty('searchData')){  // 멀티패싯 + 결과내 재검색
                    search = _state._search_list.map(function(item){
                        var obj = {};
                        obj[item] = {$regex:request.body['searchData'], $options:'i'};
                        return obj;
                    });
                    and_match.push({'$or':search});
                }else if(request.body.hasOwnProperty('now_time')){   // 멀티패싯 + 타임라인
                    var time = {}, chart_left = request.body['chart_left'];
                    time[_resource + chart_left + '_시간.@id'] = request.body['now_time'];
                    and_match.push(time);
                }
                // and_match.forEach(function(v){console.log('or : ', v['$or'])});
                Schema.aggregate().match({'$and':and_match}).unwind('@type').sort(sort).then(function(docs){
                    res.send(docs);
                })
            }
        }
        else{ // 왼쪽 패싯 없이 단순 결과내 재검색일 경우
            search = _state._search_list.map(function(item){
                var obj = {};
                obj[item] = {$regex:request.body['searchData'], $options:'i'};
                return obj;
            });
            Schema.aggregate().match({'$or':search}).unwind('@type').sort(sort).then(function(docs){
                res.send(docs);
            });
        }
    });
    /* ----------------------------------------------------------------------
    *   ajax 호출을 위한 함수 left facet 클릭시 발생함
    *   subClass와 inverse 관계의 모든 자료를 불러온다.
    * ----------------------------------------------------------------------*/
    app.get(/^\/initTimeline/, function(request, res){
        var cursor = Schema.find({}).where('@type').equals(_state._resource+'시간').cursor();
        var time_list = [], chart_left = request.query.chart_left;
        cursor.on('data', function(docs){
            var time = docs.toObject()['@id'];
            time_list.push(time);
        });
        cursor.on('close', function(){
            var list = [], item = 0;
            var list_size = time_list.length;
            time_list.forEach(function(docs){
                var match = {}, group = {};
                match[_state._resource + chart_left+'_시간.@id'] = docs;
                group['_id'] = null;
                group['count'] = {'$sum':1};
                Schema.aggregate().match(match).group(group).then(function(doc){
                    if(doc.length > 0){
                        list.push({
                            'time':docs.replace(_state._resource, '').replace('_', ''),
                            'cnt':doc[0].count
                        });
                    }
                    return Promise.all(list);
                }).then(function(data){
                    item++;
                    if(item===list_size) res.send(data);
                });
            });
        });
    });
    /* ----------------------------------------------------------------------
    *   ajax 호출을 위한 함수 left facet 클릭시 발생함
    *   subClass와 inverse 관계의 모든 자료를 불러온다.
    * ----------------------------------------------------------------------*/
    app.post(/^\/setTimeLine/, function(request, res){
        var match = {}, chart_left = request.body.chart_left, time_menu;
        var cursor = Schema.find({}).where('@id').equals(_state._resource + chart_left).cursor();
        cursor.on('data', function(docs){
            if(docs.toObject().hasOwnProperty(_state._defaultFacets)){
                time_menu = docs.toObject()[_state._defaultFacets]['@list'].map(function(item){return item['@id']});
            }
        });
        cursor.on('close', function(){
            match[_state._resource+chart_left+'_시간.@id'] = request.body['timeLine[]'];
            Schema.aggregate().match(match).then(function(docs){
                res.send({docs:docs, time_menu:time_menu});
            });
        });

    });
    /* ----------------------------------------------------------------------
    *   오늘의 향토자료에 불러올 데이터
    * ----------------------------------------------------------------------*/
    app.post(/^\/getTodayItem/, function(req, res){
        var item_idx = req.body['day'];
        var cursor = Schema.find({}).where('@id').equals(_state._resource + '민예품-01-' + item_idx).cursor();
        cursor.on('data', function(docs){
            res.send(docs.toObject());
        });
    });
    /* ----------------------------------------------------------------------
    *   searchBox
    * ----------------------------------------------------------------------*/
    app.post(/^\/searchBox/, function(req, res){
        var searchText = req.body['query'], result = [];
        var search_list = _state._search_list.map(function(item){
            var obj = {};
            obj[item] = {$regex:searchText, $options:'i'};
            return obj;
        });
        var cursor = Schema.find({}).or({$or:search_list}).where('@type').cursor();
        cursor.on('data', function(docs){
            result.push(docs.toObject());
        });
        cursor.on('close', function(){
            res.send(result);
        });
    });
    /* ----------------------------------------------------------------------
    *   입력 폼
    * ----------------------------------------------------------------------*/
    app.get(/^\/register\/(.*)/, function(req, res){
        var total = {}, subType = {}, sub_class = {};
        _commObj.inputType.forEach(function(item){
            total[item] = [], sub_class[item] = [];
            _commObj.collection[_state._resource + 'displayOnRegister_' + item]['@list'].forEach(function(v){
                var _id = v['@id'].replace(_state._resource, '');
                subType[_id] = [];
                sub_class[_id] = [];
                Schema.find({}).where(_state._subClassOf+'.@id').equals(v['@id']).cursor().on('data', function(docs){
                    var _obj = {}, _value = docs.toObject()[_state._label]['@value'];
                    _obj[_value] = [];
                    Schema.find({}).where('@type').equals(_state._resource + _value).cursor().on('data', function(docs){
                        _obj[_value].push(docs);
                    });
                    subType[_id].push(_obj);
                });
                Schema.find({'@type':v['@id']}).cursor().on('data', function(docs){
                    subType[v['@id'].replace(_state._resource, '')].push(docs);
                });
            })
        });
        function callback(total){
            res.render('register', {
                param:req.params[0],
                inputType:_commObj.inputType,
                menu:_state.menu,
                total:total,
                register:_commObj.register_list,
                subClass:_commObj.subClass,
                subType:subType
            });
        }
        getFacets();
        function getFacets(){
            var list = inputType.map(function(v){
                var match = {};
                match[_state._subClassOf+'.@id'] = _state._resource + v;
                return match;
            });
            var sub_list = [];
            var cursor = Schema.find({}).or(list).cursor();
            cursor.on('data', function(docs){
                sub_list.push({subclass:docs.toObject()[_state._subClassOf]['@id'], id:docs.toObject()['@id']});
            });
            cursor.on('close', function(){
                fnGetNormalFacet(sub_list);
            });
        }
        function fnGetNormalFacet(sub_list){
            var list = _commObj.inputType.map(function(item){
                var l = {type:_state._resource + item, sub_list:[]};
                sub_list.forEach(function(sub_item){
                    if(_state._resource + item === sub_item.subclass){
                        l['sub_list'].push(sub_item);
                    }
                });
                return l;
            });
            fnGetNormalType(list);
        }
        function fnGetNormalType(list){
            var idx = 0;
            var items = _commObj.inputType;
            list.forEach(function(v, i){
                var or_list = [];
                if(v['sub_list'].length > 0){
                    or_list = v['sub_list'].map(function(item){return {'@type':item.id}});
                }
                or_list.push({'@type':v['type']});
                var cursor = Schema.find({}).or(or_list).cursor(), result = [];
                cursor.on('data', function(docs){
                    result.push(docs);
                });
                cursor.on('close', function(){
                    idx++;
                    total[items[i]] = result;
                    if(idx === list.length) callback(total);
                });
            });
        }
    });
    //  register 타입 선택시 Ajax 호출
    app.get(/^\/getAjaxRegister\/(.*)/, function(req, res){
        var cursor = Schema.find({}).where('@type').equals(_state._resource+req.params[0]).cursor();
        var list = [];
        cursor.on('data', function(docs){
            list.push(docs);
        });
        cursor.on('close', function(){
            res.send(list);
        })
    });
    // detail page
    app.all(/^\/resource\/(.*)/, function(req, res){
        var _data = {}, docs_data;
        var orderedCollection = {};
        var resource_id = req.params[0].replace(/\./gi, '\[dot\]');
        function callback(data){
            res.render('detail', {
                docs_data:JSON.stringify(docs_data),
                data:JSON.stringify(data),
                menu:_state.menu,
                collection:JSON.stringify(orderedCollection),
                structure_data:JSON.stringify(_commObj.structure_data),
                searchList:_commObj.searchList
            });
        }
        function fnGetCollectionData() {
            try{
                var middle_list, bottom_list;
                var cursor = Schema.find({}).where('@id').equals(_state._resource + 'OrderedCollection').cursor();
                cursor.on('data', function(docs){
                    orderedCollection = docs.toObject();
                    middle_list = docs.toObject()[_state._resource + 'displayOnMiddle']['@list']
                        .map(function(item){return item['@id'];});
                    bottom_list = docs.toObject()[_state._resource + 'displayOnBottom']['@list']
                        .map(function(item){return item['@id'].replace(_state._resource, '');});
                });
                cursor.on('close', function(){
                    fnCreateProperty([middle_list, bottom_list]);
                });
            }catch(err){
                console.log('fnGetCollectionData err : ', err);
                throw err;
            }
        }
        function fnCreateProperty(list){
            try{
                var middle_list = list[0], resources = list[1], res_id = list[1], idx = 0;
                resources.push('그림');
                var new_list = [];
                Schema.aggregate().match({'@id': _state._resource + resource_id}).then(function (docs) {
                    docs_data = docs[0];
                    var type_list = [];
                    if(typeof(docs[0]['@type'])==='object' ){
                        docs[0]['@type'].forEach(function(v, i){
                            type_list.push(v);
                        });
                        _data['cls_name'] = type_list;
                    }else{
                        _data['cls_name'] = docs[0]['@type'].split('/resource/')[1];
                    }
                    if(docs[0].hasOwnProperty(_state._label)){
                        _data['title'] = (docs[0][_state._label].hasOwnProperty('@value'))?docs[0][_state._label]['@value']:docs[0][_state._label];
                    }else{
                        _data['title'] = docs[0]['@id'].replace(_state._resource, '');
                    }
                    if(docs[0].hasOwnProperty(_state._description))
                        _data['desc'] = docs[0][_state._description]['@value'].replace(/\[dot\]/gi, '.');
                    resources.forEach(function (v, i) {
                        if (docs[0].hasOwnProperty(_state._resource + v)){
                            if(docs[0][_state._resource + v].length > 0){
                                _data[res_id[i]] = [];
                                docs[0][_state._resource + v].forEach(function(w, j){
                                    _data[res_id[i]][j] = w;
                                });
                            }else
                                _data[res_id[i]] = docs[0][_state._resource + v]['@value'].replace(/\[dot\]/gi, '.');
                        }
                    });
                    if (docs[0].hasOwnProperty(_state._altLabel)){
                        if(docs[0][_state._altLabel].length > 0){
                            var alt_list = [];
                            docs[0][_state._altLabel].forEach(function(v){
                                var altLabel = {
                                    type:v['@type'],
                                    value:v['@value']
                                };
                                alt_list.push(altLabel);
                            });
                            _data['altLabel'] = alt_list;
                        }else
                            _data['altLabel'] = docs[0][_state._altLabel]['@value'].replace(/\[dot\]/gi, '.');
                    }
                    if (docs[0].hasOwnProperty(_state._prefLabel)){
                        if(docs[0][_state._prefLabel].length > 0){
                            var pref_list = [];
                            docs[0][_state._prefLabel].forEach(function(v){
                                var prefLabel = {
                                    language:v['@language'],
                                    value:v['@value']
                                };
                                pref_list.push(prefLabel);
                            });
                            _data['prefLabel'] = pref_list;
                        }else
                            _data['prefLabel'] = docs[0][_state._prefLabel]['@value'].replace(/\[dot\]/gi, '.');
                    }
                    if(docs[0].hasOwnProperty(_state._lat_long)){
                        _data['lat_long'] = docs[0][_state._lat_long]['@value'].replace(/\[dot\]/gi, '.');
                    }
                    return Promise.all(middle_list);
                }).then(function(data){
                    var docs_list;
                    new_list = data.map(function(item){var p = {}; p[item + '.@id'] = _state._resource + resource_id; return p;});
                    Schema.aggregate().match({'$or':new_list}).then(function(docs){
                        docs_list = docs;
                        _data['collection'] = docs;
                        callback(_data);
                    });
                });
            }catch(err){
                console.log('fnCreateProperty err : ', err);
                throw err;
            }
        }
        fnGetCollectionData();
    });
    // detail page 에서 속성 정보 얻어 오기
    app.post(/^\/getProperty/, function(req, res){
        var match = {};
        match[_state._resource + _default_title + '_' + req.body['type'] + '.@id'] = req.body['id'];
        Schema.aggregate().match(match).then(function(docs){
            res.send(docs);
        });
    });
    /* ----------------------------------------------------------------------
    *   관계사슬망
    *   detail 화면에서 관계사슬망 정보를 Ajax로 불러옴
    * ----------------------------------------------------------------------*/
    app.post('/getLinkedData/', function(req, res){
        var match = {}, id_match = {}, list = [], link_match = {};
        match['@id'] = _state._resource + 'OrderedCollection';
        id_match[_state._label+'.@value'] = req.body['title'];
        link_match[_state._resource + _default_title + '_' + req.body['cls_name']+'.@id'] =_state._resource + req.body['title'];
        Schema.aggregate().match({$or:[id_match, link_match]}).then(function(docs){
        }).then(function(){
            Schema.aggregate().match(match).then(function (docs) {
                docs[0][_state._resource + 'displayOnMiddle']['@list'].forEach(function (v){
                    list.push(v['@id']);
                });
                return Promise.all(list);
            }).then(function(data){
                var or_match, or_list = [];
                if(typeof(req.body['cls_name']) === 'undefined'){
                    data.forEach(function(v, i){
                        or_match = {};
                        or_match[v + '.@id'] = req.body['title'];
                        or_list.push(or_match);
                    });
                }else{
                    data.forEach(function(w, i){
                        or_match = {};
                        or_match[w + '.@id'] = _state._resource + req.body['title'];
                        or_list.push(or_match)
                    });
                }
                link_match[_state._resource + _default_title + '_' + req.body['cls_name']+'.@id'] =_state._resource + req.body['title'];
                or_list.push(link_match);
                Schema.find({$or:or_list}).exec(function(err, rest){
                    res.send(rest);
                });
            });
        });
    });
    app.post(/^\/getSubClass/, function(req, res){
        var result = [], response = {}, match = {}, list = [];
        var subClass = Schema.find({})
            .where(_state._subClassOf+'.@id').equals(_state._resource+req.body['data'])
            .select('@id').cursor();
        subClass.on('data', function(docs){
            result.push(docs.toObject());
        });
        subClass.on('close', function(){
            res.send(result);
        });
    });
    app.post(/^\/getEachData/, function(req, res){
        var match = {};
        match['@type'] = req.body['data'];
        Schema.aggregate().match(match).then(function(docs){
            res.send(docs);
        });
    });
    app.post(/^\/getMultiCount/, function(req, res){
        var data = req.body['name[]'], res_list = [], idx = 0;
        data.forEach((d) => {
            var list = [];
            middle_list.filter((f) => {
                if(f.indexOf('기록물건명') > -1) return f;
            }).forEach((v) => {
                var or_list = {};
                or_list[v + '.@id'] = _state._resource + d;
                list.push(or_list);
            });
            var collection = Schema.find({'$or':list});
            collection.count((err, count) => {
                if(err) throw err;
                res_list.push({name:d, count:count});
                if(++idx === data.length) {
                    res.send({res:res_list});
                }
            });
        });
    });
    app.post(/^\/getListCount/, function(req, res){
        var name = req.body['name'], list = [];
        _commObj.middle_list.filter(function(f){if(f.indexOf('기록물건명') > -1) return f;})
            .forEach(function(v){var or_list = {}; or_list[v + '.@id'] = _state._resource + name; list.push(or_list)});
        var collection = Schema.find({'$or':list});
        collection.count(function(err, count){
            if(err) throw err;
            res.send({name:name, count:count});
        });
    });
    // sitemap 클릭 이벤트
    app.post(/^\/getSearchData/, function(req, res){
        var or_list = [], rest = [];
        if(req.body.hasOwnProperty('data[]')){
            req.body['data[]'].forEach(function(v){
                or_list.push({'@type':v});
            });
        }else{
            or_list.push({'@type':req.body['data']});
        }
        var cursor;
        if(req.body['searchText'] !== ''){
            var searchText = req.body['searchText'];
            var search_list = _state._search_list.map(function(item){
                var obj = {};
                obj[item] = {$regex:searchText, $options:'i'};
                return obj;
            });
            cursor = Schema.find({$or:search_list}).cursor();
        }else{
            cursor = Schema.find({$or:or_list}).cursor();
        }

        cursor.on('data', function(docs){
            rest.push(docs);
        });
        cursor.on('close', function(){
            res.send(rest);
        });
    });
    app.post(/^\/getBodyData/, function(req, res){
        var match = {};
        match['@type'] = req.body['data'];
        Schema.aggregate().match(match).then(function(docs){
            res.send({
                docs:docs,
                title:req.body['data']
            });
        });
    });
    app.get(/^\/getIdData\/(.*)/, function(req, res){
        var result;
        var cursor = Schema.find({}).where('@id').equals(_state._resource+req.params[0]).cursor();
        cursor.on('data', function(docs){
            result = docs.toObject();
        });
        cursor.on('close', function(){
            res.send(result);
        });
    });
    /*  -------------------------------------------------------------
    *   file Download
    *   LOD JSON FILE
    *   -------------------------------------------------------------*/
    app.get('/getLodFile/:id', function(req, res){
        var request = require('request');
        request.get('http://lod.nl.go.kr/data/' + req.params.id + '?output=json', function(err, resp, body){
            if(!err && resp.statusCode === 200){
                res.send(body);
            }else{
                res.send('해당 ID로 검색된 자료가 없습니다. ');
            }
        });
    });
    app.all(/^\/sitemap/, function(req, res){
        if(req.body.hasOwnProperty('@searchable')){
            var searchText = req.body['@searchable'], result = [];
            /*  ----------------------------------------------------------------------------------------
            *   검색 내용을 몽고 디비에 저장해서 빈도수를 구한다.
            *   컬렉션 이름 : milSearch
            *   저장할 내용 : 검색어, 검색일
            *   --------------------------------------------------------------------------------------*/
            if(searchText !== ''){
                MongoClient.connect(url, {useNewUrlParser:true}, function(err, db){
                    if(err) throw err;
                    var dbo = db.db('Khistory');
                    dbo.collection('milSearch').insertOne({searchText:searchText, date:_commObj.nowDate}, function(err, res){
                        if(err) throw err;
                        db.close();
                    })
                });
            }
            getFrequency();
            var search_list = _state._search_list.map(function(item){
                var obj = {};
                obj[item] = {$regex:searchText, $options: 'i'};
                return obj;
            });
            var cursor = Schema.find({}).or({$or:search_list}).where('@type').cursor();
            cursor.on('data', function(docs){
                result.push(docs);
            });
            cursor.on('close', function(){
                res.render('sitemap', {
                    menu:_state.menu,
                    list:result,
                    left:_commObj.__left,
                    facet_list:_commObj.__facet_list,
                    type:'post',
                    searchText:searchText,
                    admin:req.session,
                    searchList:_commObj.searchList
                });
            });
        }else{
            res.render('sitemap', {
                menu:_state.menu,
                list:$list,
                left:_commObj.__left,
                facet_list:_commObj.__facet_list,
                type:'default',
                searchText:'',
                admin:req.session,
                searchList:_commObj.searchList
            });
        }
    });

    app.post('/getDataByType', (req, res) =>{
        var type = req.body['type'], result = [];
        var cursor = Schema.find({'@type':_state._resource + type}).cursor();
        cursor.on('data', function(docs){result.push(docs)});
        cursor.on('close', function(){
            res.send({
                result:result
            })
        })
    });
    getFrequency();
    function getFrequency(){
        MongoClient.connect(url, {useNewUrlParser:true}, function(err, db){
            if(err) throw err;
            var dbo = db.db('Khistory');
            dbo.collection('milSearch')
                .aggregate([{$match:{date:{$gte:_commObj.lastWeek}}},{$group:{_id:'$searchText', count:{$sum:1}}}]).toArray(function(err, res){
                if(err) throw err;
                searchList = res.sort(function(a, b){return (a.count < b.count)?1:(a.count > b.count)?-1:0});
                db.close();
            })
        });
    }
};