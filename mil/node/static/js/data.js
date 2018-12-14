let $left = $('#left').data('store');
let $facet_list = $('#facet_list').data('store');
let $menu = $('#menu').data('store');
let $collection = $('#collection').data('store');
let $display = ['displayOnBottom', 'displayOnMiddle', 'displayOnPage', 'displayOnProblem', 'displayOnTop'].map((v) => {
    return $collection[_resource+v]['@list'];
}).reduce((a, b) => {return a.concat(b)});


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
        beforeSend:function(){$('.bd-loading').modal('show')},
        complete:function(){$('.bd-loading').modal('hide')},
        error: function(err){console.error(err)}
    });
});
function genList(res, type){
    let html = '';
    res.forEach((v, i)=>{
        try {
            html += '<tr class="row">';
            html += '<td class="col-md-1 text-center">' + (i + 1) + '</td>';
            html += '<td class="col-sm-2 text-center"><a href="' + v['@id'].replace(/\[dot  \]/gi, '.') + '" target="_blank">' + v['@id'].replace(_resource, '') + '</a></td>';
            html += '<td class="col-sm-1 text-center">' + (v.hasOwnProperty('@type') ? v['@type'].replace(_resource, '') : '') + '</td>';
            html += '<td class="col-sm-2 text-center">' + ((v.hasOwnProperty(_label))? (v[_label].hasOwnProperty('@value') ? v[_label]['@value'] : v[_label]) : '') + '</td>';
            html += '<td class="col-sm-4 text-left">' + (v.hasOwnProperty(_description)?v[_description].hasOwnProperty('@value')?v[_description]['@value'].replace(_resource, ''):v[_description].replace(_resource, ''):'') + '</td>';
            html += '<td class="col-sm-2 text-center">';
            html += '<button type="button" class="btn btn-primary" data-toggle="modal" data-target="#modalUpdate" data-store="' + v['@id'].replace(_resource, '') + '">수정</button>';
            html += '<br>';
            html += '<button id="btn_delete" class="btn btn-danger" type="button">삭제</button>';
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
$('#modalUpdate').on('show.bs.modal', (e) => {
    let id = e.relatedTarget.dataset.store;
    let middle_html = '', annotation_html = '', bottom_html = '', top_html = '', problem_html = '', page_html ='';
    let display_html = '', val;
    $.ajax({
        type:'get',
        url:'getIdData/' + id,
        dataType:'json',
        success:function(res){
            console.log('res : ', res);
            $('#doc_id').val(res['@id'].replace(/\[dot\]/gi, '.'));
            $('#doc_type').val(res['@type'].replace(/\[dot\]/gi, '.'));
            if(res.hasOwnProperty(_label)){
                try{
                    display_html += '<div class="form-group">';
                    display_html += '<label class="control-label">Label:</label>';
                    let val = '';
                    if(res[_label].length > 0 && typeof(res[_label]) === 'object'){
                        res[_label].forEach((w, j) => {
                            val += w['@value'];
                            if((res[_label].length - 1) > j) val += '&#10;';
                        });
                    }else{
                        val = res[_label].hasOwnProperty('@value')?res[_label]['@value']:res[_label];
                    }
                    display_html += '<input type="text" class="form-control border-input" name="' + _label + '" value="' + val.replace(/\[dot\]/gi, '.') + '">';
                    display_html += '</div>';
                }catch (e) {
                    console.log(e);
                }
            }
            if(res.hasOwnProperty(_description)){
                try{
                    display_html += '<div class="form-group">';
                    display_html += '<label for="doc_description" class="control-label">설명:</label>';
                    let val = '';
                    if(res[_description].length > 0 && typeof(res[_description]) === 'object'){
                        res[_description].forEach((w, j) => {
                            val += w['@value'];
                            if((res[_description].length - 1) > j) val += '&#10;';
                        });
                    }else{
                        val = res[_description].hasOwnProperty('@value')?res[_description]['@value']:res[_description];
                    }
                    display_html += '<textarea class="form-control border-input" name="' + _description + '" rows="5">' + val.replace(/\[dot\]/gi, '.').replace(/<br>/g, '&#10;') + '</textarea>';
                    display_html += '</div>';
                }catch (e) {
                    console.log(e);
                }
            }
            $display.forEach((v)=>{
                try{
                    if(res.hasOwnProperty(v['@id'])){
                        display_html += '<div class="form-group">';
                        display_html += '<label class="control-label">' + v['@id'].replace(_resource, '') + ':</label>';
                        if(typeof(res[v['@id']]) === 'object' && res[v['@id']].length > 0){
                            res[v['@id']].forEach((w) => {
                                if(w.hasOwnProperty('@value')) {
                                    val = w['@value'];
                                    display_html += '<textarea class="form-control border-input" name="' + v['@id'] + '">' + val + '</textarea>';
                                }
                                else if(w.hasOwnProperty('@id')) {
                                    val = w['@id'];
                                    display_html += '<input type="text" class="form-control border-input" name="' + v['@id'] + '" value="' + val + '">';
                                }
                                else {
                                    val = w;
                                    display_html += '<input type="text" class="form-control border-input" name="' + v['@id'] + '" value="' + val + '">';
                                }
                                display_html += '<br>';
                            });
                        }else{
                            if(res[v['@id']].hasOwnProperty('@value')) {
                                val = res[v['@id']]['@value'];
                                display_html += '<textarea class="form-control border-input" name="' + v['@id'] + '">' + val + '</textarea>';
                            }
                            else if(res[v['@id']].hasOwnProperty('@id')) {
                                val = res[v['@id']]['@id'];
                                display_html += '<input type="text" class="form-control border-input" name="' + v['@id'] + '" value="' + val + '">';
                            }
                            else {
                                val = res[v['@id']];
                                display_html += '<input type="text" class="form-control border-input" name="' + v['@id'] + '" value="' + val + '">';
                            }
                            display_html += '<br>';
                        }
                        display_html += '<div class="row text-center"><button type="button" class="btn btn-info" onclick="fnAddElement(this)">데이터 추가</button></div>';
                        display_html += '</div>';
                    }
                }catch(e){
                    console.error(e, v);
                }
                // display_html += '<button type="button">데이터 추가</button>';
            });
            $('#display-space').html(display_html.replace(/\[dot\]/g, '.'));
        },
        error:function(err){console.error(err)}
    });
});
function fnAddElement(btn){
    console.log(btn.parentNode.parentNode.childNodes);

}