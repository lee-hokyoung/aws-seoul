var subProductList = $('#subProductList').data('store').split(',');
var per_page_item = localStorage.getItem('page')?parseInt(localStorage.getItem('page')):20; // 한 페이지에 노출되는 아이템의 수
var page_size = 10; // 한 화면에 노출되는 페이지의 수
var filter_list = [], link_list = [], parent_list = [], new_list = [], temp_parent = '', p_list;
var count_idx = 0, count_list = [];
$('#p' + per_page_item).parent().addClass('active');
/*  --------------------------------------------
*   left, body 데이터를 저장한 변수
*   --------------------------------------------*/
var sub_class = $('#sub_class').data('store').map(function(item){return item['@type'];});
var left = $('#left_store').data('store');
var facet_count_list = $('#facet_count_list').data('store');
console.log('facet_count_list : ', facet_count_list);
if(_sub_path) {
    sub_class = sub_class.filter(function(item){if(item === _resource + _sub_path) return item;});
    left = left.filter(function(item){
        if(item['@type'].length > 0 && typeof(item['@type']) === 'object'){
            item['@type'].forEach(function(v){
                if(sub_class.indexOf(v) > -1) {
                    return item;
                }
            })
        }else{
            if(sub_class.indexOf(item['@type']) > -1) return item;
        }
    });
}
var body = $('#body_store').data('store');
var left_menu = $('#left_menu').data('store');
var inverse_menu = left_menu.map(function(v){
    return _resource + v.split('/resource/')[1].split('_')[1] + '_' + v.split('/resource/')[1].split('_')[0];
});
/*  --------------------------------------------
*   left 메뉴 만들기
*   --------------------------------------------*/
createLeftMenu();
function createLeftMenu(){
    /*  --------------------------------------------
    *   left_menu 설정하는 부분
    *   --------------------------------------------*/
    var left_html = '<div id="filter_wrap"></div>'; // filter_wrap은 고정시켜 두기 위해서 따로 뺌.
    $('#left_facets').html(left_html + fnCreateLeftHtml(fnCreateUniqueLeft(left)));
    // left facet 줄이기
    fnDistinctLeft(parent_list);
    fnCreateBody(body);
}
function fnCreateUniqueLeft(left){
    var temp = [], unique = [], left_menu_list = [];
    left.forEach(function(v){
        inverse_menu.forEach(function(w){
            if(v.hasOwnProperty(w)){
                temp.push({
                    parent:w.split('/resource/')[1].split('_')[0],
                    subClass:(w.split('/resource/')[1].split('_')[0] !== _pathname)?v[_resource + w.split('/resource/')[1].split('_')[0] + '_' + _pathname]['@id']:false,
                    id:(v[w])?v[w]['@id']:false,
                    value:(v.hasOwnProperty(_label))?(v[_label].hasOwnProperty('@value'))?v[_label]['@value']:v[_label]:v['@id'].replace(_resource, ''),
                    title:v[_resource + w.split('/resource/')[1].split('_')[0] + '_' + _pathname],
                    badge:(v[_resource + w.split('/resource/')[1].split('_')[0] + '_' + _pathname].length > 0)?v[_resource + w.split('/resource/')[1].split('_')[0] + '_' + _pathname].length:1
                    , dd:1
                });
            }
        });
        left_menu.forEach(function(w){
            if(v.hasOwnProperty(w)){
                if(v[w].length > 1){
                    v[w].forEach(function(x){
                        if(v.hasOwnProperty(w)){
                            temp.push({
                                parent:w.split('/resource/')[1].split('_')[1],
                                subClass:(w.split('/resource/')[1].split('_')[0] !== _pathname)?v[_resource + w.split('/resource/')[1].split('_')[0] + '_' + _pathname]['@id']:false,
                                id:(v[w])?v[w]['@id']:false,
                                value:x['@id'].replace(_resource, ''),
                                title:v[_resource + w.split('/resource/')[1]],
                                badge:1
                                , dd:2
                            });
                        }
                    });
                }else{
                    temp.push({
                        parent:w.split('/resource/')[1].split('_')[1],
                        subClass:(w.split('/resource/')[1].split('_')[0] !== _pathname)?v[_resource + w.split('/resource/')[1].split('_')[0] + '_' + _pathname]['@id']:false,
                        id:(v[w])?v[w]['@id']:false,
                        value:v[w]['@id'].replace(_resource, ''),
                        title:v[_resource + w.split('/resource/')[1]],
                        badge:(v[_resource + w.split('/resource/')[1]].length > 0)?v[_resource + w.split('/resource/')[1]].length:1
                        , dd:3
                    });
                }
            }
        });
        if(v['@type'].indexOf(_resource + _pathname) > -1){
            temp.push({
                parent:_pathname,
                id:false,
                subClass:false,
                value:(v.hasOwnProperty(_label))?(v[_label].hasOwnProperty('@value'))?v[_label]['@value']:v[_label]:'',
                title:{'@id':v['@id']},
                badge:1
                , dd:4
            })
        }
    });
    var new_left = temp.sort(function(a, b){
        return (a.value > b.value)?1:(a.value < b.value)?-1:0;
    });
    console.log('new left : ',  new_left);
    new_left.forEach(function(v){
        left_menu_list[v['value']] = 1 + (left_menu_list[v['value']] || 0);
        if(v.parent === '결재권자'){
            switch(v.value){
                case '참모차장': v.lv = 1; break;
                case '부실단장': v.lv = 2; break;
                case '육직부대장': v.lv = 3; break;
                case '군사령관': v.lv = 4; break;
                case '군단장': v.lv = 5; break;
                case '사단장':v.lv = 6; break;
                default: v.lv = 0;
            }
        }
    });
    var unique_list = [];
    new_left.filter(function(item){
        if(unique_list.indexOf(item.value) === -1){
            unique_list.push(item.value);
            unique.push({parent:item.parent, subClass:item.subClass, id:item.id, value:item.value, title:item.title, badge:left_menu_list[item.value], lv:item.lv, dd:item.dd});
        }
        return null;
    });
    return unique;
}
/*  ------------------------------------------------------------------
*   Left Menu HTML 만들기
*   ------------------------------------------------------------------*/
function fnCreateLeftHtml(data){
    var sub_list = [], subProd_list = [], data_list = [];
    data.sort(function(a, b){return (a.parent > b.parent)?1:(a.parent < b.parent)?-1:0}).forEach(function(item){
        if(_sub_path === '총장결재기록물' && item['parent'] === '생산당시총장') return;
        // console.log('item : ', item);
        if(item['parent'] === '결재권자' && item['value'].indexOf('_') > -1 && _sub_path !== '총장결재기록물') {
            item['title'] = '참모총장';
            sub_list.push(item);
        }else if(item['parent'] === '생산기관' && subProductList.indexOf(item['value']) > -1){
            item['title'] = '부실단';
            subProd_list.push(item);
        }else{
            data_list.push(item);
        }
    });
    var left_html = '<div id="facet_wrap">';
    parent_list = [];
    data_list.sort(function(a, b){return (a.parent > b.parent)?1:(a.parent < b.parent)?-1:0});
    left_menu.forEach(function(v){
        left_html += '<div class="panel panel-default panel-primary" name="' + v.split('/resource/')[1].split('_')[1] + '">';
        left_html += '<div class="panel-heading">' + v.split('/resource/')[1].split('_')[1] + '</div>';
        left_html += '<div class="panel-body">';
        left_html += '<ul class="classTree">';
        if(v.replace(_resource, '').split('_')[1] === '결재권자' || v.replace(_resource, '').split('_')[1] === '생산기관') {
            var s_list;
            switch(v.replace(_resource, '').split('_')[1]){
                case '결재권자':
                    console.log('s list : ', sub_list);
                    s_list = sub_list.sort(function(a, b){return (a.value > b.value)?1:(a.value < b.value)?-1:0});
                    // s_list = sub_list.sort(function(a, b){return (a.value.split('_')[1] > b.value.split('_')[1])?1:(a.value.split('_')[1] < b.value.split('_')[1])?-1:0});
                    data_list.filter(function(f){if(f.parent === '결재권자') return f;}).sort(function(a,b){return (a.lv < b.lv)?1:(a.lv > b.lv)?-1:0});
                break;
                case '생산기관': s_list = subProd_list; break;
            }
            if(s_list.length > 0){
                left_html += '<b data-toggle="dropdown" style="cursor:pointer">' + s_list[0].title + '<span class="caret"></span></b>';
                left_html += '<ul class="dropdown-menu" style="position:relative;">';
                s_list.forEach(function(s){
                    if(parent_list.indexOf(s['parent']) === -1){
                        parent_list.push(s['parent']);
                    }
                    if(v.split('/resource/')[1].split('_')[1] === s['parent']){
                        left_html += '<li>';
                        left_html += '<div class="listDiv1">';
                        left_html += '<span class="class-icon"></span>';
                        var val = ((typeof(s['value'])==='object')?(s['value'][0].hasOwnProperty('@value'))?s['value'][0]['@value'].replace(/\[dot\]/gi, '.'):s['value'][0].replace(/\[dot\]/gi, '.'):s['value'].replace(/\[dot\]/gi, '.'));
                        left_html += '<b name="left_facet" data-subClass="' + ((s['subClass']!==false)?s['subClass']:false) + '" data-facet="' + v + '" data-store="' + val + '">' + val +  ' (' + s['badge'] + ')' + '</b>';
                        left_html += '</div>';
                        left_html += '</li>';
                    }
                });
                left_html += '</ul>';
            }
            data_list.sort(function(a,b){return (a.lv > b.lv)?1:(a.lv < b.lv)?-1:0}).forEach(function(w, i){
                if(parent_list.indexOf(w['parent']) === -1){
                    parent_list.push(w['parent']);
                }
                if(v.split('/resource/')[1].split('_')[1] === w['parent']){
                    left_html += '<li>';
                    left_html += '<div class="listDiv1">';
                    left_html += '<span class="class-icon"></span>';
                    var val = ((typeof(w['value'])==='object')?(w['value'][0].hasOwnProperty('@value'))?w['value'][0]['@value'].replace(/\[dot\]/gi, '.'):w['value'][0].replace(/\[dot\]/gi, '.'):w['value'].replace(/\[dot\]/gi, '.'));
                    left_html += '<b name="left_facet" data-subClass="' + ((w['subClass']!==false)?w['subClass']:false) + '" data-facet="' + v + '" data-store="' + val + '">' + val +  ' (' + w['badge'] + ')' + '</b>';
                    left_html += '</div>';
                    left_html += '</li>';
                }
            });
        }else{
            data_list.forEach(function(w){
                if(parent_list.indexOf(w['parent']) === -1){
                    parent_list.push(w['parent']);
                }
                if(v.split('/resource/')[1].split('_')[1] === w['parent']){
                    left_html += '<li>';
                    left_html += '<div class="listDiv1">';
                    left_html += '<span class="class-icon"></span>';
                    var val = ((typeof(w['value'])==='object')?(w['value'][0].hasOwnProperty('@value'))?w['value'][0]['@value'].replace(/\[dot\]/gi, '.'):w['value'][0].replace(/\[dot\]/gi, '.'):w['value'].replace(/\[dot\]/gi, '.'));
                    left_html += '<b name="left_facet" data-subClass="' + ((w['subClass']!==false)?w['subClass']:false) + '" data-facet="' + v + '" data-store="' + val + '">' + val +  ' (' + w['badge'] + ')' + '</b>';
                    left_html += '</div>';
                    left_html += '</li>';
                }
            });
        }
        left_html += '</ul>';
        left_html += '</div>';
        left_html += '</div>';
    });
    left_html += '</div>';
    return left_html;
}
/*  ------------------------------------------------------------------
*   Left 패싯 줄이기
*   ------------------------------------------------------------------*/
function fnDistinctLeft(parent_list){
    $('.panel-primary').css('display', 'none');
    parent_list.forEach(function(v){
        $('.panel-primary[name='+v+']').css('display', 'block');
    });
}
/*  ------------------------------------------------------------------
*   Body 만들기
*   핵심은 Type 별로 묶는 것
*   ------------------------------------------------------------------*/
function fnCreateBody(data){
    var type_list = {};
    data.forEach(function(v){
        var type = v['@type'].replace(_resource, '');
        if(sub_class.indexOf(v['@type']) === -1) return;
        if(type_list.hasOwnProperty(type)){
            type_list[type]['list'].push(v);
        }else{
            type_list[type] = {'list':[v], 'first':(type==='참모총장' || type === '총장결재기록물')?1000:(type === '주요수집기록물')?900:0, 'parent':type};
        }
    });
    $('#body_data').html(fnCreateBodyHtml(type_list));
    if(_pathname === '업무기능' || _pathname === '생산기관' || _pathname === '공간' || _pathname === '이벤트') fnGetListCount(_pathname);
    // console.log('count : ', count_list);
    // if(count_list.length > 0){
    //     return false;
    //     let data = count_list.map((item) => {return item.name});
    //     console.log('data : ', data);
    //     $.ajax({
    //         type:'post',
    //         url:'getMultiCount',
    //         data:{name:data},
    //         dataType:'json',
    //         success:function(res){
    //             console.log('res : ', res);
    //             res['res'].forEach((item) => {
    //                 $('b[name="' + item.name.replace(/\[dot\]/gi, '.') + '"]').text('( ' + item.count + ' )');
    //             });
    //         }
    //     });
    // }
}
/*  ------------------------------------------------------------------
*   Body Html 만들기
*   ------------------------------------------------------------------*/
function fnCreateBodyHtml(data){
    // page 선택 radio
    var sortable = [], idx = 0;
    for(var key in data){
        sortable.push([key, data[key], {page:1}, {pageGroup:1}]);
    }
    sortable.sort(function(a, b){
        return (a[1]['parent'] < b[1]['parent'])?-1:(a[1]['parent'] > b[1]['parent'])?1:0;
    }).sort(function(a, b){
        return b[1]['first'] - a[1]['first'];
    }).forEach(function(v){
        v[1]['list'].sort(function(a, b){
            var value_a = a.hasOwnProperty(_label)?a[_label].hasOwnProperty('@value')?a[_label]['@value']:a[_label]:a['@id'].replace(_resource, '');
            var value_b = b.hasOwnProperty(_label)?b[_label].hasOwnProperty('@value')?b[_label]['@value']:b[_label]:b['@id'].replace(_resource, '');
            return (value_a < value_b)?-1:(value_a > value_b)?1:0;
        });
    });
    // 속성에 idx, parent 추가
    var idx_sort = sortable.map(function(v){
        return v.map(function(w, j){
            if(j===1) {
                return w['list'].map(function(x){
                    x['idx'] = idx++;
                    x['parent'] = v[0];
                    x['group_length'] = w['list'].length;
                    if(x['@type'] === _resource + '참모총장') x['idx'] = parseInt(x['@id'].replace(_resource, '').split('_')[1].replace('대', ''));
                    if(x['@type'] === _resource + '업무기능') {
                        for(var key in _job_idx){
                            if(x['@id'].replace(_resource, '') === _job_idx[key]) x['idx'] = key;
                        }
                    }
                    return x;
                });
            }else return w;
        });
    });
    p_list = idx_sort;
    return fnDepartSection(idx_sort);
}
function fnDepartSection(list){
    // console.log('list : ', list);
    var html = '';
    for(var key in list){
        var total_item = list[key][1].length;
        var page_count = Math.ceil(total_item / per_page_item);
        var start_idx = (list[key][2].page - 1) * per_page_item;
        var last_idx = (total_item > list[key][2].page * per_page_item)?list[key][2].page * per_page_item:total_item;
        var pageGroup = list[key][3].pageGroup;
        var start_page = (pageGroup - 1) * page_size;
        var last_page = pageGroup * page_size;

        html += '<div class="row">';
        html += '<div class="body_title_wrap">';
        html += '<h2>' + list[key][0].replace(/\[dot\]/g, '.') + '</h2>';
        html += '<span class="badge">( ' + list[key][1].length + ' )</span>';
        html += '</div>';
        if(list[key][0] === '참모총장') {
            html = fnGenTopPageList(list[key][1], total_item, key, html);
        }
        if(list[key][0] === '참모총장') html = fnGenFacetList(start_idx, start_idx + (total_item < 10)?total_item:10, list, key, html);
        else if(list[key][0] === '결재권자'){
            // console.log('list : ', list[key][1]);
            list[key][1].forEach(function(s){
                // console.log('s : ', s['@id'].replace(_resource, ''));
                switch(s['@id'].replace(_resource, '')){
                    case '참모차장':s.list_idx = 1; break;
                    case '부실단장':s.list_idx = 2; break;
                    case '육직부대장':s.list_idx = 3; break;
                    case '군사령관':s.list_idx = 4; break;
                    case '군단장':s.list_idx = 5; break;
                    case '사단장':s.list_idx = 6; break;
                    default: s.list_idx = 100; break;
                }
            });
            list[key][1].sort(function(a, b){return (a.list_idx > b.list_idx)?1:(a.list_idx < b.list_idx)?-1:0});
            html = fnGenFacetList(start_idx, last_idx, list, key, html);
        }else html = fnGenFacetList(start_idx, last_idx, list, key, html);
        html += '<div class="row" name="pageGroup_' + key + '">';
        if(list[key][0] !== '참모총장' && list[key][0] !== '업무기능' && list[key][0] !== '생산기관' && list[key][0] !== '공간' && list[key][0] !== '이벤트')
            html = fnGenPageList(start_page, last_page, page_count, key, html, 1);
        // else html = fnGenPageList(start_page, last_page, page_count, key, html, 1);
        html += '</div></div>';
    }
    return html;
}
function fnGenTopPageList(list, total_item, key, html){
    var page_group = [], group_idx;
    list.sort(function(a, b){return (a.idx > b.idx)?1:(a.idx < b.idx)?-1:0}).forEach(function(v, i){
        group_idx = Math.ceil((i+1) / 10);
        if((i % 10 === 0) || (i % 10 === 9) || (list.length === i + 1)) page_group.push({idx:group_idx, name:v['@id'].split('_')[1]}); //console.log('v : ', v['@id']);
    });
    var temp_start = 1, page_list = [], obj = {};
    page_group.forEach(function(v, i){
        if(temp_start === v.idx && i % 2 === 0){
            obj = {};
            obj['start'] = v.name;
        }else if(temp_start === v.idx && i%2 === 1){
            obj['last'] = v.name;
            page_list.push(obj);
            temp_start++;
        }
    });
    html += '<div class="pageTopWrap">';
    page_list.forEach(function(v, i){
        html += '<button type="button" class="btn btn-outline-primary" name="' + i + '_' + key + '">' + v.start + ' ~ ' + v.last + '</button>';
    });
    html += '</div>';
    return html;
}
$(document).on('click', '.pageTopWrap .btn', function(){
    var page = this.name.split('_')[0];
    var key = this.name.split('_')[1];
    var list_size = p_list[key][1].length;
    var start_idx = page * 10;
    var last_idx = (start_idx + 10 > list_size)?list_size:start_idx + 10;
    html = fnGenFacetList(start_idx, last_idx, p_list, key, '');
    $('div[name=' + key + ']').html(html);
});
function fnGenFacetList(start_idx, last_idx, list, key, html){
    var v, i, title;
    if(list[key][0] === '업무기능' || list[key][0] === '생산기관' || list[key][0] === '공간' || list[key][0] === '이벤트') {
        html += '<div class="body_wrap" name="' + key + '">';
        list[key][1].sort(function(a, b){return (a.idx > b.idx)?1:(a.idx < b.idx)?-1:0});
        list[key][1].filter(function(f){if(typeof(f.idx) === 'string' || f.parent === '공간' || f.parent === '생산기관' || f.parent === '이벤트') return f;})
            .forEach(function(v){
                html += '<div class="col-md-3">';
                html += '<div class="desc_wrap">';
                // console.log('v : ', v);
                if (v.hasOwnProperty(_label)) {
                    if(typeof(v[_label]) === 'object' && v[_label].length > 1){
                        v[_label].forEach(function(t){
                            title += ((t.hasOwnProperty('@value')) ? t['@value'].replace(/\[dot\]/gi, '.'):t.replace(/\[dot\]/gi, '.')) + '<br>';
                        });
                    }else{
                        title = ((v[_label].hasOwnProperty('@value')) ? v[_label]['@value'].replace(/\[dot\]/gi, '.'):v[_label].replace(/\[dot\]/gi, '.'));
                    }
                }else title = v['@id'].replace(_resource, '').replace(/\[dot\]/gi, '.');
                title = title.replace(/ /gi, '');
                html += '<a href="' + v['@id'].replace(/\[dot\]/gi, '.') + '">' + title + '</a><b name="' + title + '"></b>';
                html += '</div>';
                html += '</div>';
            });
    }else{
        html += '<div class="body_wrap" name="' + key + '">';
        if(list[key][0] === '참모총장') list[key][1].sort(function(a, b){return (a.idx > b.idx)?1:(a.idx < b.idx)?-1:0});
        for(i = start_idx; i < last_idx; i++){
            v = list[key][1][i];
            // console.log('v : ', v);
            html += '<div class="body_list_wrap">';
            if (v.hasOwnProperty(_resource + '그림')) {
                html += '<a href="' + v['@id'].replace(/\[dot\]/gi, '.') + '" class="thumb">';
                if (v[_resource + '그림'].length > 0) {
                }else{
                    // html += '<img src="' + v[_resource + '그림']['@value'].replace(/\[dot\]/gi, '.') + '"/>';
                    html += '<img src="../static/images/' + v[_resource + '그림']['@value'].replace(/\[dot\]/gi, '.') + '"/>';
                }
                html += '</a>';
            } else {
                html += '<a href="' + v['@id'].replace(/\[dot\]/gi, '.') + '" class="thumb">';
                html += '<img src="../static/img/mil_empty.gif"/>';
                html += '</a>';
            }
            html += '<div class="desc_wrap">';
            if (v.hasOwnProperty(_label)) {
                if (typeof(v[_label]) === 'object' && v[_label].length > 1) {
                    html += '<a href="' + v['@id'].replace(/\[dot\]/gi, '.') + '">' + ((v[_label][0].hasOwnProperty('@value')) ? v[_label][0]['@value'].replace(/\[dot\]/gi, '.') : v[_label][0].replace(/\[dot\]/gi, '.')) + '</a>';
                }else
                    html += '<a href="' + v['@id'].replace(/\[dot\]/gi, '.') + '">' + ((v[_label].hasOwnProperty('@value')) ? v[_label]['@value'].replace(/\[dot\]/gi, '.') : v[_label].replace(/\[dot\]/gi, '.')) + '</a>';
            } else {
                html += '<a href="' + v['@id'].replace(/\[dot\]/gi, '.') + '">' + v['@id'].replace(_resource, '').replace(/\[dot\]/gi, '.') + '</a>';
            }
            html += '<p class="description">' + ((v.hasOwnProperty(_description))?(v[_description].hasOwnProperty('@value'))?v[_description]['@value'].replace(/\[dot\]/gi, '.'):v[_description]:'') + '</p>';
            html += '</div>';
            html += '</div>';
        }
    }
    html += '</div>';
    return html;
}
// 내부 테이블의 카운트 수를 구해주는 Ajax
function fnGetListCount(name){
    let data;
    for(let key in facet_count_list){
        if(facet_count_list[key].name === name) data = facet_count_list[key].list;
    }
    data.forEach((v) => {
        $('b[name="' + v.name.replace(/\[dot\]/gi, '.').replace(/_/gi, '') + '"]').text(' ( ' + v.count + ' )');
    });
}
function fnGenPageList(start_page, last_page, page_count, key, html, active_page){
    html += '<nav aria-label="Page navigation">';
    html += '<ul class="pagination justify-content-center">';
    html += '<li class="page-item">';
    html += '<a class="page-link" aria-label="Previous" name="' + key + '">';
    html += '<span aria-hidden="true">&laquo;</span>';
    html += '<span class="sr-only">Previous</span>';
    html += '</a>';
    html += '</li>';
    for(var p = start_page; p < (last_page>page_count?page_count:last_page); p++){
        html += '<li class="page-item ' + (p + 1 === parseInt(active_page)?"active":"") + '"><a class="page-link" name="' + key + '">' + ( p + 1 ) + '</a></li>'
    }
    html += '<li class="page-item">';
    html += '<a class="page-link" aria-label="Next" name="' + key + '">';
    html += '<span aria-hidden="true">&raquo;</span>';
    html += '<span class="sr-only">Next</span>';
    html += '</a>';
    html += '</li>';
    html += '</ul>';
    html += '</nav>';
    return html;
}
/*  ------------------------------------------------------------------
*   Left 클릭시 Facet 만들어 주는 함수
*   ------------------------------------------------------------------*/
var post_data = {'facet_title': [], 'facet_link': []}, search_data;
$(document).on('click', 'b[name=left_facet]', function(){
    var facet_title = $(this).data('store').toString();    // ex) 강두봉
    var facet_link = $(this).data('facet');     // ex) 향토자료_관련인물
    var subClass = $(this).data('subclass');    // subclass가 있을 경우
    search_data = $('#searchInResultData').val();
    if(_sub_path) subClass = _sub_path;
    if(filter_list.indexOf(facet_title) === -1){
        filter_list.push(facet_title.replace(/\./gi, '[dot]').replace(/\"/gi, '\"'));
        link_list.push(facet_link.replace(_resource, ''));
        genFilterList();
        fnSendAjax(filter_list, link_list, subClass, search_data);
    }
});
/*  ------------------------------------------------------------------
*   결과내 재검색
*   ------------------------------------------------------------------*/
$('#searchInResultData').keydown((e) =>{
    console.log('e : ', e);
    let code = e.which;
    if(code === 13) fnSearchInResult();
});
$('#btnSearchInResult').on('click', function(){
    fnSearchInResult();
});
function fnSearchInResult(){
    search_data = $('#searchInResultData').val();
    if(post_data['facet_title']){
        fnSendAjax(post_data.facet_title, post_data.facet_link, post_data.subClass, search_data);
    }else{
        fnSendAjax(null, null, post_data.subClass, search_data);
    }
}
/*  --------------------------------------------------- ---------------
*   왼쪽 상단 필터 삭제하는 함수
*   ------------------------------------------------------------------*/
$(document).on('click', 'span.fa-times', function(){
    var idx = $(this).attr('id').split('_')[1];
    filter_list.splice(idx, 1);
    link_list.splice(idx, 1);
    var subClass = $(this).data('subclass');    // subclass가 있을 경우
    search_data = $('#searchInResultData').val();
    if(_sub_path) subClass = _sub_path;
    if(filter_list.length > 0){
        genFilterList();
        fnSendAjax(filter_list, link_list, subClass, search_data);
    }else{
        if(search_data) fnSendAjax(null, null, subClass, search_data);
        else fnCreateBody(body);
        createLeftMenu();
    }
});
/*  ------------------------------------------------------------------
*   ajax로 넘기는 함수(Left facet 클릭시)
*   ------------------------------------------------------------------*/
function fnSendAjax(filter_list, link_list, subClass, search_data) {
    // post_data = {'facet_title': filter_list, 'facet_link': link_list};
    post_data['facet_title'] = filter_list;
    post_data['facet_link'] = link_list;
    post_data['searchData'] = search_data;
    if(subClass) post_data['subClass'] = subClass;
    console.log('post data : ', post_data);
    $.ajax({
        type: 'POST',
        url: 'mongoAjax/left_facet',
        data: post_data,
        dataType: 'json',
        success: function (res) {
            if(_sub_path) res = res.filter(function(item){
                if(item['@type'] === _resource + _sub_path) return item;
            });
            $('#facet_wrap').html(fnCreateLeftHtml(fnCreateUniqueLeft(res)));
            fnDistinctLeft(parent_list);
            fnCreateBody(res);
        },
        error: function (err) {
            console.log(err);
        }
    });
}
/*  ------------------------------------------------------------------
*   왼쪽 상단 필터만들어 주는 함수
*   ------------------------------------------------------------------*/
function genFilterList(){
    var filter_html = '';
    filter_list.forEach(function(w, j){
        filter_html += '<div class="items_wrap">';
        filter_html += '<div class="filter_item">' + w.replace(/\[dot\]/gi, '.') + '</div>';
        filter_html += '<span class="fa fa-times" id="filter_' + j + '"></span>';
        filter_html += '</div>';
    });
    $('#filter_wrap').html(filter_html);
}
$('.btn-custom').on('click', function(){
    localStorage.setItem('page', this.innerText);
    location.reload();
});
/*  ------------------------------------------------------------------
*   page 클릭 이벤트
*   ------------------------------------------------------------------*/
$(document).on('click', 'a.page-link', function(item){
    var page = item.currentTarget.text;
    var key = item.currentTarget.name;
    var list = p_list;
    var total_item = list[key][1].length;
    var page_count = Math.ceil(total_item / per_page_item);
    var pageGroup = list[key][3].pageGroup;
    if(page.indexOf('e') > -1){
        if(page.indexOf('ext') > -1) {
            if(page_count > list[key][3].pageGroup * page_size){
                list[key][3].pageGroup++;
                page = pageGroup * page_size + 1;
                pageGroup = list[key][3].pageGroup;
            }else{
                page = page_count;
            }
        }else {
            if(list[key][3].pageGroup === 1) {
                page = 1;
            }else{
                list[key][3].pageGroup--;
                pageGroup = list[key][3].pageGroup;
                page = pageGroup * page_size;
            }
        }
    }
    var start_page = (pageGroup - 1) * page_size;
    var last_page = pageGroup * page_size;
    $('div[name=pageGroup_' + key + ']').html(fnGenPageList(start_page, last_page, page_count, key, '', page));
    var start_idx = (page - 1) * per_page_item;
    var last_idx = (total_item > page * per_page_item)?page * per_page_item:total_item;
    var html = '';
    html = fnGenFacetList(start_idx, last_idx, list, key, html);
    $('div[name=' + key + ']').html(html);
});
/*  ------------------------------------------------------------------
*   더보기 클릭 및  추가
*   ------------------------------------------------------------------*/
function fnAppendBody(new_list, start_idx, last_idx){
    var html ='';
    for(var i = start_idx; i < last_idx; i++){
        var v = new_list[i];
        if(i === 0 || v['parent'] !== temp_parent){
            html += '<div class="body_title_wrap">';
            html += '<h2>' + v['parent'].replace(/\[dot\]/g, '.') + '</h2>';
            html += '<span class="badge">' + v['group_length'] + '</span>';
            html += '</div>';
        }
        temp_parent = v['parent'];
        html += '<div class="body_list_wrap">';
        if (v.hasOwnProperty(_resource + '그림')) {
            html += '<a href="' + v['@id'].replace(/\[dot\]/gi, '.') + '" class="thumb">';
            if (v[_resource + '그림'].length > 0) {

            } else if (v[_resource + '그림']['@value'].split('/mil/')[1] === '[dot]jpg' || v[_resource + '그림']['@value'].split('/mil/')[1] === '')
                html += '<img src="../static/img/mil_empty.gif"/>';
            else{
                // html += '<img src="' + v[_resource + '그림']['@value'].replace(/\[dot\]/gi, '.') + '"/>';
                html += '<img src="../static/images/' + v[_resource + '그림']['@value'].replace(/\[dot\]/gi, '.') + '"/>';
            }
            html += '</a>';
        } else {
            html += '<a href="' + v['@id'].replace(/\[dot\]/gi, '.') + '" class="thumb">';
            html += '<img src="../static/img/mil_empty.gif"/>';
            html += '</a>';
        }
        html += '<div class="desc_wrap">';
        if (v.hasOwnProperty(_label)) {
            if (typeof(v[_label]) === 'object' && v[_label].length > 1) {
                html += '<a href="' + v['@id'].replace(/\[dot\]/gi, '.') + '">' + ((v[_label][0].hasOwnProperty('@value')) ? v[_label][0]['@value'].replace(/\[dot\]/gi, '.') : v[_label][0].replace(/\[dot\]/gi, '.')) + '</a>';
            }
            else
                html += '<a href="' + v['@id'].replace(/\[dot\]/gi, '.') + '">' + ((v[_label].hasOwnProperty('@value')) ? v[_label]['@value'].replace(/\[dot\]/gi, '.') : v[_label].replace(/\[dot\]/gi, '.')) + '</a>';
        } else {
            html += '<a href="' + v['@id'].replace(/\[dot\]/gi, '.') + '">' + v['@id'].replace(_resource, '').replace(/\[dot\]/gi, '.') + '</a>';
        }
        html += '<p class="description">' + ((v.hasOwnProperty(_description)) ? v[_description]['@value'].replace(/\[dot\]/gi, '.') : '') + '</p>';
        html += '</div>';
        html += '</div>';
    }
    if(new_list.length > per_page_items) $('#pagination').html('<div class="view_more">더보기</div>');
    return html;
}
/*  ------------------------------------------------------------------
*   paging 처리 더보기 클릭
*   ------------------------------------------------------------------*/
$(document).on('click', '.view_more', function(){
    now_page++;
    var start_idx = (now_page - 1) * per_page_items;
    var last_idx = (new_list.length < per_page_items * now_page)?new_list.length:now_page * per_page_items;
    $('#body_data').append(fnAppendBody(new_list, start_idx, last_idx));
    if(new_list.length < per_page_items * now_page) $('#pagination').html('');
});