let current_id = '';
$('#btn_insert').on('click', () => {
    let formData = $('form[name=form_create]').serializeArray();
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
$('#btn_update').on('click', () => {
    if(confirm('수정하시겠습니까?')){
        let formData = $('form[name=form_read]').serializeArray(), obj = {};
        formData.forEach((item) => {
            obj[item.name] = item.value;
        });
        obj['_id'] = current_id;
        $.ajax({
            type:'post',
            url:'admin/notice/update',
            data:obj,
            dataType:'json',
            success:function(){
                alert('수정되었습니다.');
                location.reload();
            }, error:function(e){
                console.error(e);
            }
        })
    }
})
$('#btn_remove').on('click', () => {
    if(confirm('삭제하시겠습니까?')){
        $.ajax({
            type:'post',
            url:'admin/notice/delete',
            data:{_id:current_id},
            dataType:'json',
            success:function(){
                alert('삭제되었습니다. ');
                location.reload();
            },
            error:function(e){
                console.error(e);
            }
        })
    }
});
function fnGetContentById(id){
    current_id = id;
    $.ajax({
        type:'post',
        url:'admin/notice/read',
        data:{_id:id},
        dataType:'json',
        success:function(res){
            console.log('res : ', res);
            $('#modalRead').modal('show');
            $('form[name=form_read] input[name=title]').val(res.title);
            $('form[name=form_read] input[name=author]').val(res.author);
            $('form[name=form_read] textarea[name=content]').text(res.content);
        },
        beforeSend:function(){$('.bd-loading').modal('show')},
        complete:function(){$('.bd-loading').modal('hide')},
        error:function(err){
            console.error(err);
        }
    })
}