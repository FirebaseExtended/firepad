var examples = ['richtext', 'code', 'userlist'];
var currentId;

function main() {
  loadExampleFromUrl();
  setTimeout(function() {
    $(window).on('hashchange', loadExampleFromUrl);
  }, 0);

  for(var i = 0; i < examples.length; i++) {
    var example = examples[i];
    addClickHandler(example);
  }
}
setTimeout(main, 0);

function loadExampleFromUrl() {
  var info = getExampleAndIdFromUrl();
  var newId = info.id || randomString(10);
  if (newId !== currentId) {
    currentId = newId;
    initializeExampleIframes(currentId);
  }

  var example = (examples.indexOf(info.example) >= 0) ? info.example : '';
  setTimeout(function() {
    scrollToExample(example);
  }, 0);

  window.location = './#' + example + '-' + currentId;
}

function getExampleAndIdFromUrl() {
  var hash = window.location.hash.replace(/#/g, '') || '';
  var parts = hash.split('-');
  return { example: parts[0], id: parts[1] };
}

function initializeExampleIframes(id) {
  for(var i = 0; i < examples.length; i++) {
    var example = examples[i];
    var url = './' + example + '.html#' + example + '-' + id;
    var $iframe = $('#' + example + ' .example-container');

    // HACK: We recreate the iframe since changing its 'src' with a different hash might not actually reload it.
    $iframe.replaceWith(
        $('<iframe></iframe>').addClass('example-container').attr('src', url)
    );
  }
}

function addClickHandler(example) {
  $('#' + example + '-link').on('click', function() {
    window.location = './#' + example + '-' + currentId;
    return false;
  });
}

function scrollToExample(example) {
  var scrollTo = example ? ($('#' + example).offset().top - 20) : 0;
  $('html, body').scrollTop(scrollTo);
}

function randomString(length) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for( var i=0; i < length; i++ )
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}