// -------------- Config ------------ //
// --------------------------------- //

var API_SERVER = 'https://' + document.location.host + '/api', 
  POLL_VALIDATION_TIME = 5000, // Polls to check if user validated in ms
  THRESHOLD_PASSED_TIME = 1445853600; // Time the signature threshold was passed

// -------------- Utils ------------ //
// --------------------------------- //
function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&\/#]*)"),
  results = regex.exec(location.search);
  return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

// ie shims
if (!Object.keys) {
  Object.keys = function(o) {
    if (o !== Object(o)) {
      throw new TypeError('Object.keys called on a non-object');
    }
    var k = [], p;
    for (p in o) {
      if (Object.prototype.hasOwnProperty.call(o, p)) {
        k.push(p);
      }
    }
    return k;
  }
}

$.fn.serializeObject = function() {
  var o = {};
  var a = this.serializeArray();
  $.each(a, function() {
    if (o[this.name]) {
      if (!o[this.name].push) {
        o[this.name] = [o[this.name]];
      }
      o[this.name].push(this.value || '');
    }
    else {
      o[this.name] = this.value || '';
    }
  });
  return o;
};

$(document).ready(function () {
  // ------------ Setup -------------- //
  // --------------------------------- //

  // Enable HTML5 form validation for all browsers and platforms
  webshim.polyfill('forms');

  // Enable orgs a random chance at getting mailing list signups
  setupOrgRotation();
  document.getElementById('no-script').style.display = 'none';

  // Update the signature count.
  var updateSignatureCount = function() {
    $.ajax('/v1/petitions/' + $('input[name="petitionId"]').val() + '.json', {
      success: function(data) {
        $('#count').html(data.results[0].signatureCount.toLocaleString());
        // Link to a response when one is posted
        if (data.results[0].status == 'responded') {
          var passedDays = Math.round(((new Date().getTime() / 1000) - THRESHOLD_PASSED_TIME) / 60 / 60 / 24);
          var responseURL = data.results[0].url;
          sigTime = passedDays.toLocaleString() + ((passedDays == 1) ? ' day' : ' days');
          $('#signatures h2 span time').html(sigTime);
          $('#response-link').html('<a href="'+responseURL+'">Read the interim response from the Administration.</a>');
        } else {
          var passedDays = Math.round(((new Date().getTime() / 1000) - THRESHOLD_PASSED_TIME) / 60 / 60 / 24);
          // The form is still active, so display the elements that were hidden on load
          $("#add-name, .page-scroll").show();
          sigTime = passedDays.toLocaleString() + ((passedDays == 1) ? ' day' : ' days');
          $('#signatures h2 span time').html(sigTime);
        }
        setTimeout(updateSignatureCount, 10000);
      }
    });
  };
  updateSignatureCount();

  // Get the share counts
  var shareUrl = 'https://savecrypto.org' || window.location.href;
  $.ajax('https://act.eff.org/tools/social_buttons_count/?networks=facebook,twitter,googleplus&url=' + shareUrl, {
    success: function(res, err) {
      $.each(res, function(network, value) {
        var count = value;
        if (count / 10000 > 1) {
          count = Math.ceil(count / 1000) + 'k';
        }
        $('[data-network="' + network + '"]').attr('count', count);
      });
    }
  });

  // ------------ Events ------------- //
  // --------------------------------- //

  // page-scrolling
  $(function() {
    $('a.page-scroll').bind('click', function(event) {
      var $anchor = $(this);
      $('html, body').stop().animate({
        scrollTop: $($anchor.attr('href')).offset().top
      }, 1000, 'easeInOutExpo');
      event.preventDefault();
    });
  });

  // Input animation
  $('form input[type="text"], form input[type="email"]').blur(function () {
    if ($(this).val()) {
      $(this).addClass('filled');
    }
    else {
      $(this).removeClass();
    }
  });

  // Expand the text button for mobile
  $('#expand').click(function() {
    $('main').addClass('expanded');
    return false;
  });

  // On form submissions
  $('.petition-form').on('submit', function (ev) {
    var formData = $(ev.currentTarget).serializeObject();
    formData.subscribeToEmails = true;
    $('#modal').fadeIn();

    // Submit list signups.
    if (formData['sign-up'] == 'access') {
      $.post('https://www.accessnow.org/page/s/signup', {
        email: formData.email,
        firstname: formData.firstName,
        lastname: formData.lastName
      });
    }
    else if (formData['sign-up'] == 'eff') {
      $.post('https://supporters.eff.org/', {
        email: formData.email,
        op: 'Subscribe',
        form_id: 'eff_supporters_library_subscribe_form'
      });
    }
    else if (formData['sign-up'] == 'fftf') {
      $.post('https://action.fightforthefuture.org/api/movements/1/salsa', {
        tag: 'savecrypto',
        'member[language]': 'en',
        salsa: 'true',
        language_id: 'en',
        'member[movement_id]': '1',
        action: '1',
        'member[email]': formData.email
      });
    }
    else if (formData['sign-up'] == 'openmedia') {
      $.post('https://openmedia.org/save-crypto-form', {
        'submitted[first_name]': formData.firstName,
        'submitted[last_name]': formData.lastName,
        'submitted[email]': formData.email,
        'submitted[country]': 'US',
        'form_id': 'webform_client_form_1738',
        'op': 'Sign Up'
      });
    }
    else if (formData['sign-up'] == 'sumofus') {
      $.post('http://act.sumofus.org/act/', {
        'email': formData.email,
        'country': 'United States',
        'page': 'registration',
        'lists': '1',
        'lang': 'en',
        'source': 'savecrypto',
        'action_source': 'savecrypto',
        'action_referer': 'savecrypto',
        'form_name': 'act'
      });
    }

    delete formData['sign-up'];
    $.post(API_SERVER + '/1/signatures',
      formData
    );

    var validated = false;
    var checkValidation = function () {
      if (Math.ceil(Math.random()*3) % 2 === 0) {
      }
      else {
        setTimeout(checkValidation, POLL_VALIDATION_TIME);
      }
    }
    setTimeout(checkValidation, POLL_VALIDATION_TIME);
    return false;
  });

  $('#modal').click(function(){
    $('#modal').hide();
  });
});

