let _data = $('#data_store').data('store');
let _collection = $('#data_collection').data('store');
let _docs = $('#docs_data').data('store');
let _structure = $('#structure').data('store');
let sort_list = [];
let is_period = false;
let in_period = false;
let tr_idx = 0, img_list = [];
$('#table_search_wrap').css('display', 'none');
console.log('data : ', _data);
console.log('docs : ', _docs);
// console.log('_collection : ', _collection);
// console.log('structure : ', _structure);

let _displayOnAnnotation = _collection[_resource + 'displayOnAnnotation']['@list'].map(function(item){return item['@id']});
let _displayOnMiddle = _collection[_resource+'displayOnMiddle']['@list'].map(function(item){return item['@id']});
let _displayOnBottom = _collection[_resource+'displayOnBottom']['@list'].map(function(item){return item['@id']});
let _displayOnTable = _collection[_resource + 'displayOnTable']['@list'].map(function(item){return item['@id']});
let _displayOnRight = _collection[_resource + 'displayOnTop']['@list'].map(function(item){return item['@id']});
let _bottomList = _displayOnBottom.map(function(item){return item.replace(_resource, '').replace(/\[dot\]/gi, '.')});
let _displayOnPage = _collection[_resource + 'displayOnPage']['@list'].map(function(item){return item['@id']});
let docs_id = _docs['@id'].replace(_resource, '');

let _search_list = [
    'http://www[dot]w3[dot]org/2000/01/rdf-schema#label',
    'http://www[dot]w3[dot]org/2004/02/skos/core#altLabel',
    'http://www[dot]w3[dot]org/2004/02/skos/core#prefLabel',
    'http://www[dot]w3[dot]org/2004/02/skos/core#hiddenLabel',
    'http://www[dot]w3[dot]org/2004/02/skos/core#Concept'
];

