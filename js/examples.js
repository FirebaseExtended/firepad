var examples = {
  'richtext' : {
    create: function(div, ref) {
      var codeMirror = CodeMirror(div, { lineWrapping: true, mode: '' });

      this.firepad = Firepad.fromCodeMirror(ref, codeMirror,
          { richTextToolbar: true, richTextShortcuts: true });

      var self = this;
      this.firepad.on('ready', function() {
        if (self.firepad.isHistoryEmpty()) {
          var f = Firepad.Formatting().fontSize(24);
          self.firepad.setText([
            Firepad.Text("Rich-text", f.italic(true).color('green')),
            Firepad.Text(" editing with ", f),
            Firepad.Text("Firepad!", f.color('red'))
          ]);
        }
      });
    },
    dispose: function() {
      this.firepad.dispose();
    }
  },
  'code' : {
    create: function(div, ref) {
      var codeMirror = CodeMirror(div, {
        lineNumbers: true,
        mode: 'javascript'
      });

      this.firepad = Firepad.fromCodeMirror(ref, codeMirror);

      var self = this;
      this.firepad.on('ready', function() {
        if (self.firepad.isHistoryEmpty()) {
          self.firepad.setText('// JavaScript Editing with Firepad!\nfunction go() {\n  var message = "Hello, world.";\n  console.log(message);\n}');
        }
      });
    },
    dispose: function() {
      this.firepad.dispose();
    }
  },
  'userlist' : {
    create: function(div, ref) {
      var codeMirror = CodeMirror(div, { lineWrapping: true, mode: '' });

      var userId = Math.floor(Math.random() * 9999999999).toString();

      this.firepad = Firepad.fromCodeMirror(ref, codeMirror,
          { richTextToolbar: true, richTextShortcuts: true, userId: userId});

      this.firepadUserList = FirepadUserList.fromDiv(ref.child('users'), div, userId);

      var self = this;
      this.firepad.on('ready', function() {
        if (self.firepad.isHistoryEmpty()) {
          self.firepad.setText('Check out the user list to the left!');
        }
      });
    },
    dispose: function() {
      this.firepad.dispose();
      this.firepadUserList.dispose();
    }
  }
};

var currentId;
$(window).on('ready', function() {
  var ref = new Firebase('https://firepad-examples.firebaseio-demo.com');
  for(var example in examples) {
    addClickHandler(example);
  }

  initializeExamplesFromUrl();
  setTimeout(function() {
    $(window).on('hashchange', initializeExamplesFromUrl);
  }, 0);
});


function initializeExamplesFromUrl() {
  var info = getExampleAndIdFromUrl();
  var newId = info.id || randomString(10);
  if (newId !== currentId) {
    currentId = newId;
    initializeExamples(currentId);
  }

  var example = (examples[info.example] != null) ? info.example : '';
  scrollToExample(example);

  window.location = './#' + example + '-' + currentId;
}

function getExampleAndIdFromUrl() {
  var hash = window.location.hash.replace(/#/g, '') || '';
  var parts = hash.split('-');
  return { example: parts[0], id: parts[1] };
}

var initialized = false;
function initializeExamples(id) {
  var ref = new Firebase('https://firepad-examples.firebaseio-demo.com').child(id);
  for(var example in examples) {
    var $div = $('#' + example + ' .example-container');
    if (initialized) {
      examples[example].dispose();
      $div.empty();
    }

    examples[example].create($div.get(0), ref.child(example));
  }
  initialized = true;
}

function addClickHandler(example) {
  $('#' + example + '-link').on('click', function() {
    window.location = './#' + example + '-' + currentId;
    return false;
  });
}

function scrollToExample(example) {
  if (example) {
    var scrollTo = example ? ($('#' + example).offset().top - 20) : 0;
    $('html, body').scrollTop(scrollTo);
  }
}

function randomString(length) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for( var i=0; i < length; i++ )
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}
