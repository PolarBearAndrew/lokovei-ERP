
var url = config.ip;
var url_order     = url + 'job';

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

          // 計算統計數據
          cal();
        },
        error: function(err){
          console.log('設定job狀態錯誤', err);
        }
      });

    }else{
      return false;
    }
}

function cal(){
    //console.log('cal cal');
    var day = $('.day');
    console.log('day', day);

    for( var d = 1; d < day.length; d++){

      var val = day[d];
      var job = $(val).children('.line').children('.job');

      var name = [];
      var count = [];

      for( var c = 0; c < job.length; c++){
        var text = $(job[c]).attr('data-pro');

        //console.log('text', text);
        if( name.indexOf(text) != -1 ){
          count[name.indexOf(text)]++;
        }else{
          name.push(text);
          count.push(1);
        }
      } // for c end

      var str = '[統計數據]<br/>';

      for( var a = 0; a < name.length; a++){
        str += name[a] + '：' + count[a] + '<br/>';
      }

      $(val).children('.cal').html(str);

    } // for d end
  }