if(typeof(_data['cls_name']) === 'object'){
    _data['cls_name'].map(function(item){return item.replace(_resource, '')}).forEach(function(v){
        for(let key in _structure){
            _structure[key].forEach(function(w){
                if(w === v){
                    console.log('w : ', w, ', v : ', v);
                    _data['cls_name'] = key;
                    return false;
                }
            });
        }
    });
}
let item = 0;
function createPage(){
    /*  -------------------------------------------------------------------------
    *   기본 정보(대표이미지, 제목)
    *   -------------------------------------------------------------------------*/
    createDefault();
    /*  -------------------------------------------------------------------------
    *   Annotation(description, 번역)
    *   -------------------------------------------------------------------------*/
    createAnnotation();
    /*  -------------------------------------------------------------------------
    *   연계정보(ex. 향토자료_주제)
    *   -------------------------------------------------------------------------*/
    createMiddle();
    /*  -------------------------------------------------------------------------
    *   속성정보
    *   -------------------------------------------------------------------------*/
    createBottom();
    /*  -------------------------------------------------------------------------
    *   표제어, 대체어, 부제, 한자어, 생몰년
    *   -------------------------------------------------------------------------*/
    createRight();
    /*  -------------------------------------------------------------------------
    *   Table Info
    *   -------------------------------------------------------------------------*/
    createOnTable();
    /*  -------------------------------------------------------------------------
    *   display on page
    *   -------------------------------------------------------------------------*/
    createOnPage();
}
function createDefault(){
    if(_data['title'].length > 1 && typeof(_data['title']) === 'object'){
        $('h3[name=title]').text(_data['title'][0].replace(/\[dot\]/gi, '.'));
    }else{
        $('h3[name=title]').text(_data['title'].replace(/\[dot\]/gi, '.'));
    }
    if(_data.hasOwnProperty('그림')){
        $('img[name=pic]').attr({
            src:'../static/images/' + _data['그림'].replace(/\[dot\]/gi, '.'),
            onclick:'lightbox(0)'
        });
        img_list.push(_data['그림'].replace(/\[dot\]/gi, '.'));
    }else{
        $('img[name=pic]').attr({src:'../static/img/mil_empty.gif'});
    }
}
function createAnnotation(){
    let html = '';
    _displayOnAnnotation.forEach(function(v){
        if(_docs[v]){
            if(v === _description){
                html += createProperty(_docs[v]['@value'], 2, v);
            }else if(v !== _resource + '번역')
                html += createProperty(_docs[v]['@value'], 0, v);
            else
                html += '<span class="Pronunciation">번역</span>' + createProperty(_docs[v]['@value'], 1, v);
        }
    });
    $('#body_top').html(html);
}
function createMiddle(){
    tr_idx = 0;
    let _list = _displayOnMiddle.filter(function(item){if(_docs.hasOwnProperty(item)) return item});
    if(_list.length > 0 && _data['collection'].length === 0){
        let html = '<p class="facet_title">연계정보</p><div class="link_wrap">';
        _list.forEach(function(v){
            if(_docs.hasOwnProperty(v)) {
                if(v === _resource + '다른소장처'){
                    if(_docs[v].length > 0){
                        _docs[v].forEach(function(w , j){
                            html += '<div class="link_row">';
                            html += '<span>' + ((j === 0)?v.replace(_resource, ''):'') + '</span>';
                            html += '<dd><a href="' + w['@value'].replace(/\[dot\]/gi, '.') + '" target="_blank">' + (w['@value'].indexOf('제주민속촌') > -1?'제주민속촌':'제주대학교 박물관') + '</a></dd>';
                            html += '</div>';
                        })
                    }else{
                        html += '<div class="link_row">';
                        html += '<span>다른소장처</span>';
                        html += '<dd><a href="' + _docs[v]['@value'].replace(/\[dot\]/gi, '.') + '" target="_blank">' + (_docs[v]['@value'].indexOf('제주민속촌') > -1?'제주민속촌':'제주대학교 박물관') +'</a></dd>';
                        html += '</div>';
                    }
                }else if(_docs[v].length > 0){
                    _docs[v].forEach(function(w, j){
                        html += '<div class="link_row">';
                        html += '<span>' + ((j === 0)?v.replace(_resource, ''):'') + '</span>';
                        html += '<dd><a href="' + w['@id'].replace(/\[dot\]/gi, '.') + '">' + w['@id'].replace(_resource, '').replace(/\[dot\]/gi, '.') + '</a></dd>';
                        html += '</div>';
                    });
                }else{
                    html += '<div class="link_row">';
                    html += '<span>' + v.replace(_resource, '') + '</span>';
                    html += '<dd><a href="' + _docs[v]['@id'].replace(/\[dot\]/gi, '.') + '">' + _docs[v]['@id'].replace(_resource, '').replace(/\[dot\]/gi, '.') + '</a></dd>';
                    html += '</div>';
                }
            }
        });
        html += '</div>';
        html += '<hr>';
        $('#link_list').append(html);
    }
}
function createBottom(){
    if(_displayOnBottom.filter(function(item){if(_docs.hasOwnProperty(item)) return item}).length > 0){
        let html = '<p class="facet_title">속성정보</p>';
        html += '<table class="table table-bordered table-hover">';
        html += '<tbody>';
        _displayOnBottom.forEach(function(v){
            if(_docs[v]) {
                if(_docs[v].length > 0){
                    _docs[v].forEach(function(w){
                        html += createTable(w['@value'], v.replace(_resource, ''), 'body');
                    });
                }else{
                    html += createTable(_docs[v]['@value'], v.replace(_resource, ''), 'body');
                }
            }
        });
        html += '</tbody></table>';
        $('#body_bottom').append(html);
    }
}
function createRight(){
    let right_html = '';
    // console.log('_displayOnRight : ', _displayOnRight);
    if(_displayOnRight.length > 0){
        _displayOnRight.forEach(function(v){
            if(_docs[v]) right_html += '<div class="detail_right_wrap">' + createLabels(_docs[v], v) + '</div>';
        });
        // console.log('right_html : ', right_html);
        $('#body_right').append(right_html);
    }
}
function createOnTable(){
    let _class, type_list = [];
    _data['collection'].forEach(function(item){
        if((item.hasOwnProperty(_resource + '기록물건명_결재권자')) && _data['cls_name'] === '생산당시총장'){
            if(item[_resource + '기록물건명_결재권자']['@id'] === _resource + '참모총장'){
                in_period = true;
                is_period = true;
            }
            // if(_docs[_resource + '재임기간'].length > 0 && typeof(_docs[_resource + '재임기간']) === 'object'){
            //     _docs[_resource + '재임기간'].forEach(function(w){
            //         let period_from = w['@value'].split('~')[0].replace(/ /gi, '').replace(/\[dot\]/gi, '').replace(/\./gi, '');
            //         let period_to = w['@value'].split('~')[1].replace(/ /gi, '').replace(/\[dot\]/gi, '').replace(/\./gi, '');
            //         if(item.hasOwnProperty(_resource + '생산일자')){
            //             let created_date = item[_resource + '생산일자']['@value'].replace(/\[dot\]/gi, '').replace(/-/gi, '');
            //             if(period_from < created_date && period_to > created_date){
            //                 in_period = true;
            //                 is_period = true;
            //             }
            //         }
            //     });
            // }else{
            //     console.log('item : ', item);
            //     let period_from = _docs[_resource + '재임기간']['@value'].split('~')[0].replace(/ /gi, '').replace(/\[dot\]/gi, '').replace(/\./gi, '');
            //     let period_to = _docs[_resource + '재임기간']['@value'].split('~')[1].replace(/ /gi, '').replace(/\[dot\]/gi, '').replace(/\./gi, '');
            //     if(item.hasOwnProperty(_resource + '생산일자')){
            //         let created_date = item[_resource + '생산일자']['@value'].replace(/\[dot\]/gi, '').replace(/-/gi, '');
            //         if(period_from < created_date && period_to > created_date){
            //             in_period = true;
            //             is_period = true;
            //         }
            //     }
            // }
        }
        let _type = (typeof(item['@type'])==='string')?item['@type'].replace(_resource, ''):item['@type'][0].replace(_resource, '');
        if(_type === '업무기능') return false;  // 테이블이 따로 나오고 있어서 업무기능이 나올 경우 false 처리함.
        _class = _type;
        for(let key in _structure){
            _structure[key].forEach(function(w){
                if(typeof(w) === 'object'){
                    for(let k in w){
                        w[k].forEach(function(x){
                            if(_type === x) {
                                _class = key;
                                return false;
                            }
                        });
                    }
                }else{
                    if(_type === w) {
                        _class = key;
                        return false;
                    }
                }
            });
        }
        type_list.push({item:item, cls:_class, period:in_period});
    });
    sort_list = type_list.sort(function(a, b){return (a.cls > b.cls)?1:(a.cls < b.cls)?-1:0});

    // 결재권자에 따른 분류 mil 외에 다른 곳에는 필요없음.
    // console.log('is period : ', is_period);
    if(_data['cls_name'] === '생산당시총장' || _data['cls_name'] === '시간1'){ // 생산당시총장의 경우 기록물건명만 테이블에 나오게 함
        sort_list = sort_list.filter(function(f){if(f['cls'] === '기록물건명') return f;});
    }

    fnGenTable(sort_list);
}
function fnGenTable(sort_list){
    if(sort_list.length === 0) return false;
    $('#table_search_wrap').css('display', 'block');
    let col_list, sort_temp, table_html = '';
    if(is_period){
        let in_list = [], out_list = [];
        sort_list.forEach(function(s){
            if(s.period) in_list.push(s);
            else out_list.push(s);
        });
        col_list = '그림_기록물건명_결재권자_시간'.split('_');
        table_html += '<p class="facet_title">총장재임시 본인결재문서</p>';
        table_html += '<div class="link_wrap">';
        table_html += '<table class="table table-bordered table-hover">';
        table_html += '<th class="text-left">' + col_list.join('</th><th class="text-left">') + '</th>';
        table_html += '<tbody>';
        in_list.forEach(function(item){table_html = fnTableTr(table_html, col_list, [item['item']], item['cls'])});
        table_html += '</tbody></table>';
        table_html += '</div>';

        table_html += '<p class="facet_title">총장재임시 생산문서</p>';
        table_html += '<div class="link_wrap">';
        table_html += '<table class="table table-bordered table-hover">';
        table_html += '<th class="text-left">' + col_list.join('</th><th class="text-left">') + '</th>';
        table_html += '<tbody>';
        out_list.forEach(function(item){table_html = fnTableTr(table_html, col_list, [item['item']], item['cls'])});
        table_html += '</tbody></table>';
        table_html += '</div>';
    }else{
        let temp_item = [];
        table_html += '<div class="link_wrap">';
        sort_list.forEach(function(item){
            if(item['cls'] === '보고유형') return;
            _displayOnTable.forEach(function(v){
                let _col = v.replace(_resource, '').split('-');
                if(_col[0]===_data['cls_name'] && _col[1].split('_').indexOf(item['cls']) > -1 && temp_item.indexOf(item['item']['@id']) === -1 ){
                    temp_item.push(item['item']['@id']);
                    if(sort_temp !== '' && sort_temp !== item['cls']) table_html += '</tbody></table>';
                    if(sort_temp !== item['cls']){
                        sort_temp = item['cls'];
                        col_list = _col[1].split('_');
                        table_html += '<table class="table table-bordered table-hover">';
                        table_html += '<th class="text-left">' + col_list.join('</th><th class="text-left">') + '</th>';
                        table_html += '<tbody>';
                        table_html = fnTableTr(table_html, col_list, [item['item']], item['cls']);
                    }else{
                        table_html = fnTableTr(table_html, col_list, [item['item']], item['cls']);
                    }
                }
            });
        });
        table_html += '</div>';
    }
    if(tr_idx > 0) $('h3[name=count]').text(' (' + tr_idx + ')');
    $('#table_wrap').html(table_html);
}
function fnTableTr(html, col_list, tr_list, title){
    tr_idx++;
    let label, col_value;
    //TODO 이걸 왜 했는지 모르겠음.
    // if(_data['cls_name'] === '생산당시총장'){
    //     if(tr_list[0].hasOwnProperty(_resource + '기록물건명_결재권자')){
    //         if(tr_list[0][_resource + '기록물건명_결재권자']['@id'].indexOf(docs_id) > -1){
    //             // return html;
    //         }
    //     }
    // }
    tr_list.forEach(function(w){
        html += '<tr>';
        col_list.forEach(function(col){
            html += '<td class="text-left">';
            switch(col){
                case '그림':
                    if(w.hasOwnProperty(_resource + col)){
                        let img = (w[_resource+col].hasOwnProperty('@value')?w[_resource+col]['@value']:w[_resource+col]);
                        if(typeof(img) === 'object') img = (img[0].hasOwnProperty('@value'))?img[0]['@value']:img[0];
                        if(img.split('/mil/')[1] === '[dot]gif') img = _emptyImg;
                        html += '<img src="../static/images/' + img.replace(/\[dot\]/gi, '.') + '"/>';
                    }else{
                        html += '<img src="' + _emptyImg + '"/>';
                    }
                    break;
                case title:
                    if(w.hasOwnProperty(_label)){
                        label = w[_label].hasOwnProperty('@value')?w[_label]['@value']:w[_label];
                        if(typeof(label) === 'object' &&label.length > 0){
                            html += '<a class="text-bold" href="' + w['@id'].replace(/\[dot\]/gi, '.') + '">' + label.join(',').replace(/\[dot\]/gi, '.') + '</a>';
                        }else{
                            html += '<a class="text-bold" href="' + w['@id'].replace(/\[dot\]/gi, '.') + '">' + label.replace(/\[dot\]/gi, '.') + '</a>';
                        }
                    }else{
                        html += '<a class="text-bold" href="' + w['@id'].replace(/\[dot\]/gi, '.') + '">' + w['@id'].replace(_resource, '').replace(/\[dot\]/gi, '.') + '</a>';
                    }
                    break;
                case '출판년도':
                    if(w.hasOwnProperty(_resource + _default_title + '_timeline')){
                        let _res = w[_resource + _default_title + '_timeline'];
                        if(_res.length > 0){
                            _res.forEach(function(x){
                                html += '<a class="text-bold" href="' + x['@id'].replace(/\[dot\]/gi, '.') + '">' + x['@id'].replace(_resource, '').replace('_', '') + '</a><br>';
                            })
                        }else{
                            html += '<a class="text-bold" href="' + _res['@id'].replace(/\[dot\]/gi, '.') + '">' + _res['@id'].replace(_resource, '').replace('_', '') + '</a><br>';
                        }
                    }
                    break;
                default:
                    if(w.hasOwnProperty(_resource + title + '_' + col)){
                        col_value = w[_resource + title + '_' + col];
                        if(col_value.length > 0){
                            col_value.forEach(function(x){
                                html += '<a class="text-bold" href="' + x['@id'].replace(/\[dot\]/gi, '.') + '">' + x['@id'].replace(_resource, '').replace(/\[dot\]/gi, '.') + '</a><br/>';
                            });
                        }else{
                            html += '<a class="text-bold" href="' + col_value['@id'].replace(/\[dot\]/gi, '.') + '">' + col_value['@id'].replace(_resource, '').replace(/\[dot\]/gi, '.') + '</a>';
                        }
                    }else if(_bottomList.indexOf(col) > -1){
                        if(w.hasOwnProperty(_resource + col)){
                            label = w[_resource + col].hasOwnProperty('@value')?w[_resource + col]['@value']:w[_resource + col];
                            if(typeof(label) === 'object' && label.length > 0){
                                label.forEach(function(x){
                                    html += x['@value'].replace(_resource, '').replace(/\[dot\]/gi, '.') + '<br>';
                                })
                            }else{
                                html += label.replace(_resource, '').replace(/\[dot\]/gi, '.');
                            }
                        }else html += '';
                    }
                    break;
            }
            html += '</td>';
        });
        html += '</tr>';
    });
    return html;
}
// 설명, 번역
function createProperty(data, type, item){
    let result = '<ul class="property"><dd class="innerDesc' + (type === 1?" Pronunciation":type === 2?" Description":"") + '">';
    result += (item.indexOf(_resource) > -1)?item.replace(_resource, ''):'';
    // TODO voice가 추가 되면 false를 수정해야함.
    result += '<p class="voice">' + ((false)?'<audio><source src="' + voice + '"></audio><i class="fa fa-play">소리로 듣기</i>':'') + '</p>';
    result += data.replace(/\[dot\]/gi, '.') + '</dd></ul>';
    return result;
}
// 표제어, 대체어
function createLabels(data, key){
    // console.log('data : ', data, ' , key : ', key);
    let html = '';
    if(data.length > 0 && typeof(data) === 'object'){
        data.forEach(function(v, i){
            if(v.hasOwnProperty('@language')){
                if(i === 0) html += '<div class="detail_right_row right_facet_border"><span>국가별 표제어</span><dd>' + v['@value'].replace(/\[dot\]/gi, '.') + '<code>' + v['@language'].replace(/\[dot\]/gi, '.') + '</code></dd></div>';
                else html += '<div class="detail_right_row"><span></span><dd>' + v['@value'] + '<code>' + v['@language'].replace(/\[dot\]/gi, '.') + '</code></dd></div>';
            }else if(key === _altLabel){
                // console.log('altLabel : ', _altLabel);
                if(i === 0) html += '<div class="detail_right_row right_facet_border"><span>대체어</span><dd>' + v['@value'].replace(/\[dot\]/gi, '.') + '</dd></div>';
                else html += '<div class="detail_right_row"><span></span><dd>' + v['@value'] + '</dd></div>';
            }else{
                // console.log('altLabel : ', _altLabel);
                if(i === 0) html += '<div class="detail_right_row right_facet_border"><span>표제어</span><dd>' + v['@value'].replace(/\[dot\]/gi, '.') + '</dd></div>';
                else html += '<div class="detail_right_row"><span></span><dd>' + v['@value'] + '</dd></div>';
            }
        })
    }else{
        if(data.hasOwnProperty('@language')) html += '<div class="detail_right_row right_facet_border"><span>국가별 표제어</span><dd>' + data['@value'] + '<code>' + data['@language'].replace(/\[dot\]/gi, '.') + '</code></dd></div>';
        else if(key === _altLabel) html += '<div class="detail_right_row right_facet_border"><span>대체어</span><dd>' + data['@value'].replace(/\[dot\]/gi, '.') + '</dd></div>';
        else if(key === _prefLabel) html += '<div class="detail_right_row right_facet_border"><span>표제어</span><dd>' + (data.hasOwnProperty('@value')?data['@value'].replace(/\[dot\]/gi, '.'):data.replace(/\[dot\]/gi, '.')) + '</dd></div>';
        else html += '<div class="detail_right_row right_facet_border"><span>' + key.replace(_resource, '') + '</span><dd>' + (data.hasOwnProperty('@value')?data['@value'].replace(/\[dot\]/gi, '.'):data.replace(/\[dot\]/gi, '.')) + '</dd></div>';

    }
    return html;
}
/*------------------------------------------------------------------------
    속성정보
------------------------------------------------------------------------ */
function createTable(name, title, type){
    // console.log('name : ', name, ', title :', title, ' , type : ', type);
    if(['Youtube'].indexOf(title) > -1) return '';
    title = fnCheckObject(title);
    name = fnCheckObject(name);
    type = fnCheckExtension(name, type);
    let html = '';
    if(type === 'header'){
        html += '<thead>' +
            '<tr>' +
            '<th>' + title + '</th>' +
            '<th>' + name + '</th>' +
            '</tr>' +
            '</thead>';
    }else{
        html += '<tr><td>' + title.replace(/\[dot\]/gi, '.') + '</td>';
        if(title === '홈페이지'){
            html += '<td><a href="' + name + '" target="_blank">' + name + '</a></td>';
        }else{
            let _name;
            switch(type){
                case 'target':
                    _name = '<a href="' + name + '" target="_blank">제주대학교 박물관</a>';
                    break;
                case 'link':
                    _name = '<a href="' + name + '" target="_blank">' + name + '</a>';
                    break;
                case 'image':
                    let img_html = '<div class="td_inner_wrap">';
                    name.split('<br>').forEach(function(img){
                        img_html += '<a href="' + img + '" target="_blank"><img class="td_inner_img" src="' + img + '"/></a>';
                    });
                    img_html += '</div>';
                    _name = img_html;
                    break;
                default:
                    _name = name;
                    break;
            }
            html += '<td>' + _name + '</td></tr>';
        }
    }
    return html;
}
// <br> 처리
function fnCheckObject(item){
    // console.log('item : ', item);
    if(typeof(item) === 'object') item = item[0];
    let result = item.replace(/\[dot\]/gi, '.');
    if(item.length > 1 && typeof(item) === 'object'){
        if(typeof(item[0])==='object'){
            result = item.map(function(value){
                return value['@value'];
            }).join('<br>');
        }
        else {
            result = item.replace(/\[dot\]/gi, '.').join('<br>');
        }
    }
    return result;
}
/*------------------------------------------------------------------------
    속성정보 확장자 처리
------------------------------------------------------------------------ */
function fnCheckExtension(name, type){
    let extension = name.substr(name.length -3), result;
    switch(extension){
        case 'pdf':
            result = 'link';
            break;
        case 'gif':
        case 'png':
        case 'jpg':
            result = 'image';
            break;
        default: result = type; break;
    }
    return result;
}
/*  -------------------------------------------------------------------------
*   display on page
*   -------------------------------------------------------------------------*/
function createOnPage(){
    let list = _displayOnPage.filter(function(v){if(_docs.hasOwnProperty(v)) return v;}), img_idx = 0;
    if(list.length === 0) {
        list.push(_data['그림']);
        img_list.push(_data['그림']);
    }
    if(list.length > 0){
        let html = '<div class="onPageWrap">';
        _displayOnPage.forEach(function(v){
            if(_docs.hasOwnProperty(v)){
                html += '<hr><p class="facet_title">' + v.replace(_resource, '') + '</p>';
                if(_docs[v].length > 0){
                    _docs[v].sort(function(a, b){return (a['@value'] > b['@value'])?1:(a['@value'] < b['@value'])?-1:0})
                        .forEach(function(w){
                            let ext = w['@value'].split('[dot]')[1];
                            let val = w['@value'].replace(/\[dot\]/gi, '.');
                            html += '<div class="col-md-4">';
                            if(ext === 'pdf') {
                                html += '<a href="../static/images/' + val + '" target="_blank">';
                                html += '<img src="../static/images/pdf_download.png">';
                                html += '</a>';
                            }else {
                                html += '<img src="../static/images/' + val + '" onclick="lightbox(' + img_idx++ + ')"/>';
                                if(img_list.indexOf(val) === -1) img_list.push(val);
                            }
                            html += '</div>';
                        });
                }else{
                    let ext = _docs[v]['@value'].split('[dot]')[1];
                    html += '<div class="col-md-4">';
                    if(ext === 'pdf'){
                        html += '<a href="../static/images/' + _docs[v]['@value'].replace(/\[dot\]/gi, '.') + '" target="_blank">';
                        html += '<img src="../static/images/pdf_download.png">';
                        html += '</a>';
                    }else{
                        html += '<img src="../static/images/' + _docs[v]['@value'].replace(/\[dot\]/gi, '.') + '" onclick="lightbox(' + img_idx++ + ')"/>';
                        img_list.push(_docs[v]['@value'].replace(/\[dot\]/gi, '.'));
                    }
                    html += '</div>';
                }
            }
        });
        let img_html = '<div style="display: none;"><div id="ninja-slider"><div class="slider-inner">';
        img_html += '<ul>';
        img_list.forEach(function(w, j){
            img_html += '<li>';
            img_html += '<a class="ns-img" href="../static/images/' + w + '"></a>';
            img_html += '<div class="caption">';
            img_html += '<h3></h3>';
            img_html += '<p></p>';
            img_html += '</div>';
            img_html += '</li>';
        });
        img_html += '</ul>';
        img_html += '<div id="fsBtn" class="fs-icon" title="Expand/Close"></div>';
        img_html += '</div></div></div>';
        $('#ninja-img').html(img_html);
        html += '</div>';
        $('#body_onPage').append(html);
    }
}
createPage();
function lightbox(idx) {
    //show the slider's wrapper: this is required when the transitionType has been set to "slide" in the ninja-slider.js
    let ninjaSldr = document.getElementById("ninja-slider");
    // console.log('ninja : ', ninjaSldr);
    ninjaSldr.parentNode.style.display = "block";

    nslider.init(idx);

    let fsBtn = document.getElementById("fsBtn");
    fsBtn.click();
}

