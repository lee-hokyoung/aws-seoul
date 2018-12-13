let $left = $('#left').data('store');
let $facet_list = $('#facet_list').data('store');
let $menu = $('#menu').data('store');
let $collection = $('#collection').data('store');

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
                    top_html += '<div class="form-group">';
                    top_html += '<label for="doc_label" class="control-label">Label:</label>';
                    let val = '';
                    if(res[_label].length > 0 && typeof(res[_label]) === 'object'){
                        res[_label].forEach((w, j) => {
                            val += w['@value'];
                            if((res[_label].length - 1) > j) val += '&#10;';
                        });
                    }else{
                        val = res[_label].hasOwnProperty('@value')?res[_label]['@value']:res[_label];
                    }
                    top_html += '<textarea class="form-control" id="doc_label">' + val.replace(/\[dot\]/gi, '.').replace(/<br>/g, '&#10;') + '</textarea>';
                    top_html += '</div>';
                }catch (e) {
                    console.log(e);
                }
            }
            $collection[_resource + 'displayOnMiddle']['@list'].forEach((v, i) => {
                if(res.hasOwnProperty(v['@id'])){
                    try{
                        middle_html += '<div class="form-group">';
                        middle_html += '<label class="control-label">' + v['@id'].replace(_resource, "") + ':</label>';
                        let val = '';
                        if(res[v['@id']].length > 0 && typeof(res[v['@id']]) === 'object'){
                            res[v['@id']].forEach((w, j) => {
                                // val += w['@id'];
                                // if((res[v['@id']].length - 1) > j) val += '&#10;';
                                middle_html += '<input type="text" class="form-control" name="' + v['@id'] + '" value="' + w['@id'].replace(/\[dot\]/gi, '.') +'"><br>';
                            });
                        }else{
                            val = res[v['@id']]['@id'];
                            middle_html += '<input type="text" class="form-control" name="' + v['@id'] + '" value="' + val.replace(/\[dot\]/gi, '.') +'">';
                        }
                        middle_html += '</div>';
                    }catch (e) {
                        console.log(e, v);
                    }
                }
            });
            $collection[_resource + 'displayOnAnnotation']['@list'].forEach((v, i) => {
                if(res.hasOwnProperty(v['@id'])){
                    try{
                        annotation_html += '<div class="form-group">';
                        annotation_html += '<label for="doc_' + i + '" class="control-label">' + v['@id'].replace(_resource, "").replace(_description, '설명') + ':</label>';
                        let val = '';
                        if(res[v['@id']].length > 0 && typeof(res[v['@id']]) === 'object'){
                            res[v['@id']].forEach((w, j) => {
                                val += w['@id'];
                                if((res[v['@value']].length - 1) > j) val += '&#10;';
                            });
                        }else{
                            val = res[v['@id']].hasOwnProperty('@value')?res[v['@id']]['@value']:res[v['@id']];
                        }
                        annotation_html += '<textarea class="form-control" id="doc_' + i + '">' + val.replace(/\[dot\]/gi, '.').replace(/<br>/g, '&#10;') + '</textarea>';
                        annotation_html += '</div>';
                    }catch (e) {
                        console.log(e, v);
                    }
                }
            });
            $collection[_resource + 'displayOnTop']['@list'].forEach((v, i) => {
                if(res.hasOwnProperty(v['@id'])){
                    try{
                        top_html += '<div class="form-group">';
                        top_html += '<label for="doc_' + i + '" class="control-label">' + v['@id'].replace(_resource, "").replace(_description, '설명') + ':</label>';
                        let val = '';
                        if(res[v['@id']].length > 0 && typeof(res[v['@id']]) === 'object'){
                            res[v['@id']].forEach((w, j) => {
                                val += w['@id'];
                                if((res[v['@value']].length - 1) > j) val += '&#10;';
                            });
                        }else{
                            val = res[v['@id']].hasOwnProperty('@value')?res[v['@id']]['@value']:res[v['@id']];
                        }
                        top_html += '<textarea class="form-control" id="doc_' + i + '">' + val.replace(/\[dot\]/gi, '.').replace(/<br>/g, '&#10;') + '</textarea>';
                        top_html += '</div>';
                    }catch (e) {
                        console.log(e, v);
                    }
                }
            });
            $collection[_resource + 'displayOnBottom']['@list'].forEach((v, i) => {
                if(res.hasOwnProperty(v['@id'])){
                    try{
                        bottom_html += '<div class="form-group">';
                        bottom_html += '<label for="doc_' + i + '" class="control-label">' + v['@id'].replace(_resource, "").replace(_description, '설명') + ':</label>';
                        let val = '';
                        if(res[v['@id']].length > 0 && typeof(res[v['@id']]) === 'object'){
                            res[v['@id']].forEach((w, j) => {
                                val += w['@id'];
                                if((res[v['@value']].length - 1) > j) val += '&#10;';
                            });
                        }else{
                            val = res[v['@id']].hasOwnProperty('@value')?res[v['@id']]['@value']:res[v['@id']];
                        }
                        bottom_html += '<textarea class="form-control" id="doc_' + i + '">' + val.replace(/\[dot\]/gi, '.').replace(/<br>/g, '&#10;') + '</textarea>';
                        bottom_html += '</div>';
                    }catch (e) {
                        console.log(e, v);
                    }
                }
            });
            $collection[_resource + 'displayOnProblem']['@list'].forEach((v, i) => {
                if(res.hasOwnProperty(v['@id'])){
                    try{
                        problem_html += '<div class="form-group">';
                        problem_html += '<label for="doc_' + i + '" class="control-label">' + v['@id'].replace(_resource, "") + ':</label>';
                        let val = '';
                        if(res[v['@id']].length > 0 && typeof(res[v['@id']]) === 'object'){
                            res[v['@id']].forEach((w, j) => {
                                // val += w['@value'];
                                // if((res[v['@id']].length - 1) > j) {
                                    // val += '&#10;';
                                    problem_html += '<textarea class="form-control" id="doc_' + i + '_' + j + '">' + w['@value'].replace(/\[dot\]/gi, '.') + '</textarea><br>';
                                // }
                            });
                        }else{
                            val = res[v['@id']].hasOwnProperty('@value')?res[v['@id']]['@value']:res[v['@id']];
                            problem_html += '<textarea class="form-control" id="doc_' + i + '">' + val.replace(/\[dot\]/gi, '.') + '</textarea>';
                        }
                        // problem_html += '<textarea class="form-control" id="doc_' + i + '">' + val.replace(/\[dot\]/gi, '.') + '</textarea>';
                        problem_html += '</div>';
                    }catch (e) {
                        console.log(e, v);
                    }
                }
            });
            $collection[_resource + 'displayOnPage']['@list'].forEach((v, i) => {
                if(res.hasOwnProperty(v['@id'])){
                    try{
                        page_html += '<div class="form-group">';
                        page_html += '<label for="doc_' + i + '" class="control-label">' + v['@id'].replace(_resource, "").replace(_description, '설명') + ':</label>';
                        let val = '';
                        if(res[v['@id']].length > 0 && typeof(res[v['@id']]) === 'object'){
                            res[v['@id']].forEach((w, j) => {
                                val += w['@value'];
                                if((res[v['@id']].length - 1) > j) val += '&#10;';
                            });
                        }else{
                            val = res[v['@id']].hasOwnProperty('@value')?res[v['@id']]['@value']:res[v['@id']];
                        }
                        page_html += '<textarea class="form-control" id="doc_' + i + '">' + val.replace(/\[dot\]/gi, '.').replace(/<br>/g, '&#10;') + '</textarea>';
                        page_html += '</div>';
                    }catch (e) {
                        console.log(e, v);
                    }
                }
            });
            $('#middle_space').html(middle_html);
            $('#annotation_space').html(annotation_html);
            $('#bottom_space').html(bottom_html);
            $('#top_space').html(top_html);
            $('#problem_space').html(problem_html);
            $('#page_space').html(page_html);
        },
        error:function(err){console.error(err)}
    });
});
