$(document).ready(function() {

  // const
  var url_job       = 'http://localhost:8080/job';
  var url_user      = 'http://localhost:8080/user';
  var url_line      = 'http://localhost:8080/line';
  var url_order     = 'http://localhost:8080/order';
  var url_battery   = 'http://localhost:8080/battery';
  var url_product   = 'http://localhost:8080/product';
  var url_customer  = 'http://localhost:8080/customer';

  // select option data
  var em       = [];   //['Andrew', 'Ray', 'Doro', 'Hsuan']
  var line     = [];   //['產線-新莊', '產線-南港', '產線-五股', '產線-社子', '產線-板橋']
  var product  = [];   //['CHT-013-BO002/Lokovei SR-800-寶馬棕', 'CHT-013-BO002/Lokovei SR-800-寶馬紅', 'CHT-013-BO002/Lokovei SR-800-寶馬藍', 'CHT-013-BO002/Lokovei SR-800-寶馬綠']
  var battery  = [];
  var customer = [];   //['全馬', '竹輪', '立翔', '總太', '綠明']

  initDatePicker();

  // init select options data
  // init customer
  $.ajax({
    url: url_customer + '/all',
    type: 'GET',

    success: function( result ){
      // console.log('result', result)
      customer = result.map( function( val ){
        var tmp = {
          val: val._id,
          text: val.name
        }
        return tmp;
      });
    },
    error: function( err ){
      console.log('讀取經銷商資料錯誤', err);
    }
  });

  // init user
  $.ajax({
    url: url_user + '/all',
    type: 'GET',

    success: function( result ){
      // console.log('result', result)
      em = result.map( function( val ){
        var tmp = {
          val: val._id,
          text: val.name
        }
        return tmp;
      });
    },
    error: function( err ){
      console.log('讀取員工資料資料錯誤', err);
    }
  })

  // init line
  $.ajax({
    url: url_line + '/all',
    type: 'GET',

    success: function( result ){
      // console.log('result', result)
      line = result.map( function( val ){
        var tmp = {
          val: val._id,
          text: val.name
        }
        return tmp;
      });
    },
    error: function( err ){
      console.log('讀取產品資料錯誤', err);
    }
  })

  //init product
  $.ajax({
    url: url_product + '/all',
    type: 'GET',

    success: function( result ){
      // console.log('result', result)
      product = result.map( function( val ){
        var tmp = {
          val: val._id,
          text: val.pid + '/' + val.spec
        }
        return tmp;
      });
    },
    error: function( err ){
      console.log('讀取產品資料錯誤', err);
    }
  })

  //init battery
  $.ajax({
    url: url_battery + '/all',
    type: 'GET',

    success: function( result ){
      // console.log('result', result)
      battery = result.map( function( val ){
        var tmp = {
          val: val._id,
          text: val.name + '-' + val.note
        }
        return tmp;
      });
    },
    error: function( err ){
      console.log('讀取產品資料錯誤', err);
    }
  })

  // init select option data end

  // edit
  $('html, body').on('click', '.edit', function(){

    // icon edit/save
    var icoEdit = '<span aria-hidden="true" class="glyphicon glyphicon-pencil"></span>';
    var icoSave = '<span aria-hidden="true" class="glyphicon glyphicon-floppy-open"></span>';

    // get info we need
    var id = $(this).attr('data-orderId');
    var onEdit = parseInt( $(this).attr('data-onEdit') );
    var arr = $('.order-wrapper[data-orderId="' + id + '"] td[data-ctrl]');

    // going to save
    if( onEdit === 1 ){
      // chage btn icon
      $(this).empty().append(icoEdit);

      // loop to read each <td>
      for (var i = 0; i < arr.length; i++) {
        var show = controlsValue( $(arr[i]).attr('data-ctrl'), arr[i] );
        if(show) $(arr[i]).empty().append( show );
      };

      //  save order
      var oid = id;
      arr = $('.order-wrapper[data-orderId="' + id + '"] td');

      var orderData = {
        oid : oid,
        cName : $(arr[1]).text(),
        cAddress : $(arr[2]).text(),
        cPhone : $(arr[3]).text(),
        cWho : $(arr[4]).text(),
        usWho : $(arr[5]).text(),
        // count : $(arr[6]).text(),
        orderDate : $(arr[6]).text(),
        outputDate : $(arr[7]).text(),
        status : $(arr[8]).text(),
      };

       //save order
       $.ajax({
          url: url_order + '/',
          type: 'PUT',
          data: orderData,
          success: function(result){
            console.log('更新order資料成功', result);
          },
          error: function(err){
            console.log('更新order資料失敗',err)
          }
        })

      // save job
      var jobs = $('.order-wrapper[data-orderId="' + id + '"] tr[data-job]');

      for (var i = 0; i < jobs.length; i++) {

        var tmp = $(jobs[i]).children('td[data-ctrl]');
        var data = {};

        var p = $(tmp[0]).text();

        // uids.push(uid);
        data.uid = $(jobs[i]).attr('data-job');
        data.oid = oid;
        data.pid = p.substring( 0 , p.indexOf('/') );
        data.pSpec = p.substring( p.indexOf('/') + 1 , p.length );
        data.count = parseInt( $(tmp[1]).text() || 0 );
        data.battery = $(tmp[2]).text();
        data.note = $(tmp[3]).text();
        //data.todoTime = $(tmp[4]).text();
        data.line = $(tmp[4]).text();

        // save
        $.ajax({
          url: url_job + '/',
          type: 'PUT',
          data: data,
          success: function(result){
            console.log('更新job資料成功', result);
          },
          error: function(err){
            console.log('更新job資料失敗',err)
          }
        })
      };

    // going to edit
    }else{
      // change btn icon
      $(this).empty().append(icoSave);

      // loop to read each <td>
      for (var i = 0; i < arr.length; i++) {
        var ctrl = controls($(arr[i]).attr('data-ctrl'), $(arr[i]).html());
        if(ctrl) $(arr[i]).empty().append( ctrl );
      };

      //init date picker
      initDatePicker();
    }

    //  true false switch
    onEdit -= 1
    onEdit = onEdit * onEdit;
    $(this).attr('data-onEdit', onEdit);

    return false;
  });

  // get control or values
  function controls( ctrl, value ){

    var show;

    if(value === ' ')
      value = '';

    switch(ctrl){

      case 'none':
        show = value;
        break;

      case 'customer':
        show = buildSelector( customer, value);
        break;

      case 'em':
        show = buildSelector( em, value );
        break;

      case 'product':
        show = buildSelector( product, value );
        break;

      case 'battery':
        show = buildSelector( battery, value );
        break;

      case 'line':
        show = buildSelector( line, value );
        break;

      case 'num':
        show = '<input type="number" class="form-control"  value="' + value + '" >';
        break;

      case 'date':
        show = '<input data-date-format="mm/dd/yyyy" value="' + value + '" type="text" class="datepicker form-control"/>';
        break;

      case 'text':
        show = '<input class="form-control" type="text" value="' + value + '"></input>'
        break;
    }
    return show;
  }

  function controlsValue( ctrl, obj ){

    var show;

    switch(ctrl){

      case 'none':
        show =  $(obj).text();
        break;

      case 'customer':
        index = $(obj).children('select').val();
        show = customer[index].text;
        break;

      case 'em':
        index = $(obj).children('select').val();
        show = em[index].text;
        break;

      case 'product':
        index = $(obj).children('select').val();
        show = product[index].text;
        break;

      case 'battery':
        index = $(obj).children('select').val();
        show = battery[index].text;
        break;

      case 'line':
        index = $(obj).children('select').val();
        show = line[index].text;
        break;

      case 'num':
        show = $(obj).children('input').val();
        break;

      case 'date':
        //console.log('show', show);
        show = $(obj).children('input').val();
        break;

      case 'text':
        //console.log('show', show);
        show = $(obj).children('input').val();
        break;
    }

    show = show || ' ';

    return show;
  }

  //build <select>
  function buildSelector( arr, selected ){

    var select = '<select class="form-control">';
    var option = '<option value="@val">@text</option>';
    var optionChecked = '<option value="@val" selected>@text</option>';
    var selectEnd = '</select>';
    var tmp = '';

    for (var i = 0; i < arr.length; i++) {

      if( arr[i].text.indexOf(selected) == -1 )
        tmp += option.replace( /@val/g, i ).replace( /@text/g, arr[i].text );
      else
        tmp += optionChecked.replace( /@val/g, i ).replace( /@text/g, arr[i].text );

    };

    return select + tmp + selectEnd;
  }

  //  init date picker
  function initDatePicker(){
    $('.datepicker').datepicker({
        language: "zh-TW",
        format: 'yyyy/mm/dd',
        orientation: "top rigth"
    })
  }

  // add item
  $('html, body').on('click', '.addItem', function(){



    var id = '';
    var dataId = $(this).attr('data-id');

    // post add job
    $.ajax({
      url: url_job + '/',
      type: 'POST',
      success: function( result ){

        id = result._id;
        todo();
      },
      error: function( err ){
        console.log('新增訂單項目錯誤', err)
      }

    });

    function todo () {

      var editBtn = $('button[data-orderId=' + dataId + ']');

      //console.log('add ! ' );
      //先儲存
      if ( $(editBtn).attr('data-onEdit') === (1).toString() ){
        console.log('save first');
        $(editBtn).click();
      }

      // var id = $('.table-wrapper-item[data-id=' + $(this).attr('data-id') + '] tbody tr').length + 1;
      var arr = $('.table-wrapper-item[data-id=' + dataId + '] tbody tr:first-child td');
      var row = '<tr data-job="@jobId"><td data-ctrl="product" style="width: 300px"></td> <td data-ctrl="num">0</td> <td data-ctrl="battery"> </td> <td data-status="yes"> <label class="label label-primary">尚未完成</label> </td> <td data-ctrl="text">無</td> <td data-ctrl="line" class="hide"></td> </tr>';
      row = row.replace(/@jobId/, id);

      // 尋找正確的 table body 插入資料
      $('.table-wrapper-item[data-id=' + dataId + '] tbody').append(row);
      $('button[data-orderId=' + dataId + ']').click(); //啟動 edit 模式
      console.log('add todo');
    }

    return false
  });

  // add order
  $('html, body').on('click', '#addorder', function(){

    var oid = $('.order-wrapper').length;

    $.ajax({
      url: url_order + '/',
      type: 'POST',
      success: function( result ){
        oid = result.oid;
        todoOrder(oid, result._id);
      },
      error: function( err ){
        console.log('新增訂單項目錯誤', err)
      }

    });

    function todoOrder(oid, uid){

      var order = '<div data-orderID="@oid" data-uid="@uid" class="order-wrapper"> <div class="table-wrapper"> <table class="table"> <thead> <tr> <th>訂單編號</th> <th>經銷商</th> <th>經銷商地址</th> <th>聯絡電話</th> <th>採購人員</th> <th>接單人員</th> <th>數量合計</th> <th>訂購日期</th> <th>出車日期</th> <th>狀態</th> <th></th> </tr> </thead> <tbody> <tr> <td>@oid</td> <td data-ctrl="customer" style="width: 100px"></td> <td></td> <td></td> <td></td> <td data-ctrl="em" style="width: 120px"></td> <td></td> <td data-ctrl="date" style="width: 150px"></td> <td data-ctrl="date" style="width: 150px"></td> <td> <button class="btn btn-warning status" data-uid="@uid">尚未完成</button> </td> <td> <button data-uid="@uid" type="button" data-toggle="modal" data-target="#delDialog" class="btn btn-danger ctrl predelete"><span aria-hidden="true" class="glyphicon glyphicon-trash"></span></button> <button data-orderID="@oid" data-onEdit="0" class="btn btn-warning ctrl edit"><span aria-hidden="true" class="glyphicon glyphicon-pencil"></span></button><a href="/print/order/?id=0" class="btn btn-primary ctrl"><span aria-hidden="true" class="glyphicon glyphicon-print"></span></a> <button type="button" data-toggle="modal" data-target="#finishDialog" class="btn btn-success ctrl"><span aria-hidden="true" class="glyphicon glyphicon-ok"></span></button> </td> </tr> </tbody> </table> </div> <div data-id="@oid" class="table-wrapper-item"> <table class="table table-hover"> <thead> <tr> <th>產品編號/規格</th> <th>數量</th> <th>配備電池</th> <th>狀態</th> <th>備註</th> <th>排程時間</th> <th>產線</th> </tr> </thead> <tbody> </tbody> </table> <button data-id="@oid" class="btn btn-info ctrl addItem"><span aria-hidden="true" class="glyphicon glyphicon-plus"></span> 訂單增補</button> </div> </div>';
      order = order.replace(/@oid/g, oid);
      order = order.replace(/@uid/g, uid);

      $(order).insertBefore($('div.order-wrapper')[0]);

      //set id
      $( $('.order-wrapper')[0] ).attr('data-orderid', oid);
      $( $('.order-wrapper .edit')[0] ).attr('data-orderid', oid);
      // $( $('.order-wrapper')[0] ).children('td').text(' ');

      var btn = $('.order-wrapper .edit')[0];
      $(btn).click();

    }

    return false;
  });

  var target;

  $('html, body').on('click', '.predelete', function(){
    target = $(this).attr('data-uid').toString().replace(/"/g, '');
  });

  // delete data
  $('html, body').on('click', '.delete', function(){

    $.ajax({

      type: 'DELETE',
      url: url_order + '/',
      data: { uid: target },
      success: function( result ){
        // console.log('刪除資料成功', result);
        $('div[data-uid="' + target + '"]').remove();
        $('#delDialog').modal('toggle')
      },

      error: function( err ){
        console.log('刪除資料失敗', err);
      }

    });

    return false;
  });


  $('html, body').on('change', 'td[data-ctrl="customer"] select', function(){

    var cAddress = $(this).parent().next('td');
    var cPhone = $(cAddress).next('td');
    var cWho = $(cPhone).next('td');

    var id = customer[$(this).val()].val; //取得id

    // console.log('show', show);

    $.ajax({
      url: url_customer + '/?id=' + id,
      type: 'GET',
      success: function( result ){
        tmp = result[0];
        $(cAddress).text( tmp.address );
        $(cPhone).text( tmp.phone );
        $(cWho).text( tmp.who );
      },

      error: function( err ){
        console.log('讀取經銷商資料錯誤', err);
      }
    })

    return false;
  })

  $('html, body').on('change', '#sort', function(){

    var sortFunc = $(this).val();
    window.location.assign( url_order + '/' + sortFunc );
    return false;
  });
});//  end doc reade