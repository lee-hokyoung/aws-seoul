const _label = 'http://www[dot]w3[dot]org/2000/01/rdf-schema#label';
const _resource = 'http://mil[dot]k-history[dot]kr/resource/';
// const _resource = 'http://localhost:8106/resource/';
const _description = 'http://purl[dot]org/dc/elements/1[dot]1/description';
const _prefLabel = 'http://www[dot]w3[dot]org/2004/02/skos/core#prefLabel';
const _altLabel = 'http://www[dot]w3[dot]org/2004/02/skos/core#altLabel';
const _emptyImg = 'http://mil.k-history.kr/static/img/mil_empty.gif';
// const _emptyImg = 'http://localhost:8106/static/img/mil_empty.gif';
const _class = 'http://www[dot]w3[dot]org/2002/07/owl#Class';
const _datatypeProperty = 'http://www[dot]w3[dot]org/2002/07/owl#DatatypeProperty';
const _latlong = 'http://www[dot]w3[dot]org/2003/01/geo/wgs84_pos#lat_long';
const _pathname = decodeURI(location.pathname.split('/')[2]);
const _sub_path = location.pathname.split('/').length === 5?decodeURI(location.pathname.split('/')[4]):
    location.pathname.split('/').length === 4?decodeURI(location.pathname.split('/')[3]):false;
const _default_title = '기록물';
const _job_idx = ['인사', '정보작전', '군수', '전력예산', '정보화', '정책', '정훈공보', '동원', '감찰', '기타'];
