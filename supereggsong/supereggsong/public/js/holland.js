// 버튼 클릭시 active 활성화
let total_score = {};
$('.btn-answer .btn').on('click', (b) => {
  let btn_group = b.currentTarget.parentElement.childNodes;
  btn_group.forEach((v) => {v.classList.remove('active');});
  b.currentTarget.classList.add('active');
  let data = b.currentTarget.parentElement.attributes.data.value;
  let score = b.currentTarget.attributes.score.value;
  let id = b.currentTarget.parentElement.attributes.name.value;
  total_score[id] = {data:data, score:score};
});
$('#btn_submit_test').on('click', () => {
  let score = {R:[],I:[],A:[],S:[],E:[],C:[]};
  for(let key in total_score){
    let data = total_score[key].data.split(',');
    if(data.length > 1) {
      switch(total_score[key].score){
        case 'H':
          score[data[0]].push(5);
          score[data[1].toUpperCase()].push(3);
          break;
        case 'M':
          score[data[0]].push(3);
          score[data[1].toUpperCase()].push(1);
          break;
        case 'Z':
          score[data[0]].push(0);
          score[data[1].toUpperCase()].push(0);
          break;
      }
    }else{
      switch(total_score[key].score){
        case 'H': score[data[0]].push(5); break;
        case 'M': score[data[0]].push(3); break;
        case 'L': score[data[0]].push(1); break;
      }
    }
  }
  let idx = 0, data = [];
  for(let key in score){
    idx++;
    let point = score[key].reduce((acc, v) => {return acc + v;}, 0);
    $('table.table tbody tr td')[idx].innerText = point;
    data.push(point);
  }
  fnGenChart(data);
});
function fnGenChart(data){
  console.log('data : ', data);
  let ctx = document.getElementById("holland_chart");
  let myChart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ["Realistic", "Investigative", "Artistic", "Social", "Enterprising", "Conventional"],
      datasets: [{
        label:'Holland 검사 결과',
        data: data,
        fill:true,
        backgroundColor:'rgba(255,99,132,0.2)',
        borderColor:'rgb(255,99,132)',
        pointBackgroundColor:'rgb(255,99,132)',
        pointBorderColor:'#fff',
        pointHoverBackgroundColor:'#fff'
      }]
    },
    options: {
      scale:{
        ticks:{
          beginAtZero:true,
          min:0,
          max:60,
          stepSize:10
        }
      }
    }
  });
}
// 개인정보 저장
$('#btn_personal').on('click', () => {
  let formData = $('form[name=form_personal]').serializeArray();
  let obj = {};
  for(let key in total_score){
    obj[key] = total_score[key]['score'];
  }
  for(let key in formData){
    obj[formData[key]['name']] = formData[key]['value'];
  }
  if(!$('#agree_personality')[0].checked){
    alert('개인정보의 수집항목 및 이용목적에 동의해주시기 바립니다.');
    return false;
  }
  $.ajax({
    type:'post',
    url:'/holland/personal',
    data:obj,
    dataType:'json',
    success:function(res){
      console.log(`res : ${res}`);
    },
    error:function(err){
      console.error(err);
    }
  })
});