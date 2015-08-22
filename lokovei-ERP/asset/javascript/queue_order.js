$(document).ready(function() {

  initDatePicker();

  var customer = ['全馬', '竹輪', '立翔', '總太', '綠明'];
  var em = ['Andrew', 'Doro', 'Ray', 'Doro', 'Hsuan'];
  var product = ['CHT-013-BO002/Lokovei SR-800-寶馬棕', 'CHT-013-BO002/Lokovei SR-800-寶馬紅', 'CHT-013-BO002/Lokovei SR-800-寶馬藍', 'CHT-013-BO002/Lokovei SR-800-寶馬綠'];

  $('html, body').on('click', '.edit', function(){

    // icon edit/save
    var icoEdit = '<span aria-hidden="true" class="glyphicon glyphicon-pencil"></span>';
    var icoSave = '<span aria-hidden="true" class="glyphicon glyphicon-floppy-open"></span>';

    // use controls list
    var editInfo = ['none', 'customer', 'none', 'none', 'none', 'em', 'none', 'date', 'date', 'skip', 'skip',
                    'none', 'product', 'num', 'none', 'text'];

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

      //  !!!
      // need ajax save api
      //  !!!

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

      case 'date':
        //console.log('show', show);
        show = $(obj).children('input').val();
        break;

      case 'text':
        //console.log('show', show);
        show = $(obj).children('input').val();
        break;
    }
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
      if( arr[i] !== selected )
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
        startDate: '-3d',
        orientation: "top rigth"
    })
  }

  //  $('#sandbox-container .input-group.date').datepicker({});

  //  $('#sandbox-container input').datepicker({});

});//  end doc reade

