const _label = 'http://www[dot]w3[dot]org/2000/01/rdf-schema#label';
const _altLabel = 'http://www[dot]w3[dot]org/2004/02/skos/core#altLabel';
const _prefLabel = 'http://www[dot]w3[dot]org/2004/02/skos/core#prefLabel';
const _hiddenLabel = 'http://www.w3.org/2004/02/skos/core#hiddenLabel';
const _description = 'http://purl[dot]org/dc/elements/1[dot]1/description';
const _subClassOf = 'http://www[dot]w3[dot]org/2000/01/rdf-schema#subClassOf';
const _defaultFacets = 'http://topbraid[dot]org/facet#defaultFacets';
const _class = 'http://www[dot]w3[dot]org/2002/07/owl#Class';
// const _resource = 'http://16[dot]1[dot]159[dot]233:8106/resource/';
const _resource = 'http://mil[dot]k-history[dot]kr/resource/';
const _thing = 'http://www[dot]w3[dot]org/2002/07/owl#Thing';
const _lat_long = 'http://www[dot]w3[dot]org/2003/01/geo/wgs84_pos#lat_long';
const _objectProperty = 'http://www[dot]w3[dot]org/2002/07/owl#ObjectProperty';
const _datatypeProperty = 'http://www[dot]w3[dot]org/2002/07/owl#DatatypeProperty';
const _default_title = '기록물건';
const Promise = require('promise');

var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/';
var searchList;
var date = new Date();
var nowDate = getDateStr(date);
var d = getLastWeek();
var lastWeek = getDateStr(d);

