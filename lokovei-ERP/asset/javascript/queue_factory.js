$(document).ready(function(){

  $('.job-info').popover()

  $('#myPopover').on('hidden.bs.popover', function () {
    // do something…
  })


  // set status
  var posi = '';
  var data = {};
  var id = '';
  var url_order     = 'http://localhost:8080/job';

  $('html, body').on('click', '.status', function(){
    //console.log('click .status');
    posi = $(this).attr('data-id');
    id = $(this).attr('data-uid');
    data.oid = $(this).attr('data-oid');
    data.time = $(this).attr('data-time');
    data.status = $(this).attr('data-status');

    //data.nTime = $(this).parent().parent().attr('data-time');
    data.nTime = data.time;
    $('#statusDialog').modal('toggle');
    return false;
  });

  $('html, body').on('click', '.statusChoose', function(){

    data.nStatus = $(this).attr('data-value');

    // console.log('data', data);

    var color = $(this).attr('class').replace(/statusChoose/g, '');

    console.log('posi', posi);

    $.ajax({
      url: url_order + '/todoTime',
      type: 'PUT',
      data: data,
      success: function(result){
        console.log('設定job狀態成功', result);
        $('.status[data-id="' + posi + '"]').attr('class', color + ' status btn-sm' ).text(data.nStatus);
      },
      error: function(err){
        console.log('設定job狀態錯誤', err);
      }
    })

    $('#statusDialog').modal('toggle');
    return false;

  });
});