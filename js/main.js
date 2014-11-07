
$(document).ready(function () {
  $('form input').blur(function () {
    if( $(this).val() ) {
        $(this).addClass('filled');
      } else {
        $(this).removeClass();
      }
  });
  $('#expand').click(function() {
    $('main').addClass('expanded');
    return false;
  });
  
  $('input#submit').click(function() {
    $('#modal').fadeIn();
    return false;
  });
});
