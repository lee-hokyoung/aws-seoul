$('#btn_update').on('click', () => {
    let formData = $('form').serializeArray();
    $.ajax({
        type:'post',
        url:'admin/notice/insert',
        data:formData,
        dataType:'json',
        success:function(){
            alert('글이 정상적으로 등록되었습니다.');
            $('#btn_close').click();
        },
        error:function(e){

        }
    })
});