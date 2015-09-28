// -------------- Config ------------ //
// --------------------------------- //

var API_SERVER = 'https://standupforthenet.herokuapp.com';
var POLL_VALIDATION_TIME = 5000; // Polls to check if user validated in ms

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
        if (o !== Object(o))
            throw new TypeError('Object.keys called on a non-object');
        var k = [],
            p;
        for (p in o)
            if (Object.prototype.hasOwnProperty.call(o, p)) k.push(p);
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
     } else {
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


  // Get the share counts
	var shareUrl = 'https://savecrypto.org' || window.location.href;
	$.ajax('https://act.eff.org/tools/social_buttons_count/?networks=facebook,twitter,googleplus&url=' + shareUrl, { success: function(res, err) {
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
  $('.petition-form').on('submit', function (ev) {
    var formData = $(ev.currentTarget).serializeObject();
    formData.subscribeToEmails = true;
    $('#modal').fadeIn();
    $.ajax({
      url: API_SERVER + '/api/1/signatures',
      type: 'POST',
      crossDomain: true,
      data: JSON.stringify(formData),
      dataType: 'json',
      success: function (){
        console.log(arguments);
      }
    });

    var validated = false;
    var checkValidation = function () {
      console.log('Checking Validation', validated);
      if(Math.ceil(Math.random()*3) % 2 === 0) {
        console.log('Complete');
      } else {
        setTimeout(checkValidation, POLL_VALIDATION_TIME);
      }
    }
    setTimeout(checkValidation, POLL_VALIDATION_TIME);
    /*
      {
        "email": "thomasalwyndavis@gmail.cmo",
        "firstName": "John",
        "lastName": "Doe",
        "subscribeToEmails": true
      }
    */
    return false;
  })

});
var setupOrgRotation = function () {
  var referalMap = {
    'fftf': {
        name: 'Access',
        policy: 'https://www.accessnow.org/'
    },
    'eff': {
        name: 'Electronic Frontier Foundation',
        policy: 'https://www.eff.org/policy'
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
  if(typeof alwaysSelected !== 'undefined') {
      referalParam = alwaysSelected;
  }

  if (referalParam in referalMap) {
    referalOrg = referalMap[referalParam];
    slug = referalParam;
  } else {
    var randomOrgIndex = Math.floor(Math.random() * referalKeys.length);
    referalOrg = referalMap[referalKeys[randomOrgIndex]];
    slug = referalKeys[randomOrgIndex];
  }
  console.log(referalMap[slug]);
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
    } else {
        $('.floating-share').removeClass('fixed');
    }
});
