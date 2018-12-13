$(document).ready(function(){
    var footer = '<div class="container">' +
        '<div class="footer_back">' +
        '<div class="row">' +
        '<div class="col-md-4">' +
        '<div class="notice-table-wrap">'+ fnGenNoticeBoard() + '</div>' +
        '</div>' +
        '<div class="col-md-8">' +
        '<div class="data-rotate-wrap">' + fnGenRecommendData() + '</div>' +
        '</div>' +
        '</div>' +
        '<div class="row">' +
        '<div class="col-md-7">' +
        '<img src="static/img/footer_text.png"/>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>';
    $('#footer').html(footer);
    /* 공지사항 News Table 만들기 */
    function fnGenNoticeBoard(){
        var html = '';
        var list = [
            {idx:1, title:'홈페이지 개편 안내 및 점검 공지', date:'2018.10.31'},
            {idx:2, title:'육군디지털아카이브 개편 안내', date:'2018.10.31'},
            {idx:3, title:'추천자료 안내', date:'2018.10.31'},
            {idx:4, title:'디지털아카이브 시스템 안내', date:'2018.10.31'}
            ];
        html += '<div class="news-table">';
        html += '<div class="news-title">';
        html += '<span>News</span>';
        html += '<button>+MORE</button>';
        html += '</div>';
        html += '<table class="table">';
        list.forEach(function(v){
            html += '<tr data-store="' + v.idx + '">';
            html += '<td>' + v.title + '</td>';
            html += '<td>' + v.date + '</td>';
            html += '</tr>';
        });
        html += '</table>';
        html += '</div>';
        return html;
    }
    /* 추천 기록자료 만들기 */
    function fnGenRecommendData(){
        var list = [
            {idx:1, img_url:'../static/img/facet_menu1.gif', title:'전투요도', link:'/'},
            {idx:2, img_url:'../static/img/facet_menu2.gif', title:'낙동강지구 역사자료', link:'/'},
            {idx:3, img_url:'../static/img/facet_menu3.gif', title:'지평리전투', link:'/'},
            {idx:4, img_url:'../static/img/facet_menu4.gif', title:'기록물관리 종합 발전 계획', link:'/'},
            {idx:5, img_url:'../static/img/facet_menu5.gif', title:'추천기록 자료 리스트', link:'/'}
        ];
        var html = '<div class="recommend-wrap">';
        html += '<p>+추천 기록자료</p>';
        html += '<div class="row">';
        html += '<div class="col-md-12">';
        html += '<div class="carousel carousel-showmanymoveone slide" id="carouselRecommend">';
        html += '<div class="carousel-inner">';
        list.forEach(function(v, i){
            if(i === 0) html += '<div class="item active">';
            else html += '<div class="item">';
            html += '<div class="col-xs-12 col-sm-6 col-md-3"><a href="' + v.link + '"><img src="' + v.img_url + '" class="img-responsive"></a>';
            html += '<p>' + v.title + '</p>';
            html += '</div>';
            html += '</div>';
        });
        html += '</div>';
        html += '<a class="left carousel-control" href="#carouselRecommend" data-slide="prev"><i class="glyphicon glyphicon-chevron-left"></i></a>';
        html += '<a class="right carousel-control" href="#carouselRecommend" data-slide="next"><i class="glyphicon glyphicon-chevron-right"></i></a>';
        html += '</div>';
        html += '</div>';
        html += '</div>';
        html += '</div>';
        return html;
    }
    (function(){
        // setup your carousels as you normally would using JS
        // or via data attributes according to the documentation
        // https://getbootstrap.com/javascript/#carousel
        $('#carouselRecommend').carousel({ interval: 5000 });
    }());
    (function(){
        $('.carousel-showmanymoveone .item').each(function(){
            var itemToClone = $(this);
            for (var i=1;i<4;i++) {
                itemToClone = itemToClone.next();
                // wrap around if at end of item collection
                if (!itemToClone.length) {
                    itemToClone = $(this).siblings(':first');
                }
                // grab item, clone, add marker class, add to collection
                itemToClone.children(':first-child').clone()
                    .addClass("cloneditem-"+(i))
                    .appendTo($(this));
            }
        });
    }());
});