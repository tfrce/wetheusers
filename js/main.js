
$(document).ready(function () {



  // ------------ Events ------------- //

  // Input animation
  $('form input').blur(function () {
    if( $(this).val() ) {
        $(this).addClass('filled');
      } else {
        $(this).removeClass();
      }
  });

  // Expand the text button for mobile
  $('#expand').click(function() {
    $('main').addClass('expanded');
    return false;
  });
  

  // On form submissions
  $('.petition-form').on('submit', function () {
    $('#modal').fadeIn();
    return false;
  })

});
