let $left = $('#left').data('store');
let $facet_list = $('#facet_list').data('store');
let $menu = $('#menu').data('store');
// let $result = $('#result').data('store');

$menu['mongo_12'] = {label:'핵심키워드'};
init();
function init(){
    var left_html = '<div class="just-padding">';
    left_html += '<div class="list-group list-group-root well">';
    for(var key in $menu){
        if($menu[key]['label'] !== 'Home'){
            left_html += '<a class="list-group-item list-group-item-success" data-toggle="' + ($menu[key].hasOwnProperty('subClass')?1:0) + '" data-store="' + key + '">' + $menu[key]['label'] + '</a>';
            left_html += '<div class="list-group" data-store="' + ($menu[key].hasOwnProperty('subClass')?key:0) + '">';
            if($menu[key].hasOwnProperty('subClass')){
                $menu[key]['subClass'].forEach(function(v){
                    if(typeof(v) === 'object'){
                        left_html += '<a class="list-group-item list-group-item-warning" data-toggle="1" data-store="sub_' + key + '">' + Object.keys(v) + '</a>';
                        left_html += '<div class="list-group" data-store="sub_' + key + '">';
                        v[Object.keys(v)].forEach(function(w){
                            left_html += '<a class="list-group-item list-group-item-text">' + w + '</a>';
                        });
                        left_html += '</div>';
                    }else{
                        left_html += '<a class="list-group-item list-group-item-warning">' + v + '</a>';
                    }
                });
            }
            left_html += '</div>';
        }
    }
    left_html += '</div></div>';
    $('#left_facets').html(left_html);
}

$('a.list-group-item').on('click', (item)=>{
    let type = item.currentTarget.text;
    $.ajax({
        type: 'POST',
        url: 'getDataByType',
        data: {type:type},
        dataType: 'json',
        success:function(res){genList(res.result, type);},
        beforeSend:function(){$('.modal').modal('show')},
        complete:function(){$('.modal').modal('hide')},
        error: function(err){console.log('error : ', err)}
    });
});
function genList(res, type){
    let html = '';
    console.log('res : ', res);
    res.forEach((v, i)=>{
        try {
            html += '<tr class="row">';
            html += '<td class="col-md-1 text-center">' + (i + 1) + '</td>';
            html += '<td class="col-sm-2 text-center">' + v['@id'].replace(_resource, '') + '</td>';
            html += '<td class="col-sm-1 text-center">' + (v.hasOwnProperty('@type') ? v['@type'].replace(_resource, '') : '') + '</td>';
            html += '<td class="col-sm-2 text-center">' + ((v.hasOwnProperty(_label))? (v[_label].hasOwnProperty('@value') ? v[_label]['@value'] : v[_label]) : '') + '</td>';
            html += '<td class="col-sm-4 text-left">' + (v.hasOwnProperty(_description)?v[_description].hasOwnProperty('@value')?v[_description]['@value'].replace(_resource, ''):v[_description].replace(_resource, ''):'') + '</td>';
            html += '<td class="col-sm-2 text-center">';
            html += '<button id="btn_update" class="btn btn-primary">수정</button>';
            html += '<button id="btn_delete" class="btn btn-danger">삭제</button>';
            html += '</td>';
            html += '</tr>';
        }catch (e) {
            console.log('error : ', e, ' , v : ', v);
        }
    });
    $('#tbody').html(html.replace(/\[dot\]/gi, '.'));
    $('p.category').text(type);
}
$("#search").on("keyup", function() {
    let value = $(this).val().toLowerCase();
    $("#tbody tr").filter(function() {
        $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
    });
});