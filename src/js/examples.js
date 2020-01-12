var examples = {
  'richtext' : {
    create: function(div, ref) {
      var codeMirror = CodeMirror(div, { lineWrapping: true, mode: '' });

      this.firepad = Firepad.fromCodeMirror(ref, codeMirror,
          { richTextToolbar: true, richTextShortcuts: true });

      var self = this;
      this.firepad.on('ready', function() {
        if (self.firepad.isHistoryEmpty()) {
          self.firepad.setHtml(
            '<span style="font-size: 24px;">Rich-text editing     with <span style="color: red">Firepad!</span></span><br/>\n' +
            '<div style="font-size: 14px">' +
            'Supports:<br/>' +
            '<ul>' +
              '<li>Different ' +
                '<span style="font-family: impact">fonts,</span>' +
                '<span style="font-size: 24px;"> sizes, </span>' +
                '<span style="color: blue">and colors.</span>' +
              '</li>' +
              '<li>' +
                '<b>Bold, </b>' +
                '<i>italic, </i>' +
                '<u>and underline.</u>' +
              '</li>' +
              '<li>Lists' +
                '<ol>' +
                  '<li>One</li>' +
                  '<li>Two</li>' +
                '</ol>' +
              '</li>' +
              '<li>Undo / redo</li>' +
              '<li>Cursor / selection synchronization.</li>' +
              '<li>And it\'s all fully collaborative!</li>' +
            '</ul>' +
            '</div>');
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
  'ace' : {
      create: function(div, ref) {
          var editor = ace.edit(div);
          editor.setTheme("ace/theme/textmate");
          var session = editor.getSession();
          session.setUseWrapMode(true);
          session.setUseWorker(false);
          session.setMode("ace/mode/javascript");

          this.firepad = Firepad.fromACE(ref, editor);

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
  var config = {
    apiKey: '<API_KEY>',
    authDomain: "firepad.firebaseapp.com",
    databaseURL: "https://firepad.firebaseio.com"
  };
  firebase.initializeApp(config);

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
  var ref = firebase.database().ref('examples').child(id);
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
