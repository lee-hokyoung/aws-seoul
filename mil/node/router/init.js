const _state = require('../router/state');

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

const Schema = require('../model/jeju');
const _resource = _state._resource;
const _subClassOf = _state._subClassOf;
const menu = _state._menu;
const _label = _state._label;
const _defaultFacets = _state._defaultFacets;

// 데이터에 필수로 들어갈 내용들을 서버 구동시 작성함.
var menu_size = Object.size(menu), __idx = 1, __left = [], __facet_list = [], __depth_list = [], $list = [];
var collection_cursor = Schema.find({}).where('@id').equals(_resource + 'OrderedCollection').cursor();
var dataStructure = Schema.find({}).where('@id').equals(_resource + 'TableDisplay').cursor();
var subProductCursor = Schema.find({}).where('@type').equals(_resource + '부실단').cursor(), subProductList = [];
var data_list, structure = [], structure_data = {}, facet_count_list = [];
var displayOnFacet, inputType, register_list = {}, subClass = {}, collection, distinct_list = [], middle_list = [];
var count_facet = ['업무기능', '생산기관', '공간', '이벤트'];
var MongoClient = require('mongodb').   MongoClient;
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
        var _idx = 0, curr_idx = 0, f_idx = 0;
        __left.forEach(function(v, i){
            if(v.subClass.length === 0) return false;
            curr_idx += parseInt(v.subClass.length);
            v.subClass.forEach(function(w, j){
                Schema.aggregate([{$match:{'@type':w.docs.toObject()['@id']}},
                    {$group:{_id:w.docs.toObject()['@id'].replace(_resource, ''), count:{$sum:1}}}])
                    .then((agg_docs) => {
                        _idx++;
                        w.count = agg_docs[0].count;
                        __depth_list.push(w);
                    }).then(() => {
                    f_idx++;
                    if(f_idx === curr_idx - 1) cb();
                });
            });
        });
    }
}

function cb(){
    module.exports = {
        depth_list:__depth_list,
        left:__left,
        facet_list:__facet_list,
        collection:collection,
        middle_list:middle_list,
        searchList:searchList
    }
}