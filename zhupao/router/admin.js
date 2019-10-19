const express = require('express');
const router = express.Router();
// 사용자 등록
let category = [
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
let province = [
    {name: '안후이성'},
    {name: '허난성'},
    {name: '칭하이성'},
    {name: '푸젠성'},
    {name: '후베이성'},
    {name: '산시성'},
    {name: '간쑤성'},
    {name: '후난성'},
    {name: '산둥성'},
    {name: '구이저우성'},
    {name: '장쑤성'},
    {name: '산시성'},
    {name: '하이난성'},
    {name: '장시성'},
    {name: '쓰촨성'},
    {name: '허베이성'},
    {name: '지린성'},
    {name: '원난성'},
    {name: '헤이룽장성'},
    {name: '랴오닝성'},
    {name: '저장성'}
];
let city = [
    {name: '베이징'},
    {name: '청두'},
    {name: '장사'},
    {name: '상하이'},
    {name: '항저우'},
    {name: '선양'},
    {name: '광저우'},
    {name: '우한'},
    {name: '칭다오'},
    {name: '선전'},
    {name: '충칭'},
    {name: '정저우'},
    {name: '난징'},
    {name: '다렌'},
    {name: '홍콩'},
    {name: '텐진'},
    {name: '동관'},
    {name: '마카오'},
    {name: '쑤저우'},
    {name: '닝보'},
    {name: '대만'},
    {name: '시안'},
    {name: '충칭'},
];
let obj = [
    {name:'Industry'},
    {name:'Market'},
    {name:'Consumer'},
    {name:'Company'}
];
router.get('/user/register', (req, res) => {
    res.render('admin_user_register', {
        purchase: category,
        active: 'user_register'
    });
});

// 사용자 관리
router.get('/user/list', (req, res) => {
    let users = [
        {
            user_no: 'A0001',
            user_corp: '주파오컨설팅',
            manager_name: '정우성',
            manager_tel: '010-5531-2559',
            email: 'jws2559@zhupao.co.kr',
            user_id: 'jws2559',
            user_pw: 'jws2220',
            status: 1,
            purchase_list: ['Hair Salon', 'SPA', 'Nail Shop', 'Hotel', 'Delivery', 'Sharing', 'Electronic Vehicles', 'Drone']
        },
        {
            user_no: 'A0002',
            user_corp: '네이버',
            manager_name: '홍길동',
            manager_tel: '010-1213-2559',
            email: 'naver@naver.com',
            user_id: 'naver',
            user_pw: 'naver1234',
            status: 9,
            purchase_list: ['Hair Salon', 'Nail Shop', 'Delivery', 'Sharing', 'Electronic Vehicles', 'Drone']
        }
    ];
    res.render('admin_user_list', {
        users: users,
        active: 'user_list'
    })
});

// 데이터 등록
router.get('/data/register', (req, res) => {
    res.render('admin_data_register', {
        active: 'data_register',
        category: category,
        province:province,
        city:city,
        obj:obj
    })
});

// 데이터 리스트
router.get('/data/list', (req, res) => {
    let data = [
        {
            id:'A7777', title:'중국 허난성 지역 내 헤어 미용실 수 2019', unit:'개',
            category:'Hair Salon', region:'Henan', obj:'company', status:1,
            updated_data:'2019.09.29'
        },
        {
            id:'A7778', title:'중국 베이징 지역 내 헤어 미용실 수 2019', unit:'개',
            category:'Hair Salon', region:'Beijing', obj:'company', status:1,
            updated_data:'2019.09.29'
        }
    ];
    res.render('admin_data_list', {
        active:'data_list',
        data:data
    })
});
// 환경설정 (Set-up)
router.get('/config', (req, res) => {
   res.render('admin_config', {
       active:'config'
   });
});
module.exports = router;