function getLastWeek() {
    var today = new Date();
    var lastW = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
    return lastW;
}
function getDateStr(date){
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var year = date.getFullYear();
    return ("0000" + year.toString()).slice(-4) + ("00" + month.toString()).slice(-2) + ("00" + day.toString()).slice(-2);
}
var menu = {
    "home":{
        label: "Home",
        out:"Home",
        baseUrl: "/"
    },
    "mongo_1":{
        label:"기록물건명",
        out:"기록물건명",
        baseUrl:"/mongo/기록물건명"
    },
    "mongo_3":{
        label:"결재권자",
        out:"결재권자",
        baseUrl:"/mongo/결재권자"
    },
    "mongo_4":{
        label:"생산당시총장",
        out:"생산당시총장",
        baseUrl:"/mongo/생산당시총장"
    },
    "mongo_5":{
        label:"업무기능",
        out:"업무기능",
        baseUrl:"/mongo/업무기능"
    },
    "mongo_6":{
        label:"생산기관",
        out:"생산기관",
        baseUrl:"/mongo/생산기관"
    },
    "mongo_7":{
        label:"시간",
        out:"시간",
        baseUrl:"/mongo/시간"
    },      
    "mongo_8":{
        label:"공간",
        out:"공간",
        baseUrl:"/mongo/공간"
    },
    "mongo_9":{
        label:"사람",
        out:"사람",
        baseUrl:"/mongo/사람"
    },
    "mongo_10":{
        label:"이벤트",
        out:"이벤트",
        baseUrl:"/mongo/이벤트"
    },
    "mongo_2":{
        label:"대외자료",
        out:"대외자료",
        baseUrl:"/mongo/대외자료"
    },
    "mongo_11":{
        label:"아이디어",
        out:"아이디어",
        baseUrl:"/mongo/아이디어"
    }
};
var _search_list = [
    '@id',
    'http://www[dot]w3[dot]org/2000/01/rdf-schema#label.@value',
    'http://www[dot]w3[dot]org/2000/01/rdf-schema#label',
    'http://www[dot]w3[dot]org/2004/02/skos/core#altLabel.@value',
    'http://www[dot]w3[dot]org/2004/02/skos/core#altLabel',
    'http://www[dot]w3[dot]org/2004/02/skos/core#prefLabel.@value',
    'http://www[dot]w3[dot]org/2004/02/skos/core#prefLabel',
    'http://www[dot]w3[dot]org/2004/02/skos/core#hiddenLabel.@value',
    'http://www[dot]w3[dot]org/2004/02/skos/core#hiddenLabel',
    'http://www[dot]w3[dot]org/2004/02/skos/core#Concept',
    'http://www[dot]w3[dot]org/2004/02/skos/core#changeNote',
    'http://www[dot]w3[dot]org/2004/02/skos/core#changeNote.@value'
];
Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};
module.exports = function(app, fs, Schema) {
    // 데이터에 필수로 들어갈 내용들을 서버 구동시 작성함.
    var menu_size = Object.size(menu), __idx = 1, __left = [], __facet_list = [], __depth_list = [], $list = [];
    var collection_cursor = Schema.find({}).where('@id').equals(_resource + 'OrderedCollection').cursor();
    var dataStructure = Schema.find({}).where('@id').equals(_resource + 'TableDisplay').cursor();
    var subProductCursor = Schema.find({}).where('@type').equals(_resource + '부실단').cursor(), subProductList = [];
    var data_list, structure = [], structure_data = {}, facet_count_list = [];
    var displayOnFacet, inputType, register_list = {}, subClass = {}, collection, distinct_list = [], middle_list = [];
    var count_facet = ['업무기능', '생산기관', '공간', '이벤트'];
    // var count_facet = ['공간'];

    subProductCursor.on('data', function(docs){
        subProductList.push(docs.toObject()['@id'].replace(_resource, ''));
    });
    dataStructure.on('data', function(docs){
        data_list = docs.toObject()[_resource + 'displayOnTable']['@list'].map(function(item){
            return item['@id'].replace(_resource, '');
        });
    });
    dataStructure.on('close', function(){
        data_list.forEach(function(v){
            var facet_title = {};
            if(v.indexOf('with') > -1){
                if(distinct_list.indexOf(v.split('with')[0]) > -1) return false;
                var sub_facet = [];
                v.split('with')[1].split('or').forEach(function(w){
                    if(w.indexOf('in') > -1){
                        var arr = {};
                        arr[w.split('in')[1]] = w.split('in')[0].split('and').map(function(x){return x;});
                        sub_facet.push(arr);
                    }else{
                        sub_facet.push(w);
                    }
                });
                facet_title[v.split('with')[0]] = sub_facet;
                structure_data[v.split('with')[0]] = sub_facet;
                structure.push(facet_title);
                distinct_list.push(v.split('with')[0]);
            }else{
                if(distinct_list.indexOf(v) > -1) return false;
                structure.push(v);
                distinct_list.push(v);
                structure_data[v] = [v];
            }
        });
        for(var key in menu){
            structure.forEach(function(v){
                if(typeof(v) === 'object'){
                    if(menu[key]['label'] === Object.keys(v)[0]){
                        menu[key].subClass = [];
                        v[Object.keys(v)[0]].forEach(function(w){
                            if(typeof(w) === 'object'){
                                menu[key]['subClass'].push(w);
                            }else{
                                menu[key]['subClass'].push(w);
                            }
                        })
                    }
                }
            });
        }
        init();
    });
    collection_cursor.on('data', function(docs){
        collection = docs.toObject();
        displayOnFacet = collection[_resource + 'displayOnFacet'];
        // register 관련
        inputType = collection[_resource + 'displayOnRegister']['@list']
            .map(function(item){return item['@id'].replace(_resource, '')})
            .filter(function(f){if(docs.toObject().hasOwnProperty(_resource + 'displayOnRegister_' + f)) {return f;}});
        inputType.forEach(function(v){
            register_list[v] = [];
            docs.toObject()[_resource + 'displayOnRegister_' + v]['@list'].forEach(function(w){
                Schema.find(w).cursor().on('data', function(reg_docs){
                    register_list[v].push(reg_docs);
                });
            });
            subClass[v] = [];
            Schema.find({}).where(_subClassOf + '.@id').equals(_resource + v).cursor().on('data', function(docs){
                subClass[v].push(docs);
            });
        });
        middle_list = collection[_resource + 'displayOnMiddle']['@list'].map(function(item){return item['@id']});
        fnCountInnerTable();
    });
    app.get(/^\/intro\/(.*)/, function(req, res){
        res.render('intro/'+req.params[0], {
            menu:menu,
            searchList:searchList
        });
    });
    // 메인 화면에 각 패싯별 카운트를 구한다.
    app.get(/^\/(|index\.html)$/, function(req, res){
        var total = [];
        var facets = [{title:'기록물건명', idx:0},{title:'생산기관', idx:1},{title:'핵심키워드', idx:2},{title:'결재권자', idx:3},{title:'대외자료', idx:4},{title:'이벤트', idx:5},{title:'사람', idx:6}];
        function callback(){
            total = total.sort(function(a, b){
                return a.idx - b.idx;
            });
            res.render('home', {
                menu:menu,
                total:JSON.stringify(total),
                data:total,
                searchList:searchList
            });
        }
        fnGetSubClass();
        function fnGetSubClass(){
            var subClass = [], idx = 0;
            facets.forEach(function(v, i){
                var list = [];
                var cursor = Schema.find({}).where(_subClassOf + '.@id').equals(_resource+v.title).cursor();
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
                or_list.push({'@type':_resource+v.parent});
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
            // 이중으로 쌓여진 Array를 풀고 new_items에 넣기
            for(var i=0; i<left_data.length; i++){
                left_data[i]['new_items'] = [];
                left_data[i]['sub_items'].forEach(function(v){
                    left_data[i]['new_items'] = left_data[i]['new_items'].concat(v);
                });
            }
            // 오름차순 정렬
            for(var i=0; i<left_data.length; i++){
                left_data[i]['new_items'].sort(function(a, b){
                    return (a.value < b.value)?-1:(a.value > b.value)?1:0;
                });
            }
            if(req.params[0]==='시간'){
                res.render('timeline', {
                    left:JSON.stringify(left),
                    sub_class:JSON.stringify(subClassList),
                    left_store:JSON.stringify(left_data),
                    store:JSON.stringify(body_data),
                    menu:menu,
                    left_menu:JSON.stringify(left_menu),
                    body:JSON.stringify(body),
                    searchList:searchList,
                    subProductList:subProductList,
                    facet_count_list:JSON.stringify(facet_count_list)
                })
            }else{
                res.render('index', {
                    left:JSON.stringify(left),
                    sub_class:JSON.stringify(subClassList),
                    left_store:JSON.stringify(left_data),
                    store:JSON.stringify(body_data),
                    menu:menu,
                    left_menu:JSON.stringify(left_menu),
                    body:JSON.stringify(body),
                    searchList:searchList,
                    subProductList:subProductList,
                    facet_count_list:JSON.stringify(facet_count_list)
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
            match['@id'] = _resource + req.params[0];
            // cursor 만들기
            var left_facets = Schema.find({'@id':_resource + req.params[0]}).cursor();
            left_facets.on('data', function(docs){
                if(docs.toObject().hasOwnProperty(_defaultFacets)){
                    docs.toObject()[_defaultFacets]['@list'].forEach(function(list){
                        var inverse = _resource + list['@id'].split('/resource/')[1].split('_')[1] + '_' + list['@id'].split('/resource/')[1].split('_')[0];
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
                    list.push({'@type':_resource+req.params[0]});
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
                        type_list.push({'@id':_resource + v});
                    });
                }else type_list.push({'@id':_resource + item});
            });
            var subClass = Schema.find({}).or({'$or':type_list}).cursor();
            subClass.on('data', function(docs){
                subClassList.push({'@type':docs.toObject()['@id']});
            });
            subClass.on('close', function(){
                subClassList.push({'@type':_resource+req.params[0]});
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
        sort[_label + '.@value'] = 1;
        if(request.body.hasOwnProperty('facet_title[]')){
            var title = request.body['facet_title[]'];
            var link = request.body['facet_link[]'];
            if(typeof(title) === 'string'){ // 싱글패싯 검색
                var prev = _default_title + '_' + link.split('_')[0];
                var inverse = link.split('_')[1] + '_' + link.split('_')[0];
                ori[_resource + link + '.@id'] = _resource + title;
                inv[_resource + inverse + '.@id'] = _resource + title;
                def[_resource + prev + '.@id'] = _resource + title;
                lbl1[_label] = title;
                lbl2[_label+'.@value'] = title;
                or_list.push(ori, inv, def, lbl1, lbl2);
                if(request.body.hasOwnProperty('subClass')){
                    subClass['@id'] = request.body['subClass'];
                    or_list.push(subClass);
                }
                if(request.body.hasOwnProperty('searchData')){  // 싱글패싯 + 결과내 재검색
                    search = _search_list.map(function(item){
                        var obj = {};
                        obj[item] = {$regex:request.body['searchData']};
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
                    ori = {}, inv = {}, or_match = {}, def= {}, lbl1 = {}, lbl2 = {};
                    var prev = _default_title + '_' + link[i].split('_')[0];
                    var inverse = link[i].split('_')[1] + '_' + link[i].split('_')[0];
                    ori[_resource + link[i] + '.@id'] = _resource + v;
                    def[_resource + prev + '.@id'] = _resource + v;
                    inv[_resource + inverse + '.@id'] = _resource + v;
                    lbl1[_label] = title[i];
                    lbl2[_label+'.@value'] = title[i];
                    or_match['$or'] = [ori, inv, def, lbl1, lbl2];
                    return or_match;
                });
                var and_match = match.map(function(v){return v});
                if(request.body.hasOwnProperty('searchData')){  // 멀티패싯 + 결과내 재검색
                    search = _search_list.map(function(item){
                        var obj = {};
                        obj[item] = {$regex:request.body['searchData']};
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
            search = _search_list.map(function(item){
                var obj = {};
                obj[item] = {$regex:request.body['searchData']};
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
        var cursor = Schema.find({}).where('@type').equals(_resource+'시간').cursor();
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
                match[_resource+chart_left+'_시간.@id'] = docs;
                group['_id'] = null;
                group['count'] = {'$sum':1};
                Schema.aggregate().match(match).group(group).then(function(doc){
                    if(doc.length > 0){
                        list.push({
                            'time':docs.replace(_resource, '').replace('_', ''),
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
        var cursor = Schema.find({}).where('@id').equals(_resource + chart_left).cursor();
        cursor.on('data', function(docs){
            if(docs.toObject().hasOwnProperty(_defaultFacets)){
                time_menu = docs.toObject()[_defaultFacets]['@list'].map(function(item){return item['@id']});
            }
        });
        cursor.on('close', function(){
            match[_resource+chart_left+'_시간.@id'] = request.body['timeLine[]'];
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
        var cursor = Schema.find({}).where('@id').equals(_resource + '민예품-01-' + item_idx).cursor();
        cursor.on('data', function(docs){
            res.send(docs.toObject());
        });
    });
    /* ----------------------------------------------------------------------
    *   searchBox
    * ----------------------------------------------------------------------*/
    app.post(/^\/searchBox/, function(req, res){
        var searchText = req.body['query'], result = [];
        var search_list = _search_list.map(function(item){
            var obj = {};
            obj[item] = {$regex:searchText};
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
        inputType.forEach(function(item){
            total[item] = [], sub_class[item] = [];
            collection[_resource + 'displayOnRegister_' + item]['@list'].forEach(function(v){
                var _id = v['@id'].replace(_resource, '');
                subType[_id] = [];
                sub_class[_id] = [];
                Schema.find({}).where(_subClassOf+'.@id').equals(v['@id']).cursor().on('data', function(docs){
                    var _obj = {}, _value = docs.toObject()[_label]['@value'];
                    _obj[_value] = [];
                    Schema.find({}).where('@type').equals(_resource + _value).cursor().on('data', function(docs){
                        _obj[_value].push(docs);
                    });
                    subType[_id].push(_obj);
                });
                Schema.find({'@type':v['@id']}).cursor().on('data', function(docs){
                    subType[v['@id'].replace(_resource, '')].push(docs);
                });
            })
        });
        function callback(total){
            res.render('register', {
                param:req.params[0],
                inputType:inputType,
                menu:menu,
                total:total,
                register:register_list,
                subClass:subClass,
                subType:subType
            });
        }
        getFacets();
        function getFacets(){
            var list = inputType.map(function(v){
                var match = {};
                match[_subClassOf+'.@id'] = _resource + v;
                return match;
            });
            var sub_list = [];
            var cursor = Schema.find({}).or(list).cursor();
            cursor.on('data', function(docs){
                sub_list.push({subclass:docs.toObject()[_subClassOf]['@id'], id:docs.toObject()['@id']});
            });
            cursor.on('close', function(){
                fnGetNormalFacet(sub_list);
            });
        }
        function fnGetNormalFacet(sub_list){
            var list = inputType.map(function(item){
                var l = {type:_resource + item, sub_list:[]};
                sub_list.forEach(function(sub_item){
                    if(_resource + item === sub_item.subclass){
                        l['sub_list'].push(sub_item);
                    }
                });
                return l;
            });
            fnGetNormalType(list);
        }
        function fnGetNormalType(list){
            var idx = 0;
            var items = inputType;
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
        var cursor = Schema.find({}).where('@type').equals(_resource+req.params[0]).cursor();
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
                menu:menu,
                collection:JSON.stringify(orderedCollection),
                structure_data:JSON.stringify(structure_data),
                searchList:searchList
            });
        }
        function fnGetCollectionData() {
            var middle_list, bottom_list;
            var cursor = Schema.find({}).where('@id').equals(_resource + 'OrderedCollection').cursor();
            cursor.on('data', function(docs){
                orderedCollection = docs.toObject();
                middle_list = docs.toObject()[_resource + 'displayOnMiddle']['@list']
                    .map(function(item){return item['@id'];});
                bottom_list = docs.toObject()[_resource + 'displayOnBottom']['@list']
                    .map(function(item){return item['@id'].replace(_resource, '');});
            });
            cursor.on('close', function(){
                fnCreateProperty([middle_list, bottom_list]);
            });
        }
        function fnCreateProperty(list){
            var middle_list = list[0], resources = list[1], res_id = list[1], idx = 0;
            resources.push('그림');
            var new_list = [];
            Schema.aggregate().match({'@id': _resource + resource_id}).then(function (docs) {
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
                if(docs[0].hasOwnProperty(_label)){
                    _data['title'] = (docs[0][_label].hasOwnProperty('@value'))?docs[0][_label]['@value']:docs[0][_label];
                }else{
                    _data['title'] = docs[0]['@id'].replace(_resource, '');
                }
                if(docs[0].hasOwnProperty(_description))
                    _data['desc'] = docs[0][_description]['@value'].replace(/\[dot\]/gi, '.');
                resources.forEach(function (v, i) {
                    if (docs[0].hasOwnProperty(_resource + v)){
                        if(docs[0][_resource+v].length > 0){
                            _data[res_id[i]] = [];
                            docs[0][_resource+v].forEach(function(w, j){
                                _data[res_id[i]][j] = w;
                            });
                        }else
                            _data[res_id[i]] = docs[0][_resource + v]['@value'].replace(/\[dot\]/gi, '.');
                    }
                });
                if (docs[0].hasOwnProperty(_altLabel)){
                    if(docs[0][_altLabel].length > 0){
                        var alt_list = [];
                        docs[0][_altLabel].forEach(function(v){
                            var altLabel = {
                                type:v['@type'],
                                value:v['@value']
                            };
                            alt_list.push(altLabel);
                        });
                        _data['altLabel'] = alt_list;
                    }else
                        _data['altLabel'] = docs[0][_altLabel]['@value'].replace(/\[dot\]/gi, '.');
                }
                if (docs[0].hasOwnProperty(_prefLabel)){
                    if(docs[0][_prefLabel].length > 0){
                        var pref_list = [];
                        docs[0][_prefLabel].forEach(function(v){
                            var prefLabel = {
                                language:v['@language'],
                                value:v['@value']
                            };
                            pref_list.push(prefLabel);
                        });
                        _data['prefLabel'] = pref_list;
                    }else
                        _data['prefLabel'] = docs[0][_prefLabel]['@value'].replace(/\[dot\]/gi, '.');
                }
                if(docs[0].hasOwnProperty(_lat_long)){
                    _data['lat_long'] = docs[0][_lat_long]['@value'].replace(/\[dot\]/gi, '.');
                }
                return Promise.all(middle_list);
            }).then(function(data){
                var docs_list;
                new_list = data.map(function(item){var p = {}; p[item + '.@id'] = _resource + resource_id; return p;});
                Schema.aggregate().match({'$or':new_list}).then(function(docs){
                    docs_list = docs;
                    _data['collection'] = docs;
                    callback(_data);
                });
            });
        }
        fnGetCollectionData();
    });
    // detail page 에서 속성 정보 얻어 오기
    app.post(/^\/getProperty/, function(req, res){
        var match = {};
        match[_resource + _default_title + '_' + req.body['type'] + '.@id'] = req.body['id'];
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
        match['@id'] = _resource + 'OrderedCollection';
        id_match[_label+'.@value'] = req.body['title'];
        link_match[_resource + _default_title + '_' + req.body['cls_name']+'.@id'] =_resource + req.body['title'];
        Schema.aggregate().match({$or:[id_match, link_match]}).then(function(docs){
        }).then(function(){
            Schema.aggregate().match(match).then(function (docs) {
                docs[0][_resource + 'displayOnMiddle']['@list'].forEach(function (v){
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
                        or_match[w + '.@id'] = _resource + req.body['title'];
                        or_list.push(or_match)
                    });
                }
                link_match[_resource + _default_title + '_' + req.body['cls_name']+'.@id'] =_resource + req.body['title'];
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
            .where(_subClassOf+'.@id').equals(_resource+req.body['data'])
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
            // idx++;
            var list = [];
            middle_list.filter((f) => {
                if(f.indexOf('기록물건명') > -1) return f;
            }).forEach((v) => {
                var or_list = {};
                or_list[v + '.@id'] = _resource + d;
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
        var facet = req.body['facet'], name = req.body['name'], list = [];
        middle_list.filter(function(f){if(f.indexOf('기록물건명') > -1) return f;})
            .forEach(function(v){var or_list = {}; or_list[v + '.@id'] = _resource + name; list.push(or_list)});
        var collection = Schema.find({'$or':list});
        collection.count(function(err, count){
            if(err) throw err;
            res.send({name:name, count:count});
        });
    });
    // sitemap 클릭 이벤트
    app.post(/^\/getSearchData/, function(req, res){
        var or_list = [], rest = [];
        console.log(req.body);
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
            var search_list = _search_list.map(function(item){
                var obj = {};
                obj[item] = {$regex:searchText};
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
        var cursor = Schema.find({}).where('@id').equals(_resource+req.params[0]).cursor();
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
                    dbo.collection('milSearch').insertOne({searchText:searchText, date:nowDate}, function(err, res){
                        if(err) throw err;
                        db.close();
                    })
                });
            }
            getFrequency();
            var search_list = _search_list.map(function(item){
                var obj = {};
                obj[item] = {$regex:searchText};
                return obj;
            });
            var cursor = Schema.find({}).or({$or:search_list}).where('@type').cursor();
            cursor.on('data', function(docs){
                result.push(docs);
            });
            cursor.on('close', function(){
                res.render('sitemap', {
                    menu:menu,
                    list:result,
                    left:__left,
                    facet_list:__facet_list,
                    type:'post',
                    searchText:searchText,
                    admin:req.session,
                    searchList:searchList
                });
            });
        }else{
            res.render('sitemap', {
                menu:menu,
                list:$list,
                left:__left,
                facet_list:__facet_list,
                type:'default',
                searchText:'',
                admin:req.session,
                searchList:searchList
            });
        }
    });
    getFrequency();
    function getFrequency(){
        MongoClient.connect(url, {useNewUrlParser:true}, function(err, db){
            if(err) throw err;
            var dbo = db.db('Khistory');
            dbo.collection('milSearch')
                .aggregate([{$match:{date:{$gte:lastWeek}}},{$group:{_id:'$searchText', count:{$sum:1}}}]).toArray(function(err, res){
                if(err) throw err;
                searchList = res.sort(function(a, b){return (a.count < b.count)?1:(a.count > b.count)?-1:0});
                db.close();
            })
        });
    }
    function fnCountInnerTable(){
        count_facet.forEach((f) => {
            var obj = {name:f, list:[]};
            var cursor = Schema.find({'@type':_resource + f}).cursor();
            cursor.on('data', (docs) => {
                obj.list.push(docs.toObject()['@id']);
            });
            cursor.on('close', () => {
                fnGetFacetObjCount(obj, f);
            });
        });
    }
    function fnGetFacetObjCount(obj, name){
        var data = obj.list, idx = 0, or_list, facet_count = {};
        var size = obj.list.length;
        facet_count['name'] = name;
        facet_count['list'] = [];
        data.forEach((d) => {
            var list = [];
            middle_list.filter((f) => {
                if(f.indexOf('기록물건명') > -1) return f;
            }).forEach((v) => {
                or_list = {};
                or_list[v + '.@id'] = d;
                list.push(or_list);
            });
            var collection = Schema.find({'$or':list});
            collection.count((err, count) => {
                if(err) throw err;
                facet_count['list'].push({name:d.replace(_resource, ''), count:count});
                if(++idx === size) facet_count_list.push(facet_count);
            });
        });
    }
    function init(){
        for(var key in menu){
            var facet = menu[key]['label'];
            if(facet !== 'Home'){
                if(menu[key].hasOwnProperty('subClass')){
                    menu[key].subClass.forEach(function(v){
                        if(typeof(v) === 'object'){
                            v[Object.keys(v)].forEach(function(w){
                                Schema.aggregate([{$match:{'@type':_resource + w}}, {$group:{'_id':w, count:{$sum:1}}}]).then(function(docs){
                                    $list.push(docs[0]);
                                });
                            })
                        }
                        else{
                            Schema.aggregate([{$match:{'@type':_resource + v}}, {$group:{'_id':v, count:{$sum:1}}}]).then(function(docs){
                                $list.push(docs[0]);
                            });
                        }
                    })
                }
                Schema.aggregate([{$match:{'@type':_resource + menu[key]['label']}}, {$group:{'_id':menu[key]['label'], count:{$sum:1}}}]).then(function(docs){
                    $list.push(docs[0]);
                });
            }
        }

        for(var key in menu){
            var facet = menu[key]['label'];
            if(facet !== 'Home'){
                Schema.aggregate([{$match:{'@type':_resource + facet}}, {$group:{'_id':facet, count:{$sum:1}}}]).then(function(agg_docs){
                    __facet_list.push(agg_docs[0]);
                });
                var name, facet_cursor = Schema.find({'@id':_resource + facet}).cursor();
                facet_cursor.on('data', function(docs){
                    name = docs.toObject()[_label]['@value'].replace(/ /gi, '');
                    var sub_find = {};
                    sub_find[_subClassOf + '.@id'] = docs.toObject()['@id'];
                    __left.push({name:name, link:docs.toObject()[_defaultFacets]['@list'], sub_find:sub_find});
                });
                facet_cursor.on('close', function(){
                    __idx++;
                    if(__idx === menu_size) fnGetSubClass();
                });
            }
        }
        function fnGetSubClass(){
            var size = __left.length, sub_idx = 0;
            __left.forEach(function(v){
                var cursor = Schema.find(v.sub_find).cursor();
                v.subClass = [];
                cursor.on('data', function(docs){
                    v.subClass.push({docs:docs});
                });
                cursor.on('close', function(){
                    sub_idx++;
                    if(size === sub_idx) fnGetCount();
                });
            });
        }
        function fnGetCount(){
            var _idx = 0, curr_idx = 0;
            __left.forEach(function(v){
                if(v.subClass.length === 0) return false;
                curr_idx += parseInt(v.subClass.length);
                v.subClass.forEach(function(w){
                    Schema.aggregate([{$match:{'@type':w.docs.toObject()['@id']}},{$group:{_id:w.docs.toObject()['@id'].replace(_resource, ''), count:{$sum:1}}}]).then(function(agg_docs){
                        _idx++;
                        w.count = agg_docs[0].count;
                        __depth_list.push(w);
                    });
                });
            });
        }
    }
};