var setupOrgRotation = function () {
  var referalMap = {
    'access': {
      name: 'Access',
      policy: 'https://www.accessnow.org/pages/privacy-policy'
    },
    'eff': {
      name: 'Electronic Frontier Foundation',
      policy: 'https://www.eff.org/policy'
    },
    'fftf': {
      name: 'Fight for the Future',
      policy: 'https://www.fightforthefuture.org/privacy/'
    },
    'openmedia': {
      name: 'OpenMedia',
      policy: 'https://openmedia.ca/privacy'
    },
    'sumofus': {
      name: 'SumOfUs',
      policy: 'https://sumofus.org/privacy/'
    }
  };
  var referalKeys = Object.keys(referalMap);
  var referalParam = getParameterByName('r');
  var referalOrg;
  var slug;

  // Share button popups
  $(".fblinkthis" ).click(function() {
    var url = $(this).attr("href");
    window.open(url, "Share on Facebook", "width=650,height=500");
    return false;
  });
  $( ".twlinkthis" ).click(function() {
    var url = $(this).attr("href");
    window.open(url,"Twitter","width=550,height=420");
    return false;
  });
  $( ".gpluslinkthis" ).click(function() {
    var url = $(this).attr("href");
    window.open(url,"Share on Google Plus","width=500,height=436");
    return false;
  });

  // Allows a page to have a selected org always
  if (typeof alwaysSelected !== 'undefined') {
    referalParam = alwaysSelected;
  }

  if (referalParam in referalMap) {
    referalOrg = referalMap[referalParam];
    slug = referalParam;
  }
  else {
    var randomOrgIndex = Math.floor(Math.random() * referalKeys.length);
    referalOrg = referalMap[referalKeys[randomOrgIndex]];
    slug = referalKeys[randomOrgIndex];
  }
  $('.org-name').text(referalMap[slug].name);
  $('.org-privacy-link').attr('href', referalMap[slug].policy);
  $('.org-slug').val(slug);
}

//  Scroll-to-fix share buttons
var floatingShareTop = $('.floating-share').offset().top - 20;

$(window).scroll(function() {
  var currentScroll = $(window).scrollTop();
  if (currentScroll >= floatingShareTop) {
    $('.floating-share').addClass('fixed');
  }
  else {
    $('.floating-share').removeClass('fixed');
  }
});
