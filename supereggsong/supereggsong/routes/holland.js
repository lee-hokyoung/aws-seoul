const express = require('express');
const router = express.Router();
const hollandSchema = require('../models/holland');
const test_act = [
  {attr:{name:'act1', data:'S,e'}, question:'1. 갈등을 겪고 있는 사람들이 화합하도록 돕는다.'},
  {attr:{name:'act2', data:'E,r'}, question:'2. 다른 사람에게 해야 할 일을 지시한다.'},
  {attr:{name:'act3', data:'A,i'}, question:'3. 작품 사진을 찍는다.'},
  {attr:{name:'act4', data:'R,i'}, question:'4. 컴퓨터를 조립한다 '},
  {attr:{name:'act5', data:'I,c'}, question:'5. 화학실험을 한다.'},
  {attr:{name:'act6', data:'A,s'}, question:'6. 연극이나 뮤지컬을 관람한다.'},
  {attr:{name:'act7', data:'C,e'}, question:'7. 문서를 확인하고 교정한다.'},
  {attr:{name:'act8', data:'R,a'}, question:'8. 중장비를 운전한다.'},
  {attr:{name:'act9', data:'E,s'}, question:'9. 대중 앞에서 연설한다.'},
  {attr:{name:'act10', data:'C,r'}, question:'10. 회사 규칙을 준수한다.'},
  {attr:{name:'act11', data:'S,c'}, question:'11. 다른 사람의 고민을 듣고 충고해준다.'},
  {attr:{name:'act12', data:'I,a'}, question:'12. 우주 생성에 관하여 공부한다.'}
];
const test_competence = [
  {attr:{name:'com1', data:'R,a'}, question:'1. 간단한 집안수리를 할 수 있다.'},
  {attr:{name:'com2', data:'A,i'}, question:'2. 인물 스케치를 잘 할 수 있다.'},
  {attr:{name:'com3', data:'C,e'}, question:'3. 편지와 서류 등을 잘 정리할 수 있다.'},
  {attr:{name:'com4', data:'I,s'}, question:'4. 지구 온난화 현상을 설명할 수 있다.'},
  {attr:{name:'com5', data:'R,c'}, question:'5. 공구를 사용할 수 있다.'},
  {attr:{name:'com6', data:'E,r'}, question:'6. 원하는 방향으로 일을 주도할 수 있다.'},
  {attr:{name:'com7', data:'C,s'}, question:'7. 남을 설득해서 계약을 성사실킬 수 있다.'},
  {attr:{name:'com8', data:'I,c'}, question:'8. 산수 응용문제를 잘 풀 수 있다.'},
  {attr:{name:'com9', data:'S,e'}, question:'9. 사람들과 편안하게 이야기할 수 있다.'},
  {attr:{name:'com10', data:'A,r'}, question:'10. 실내를 독특하고 아름답게 꾸밀 수 있다.'},
  {attr:{name:'com11', data:'E,a'}, question:'11. 비전과 목표를 세워 남들에게 제시할 수 있다.'},
  {attr:{name:'com12', data:'S,i'}, question:'12. 타인의 기분을 잘 읽어낼 수 있다.'}
];
const test_job = [
  {attr:{name:'job1', data:'R'}, question:'1. 항공기 조종사'},
  {attr:{name:'job2', data:'C'}, question:'2. 법무사'},
  {attr:{name:'job3', data:'A'}, question:'3. 작곡가'},
  {attr:{name:'job4', data:'I'}, question:'4. 과학자'},
  {attr:{name:'job5', data:'R'}, question:'5. 경찰'},
  {attr:{name:'job6', data:'E'}, question:'6. 정치가'},
  {attr:{name:'job7', data:'S'}, question:'7. 사회복지가'},
  {attr:{name:'job8', data:'A'}, question:'8. 디자이너'},
  {attr:{name:'job9', data:'C'}, question:'9. 은행 사무원'},
  {attr:{name:'job10', data:'I'}, question:'10. 인류학자'},
  {attr:{name:'job11', data:'A'}, question:'11. 광고 기획자'},
  {attr:{name:'job12', data:'S'}, question:'12. 언어 치료사'},
  {attr:{name:'job13', data:'E'}, question:'13. 판매원'},
  {attr:{name:'job14', data:'R'}, question:'14. 엔지니어'},
  {attr:{name:'job15', data:'E'}, question:'15. 변호사'},
  {attr:{name:'job16', data:'C'}, question:'16. 공인회계사'},
  {attr:{name:'job17', data:'I'}, question:'17. 경영분석가'},
  {attr:{name:'job18', data:'S'}, question:'18. 교육자'}
];
const test_tendency = [
  {attr:{name:'ten1', data:'A'}, question:'1. 아름다운 음악이나 그림에 감명을 받는 경우가 많다.'},
  {attr:{name:'ten2', data:'E'}, question:'2. 사회적 지위획득에 관심이 많다.'},
  {attr:{name:'ten3', data:'R'}, question:'3. 스스로 조립하거나 만들 수 있는 제품을 즐겨 산다.'},
  {attr:{name:'ten4', data:'S'}, question:'4. 사람들의 개인적인 이야기를 잘 들어주는 편이다.'},
  {attr:{name:'ten5', data:'I'}, question:'5. 시험에서 틀린 문제에 끝까지 정답을 밝혀낸다.'},
  {attr:{name:'ten6', data:'E'}, question:'6. 어떤 분야에서 주도적으로 일을 하는 편이다.'},
  {attr:{name:'ten7', data:'A'}, question:'7. 아름다움을 추구한다.'},
  {attr:{name:'ten8', data:'C'}, question:'8. 정해진 규칙대로 일하지 않으면 불안하다.'},
  {attr:{name:'ten9', data:'R'}, question:'9. 도구를 사용하여 무엇을 잘 만드는 편이다.'},
  {attr:{name:'ten10', data:'S'}, question:'10. 사무실 안에서 일하는 것보다 바깥에서 일하는 것이 낫다.'},
  {attr:{name:'ten11', data:'I'}, question:'11. 여러 가지 자연현상에 대해 호기심을 갖고 있다.'},
  {attr:{name:'ten12', data:'C'}, question:'12. 쉽게 찾을 수 있도록 물건을 정리하는 편이다.'}
];

router.get('', (req, res) => {
  res.render('holland', {
    q1:JSON.stringify(test_act),
    q2:JSON.stringify(test_competence),
    q3:JSON.stringify(test_job),
    q4:JSON.stringify(test_tendency)
  });
});
router.get('/personal/:id', (req, res) => {
  let id = req.params.id, list = [];
  hollandSchema.find().where('_id').equals(id).then((doc)=>{
    res.render('holland_personal', {
      doc:doc,
      q1:JSON.stringify(test_act),
      q2:JSON.stringify(test_competence),
      q3:JSON.stringify(test_job),
      q4:JSON.stringify(test_tendency)
    });
  })
});
router.post('/personal', (req, res) => {
  let query = {'user_name':req.body.user_name, 'user_phone':req.body.user_phone};
  hollandSchema.findOneAndUpdate(query, req.body, {upsert:true}, (err) =>{
    if(err) return res.status(500).send(err);
    return res.status(200).send({result:1, comment:'등록 성공'});
  });
});

module.exports = router;