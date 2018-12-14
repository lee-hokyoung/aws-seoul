/*  --------------------------------------------
*   left, body 데이터를 저장한 변수
*   --------------------------------------------*/
let body = $('#body_store').data('store'), now_time;
let chart_left = (localStorage.getItem('chartType'))?localStorage.getItem('chartType'):'기록물건명';
let filter_list = [], link_list = [], left, left_menu, inverse_menu;
let selected_time = 2017;
$('#chart_left a').each(function(a){
    if($('#chart_left a')[a].innerText === chart_left){
        $('#chart_left a')[a].classList.add('active');
    }else{
        $('#chart_left a')[a].classList.remove('active');
    }
});
function createTimeLineLeft(res) {
    left = res.docs;
    left_menu = res.time_menu;
    inverse_menu = left_menu.map(function (v) {
        return _resource + v.split('/resource/')[1].split('_')[1] + '_' + v.split('/resource/')[1].split('_')[0];
    });
    createLeftMenu();
}
function createLeftMenu(){
    /*  --------------------------------------------
    *   left_menu 설정하는 부분
    *   --------------------------------------------*/
    let left_html = '<div id="filter_wrap"></div>'; // filter_wrap은 고정시켜 두기 위해서 따로 뺌.
    $('#left_facets').html(left_html + fnCreateLeftHtml(fnCreateUniqueLeft(left)));
    // left facet 줄이기
    fnDistinctLeft(parent_list);
}
function fnCreateUniqueLeft(left){
    switch(chart_left){
        case '기록물건명':
            left_menu.splice(left_menu.indexOf(_resource + '기록물건명_이벤트'));
            // console.log('left : ', left_menu.indexOf(_resource + '기록물건명_이벤트'));
            break;
    }
    let temp = [], unique = [], left_menu_list = [];
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
            })
        }
    });
    let new_left = temp.sort(function(a, b){
        return (a.value > b.value)?1:(a.value < b.value)?-1:0;
    });
    new_left.forEach(function(v){
        if(v['value'] === '정책') console.log('정책 : ', v);
        left_menu_list[v['value']] = 1 + (left_menu_list[v['value']] || 0);
        if(v.parent === '결재권자'){
            switch(v.value){
                case '참모차장': v.lv = 1; break;
                case '부실단장': v.lv = 2; break;
                case '육직부대장': v.lv = 3; break;
                case '군사령관': v.lv = 4; break;
                case '군단장': v.lv = 5; break;
                case '사여단장':v.lv = 6; break;
                default: v.lv = 0;
            }
        }
    });
    let unique_list = [];
    new_left.filter(function(item){
        if(unique_list.indexOf(item.value) === -1){
            unique_list.push(item.value);
            unique.push({parent:item.parent, subClass:item.subClass, id:item.id, value:item.value, title:item.title, badge:left_menu_list[item.value], lv:item.lv});
        }
        return null;
    });
    return unique;
}
/*  ------------------------------------------------------------------
*   Left Menu HTML 만들기
*   ------------------------------------------------------------------*/
function fnCreateLeftHtml(data){
    let sub_list = [], data_list = [];
    data.forEach(function(item){
        if(_sub_path === '총장결재기록물' && item['parent'] === '생산당시총장') return;
        if(item['parent'] === '결재권자' && item['value'].indexOf('_') > -1 && _sub_path !== '총장결재기록물') {
            item['title'] = '참모총장';
            sub_list.push(item);
        }else{
            data_list.push(item);
        }
    });
    let left_html = '<div id="facet_wrap">';
    parent_list = [];
    data_list.sort(function(a, b){return (a.parent > b.parent)?1:(a.parent < b.parent)?-1:0});
    left_menu.forEach(function(v){
        left_html += '<div class="panel panel-default panel-primary" name="' + v.split('/resource/')[1].split('_')[1] + '">';
        left_html += '<div class="panel-heading">' + v.split('/resource/')[1].split('_')[1] + '</div>';
        left_html += '<div class="panel-body">';
        left_html += '<ul class="classTree">';
        if(v.replace(_resource, '').split('_')[1] === '결재권자') {
            if(sub_list.length > 0){
                left_html += '<b data-toggle="dropdown" style="cursor:pointer">' + sub_list[0].title + '<span class="caret"></span></b>';
                left_html += '<ul class="dropdown-menu" style="position:relative;">';
                sub_list.forEach(function(s){
                    if(parent_list.indexOf(s['parent']) === -1){
                        parent_list.push(s['parent']);
                    }
                    if(v.split('/resource/')[1].split('_')[1] === s['parent']){
                        left_html += '<li>';
                        left_html += '<div class="listDiv1">';
                        left_html += '<span class="class-icon"></span>';
                        let val = ((typeof(s['value'])==='object')?(s['value'][0].hasOwnProperty('@value'))?s['value'][0]['@value'].replace(/\[dot\]/gi, '.'):s['value'][0].replace(/\[dot\]/gi, '.'):s['value'].replace(/\[dot\]/gi, '.'));
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
                    let val = ((typeof(w['value'])==='object')?(w['value'][0].hasOwnProperty('@value'))?w['value'][0]['@value'].replace(/\[dot\]/gi, '.'):w['value'][0].replace(/\[dot\]/gi, '.'):w['value'].replace(/\[dot\]/gi, '.'));
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
                    let val = ((typeof(w['value'])==='object')?(w['value'][0].hasOwnProperty('@value'))?w['value'][0]['@value'].replace(/\[dot\]/gi, '.'):w['value'][0].replace(/\[dot\]/gi, '.'):w['value'].replace(/\[dot\]/gi, '.'));
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
    let idx = parent_list.indexOf('시간');
    if(idx > -1) parent_list.splice(idx, 1);
    parent_list.forEach(function(v){
        $('.panel-primary[name='+v+']').css('display', 'block');
    });
}
/*  ------------------------------------------------------------------
*   Body 만들기
*   핵심은 Type 별로 묶는 것
*   ------------------------------------------------------------------*/
function fnCreateBody(data){
    let type_list = {};
    data.forEach(function(v){
        if(typeof(v['@type'])==='object'){
            v['@type'].forEach(function(w){
                let type = w.replace(_resource, '');
                if(type_list.hasOwnProperty(type)){
                    type_list[type]['list'].push(v);
                }else{
                    type_list[type] = {'list':[v]};
                }
            });
        }else{
            let type = v['@type'].replace(_resource, '');
            if(type_list.hasOwnProperty(type)){
                type_list[type]['list'].push(v);
            }else{
                type_list[type] = {'list':[v]};
            }
        }
    });
    $('#body_data').html(fnCreateBodyHtml(type_list));
}
/*  ------------------------------------------------------------------
*   Body Html 만들기
*   ------------------------------------------------------------------*/
function fnCreateBodyHtml(data){
    let html ='';
    for(let key in data){
        html += '<div class="body_title_wrap">';
        html += '<h2><a href="' + _resource + key.replace(/\[dot\]/gi, '.') + '">' + key.replace(/\[dot\]/gi, '.') + '</a></h2>';
        html += '<span class="badge">' + data[key]['list'].length + '</span>';
        html += '</div>';

        data[key]['list'].forEach(function(v, i){
            html += '<div class="body_list_wrap">';
            html += '<a href="' + v['@id'].replace(/\[dot\]/gi, '.') +'" class="thumb">';
            if(v.hasOwnProperty(_resource+'그림')){
                if(v[_resource+'그림'].length > 0){}
                else{
                    if(v[_resource+'그림']['@value'].split('/mil/')[1] === '[dot]jpg' || v[_resource+'그림']['@value'].split('/mil/')[1] === '')
                        html += '<img src="../static/img/mil_empty.gif"/>';
                    else
                        html += '<img src="../static/images/' + v[_resource+'그림']['@value'].replace(/\[dot\]/gi, '.') + '"/>';
                }
            }else{
                html += '<img src="../static/img/mil_empty.gif"/>';
            }
            html += '</a>';
            html += '<div class="desc_wrap">';
            if(v.hasOwnProperty(_label)){
                if(typeof(v[_label]) === 'object' && v[_label].length > 1){
                    html += '<a href="' + v['@id'].replace(/\[dot\]/gi, '.') + '">' + ((v[_label][0].hasOwnProperty('@value'))?v[_label][0]['@value'].replace(/\[dot\]/gi,'.'):v[_label][0].replace(/\[dot\]/gi, '.')) + '</a>';
                }
                else
                    html += '<a href="' + v['@id'].replace(/\[dot\]/gi, '.') + '">' + ((v[_label].hasOwnProperty('@value'))?v[_label]['@value'].replace(/\[dot\]/gi,'.'):v[_label].replace(/\[dot\]/gi, '.')) + '</a>';
            }else{
                html += '<a href="' + v['@id'].replace(/\[dot\]/gi, '.') + '">' + v['@id'].replace(_resource, '').replace(/\[dot\]/gi, '.') + '</a>';
            }
            if(v.hasOwnProperty(_description)){
                if(v[_description].length > 1){
                    html += '<p class="description">';
                    v[_description].forEach(function(d){
                        html += (d.hasOwnProperty('@value'))?d['@value']:d + '<br>';
                    });
                    html += '</p>';
                }else{
                    html += '<p class="description">' + ((v.hasOwnProperty(_description))?(v[_description].hasOwnProperty('@value'))?v[_description]['@value'].replace(/\[dot\]/gi, '.'):v[_description]:'') + '</p>';
                }
            }
            html += '</div>';
            html += '</div>';
        });
    }
    return html;
}
/*  ------------------------------------------------------------------
*   time slider 설정
*   ------------------------------------------------------------------*/
let body_range = body.map(function(item){
    return item['@id'].replace(_resource, '').replace('_', '');
}).sort(function(a, b){
    return a - b;
});
/* slider 관련 */
let min_value = parseInt(body_range[0]) - 10;
let max_value = parseInt(body_range[body_range.length - 1]) + 10;
$('#timeline').attr('data-slider-min', min_value);
$('#timeline').attr('data-slider-max', max_value);
$('#timeline').attr('data-slider-value', "2012");

function setTimeLine(sliderValue){
    let itemList = body.filter(function(item){
        if(parseInt(item['@id'].replace(_resource, '').replace('_', '')) === sliderValue){
            return item['@id'];
        }
    });
    let post_list = itemList.map(function(item){
        return item['@id'];
    });
    if(post_list.length > 0)
        return post_list;
    else{
        return false;
    }
}
function fnGetTimeLine(post_list){
    if(post_list){
        now_time = post_list[0];
        if(post_list.length > 1){
            post_list = post_list.filter(function(val, idx, self){return self.indexOf(val) === idx});
        }
        $.ajax({
            type:'post',
            url:'setTimeLine',
            data:{'timeLine':post_list, 'chart_left':chart_left},
            dataType:'json',
            success:function(res){
                createTimeLineLeft(res);
                fnCreateBody(res.docs);
            }
        });
    }
}
function initTimeLine(sliderValue){
    let postlist = setTimeLine(sliderValue);
    fnGetTimeLine(postlist);
}
$('#chart_left a[type=button]').on('click', function(){
    localStorage.setItem('chartType', this.innerText);
    location.reload();
});
initTimeLine(selected_time);
/*  ------------------------------------------------------------------
*   Left 클릭시 Facet 만들어 주는 함수
*   ------------------------------------------------------------------*/
$(document).on('click', 'b[name=left_facet]', function(){
    let facet_title = $(this).data('store').toString();    // ex) 강두봉
    let facet_link = $(this).data('facet');     // ex) 향토자료_관련인물
    let subClass = $(this).data('subclass');    // subclass가 있을 경우
    if(_sub_path) subClass = _sub_path;

    if(filter_list.indexOf(facet_title) === -1){
        filter_list.push(facet_title.replace(/\./gi, '[dot]').replace(/\"/gi, '\"'));
        // if(link_list.indexOf(facet_link.replace(_resource, '')) === -1)
        link_list.push(facet_link.replace(_resource, ''));
        genFilterList();
        fnSendAjax(filter_list, link_list, subClass);
    }
});
/*  ------------------------------------------------------------------
*   ajax로 넘기는 함수(Left facet 클릭시)
*   ------------------------------------------------------------------*/
function fnSendAjax(filter_list, link_list) {
    let post_data = {facet_title: filter_list, facet_link: link_list, now_time:now_time, chart_left:chart_left};
    // Ajax 로 패싯 정보 가져오기
    $.ajax({
        type: 'POST',
        url: 'mongoAjax/left_facet',
        data: post_data,
        dataType: 'json',
        success: function (res) {
            if(_sub_path) res = res.filter(function(item){if(item['@type'] === _resource + _sub_path) return item;});
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
    let filter_html = '';
    filter_list.forEach(function(w, j){
        filter_html += '<div class="items_wrap">';
        filter_html += '<div class="filter_item">' + w.replace(/\[dot\]/gi, '.') + '</div>';
        filter_html += '<span class="fa fa-times" id="filter_' + j + '"></span>';
        filter_html += '</div>';
    });
    $('#filter_wrap').html(filter_html);
}
/*  --------------------------------------------------- ---------------
*   왼쪽 상단 필터 삭제하는 함수
*   ------------------------------------------------------------------*/
$(document).on('click', 'span.fa-times', function(){
    let idx = $(this).attr('id').split('_')[1];
    filter_list.splice(idx, 1);
    link_list.splice(idx, 1);
    if(filter_list.length > 0){
        genFilterList();
        fnSendAjax(filter_list, link_list);
    }else{
        // fnCreateBody(body);
        // createLeftMenu();
        initTimeLine(parseInt(selected_time));
    }
});

let timeGroup = {};
genChart();
function genChart(){
    $.ajax({
        type:'get',
        url:'initTimeline?chart_left=' + chart_left,
        dataType:'json',
        success:function(res){
            let dataProvider = res.sort(function(a, b){return a.time-b.time;}), time = 200;
            dataProvider.forEach(function(v){
                time = Math.floor(v.time / 10).toString();
                if(timeGroup.hasOwnProperty(time)){
                    timeGroup[time].push(v);
                }else {
                    timeGroup[time] = [];
                    timeGroup[time].push(v);
                }
            });
            let top_html = '<div class="row">';
            top_html += '<div class="flex_center btn-group" data-toggle="buttons">';
            for(let key in timeGroup){
                top_html += '<label class="btn btn-default ' + (key === time?"active":"") + '">';
                top_html += '<input type="radio" id="t' + key + '" name="' + key + '" value="' + key + '" />' + key + '0년대</label>';
            }
            top_html += '</div></div>';
            $('#timeWrap').html(top_html);
            fnGenChart(timeGroup[time]);
        }
    });
}
$(document).on('click', 'label.btn', function(){
    let time = $(this).children('input')[0].name;
    fnGenChart(timeGroup[time]);
});
function fnGenChart(dataProvider){
    let chart = AmCharts.makeChart("chartdiv", {
        "type": "serial",
        "theme": "light",
        "dataProvider": dataProvider,
        "valueAxes": [ {
            "gridColor": "#aaa",
            "gridAlpha": 1,
            "dashLength": 0,
            "axisAlpha": 0,
            "position": "left",
            "title": chart_left + " 수"
        } ],
        "gridAboveGraphs": false,
        "startDuration": 1,
        "graphs": [ {
            "balloonText": "[[category]]: <b>[[value]]</b>",
            "fillAlphas":1,
            "lineAlpha": 0.2,
            "type": "column",
            "valueField": "cnt",
            "fillColorsField":"color"
        } ],
        "chartCursor": {
            "categoryBalloonEnabled": false,
            "cursorAlpha": 0,
            "zoomable": false
        },
        "categoryField": "time",
        "categoryAxis": {
            "gridPosition": "start",
            "gridAlpha": 0,
            "tickPosition": "start",
            "tickLength": 20
        },
        "export": {
            "enabled": true
        },
        "listeners": [{
            "event": "clickGraphItem",
            "method": function(event) {
                selected_time = event.item.category;
                initTimeLine(parseInt(event.item.category));
            }
        }]
    });
}