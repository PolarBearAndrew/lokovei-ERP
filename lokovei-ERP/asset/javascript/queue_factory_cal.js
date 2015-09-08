$(document).ready(function(){

  cal();

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
});