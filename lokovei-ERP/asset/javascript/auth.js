$(document).ready(function(){

  var name = localStorage.getItem("lokoveiUser");
  var auth = localStorage.getItem("lokoveiAuth");
  // console.log('doc ready', name, auth);

  if(name){
    $('#user').text( name + '/' + auth );
  }

  var Rules = {
    '員工': [
      { path: '/', auth: true },
      { path: '/order', auth: true },
      { path: '/order/none', auth: true },
      { path: '/order/startTime', auth: true },
      { path: '/order/customer', auth: true },
      { path: '/order/endTime', auth: true },
      { path: '/factory', auth: true },
      { path: '/crud/product', auth: false },
      { path: '/crud/line', auth: false },
      { path: '/crud/battery', auth: false },
      { path: '/crud/customer', auth: false },
      { path: '/crud/account', auth: false }
    ],

    '主管': [
      { path: '/', auth: true },
      { path: '/order', auth: true },
      { path: '/order/none', auth: true },
      { path: '/order/startTime', auth: true },
      { path: '/order/customer', auth: true },
      { path: '/order/endTime', auth: true },
      { path: '/factory', auth: true },
      { path: '/crud/product', auth: true },
      { path: '/crud/line', auth: true },
      { path: '/crud/battery', auth: true },
      { path: '/crud/customer', auth: true },
      { path: '/crud/account', auth: true }
    ],

    default: [
      { path: '/', auth: false },
      { path: '/order', auth: false },
      { path: '/order/none', auth: false },
      { path: '/order/startTime', auth: false },
      { path: '/order/customer', auth: false },
      { path: '/order/endTime', auth: false },
      { path: '/factory', auth: false },
      { path: '/crud/product', auth: false },
      { path: '/crud/line', auth: false },
      { path: '/crud/battery', auth: false },
      { path: '/crud/customer', auth: false },
      { path: '/crud/account', auth: false }
    ]
  };

  var path = location.pathname;
  var myRule = Rules[auth] || Rules['default'];

  // console.log('myRule', myRule);

  for( var r = 0; r < myRule.length; r++){

    if( myRule[r].path === url && myRule[r].auth === true){
      //...
      break;

    }else if( myRule[r].path === url && myRule[r].auth === false){

    }

  }



})