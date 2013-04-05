var examples = {
  code: {
    linkId: "code-link", // Refers to the link at the top of the page (not all examples have this).
    title: "Code",
    description: "Uses CodeMirror's javascript mode to build a collaborative JavaScript code editor.",
    src: "code.html"
  },
  richtext: {
    linkId: "rich-text-link", // Refers to the link at the top of the page (not all examples have this).
    title: "Rich-Text",
    description: "Typical rich-text setup (toolbar, keyboard shortcuts, line wrap, etc.)",
    src: "richtext.html"
  },
};

var GITHUB_BASE_URL = 'https://github.com/firebase/firepad/blob/gh-pages/examples/';

function main() {
  createExamples();

  loadExampleOnHashChange();
}
setTimeout(main, 0);

function loadExampleOnHashChange() {
  var hash;
  setInterval(function() {
    if (window.location.hash !== hash) {
      loadExampleFromUrl();
      hash = window.location.hash;
    }
  }, 50);
}

function loadExampleFromUrl() {
  var info = getExampleAndIdFromUrl();
  loadExample(info.example, info.id);
}

function getExampleAndIdFromUrl() {
  var hash = window.location.hash.replace(/#/g, '') || '';
  var parts = hash.split('-');
  return { example: parts[0], id: parts[1] };
}

function createExamples() {
  for(var example in examples) {
    createExample(example);
  }
}

function createExample(example) {
  var info = examples[example];
  var $example = $('<div class="example" id="example-' + example + '"></div>');
  var $exampleTitle = $('<div class="example-title"></div>').text(info.title);
  var $seeItLink = $('<a href="#">See it in action &gt;</a>').addClass('example-see-it');
  var $viewSourceLink = $('<a>View source &gt;</a>').addClass('example-view-source')
      .attr('href', GITHUB_BASE_URL + info.src).attr('target', '_blank');

  $example.append($exampleTitle)
      .append(document.createTextNode(info.description))
      .append($seeItLink)
      .append($viewSourceLink);

  $seeItLink.on('click', function(e) {
    loadExample(example);

    e.preventDefault();
    return false;
  });

  if (info.linkId) {
    $('#' + info.linkId).on('click', function(e) {
      loadExample(example);
      return false;
    });
  }

  $('#example-list').append($example);
}

function loadExample(example, id) {
  if (!example || !(example in examples)) {
    example = 'code';
  }

  var info = examples[example];
  id = id || randomString(10);

  $('#example-list .selected').removeClass('selected');
  $('#example-' + example).addClass('selected');

  var exampleUrl = './' + info.src + '#' + id;
  $('#example-container').attr('src', exampleUrl);

  window.location = './#' + example + '-' + id;

  $('#page-links .selected').removeClass('selected');
  var linkId = examples[example].linkId;
  if (linkId) {
    $('#' + linkId).addClass('selected');
  }

  $('#view-source').attr('href', GITHUB_BASE_URL + info.src);
}

function randomString(length) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for( var i=0; i < length; i++ )
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}
