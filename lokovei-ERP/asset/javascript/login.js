$(document).ready( function(){
  $('html, body').on('click', '#login', function(){
    //console.log('login click');
    //
    var data = {
      account: '123',
      pwd: '123'
    }

    $.ajax({
      url: 'http://localhost:8080/login',
      type: 'POST',
      data: data,
      success: function( result ){
        //console.log('登入資料取得成功', result);
        $('#loginDialog').modal('toggle')
      },
      error: function( err ){
        console.log('登入錯誤', err);
      }

    }); //ajax end

    return false;
  }); // login click end
});// doc ready end