var ROOMS = 15;
var OFFSET = 30;
var firepad = null, codeMirror = null, userList = null;

function joinFirepadForHash() {
  console.log(firepad);
  if (firepad) {
    // Clean up.
    firepad.dispose();
    userList.dispose();
    $('.CodeMirror').remove();
  }

  var room = Number(window.location.hash.replace(/#/g, ''));
  if (!(room >= 1 && room <= OFFSET + ROOMS)) {
    room = OFFSET + Math.floor(Math.random() * ROOMS);
  }

  var NAMESPACES = 15;
  var firebaseUrl = 'https://firebase-firepad' + (room % NAMESPACES) + '.firebaseio.com/' + room;
  var firepadRef = new Firebase(firebaseUrl);

  codeMirror = CodeMirror(document.getElementById('firepad'), { lineWrapping: true });
  var userId = firepadRef.push().name(); // Just a random ID.
  firepad = Firepad.fromCodeMirror(firepadRef, codeMirror,
      { richTextToolbar: true, richTextShortcuts: true, userId: userId});
  userList = FirepadUserList.fromDiv(firepadRef.child('users'),
      document.getElementById('firepad-userlist'), userId);

  window.location = window.location.toString().replace(/#.*/, '') + '#' + room;

  $(window).on('scroll', function() {
    // unfocus codemirror on scroll, so it doesn't scroll into view on cursor movements.
    codeMirror.getInputField().blur();
  });
}

$(document).on('ready', function() {
  joinFirepadForHash();
  setTimeout(function() {
    $(window).on('hashchange', joinFirepadForHash);
  },0);
});