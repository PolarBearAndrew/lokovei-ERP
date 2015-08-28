$(document).ready(function() {

  var url_job = 'http://localhost:8080/job';
  var url_order = 'http://localhost:8080/order';

  initDatePicker();

  var customer = ['全馬', '竹輪', '立翔', '總太', '綠明'];
  var em = ['Andrew', 'Doro', 'Ray', 'Doro', 'Hsuan'];
  var product = ['CHT-013-BO002/Lokovei SR-800-寶馬棕', 'CHT-013-BO002/Lokovei SR-800-寶馬紅', 'CHT-013-BO002/Lokovei SR-800-寶馬藍', 'CHT-013-BO002/Lokovei SR-800-寶馬綠'];
  var line = ['產線-新莊', '產線-南港', '產線-五股', '產線-社子', '產線-板橋'];

  $('html, body').on('click', '.edit', function(){

    // icon edit/save
    var icoEdit = '<span aria-hidden="true" class="glyphicon glyphicon-pencil"></span>';
    var icoSave = '<span aria-hidden="true" class="glyphicon glyphicon-floppy-open"></span>';

    // use controls list
    // var editInfo = ['none', 'customer', 'none', 'none', 'none', 'em', 'none', 'date', 'date', 'skip', 'skip',
    //                 'none', 'product', 'num', 'none', 'text'];

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

      //  save job
      var oid = id;
      var jobs = $('.order-wrapper[data-orderId="' + id + '"] tr[data-job]');

      var uids = [];

      for (var i = jobs.length - 1; i >= 0; i--) {

        var tmp = $(jobs[i]).children('td[data-ctrl]');

        var data = {};

        uids.push(uid);
        data.uid = $(jobs[i]).attr('data-job');
        data.oid = oid;
        data.pid = $(tmp[0]).text();
        data.pSpec = $(tmp[0]).text();
        data.count = $(tmp[1]).text();
        data.note = $(tmp[2]).text();
        data.todoTime = $(tmp[3]).text();
        data.line = $(tmp[4]).text();

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

        // $.ajax({
        //   url: url_order + '/',
        //   type: 'PUT',
        //   data: data,
        //   success: function(result){
        //     console.log('更新order資料成功', result);
        //   },
        //   error: function(err){
        //     console.log('更新order資料失敗',err)
        //   }
        // })
      };

      //save order


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
        show = $(obj).children('select').val();
        break;

      case 'em':
        show = $(obj).children('select').val();
        break;

      case 'product':
        show = $(obj).children('select').val();
        break;

      case 'line':
        show = $(obj).children('select').val();
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
    var option = '<option value="@val">@val</option>';
    var optionChecked = '<option value="@val" selected>@val</option>';
    var selectEnd = '</select>';
    var tmp = '';

    for (var i = 0; i < arr.length; i++) {

      if( arr[i].indexOf(selected) == -1 )
        tmp += option.replace( /@val/g, arr[i] );
      else
        tmp += optionChecked.replace( /@val/g, arr[i] );

    };

    return select + tmp + selectEnd;
  }

  //  init date picker
  function initDatePicker(){
    $('.datepicker').datepicker({
        language: "zh-TW",
        format: 'yyyy/mm/dd',
        startDate: '0d',
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
      success: function( reuslt ){

        id = reuslt._id;

        todo();
        // 尋找正確的 table body 插入資料
        // $('.table-wrapper-item[data-id=' + $(this).attr('data-id') + '] tbody').append(row);
        // $('button[data-orderId=' + $(this).attr('data-id') + ']').click(); //啟動 edit 模式

      },
      error: function( err ){
        console.log('新增訂單項目錯誤', err)
      }

    });

    function todo () {
      // var id = $('.table-wrapper-item[data-id=' + $(this).attr('data-id') + '] tbody tr').length + 1;
      var arr = $('.table-wrapper-item[data-id=' + dataId + '] tbody tr:first-child td');
      var row = '<tr data-job="@jobId">';

      for (var i = 0; i < arr.length ; i++) {

        // if( $(arr[i]).attr('data-ctrl').indexOf('num')){
        //   row += '<td data-ctrl="num">0</td>';
        //   continue;
        // }

        var td = '<td @attr></td>'
        var ctrl = $(arr[i]).attr('data-ctrl');

        if(ctrl) td = td.replace(/@attr/g, 'data-ctrl="' + ctrl + '"')
        else td = td.replace(/@attr/g,'')

        row += td;
      };

      row = row.replace(/@jobId/, id);
      // 尋找正確的 table body 插入資料
      $('.table-wrapper-item[data-id=' + dataId + '] tbody').append(row);
      $('button[data-orderId=' + dataId + ']').click(); //啟動 edit 模式
    }

    return false
  });

  $('html, body').on('click', '#addorder', function(){

    var id = '';
    var id = $('.order-wrapper').length;

    $.ajax({
      url: url_order + '/',
      type: 'POST',
      success: function( reuslt ){
        id = reuslt.oid;
        todoOrder();
      },
      error: function( err ){
        console.log('新增訂單項目錯誤', err)
      }

    });

    function todoOrder(){

      var order = '<div data-orderID="0" class="order-wrapper"> <div class="table-wrapper"> <table class="table"> <thead> <tr> <th>訂單編號</th> <th>經銷商</th> <th>經銷商地址</th> <th>聯絡電話</th> <th>採購人員</th> <th>接單人員</th> <th>數量合計</th> <th>訂購日期</th> <th>出車日期</th> <th>狀態</th> <th></th> </tr> </thead> <tbody> <tr> <td>@id</td> <td data-ctrl="customer" style="width: 100px"> </td> <td> </td> <td> </td> <td> </td> <td data-ctrl="em" style="width: 120px"> </td> <td data-ctrl="num"> </td> <td data-ctrl="date" style="width: 150px"> </td> <td data-ctrl="date" style="width: 150px"> </td> <td> <button class="btn btn-success">已出貨</button> </td> <td> <button type="button" data-toggle="modal" data-target="#delDialog" class="btn btn-danger ctrl"><span aria-hidden="true" class="glyphicon glyphicon-trash"></span></button> <button data-orderID="0" data-onEdit="0" class="btn btn-warning ctrl edit"><span aria-hidden="true" class="glyphicon glyphicon-pencil"></span></button> <button class="btn btn-primary ctrl"><span aria-hidden="true" class="glyphicon glyphicon-print"></span></button> <button type="button" data-toggle="modal" data-target="#finishDialog" class="btn btn-success ctrl"><span aria-hidden="true" class="glyphicon glyphicon-ok"></span></button> </td> </tr> </tbody> </table> </div> <div data-id="0" class="table-wrapper-item"> <table class="table table-hover"> <thead> <tr> <th>產品編號</th> <th>品名規格</th> <th>數量</th> <th>狀態</th> <th>備註</th> <th>排程時間</th> </tr> </thead> <tbody> <tr> <td>CHT-013-BO002</td> <td data-ctrl="product" style="width: 300px">Lokovei SR-800-寶馬棕</td> <td data-ctrl="num">1</td> <td> <label class="label label-warning">尚未完成</label> </td> <td data-ctrl="text">無</td> <td data-ctrl="date"> </td> </tr> </tbody> </table> <button data-id="0" class="btn btn-info ctrl addItem"><span aria-hidden="true" class="glyphicon glyphicon-plus"></span> 訂單增補</button> </div> </div>'
      order = order.replace(/@id/, id);

      $(order).insertBefore($('div.order-wrapper')[0]);

      //set id
      $( $('.order-wrapper')[0] ).attr('data-orderid', id);
      $( $('.order-wrapper .edit')[0] ).attr('data-orderid', id);
      // $( $('.order-wrapper')[0] ).children('td').text(' ');

      var btn = $('.order-wrapper .edit')[0];
      $(btn).click();

    }

    return false;
  });

});//  end doc reade

