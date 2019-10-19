const express = require('express');
const router = express.Router();

// main 화면
router.get('/:id', (req, res) => {
    let data = {
        id:1,
        dataNo:'A7777',
        cate:'Beauty',
        sub_cate:'Hair Salon',
        title:'중국 허난성 지역 내 헤어 미용실 수 2019',
        chart:{
            type:'bar',
            data:[
                {x:'2015', y:150},
                {x:'2016', y:170},
                {x:'2017', y:190},
                {x:'2018', y:210},
                {x:'2019', y:200},
            ]
        },
        desc:`중국 허난성 푸양시의 헤어살롱 업체는 2015년 이후로, 지속적인 성장을 보이고 있으며, 전년대비 15.3%의 성장률을 나타내고 있다.`,
        source:`www.zhupao.co.kr 홈페이지 내 'ABC보고서' 페이지 21에서 발췌`
    };
    res.render('detail', {
        data:data
    });
});
module.exports = router;