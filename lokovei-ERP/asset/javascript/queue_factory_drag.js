
var url_order     = 'http://localhost:8080/job';

function allowDrop( ev) {
    ev.preventDefault();
}

var id = '';
var job;
var data = {};

function drag(ev) {

    ev.dataTransfer.setData("text", ev.target.id);

    id = '#' + ev.target.id;
    job = $( '#' + ev.target.id );

    data.oid = $(job).attr('data-oid');
    data.time = $(job).attr('data-time');
    data.status = $(job).attr('data-status');
}

function drop(ev) {

    if( $(ev.target).hasClass('line') === true ){
      ev.preventDefault();
      var tag = ev.dataTransfer.getData("text");
      ev.target.appendChild(document.getElementById(tag));

      job = $(id)

      data.nTime = $(job).parent().attr('data-time');
      data.nStatus = data.status;

      console.log('data', data);
      $.ajax({
        url: url_order + '/todoTime',
        type: 'PUT',
        data: data,
        success: function(result){
          console.log('設定job新時間成功', result);
          // console.log('設定job狀態成功', data.nStatus);

          $(job).attr('data-time', data.nTime);
          $(job).children('').children('[data-time]').attr('data-time', data.nTime);
        },
        error: function(err){
          console.log('設定job狀態錯誤', err);
        }
      });

    }else{
      return false;
    }


}