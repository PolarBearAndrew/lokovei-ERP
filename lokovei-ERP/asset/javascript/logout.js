$(document).ready( function(){

  logoutSuccess();

  localStorage.setItem("lokoveiUser", '');
  localStorage.setItem("lokoveiAuth", '');


  $.ajax({
    url: 'http://localhost:8080/login',
    type: 'POST',
    data: { account: '', pwd: '' },
    success: function( result ){ },
    error: function( err ){
      console.log('登出錯誤', err);
    }

  }); //ajax end

  function logoutSuccess(){
    $('#loginoutDialog').modal('show');
  }

  $('html, body').on('click', '#login', function(){
    //console.log('login click');
    //
    var data = {
      account: $('#account').val(),
      pwd: $('#pwd').val()
    }

    $.ajax({
      url: 'http://localhost:8080/login',
      type: 'POST',
      data: data,
      success: function( result ){
        //console.log('登入資料取得成功', result);
        if( result.login === 'success'){
          loginSuccess();
        }else{
          loginFail();
        }
      },
      error: function( err ){
        console.log('登入錯誤', err);
        loginFail();
      }

    }); //ajax end

    function loginSuccess(){

      // console.log('location.href', location.href);

      // if( location.href !== 'http://localhost:8080/'){
      //   window.location.assign( location.href ); // 直接導向到原先要連接的網頁
      // }else{
        window.location.assign( 'http://localhost:8080/order/startTime' ); // 直接導向到 order
      // }

      $('#loginDialog').modal('hide');
      $('#loginSuccessDialog').modal('show');
    }

    function loginFail(){
      //$('#loginDialog').modal('hide');
      $('#loginFailDialog').modal('show');
    }

    return false;
  }); // login click end
});// doc ready end