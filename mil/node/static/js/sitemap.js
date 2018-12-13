// const _label = 'http://www[dot]w3[dot]org/2000/01/rdf-schema#label';
// const _resource = 'http://mil[dot]k-history[dot]kr/resource/';
// const _description = 'http://purl[dot]org/dc/elements/1[dot]1/description';
var _left = $('#left').data('store');
var $list = $('#list').data('store');
var $menu = $('#menu').data('store');
var $facet_list = $('#facet_list').data('store');
var type = $('#type').data('store');
var searchText = $('#search').data('store');
if(searchText !== '') $('#searchResult').html('"<strong>' + searchText + '</strong>"의 검색 결과 ( ' + $list.length +  '건 )');
// console.log('type : ', type);
// console.log('search text : ', searchText);
console.log('list : ', $list);
var post = {list:[]};
if(type === 'post'){
    $list.forEach(function(v){
        if(v['@type'].length > 0 && typeof(v['@type']) === 'object'){
            v['@type'].forEach(function(w){
                post[w.replace(_resource, '')] = 1 + (post[w.replace(_resource, '')] || 0);
                post.list.push(w);
            });
        }else{
            post[v['@type'].replace(_resource, '')] = 1 + (post[v['@type'].replace(_resource, '')] || 0);
            post.list.push(v);
        }
    });
    $list = [];
    for(var key in post){
        $list.push({'_id':key, count:post[key]});
    }
}
// console.log('left : ', _left);
console.log('menu : ', $menu);
// console.log('list : ', $list);
// console.log('facet_list : ', $facet_list);
// site map에서만 핵심 키워드 추가(메뉴에는 없으므로 리스트 표시가 안 되는 문제)
$menu['mongo_12'] = {label:'핵심키워드'}
var $left = {};
$list.forEach(function(v){
    if(v !== null) $left[v['_id']] = v['count'];
});
var left_html = '<div class="just-padding">', total_list = [];
left_html += '<div class="list-group list-group-root well">';
for(var key in $menu){
    var sub_total = 0;
    if($menu[key]['label'] !== 'Home'){
        left_html += '<a class="list-group-item list-group-item-success" data-toggle="' + ($menu[key].hasOwnProperty('subClass')?1:0) + '" data-store="' + key + '">' + $menu[key]['label'];
        left_html += '<b class="list-number" name="' + key + '">' + 0 + '</b></a>';
        left_html += '<div class="list-group" data-store="' + ($menu[key].hasOwnProperty('subClass')?key:0) + '">';
        sub_total += ($left.hasOwnProperty($menu[key]['label'])?$left[$menu[key]['label']]:0);
        if($menu[key].hasOwnProperty('subClass')){
            $menu[key]['subClass'].forEach(function(v){
                if(typeof(v) === 'object'){
                    left_html += '<a class="list-group-item list-group-item-warning" data-toggle="1" data-store="sub_' + key + '">' + Object.keys(v);
                    left_html += '<b class="list-number">' + v[Object.keys(v)].reduce(function(tot, record){return ($left.hasOwnProperty(tot)?$left[tot]:0) + ($left.hasOwnProperty(record)?$left[record]:0)}) + '</b></a>';
                    left_html += '<div class="list-group" data-store="sub_' + key + '">';
                    sub_total += v[Object.keys(v)].reduce(function(tot, record){return ($left.hasOwnProperty(tot)?$left[tot]:0) + ($left.hasOwnProperty(record)?$left[record]:0)});
                    v[Object.keys(v)].forEach(function(w){
                        left_html += '<a class="list-group-item list-group-item-text">';
                        left_html += w;
                        left_html += '<b class="list-number">' + ($left.hasOwnProperty(w)?$left[w]:0) + '</b></a>';
                    });
                    left_html += '</div>';
                }else{
                    left_html += '<a class="list-group-item list-group-item-warning">';
                    left_html += v;
                    left_html += '<b class="list-number">' + ($left.hasOwnProperty(v)?$left[v]:0) + '</b></a>';
                    sub_total += ($left.hasOwnProperty(v)?$left[v]:0);
                }
            });
        }
        left_html += '</div>';
        var obj= {};
        obj[key] = sub_total;
        total_list.push(obj);
    }
}
left_html += '</div>';
$('#left_facets').html(left_html);
var list_html = '';
if(post.list.length > 0){
    post.list.forEach(function(v){
        list_html = fnGenBodyList(v, list_html);
    });
    $('#body_data').html(list_html);
}
total_list.forEach(function(v){
    if(v[Object.keys(v)] === 0){
        $('b[name=' + Object.keys(v)[0] + ']').prop('display', 'node');
    }else{
        $('b[name=' + Object.keys(v)[0] + ']').html(v[Object.keys(v)]);
    }
});
$('a.list-group-item').on('click', function(item){
    var dataset = item.currentTarget.dataset, dataset_list = [];
    var target = item.currentTarget.innerText.replace(/[0-9\.]/g, '');
    if(dataset.toggle == 1){
        var $store = $('div.list-group[data-store="' + dataset.store +'"]')[0].children;
        dataset_list.push(_resource + item.currentTarget.text.replace(/[0-9\.]/g, ''));
        for(var i = 0; i < $store.length; i++){
            if($store[i].tagName === 'A'){
                dataset_list.push(_resource + $store[i].text.replace(/[0-9\.]/g, ''));
            }else if($store[i].tagName === 'DIV'){
                for(var j = 0; j < $store[i].children.length; j++){
                    dataset_list.push(_resource + $store[i].children[j].text.replace(/[0-9\.]/g, ''));
                }
            }
        }
    }else{
        dataset_list = _resource + item.currentTarget.text.replace(/[0-9\.]/g, '');
    }
    var post_data = {data:dataset_list, searchText:searchText}, ajax_html = '';
    $.ajax({
        type:'post',
        url:'getSearchData/' + target,
        data:post_data,
        dataType:'json',
        success:function(res){
            var post_type;
            if(post_data.data.length > 0 && typeof(post_data.data) === 'object'){
                post_type = post_data.data.map(function(item){return item});
            }else{
                post_type = [post_data.data];
            }
            post_type.forEach(function(p){
                res.forEach(function(v){
                    if(typeof(v['@type']) === 'string'){
                        if(v['@type'].replace(/ /gi, '') === p.replace(/ /gi, '')){
                            // console.log('v : ', v);
                            ajax_html = fnGenBodyList(v, ajax_html);
                        }
                    }
                });
            });
            $('#body_data').html(ajax_html);
        }
    });
});
function fnGenBodyList(v, html){
    html += '<div class="body_list_wrap">';
    if (v.hasOwnProperty(_resource + '그림')) {
        html += '<a href="' + v['@id'].replace(/\[dot\]/gi, '.') + '" class="thumb">';
        if (v[_resource + '그림'].length > 0) {

        } else if (v[_resource + '그림']['@value'].split('/mil/')[1] === '[dot]gif' || v[_resource + '그림']['@value'].split('/mil/')[1] === '')
            html += '<img src="../static/img/mil_empty.gif"/>';
        else
            html += '<img src="../static/images/' + v[_resource + '그림']['@value'].replace(/\[dot\]/gi, '.') + '"/>';
        html += '</a>';
    } else {
        if(v.hasOwnProperty('@id')){
            html += '<a href="' + v['@id'].replace(/\[dot\]/gi, '.') + '" class="thumb">';
            html += '<img src="../static/img/mil_empty.gif"/>';
            html += '</a>';
        }
    }
    html += '<div class="desc_wrap">';
    if(v.hasOwnProperty('@id')){
        if (v.hasOwnProperty(_label)) {
            if (typeof(v[_label]) === 'object' && v[_label].length > 1) {
                html += '<a href="' + v['@id'].replace(/\[dot\]/gi, '.') + '">' + ((v[_label][0].hasOwnProperty('@value')) ? v[_label][0]['@value'].replace(/\[dot\]/gi, '.') : v[_label][0].replace(/\[dot\]/gi, '.')) + '</a>';
            }
            else
                html += '<a href="' + v['@id'].replace(/\[dot\]/gi, '.') + '">' + ((v[_label].hasOwnProperty('@value')) ? v[_label]['@value'].replace(/\[dot\]/gi, '.') : v[_label].replace(/\[dot\]/gi, '.')) + '</a>';
        } else {
            html += '<a href="' + v['@id'].replace(/\[dot\]/gi, '.') + '">' + v['@id'].replace(_resource, '').replace(/\[dot\]/gi, '.') + '</a>';
        }
    }
    // console.log('v : ', v);
    html += '<p class="description">' + ((v.hasOwnProperty(_description)) ? (v[_description].length > 1)?v[_description][0]['@value'].replace(/\[dot\]/gi, '.'):v[_description]['@value'].replace(/\[dot\]/gi, '.') : '') + '</p>';
    html += '</div>';
    html += '</div>';
    return html;
}
// count 0 은 display none
$('b.list-number').each(function(){
    // console.log(this.innerText);
    if(this.innerText == 0) $(this).parent('a')[0].style.display = 'none';
});