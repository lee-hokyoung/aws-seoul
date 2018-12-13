// const _label = 'http://www[dot]w3[dot]org/2000/01/rdf-schema#label';
// const _resource = 'http://mil[dot]k-history[dot]kr/resource/';
// const _description = 'http://purl[dot]org/dc/elements/1[dot]1/description';
fnCreateBody();
function fnCreateBody(){
    var items = {
        'item_1':{idx:0, baseUrl:'/intro/item_1', img_url:'static/assets/img/drone.gif', content:'왜 시맨틱 디지털 아카이빙인가 <br> How to use this Collection'}
        , 'item_2':{idx:1, baseUrl:'/intro/item_2', img_url:'static/assets/img/head.gif', content:'육군참모총장인사 <br> Army Chief of Staff Address'}
        , 'item_3':{idx:2, baseUrl:'/intro/item_3', img_url:'static/assets/img/gijungdan.gif', content:'4차 산업혁명과 군의 역할<br>4th Industrial Revolution'}
    };
    var html = '<card class="row">';
    for(var key in items){
        var item = items[key];
        if(item.idx % 3 === 0) html += '<div class="row">';
        html += '<div class="col-md-4">' +
            '<div class="card">' +
            '<div class="image">' +
            '<a href="' + item.baseUrl + '">' +
            '<img src="' + item.img_url + '">' +
            '</a>' +
            '</div>' +
            '<div class="content">' + item.content +
            '</div>' +
            '</div>' +
            '</div>';
        if(item.idx % 3 === 2) html += '</div>';
    }
    html += '</div>';
    $('#cards').html(html);
}
/*  ---------------------------------------------------------
*   홈 화면 카운팅 업
*   ---------------------------------------------------------*/
document.querySelector('video').addEventListener('ended', function(){
    this.play();
    facetCount();
});
facetCount();
function facetCount(){
    $('.count').css('display', 'none');
    setTimeout(()=>{
        $('.count').each(function () {
            $(this).prop('Counter',0).animate({
                Counter: $(this).text()
            }, {
                duration: 5000,
                easing: 'swing',
                step: function (now) {
                    $(this).text(Math.ceil(now));
                }
            });
        }).css('display', 'block');
    }, 3000);
}
