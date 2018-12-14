// const _label = 'http://www[dot]w3[dot]org/2000/01/rdf-schema#label';
// const _altLabel = 'http://www[dot]w3[dot]org/2004/02/skos/core#altLabel';
// const _resource = 'http://mil[dot]k-history[dot]kr/resource/';
// const _description = 'http://purl[dot]org/dc/elements/1[dot]1/description';
// const _class = 'http://www[dot]w3[dot]org/2002/07/owl#Class';
// const _datatypeProperty = 'http://www[dot]w3[dot]org/2002/07/owl#DatatypeProperty';
// const _latlong = 'http://www[dot]w3[dot]org/2003/01/geo/wgs84_pos#lat_long';
// const _pathname = decodeURI(location.pathname.split('/')[2]);
var _data = $('#total_store').data('store');
var _register_store = $('#register_store').data('store');
var _subClass_store = $('#subClass_store').data('store');
var subType_store = $('#subType_store').data('store');
console.log('_data : ', _data);
console.log('register store : ', _register_store);
console.log('subType_store : ', subType_store);
console.log('_subClass_store : ', _subClass_store);
var store = {};
for(var key in _register_store){
    var list = _register_store[key].map(function(item){
        switch(item['@id']){
            case _description: return {id:'description', label:'설명', type:'textarea', property:_description}; break;
            case _latlong: return {id:'lat_long', label:'위치', type:'text', property:_latlong}; break;
            default:
                switch(item['@type']){
                    case _class: return {id:item[_label]['@value'], label:item[_label]['@value'], type:'link'}; break;
                    case _datatypeProperty: return {id:item[_label]['@value'], label:item[_label]['@value'], type:'text', property:item['@id']}; break;
                }
                break;
        }
    });
    store[key] = list;
}
var items = [], objs = [], add_list = [];
store[_pathname].forEach(function(v){
    if(v.type === 'link'){items.push(v.id.replace(/ /gi, '')); objs.push(v.label);}
    else{add_list.push(v);}
});
var post_data = {};
var $normal_facet = $('#normal_facet');
// 향토자료(default facet)
var html = '<div class="row">';
html += '<div class="col-md-2 col-md-offset-2 text-left"><label for="default">' + _pathname + '명</label></div>';
html += '<div class="col-md-3"><div class="form-group"><input type="text" class="form-control" id="typename" placeholder="' + _pathname + '명을 입력하세요." value=""/></div></div></div>';

if(_subClass_store[_pathname].length > 0) {
    html += '<div class="row"><div class="col-md-2 col-md-offset-2 text-left"><label>sub-category</label></div>';
    html += '<div class="col-md-3"><div class="form-group"><div class="dropdown">';
    html += '<select class="selectpicker" name="default" title="sub-category 선택" multiple>';
    _subClass_store[_pathname].forEach(function (v) {
        var label = v.hasOwnProperty(_label)?v[_label]['@value'].replace(/\./g, '[dot]'):v['@id'];
        html += '<option value="' + v['@id'].replace(/\./g, '[dot]') + '">' + label + '</option>';
    });
    html += '</select></div></div></div></div>';
}
$normal_facet.append(html);
// 일반패싯(관계형)
items.forEach(function(v, i){
    var temp =[];
    var html = '<div class="row"><div class="col-md-2 col-md-offset-2 text-left"><label for="' + v + '">' + objs[i] + '</label></div>';
    html += '<div class="col-md-3"><div class="form-group"><div class="dropdown">';
    html += '<select class="selectpicker" name="' + v + '" data-live-search="true" multiple title="' + objs[i] + ' 선택">';
    subType_store[v].forEach(function(w){
        if(w.hasOwnProperty('@id')){
            var label = (w.hasOwnProperty(_label)?w[_label].hasOwnProperty('@value')?w[_label]['@value']:w[_label]:w['@id'].replace(_resource, ''));
            // console.log('label : ', label);
            if(temp.indexOf(label) === -1){
                html += '<option value="' + w['@id'] + '">' + label + '</option>';
                temp.push(label);
            }
        }else{
            for(var key in w){
                html += '<optgroup label="' + key + '">';
                w[key].forEach(function(x){
                    var label = (x.hasOwnProperty(_label)?x[_label].hasOwnProperty('@value')?x[_label]['@value']:x[_label]:x['@id'].replace(_resource, ''));
                    // console.log('label : ', label);
                    if(temp.indexOf(label) === -1){
                        html += '<option value="' + x['@id'] + '">' + label + '</option>';
                        temp.push(label);
                    }
                });
                html += '</optgroup>';
            }

        }

    });
    html += '</select>';
    html += '</div></div></div>';
    html += '<div class="col-md-2"><a href="/register/' + objs[i] + '">' + objs[i] + ' 새로 만들기</a></div>';
    html += '</div>';
    $normal_facet.append(html);
    // console.log(i, html);
});
// 나머지 정보입력창
add_list.forEach(function(v, i){
    var html = '<div class="row"><div class="col-md-2 col-md-offset-2 text-left"><label>' + v.label + '</label></div>';
    html += '<div class="col-md-6"><div class="form-group">';
    switch(v.type){
        case 'text':
            html += '<input type="text" class="form-control" id="' + v.id + '"/>';
            break;
        case 'textarea':
            html += '<textarea class="form-control" id="' + v.id +'"></textarea>';
            break;
        case 'file':
            html += '<input type="file" class="form-control" id="' + v.id + '"/>';
            break;
    }
    html += '</div></div>';
    html += '</div>';
    $normal_facet.append(html);
});
$('.selectpicker').on('hidden.bs.select', function(){post_data[$(this).attr('name')] = $(this).selectpicker('val');});
var idx = 0, link = items.map(function(item){return {name:item, value:_resource+_pathname+'_'+objs[idx++]}});
link.push({name:'default', value:post_data['default']});
$('button[name=register_btn]').on('click', function(){
    var $id = $('#typename');
    if($id.val() === ''){
        alert(_pathname + '명은 필수 입력 값 입니다. ');
        return false;
    }
    var item = {'@id':_resource+$id.val()};
    for(var key in post_data){
        link.forEach(function(v){
            if(key === v['name'] && post_data[key].length > 0){
                var value = post_data[key].map(function(v){
                    var result;
                    switch(key){
                        case 'default':
                            console.log('defadfad');
                            result = v;
                            break;
                        default:
                            result = {'@id':v};
                            break;
                    }
                    return result;
                });
                if(v.name === 'default') item['@type'] = (value.length > 1)?value:value[0];
                else item[v['value']] = (value.length > 1)?value:value[0];
            }
        });
    }
    for(var key in add_list){
        var value = $('#' + add_list[key]['id']).val();
        if(value) {
            item[add_list[key]['property']] = {'@value':value};
        }
    }
    console.log('item : ', item);
    if(!item.hasOwnProperty('@type')) item['@type'] = _resource + _pathname;
    $.ajax({
        type:'post',
        url:'insertData',
        data:{'item':JSON.stringify([item])},
        dataType:'json',
        success:function(res){
            if(res.result === 'fail'){
                alert(res.message);
            }else if(res.result === 'success'){
                alert(res.message);
                location.reload();
            }
        }
    })
});