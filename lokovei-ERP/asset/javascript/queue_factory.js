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
  var url_route     = 'http://localhost:8080';

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

    // console.log('posi', posi);

    $.ajax({
      url: url_order + '/todoTime',
      type: 'PUT',
      data: data,
      success: function(result){
        // console.log('設定job狀態成功', result);
        // console.log('設定job狀態成功', data.nStatus);

        var btn = $('.status[data-id="' + posi + '"]');

        //refresh btn data-status
        $(btn).attr('class', color + ' status btn-sm' )
              .attr('data-status', data.nStatus)
              .text(data.nStatus);

        //refresh div data-status
        $(btn).parent()
              .parent()
              .attr('data-status', data.nStatus);
      },
      error: function(err){
        console.log('設定job狀態錯誤', err);
      }
    })

    $('#statusDialog').modal('toggle');
    return false;

  });

  $('html, body').on('click', '.doSort', function(){

    var time = $(this).attr('data-time');
    var count = $('input[data-time]').val() || 0;

    if(count == 0){
      console.log('無需求數量');
      return false;
    }

    $.ajax({
      url: url_route + '/sort',
      type: 'POST',
      data: { time: time, count: count },
      success: function(result){
        console.log('排程成功', result);
        window.location.assign('http://localhost:8080/factory');
      },
      error: function(err){
        console.log('排程錯誤', err);
      }
    })
    return false;
  });

});