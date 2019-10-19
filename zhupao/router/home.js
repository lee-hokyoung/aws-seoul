const express = require('express');
const router = express.Router();

// main 화면
router.get('', (req, res) => {
    let list = [
        {
            cate: 'Beauty',
            sub_cate: ['Hair Salon', 'SPA', 'Nail Shop']
        },
        {
            cate: 'O2O',
            sub_cate: ['Hotel', 'Delivery', 'Sharing']
        },
        {
            cate: 'Health',
            sub_cate: ['Health care & Support', 'Silver care & Support', 'Baby care & Support']
        },
        {
            cate: 'Transport',
            sub_cate: ['Electronic Vehicles', 'Drone', 'Smart Mobility']
        },
        {
            cate: 'Food & Beverage',
            sub_cate: ['Restaurant', 'Cafe', 'Franchise']
        },
        {
            cate: 'E-Commerce',
            sub_cate: ['B2B Commerce', 'B2C Commerce', 'C2C Commerce']
        }
    ];
    res.render('home', {
        list: list
    });
});
// list 화면
router.get('/list/:cate', async (req, res) => {
    let list = [
        {
            id:1,
            title: '중국 상하이 도시의 헤어 미용실 수 변화 2015-2019',
            cate: 'Beauty',
            sub_cate: 'Hair salon',
            region: 'Shanghai',
            object: 'company',
            chart: 'bar'
        }, {
            id:2,
            title: '중국 허난성 지역 내 헤어 미용실 수 2019',
            cate: 'Beauty',
            sub_cate: 'Hair salon',
            region: 'Henen',
            object: 'company',
            chart: 'line'
        }, {
            id:3,
            title: '중국 허난성 정저우 도시 내 미용실 만족도 2018',
            cate: 'Beauty',
            sub_cate: 'Hair salon',
            region: 'Henen',
            object: 'Consumer',
            chart: 'pie'
        }, {
            id:4,
            title: '중국 정저우 도시의 헤어 미용실 수 변화 2015-2019',
            cate: 'Beauty',
            sub_cate: 'Hair salon',
            region: 'Shanghai',
            object: 'company',
            chart:'line'
        }, {
            id:5,
            title: '중국 상하이 도시의 헤어 미용실 수 변화 2015-2019',
            cate: 'Beauty',
            sub_cate: 'Hair salon',
            region: 'Shanghai',
            object: 'company',
            chart: 'bar'
        }, {
            id:6,
            title: '중국 상하이 도시의 헤어 미용실 수 변화 2015-2019',
            cate: 'Beauty',
            sub_cate: 'Hair salon',
            region: 'Shanghai',
            object: 'company',
            chart: 'line'
        }, {
            id:7,
            title: '중국 정저우 도시의 헤어 미용실 수 변화 2015-2019',
            cate: 'Beauty',
            sub_cate: 'Hair salon',
            region: 'Shanghai',
            object: 'company',
            chart: 'line'
        }, {
            id:8,
            title: '중국 상하이 도시의 헤어 미용실 수 변화 2015-2019',
            cate: 'Beauty',
            sub_cate: 'Hair salon',
            region: 'Shanghai',
            object: 'company',
            chart: 'bar'
        }, {
            id:9,
            title: '중국 상하이 도시의 헤어 미용실 수 변화 2015-2019',
            cate: 'Beauty',
            sub_cate: 'Hair salon',
            region: 'Shanghai',
            object: 'company',
            chart: 'line'
        },
    ];
    res.render('list', {
        cate: req.params.cate,
        list:list
    })
});
module.exports = router;