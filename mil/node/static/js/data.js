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
