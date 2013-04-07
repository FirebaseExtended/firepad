var ROOMS = 20;

var room = Number(window.location.hash.replace(/#/g, ''));
if (!(room >= 1 && room <= ROOMS)) {
  room = Math.floor(Math.random() * ROOMS);
}

window.location = window.location.toString().replace(/#.*/, '') + '#' + room;

var NAMESPACES = 15;
var firebaseUrl = 'https://firebase-firepad' + (room % NAMESPACES) + '.firebaseio.com/' + room;
var firepadRef = new Firebase(firebaseUrl);
var codeMirror = CodeMirror(document.getElementById('firepad'), { lineWrapping: true });

var userId = firepadRef.push().name(); // Just a random ID.

var firepad = Firepad.fromCodeMirror(firepadRef, codeMirror,
    { richTextToolbar: true, richTextShortcuts: true, userId: userId});

var firepadUserList = FirepadUserList.fromDiv(firepadRef.child('users'),
    document.getElementById('firepad-userlist'), userId);

codeMirror.focus();