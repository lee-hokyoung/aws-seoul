$('#btn_insert').on('click', () => {
    let formData = $('form').serializeArray();
    $.ajax({
        type:'post',
        url:'admin/notice/insert',
        data:formData,
        dataType:'json',
        success:function(){
            alert('글이 정상적으로 등록되었습니다.');
            location.reload();
        },
        error:function(e){
            console.error(e);
        }
    })
});
function fnGetContentById(id){
    $.ajax({
        type:'post',
        url:'admin/notice/read',
        data:{_id:id},
        dataType:'json',
        success:function(res){
            console.log('res : ', res);
            $('#modalRead').modal('show');
            $('input[name=read_title]').val(res.title);
            $('input[name=read_author]').val(res.author);
            $('textarea[name=read_content]').text(res.content);
        },
        beforeSend:function(){$('.bd-loading').modal('show')},
        complete:function(){$('.bd-loading').modal('hide')},
        error:function(err){
            console.error(err);
        }
    })
}