var examples = ['richtext', 'code', 'userlist'];
var GITHUB_BASE_URL = 'https://github.com/firebase/firepad/blob/gh-pages/examples/';

function main() {
  for(var i = 0; i < examples.length; i++) {
    loadExample(examples[i]);
  }
}
setTimeout(main, 0);

function loadExample(example) {
  var githubUrl = GITHUB_BASE_URL + example + '.html';
  $('#' + example + ' .example-view-source').attr('href', githubUrl);
}
