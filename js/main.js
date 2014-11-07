
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

  setupReferralInput();



  // ------------ Events ------------- //
  // --------------------------------- //



  // Input animation
  $('form input.text').blur(function () {
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
    console.log(formData);
    $('#modal').fadeIn();
    return false;
  })

});

var setupReferralInput = function () {
  var referalMap = {
    'fftf': {
        name: 'Fight for the Future',
        policy: 'http://www.fightforthefuture.org/privacy/'
    },
    'eff': {
        name: 'Electronic Frontier Foundation',
        policy: 'https://www.eff.org/policy'
    },
    'dp': {
        name: 'Demand Progress',
        policy: 'http://www.demandprogress.org/privacy/'
    },
    'fp': {
        name: 'Free Press',
        policy: 'http://www.freepress.net/privacy-copyright'
    }
  };
  var referalKeys = Object.keys(referalMap);
  var referalParam = getParameterByName('r');
  var referalOrg;
  var slug;

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
  $('.org-privacy-link').text(referalMap[slug].policy);
  $('.org-slug').val(slug);
}
