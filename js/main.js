// TODO: Sharding.
var firepadRef = new Firebase('https://firepad.firebaseio.com/home/');

var codeMirror = CodeMirror(document.getElementById('firepad'), { lineWrapping: true });

var userId = firepadRef.push().name(); // Just a random ID.

var firepad = Firepad.fromCodeMirror(firepadRef, codeMirror,
    { richTextToolbar: true, richTextShortcuts: true, userId: userId});

var firepadUserList = FirepadUserList.fromDiv(firepadRef.child('users'),
    document.getElementById('firepad-userlist'), userId);

codeMirror.focus();