function fsIconClick(isFullscreen, ninjaSldr) { //fsIconClick is the default event handler of the fullscreen button
    if (isFullscreen) {
        ninjaSldr.parentNode.style.display = "none";
    }
}
function initMap(lat, lng) {
    let center = {lat: lat, lng: lng};
    let map = new google.maps.Map(document.getElementById('map'), {
        zoom: 4,
        center: center
    });
    let marker = new google.maps.Marker({
        position: center,
        map: map
    });
}
/*------------------------------------------------------------------------
//     사운드  클릭시 재생 이벤트
------------------------------------------------------------------------ */
$('p.voice i').on('click', function(){
    let audioEle = $(this).parent().children("audio")[0];
    if(audioEle.paused){
        $(this).removeClass("fa-play").addClass("fa-pause");
        audioEle.play();
    }else{
        $(this).removeClass("fa-pause").addClass("fa-play");
        audioEle.pause();
    }
});
/*------------------------------------------------------------------------
//     Description 내에 keyword rollover
------------------------------------------------------------------------ */
if(_docs.hasOwnProperty(_resource + 'tag')){
    let _desc = $('.description'), temp_desc = _desc.text();
    let tag = _docs[_resource + 'tag'];
    if(tag.length > 0){
        tag.map(function(item){return item['@value'].replace(/ /, '')}).forEach(function(v){
            temp_desc = temp_desc.replace(new RegExp(v, 'gi'),
                '<a class="desc_replace" title="' + v + '" data-container="body" data-toggle="popover" data-image="' + _emptyImg + '">' + v + '</a>');
        });
    }else{
        temp_desc = temp_desc.replace(new RegExp(tag['@value'].replace(/ /, ''), 'gi'),
            '<a class="desc_replace" title="' + tag['@value'].replace(/ /, '') + '" data-container="body" data-toggle="popover" data-image="' + _emptyImg + '">' + tag['@value'].replace(/ /, '') + '</a>');
    }
    _desc.html(temp_desc);
}
$('.desc_replace').popover({
    html:true,
    trigger:'click',
    delay:{'show':500, 'hide':100},
    placement:'bottom',
    template:'<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
});
$('.desc_replace').on('show.bs.popover', function(p){
    let $popover = $('.popover');
    console.log('popover : ', $popover);
    if($popover.length === 1) $popover[0].remove();
    //console.log('p : ', p);
    $.ajax({
        type:'get',
        url:'getIdData/' + p.target.innerHTML,
        dataType:'json',
        success:function(res){
            let html = '<div class="popover-wrap">';
            console.log('res : ', res);
            if(res.hasOwnProperty(_resource + '그림')){
                html += '<img width="100%" src="../static/images/' + res[_resource + '그림']['@value'].replace(/\[dot\]/gi, '.') + '"/><hr>'
            }
            if(res.hasOwnProperty(_description)){
                html += '<div class="popover-desc">' + res[_description]['@value'].replace(/\[dot\]/gi, '.') + '</div>';
            }
            html += '<div class="popover-btn">';
            html += '<button type="button" class="btn btn-default" name="btn_move" data-target="' + res['@id'].replace(/\[dot\]/gi, '.') +'">이동</button>';
            html += '<button type="button" class="btn btn-default" name="btn_close">닫기</button>';
            html += '</div>';
            html += '</div>';
            $('.popover-content').html(html);
            $popover = $('.popover')[0];
            $popover.style.left = parseInt($popover.style.left) - 95;
        }
    });
});
// 창 조절시 롤오버 없애기
window.onresize = function(){$('.popover').popover('hide'); $('.popover')[0].remove();};
$(document).on('click', 'button[name=btn_move]', function(){
    location.href = $(this)[0].dataset.target;
});
$(document).on('click', 'button[name=btn_close]', function(){
    $('.popover').popover('hide');
    $('.popover')[0].remove();
});
/* 결과내 재검색 */
$('#searchInResultData').keydown((e) =>{
    console.log('e : ', e);
    let code = e.which;
    if(code === 13) fnSearchInResult();
});
$('#btnSearchInResult').on('click', function(){
    fnSearchInResult();
});
function fnSearchInResult(){
    tr_idx = 0;
    let val = $('#searchInResultData').val(), is_filtered;
    let list = sort_list.filter(function(f){
        is_filtered = false;
        _search_list.forEach(function(v){
            if(f.item[v]){
                if(typeof(f.item[v]) === 'object') {
                    if(f.item[v].length > 1){
                        f.item[v].forEach(function(w){
                            if(typeof(w) === 'object'){
                                if(w['@value'].indexOf(val) > -1) is_filtered = true;
                            }else{
                                if(w.indexOf(val) > -1) is_filtered = true;
                            }
                        })
                    }else{
                        if (f.item[v]['@value'].indexOf(val) > -1) is_filtered = true;
                    }
                }else{
                    if(f.item[v].indexOf(val) > -1) is_filtered = true;
                }
            }
        });
        if(is_filtered) return f;
    });
    if(list.length === 0) alert('검색 결과가 없습니다. ');
    else fnGenTable(list);
}
// 재임기간에 따라 collection 표시하기
fnGetPeriod();
function fnGetPeriod(){
    if(_docs.hasOwnProperty(_resource + '재임기간')){
        let period = _docs[_resource + '재임기간'];
        let period_list = [];
        if(typeof(period) === 'object' && period.length > 0){
            period.forEach(function(v){
                console.log('v : ', v);
                period_list.push({from:v['@value'].split('~')[0].replace(/\[dot\]/gi, '.').replace(/ /gi, ''), to:v['@value'].split('~')[1].replace(/\[dot\]/gi, '.').replace(/ /gi, '')});
            })
        }
        console.log('period list : ', period_list);
    }
}