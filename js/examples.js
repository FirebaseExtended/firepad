var examples = ['richtext', 'code', 'userlist'];

function main() {
  loadExampleFromUrl();
  setTimeout(function() {
    $(window).on('hashchange', loadExampleFromUrl);
  }, 0);
}
setTimeout(main, 0);

function loadExampleFromUrl() {
  var info = getExampleAndIdFromUrl();
  var id = info.id || randomString(10);
  loadExamples(id);

  var example = (examples.indexOf(info.example) >= 0) ? info.example : '';
  scrollToExample(example);

  window.location = './#' + id + '-' + example;
}

function getExampleAndIdFromUrl() {
  var hash = window.location.hash.replace(/#/g, '') || '';
  var parts = hash.split('-');
  return { id: parts[0], example: parts[1] };
}

function loadExamples(id) {
  for(var i = 0; i < examples.length; i++) {
    var example = examples[i];
    var url = './' + example + '.html#' + id;
    $('#' + example + ' .example-container').attr('src', url);
  }
}

function scrollToExample(example) {
  if (!example) {

  }
}

function randomString(length) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for( var i=0; i < length; i++ )
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}