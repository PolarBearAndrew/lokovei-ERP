$(document).ready(function(){
  console.log('init factory')

  $('.job-info').popover()

  $('#myPopover').on('hidden.bs.popover', function () {
    // do something…
  })
});