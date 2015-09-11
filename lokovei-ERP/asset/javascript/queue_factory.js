$(document).ready(function(){

  var url = config.ip;

  var url_job       = url + 'job';
  var url_battery   = url + 'battery';
  var url_product   = url + 'product';

  var product  = [];
  var battery  = [];

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

  // init table-add-newjob
  var arr = $('#newJobTable').children('div');
  setTimeout( todo, 500 );

  function todo(){
    for (var i = 0; i < arr.length; i++) {
      var ctrl = controls($(arr[i]).attr('data-ctrl'), $(arr[i]).html());
      if(ctrl) $(arr[i]).empty().append( ctrl );
    };
  }

  $('.job-info').popover()

  // $('#myPopover').on('hidden.bs.popover', function () {
  //   // do something…
  // })


  // set status
  var posi = '';
  var data = {};
  var id = '';
  var url_order     =  url + 'job';
  var url_route     =  url;

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

    var color = $(this).attr('class').replace(/statusChoose/g, '');

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
    var count = $(this).parent().children('input[data-time]').val() || 0;

    console.log('use time', time);

    if(count == 0){
      console.log('無需求數量');
      return false;
    }

    $.ajax({
      url: url_route + 'sort',
      type: 'POST',
      data: { time: time, count: count },
      success: function(result){
        console.log('排程成功', result);
        window.location.assign( url +'factory');
      },
      error: function(err){
        console.log('排程錯誤', err);
      }
    })
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

  $('html, body').on('click', '#newJobTable button', function(){

    var tmp = $('#newJobTable').children('div').children('');
    var data = {};


    var p = product[$(tmp[0]).val()].text;

    // uids.push(uid);
    data.uid = '';
    data.oid = '';
    data.pid = p.substring( 0 , p.indexOf('/') );
    data.pSpec = p.substring( p.indexOf('/') + 1 , p.length );
    data.count = 1;
    data.battery = battery[$(tmp[1]).val()];
    data.note = $(tmp[2]).val();
    //data.todoTime = $(tmp[4]).text();
    // data.line = $(tmp[4]).text();
    data.line = '';

    var d = new Date();
    data.time = Math.round(d / 86400000) * 100;

    console.log('data', data);

    // save
    $.ajax({
      url: url_job + '/new',
      type: 'POST',
      data: data,
      success: function(result){
        console.log('手動新增 job 成功', result);
        window.location.assign( url +'factory');
      },
      error: function(err){
        console.log('手動新增 job 失敗',err)
      }
    })

    return false;
  });

});