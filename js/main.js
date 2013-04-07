var ROOMS = 20;
var ROOMS_PER_NS = 10;

var room = Number(window.location.hash.replace(/#/g, ''));
if (!(room >= 1 && room <= ROOMS)) {
  room = Math.floor(Math.random() * ROOMS);
}
var firebaseUrl = 'https://firebase-firepad' + Math.floor(room / ROOMS_PER_NS) + '.firebaseio.com/' + (room % ROOMS_PER_NS);

window.location = window.location.toString().replace(/#.*/, '') + '#' + room;

var firebaseUrl = 'https://firebase-firepad' + Math.floor(room / ROOMS_PER_NS) + '.firebaseio.com/' + (room % ROOMS_PER_NS);
var firepadRef = new Firebase(firebaseUrl);
var codeMirror = CodeMirror(document.getElementById('firepad'), { lineWrapping: true });

var userId = firepadRef.push().name(); // Just a random ID.

var firepad = Firepad.fromCodeMirror(firepadRef, codeMirror,
    { richTextToolbar: true, richTextShortcuts: true, userId: userId});

var firepadUserList = FirepadUserList.fromDiv(firepadRef.child('users'),
    document.getElementById('firepad-userlist'), userId);

codeMirror.focus();