$('#btn_login').on('click', () =>{
    let data = $('form[name=login_form]').serializeArray();
    $.ajax({
        type:'post',
        url:'admin/check',
        data:data,
        dataType:'json',
        success:function(res){
            if(res.result === 0){
                alert('아이디 혹은 비밀번호를 다시 확인해주세요.');
            }else if(res.result === 1){
                location.replace('/admin/news_board');
            }else{
                alert('잘못된 접근입니다.');
                location.replace('/');
            }
        }
    });
})
