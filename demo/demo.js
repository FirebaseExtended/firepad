var firepad, userList, codeMirror;

function joinFirepadForHash() {
  if (firepad) {
    // Clean up.
    firepad.detach();
    userList.detach();
    $('.CodeMirror').remove();
  }

  var id = window.location.hash.replace(/#/g, '') || randomString(10);
  var url = window.location.toString().replace(/#.*/, '') + '#' + id;
  var firepadRef = new Firebase('https://firepad.firebaseio.com/demo').child(id);

  var userId = firepadRef.push().name(); // Just a random ID.
  codeMirror = CodeMirror(document.getElementById('firepad'), { lineWrapping: true });
  firepad = Firepad.fromCodeMirror(firepadRef, codeMirror,
      { richTextToolbar: true, richTextShortcuts: true, userId: userId});
  userList = FirepadUserList.fromDiv(firepadRef.child('users'),
      document.getElementById('firepad-userlist'), userId);

  firepad.on('ready', function() {
    if (firepad.isHistoryEmpty()) {
      firepad.setText('Welcome to your own private pad!\n\nShare the URL below and collaborate with your friends.');
    }
  });

  codeMirror.focus();

  window.location = url;
  $('#url').val(url);
  $("#url").on('click', function(e) {
    $(this).focus().select();
    e.preventDefault();
    return false;
  });
}

function randomString(length) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for(var i=0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

joinFirepadForHash();
$(window).on('hashchange', joinFirepadForHash);
