$( document ).ready( function(){

  var id = '';
  var url_order     = 'http://localhost:8080/order';

  $('html, body').on('click', '.status', function(){
    //console.log('click .status');
    id = $(this).attr('data-uid');
    // console.log('id', id);
    $('#statusDialog').modal('toggle');
    return false;
  });

  $('html, body').on('click', '.statusChoose', function(){

    //var btn = $(this);
    var status = $(this).attr('data-value');
    var color = $(this).attr('class').replace(/statusChoose/g, '');

    console.log('set staus');

    $.ajax({
      url: url_order + '/status',
      type: 'POST',
      data: { uid: id, status: status },
      success: function(result){
        console.log('設定狀態成功', result);
        $('.status[data-uid="' + id + '"]').attr('class', color + ' status' ).text(status);
      },
      error: function(err){
        console.log('設定狀態錯誤', err);
      }
    })

    $('#statusDialog').modal('toggle');
    return false;

  });
});