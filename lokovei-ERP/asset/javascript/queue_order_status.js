$( document ).ready( function(){
  $('html, body').on('click', '.status', function(){
    //console.log('click .status');
    $('#statusDialog').modal('toggle')
    return false;
  })
});