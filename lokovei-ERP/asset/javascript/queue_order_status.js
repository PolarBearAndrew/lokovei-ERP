$( document ).ready( function(){

  var id = '';
  var url = 'http://192.168.1.120:80/';
  var url_order     = url + 'order';

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


  // 打勾勾結案
  $('html, body').on('click', '.finishOrder', function(){
    console.log('click .status');
    id = $(this).attr('data-uid');
    // console.log('id', id);
    $('#finishDialog').modal('toggle');
    return false;
  });

  $('html, body').on('click', '#finishOrder', function(){

    //var btn = $(this);
    var status = '已結案';
    var color = 'btn btn-success';

    console.log('test', { uid: id, status: status });

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

    $('#finishDialog').modal('toggle');
    return false;

  });
});