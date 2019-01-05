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
const menu = {
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
const _search_list = [
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


module.exports = {
    _label:_label,
    _altLabel:_altLabel,
    _prefLabel:_prefLabel,
    _hiddenLabel:_hiddenLabel,
    _description:_description,
    _subClassOf:_subClassOf,
    _defaultFacets:_defaultFacets,
    _class:_class,
    _resource:_resource,
    _thing:_thing,
    _lat_long:_lat_long,
    _objectProperty:_objectProperty,
    _datatypeProperty:_datatypeProperty,
    _default_title:_default_title,
    menu:menu,
    _search_list:_search_list
};
