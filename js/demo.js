function main() {
  var padInfo = getPadIdAndUrl();
  // Get hash from end of URL or generate a random one.
  var firepadRef = new Firebase('https://firepad.firebaseio.com/demo').child(padInfo.id);

  window.location = padInfo.url;
  $('#url').val(padInfo.url);
  $("#url").on('click', function(e) {
    $(this).focus().select();
    e.preventDefault();
    return false;
  });

  var codeMirror = CodeMirror(document.getElementById('firepad'), { lineWrapping: true });
  var userId = firepadRef.push().name(); // Just a random ID.
  var firepad = Firepad.fromCodeMirror(firepadRef, codeMirror,
      { richTextToolbar: true, richTextShortcuts: true, userId: userId});
  var firepadUserList = FirepadUserList.fromDiv(firepadRef.child('users'),
      document.getElementById('firepad-userlist'), userId);

  firepad.on('ready', function() {
    if (firepad.isHistoryEmpty()) {
      firepad.setText('Welcome to your own private pad!\n\nShare the URL below and collaborate with your friends.');
    }
  });

  codeMirror.focus();
}
setTimeout(main, 0);

function getPadIdAndUrl() {
  var id = window.location.hash.replace(/#/g, '');
  if (!id) {
    id = randomString(10);
  }

  var url = window.location.toString();
  var hashInd = url.indexOf('#');
  if (hashInd >= 0) {
    url = url.substr(0, hashInd);
  }

  return {
    id: id,
    url: url + '#' + id
  };
}

function randomString(length) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for( var i=0; i < length; i++ )
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}