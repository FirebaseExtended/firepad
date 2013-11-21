(function() {
  var ROOMS = 1;
  var OFFSET = 1; // Must be at least 1.
  var firepad = null, codeMirror = null, userList = null;

  function joinFirepadForHash() {
    if (firepad) {
      // Clean up.
      firepad.dispose();
      userList.dispose();
      $('.CodeMirror').remove();
    }

    var room = Number(window.location.hash.replace(/#/g, ''));
    if (room < 1 || room >= OFFSET + ROOMS) {
      room = OFFSET + Math.floor(Math.random() * ROOMS);
    }

    var NAMESPACES = 15;
    //var firebaseUrl = 'https://firebase-firepad' + (room % NAMESPACES) + '.firebaseio.com/' + room;
    var firebaseUrl = 'https://firepad.firebaseio.com/home/' + room;
    var firepadRef = new Firebase(firebaseUrl);

    codeMirror = CodeMirror(document.getElementById('firepad'), { lineWrapping: true });
    var userId = firepadRef.push().name(); // Just a random ID.
    firepad = Firepad.fromCodeMirror(firepadRef, codeMirror,
                                     { richTextToolbar: true, richTextShortcuts: true, userId: userId, imageInsertionUI:false });

    var func = function() { firepad.insertEntity('img', { 'src':'http://farm9.staticflickr.com/8076/8359513601_92c6653a5c_z.jpg' }) };

    var span = document.createElement('span');
    span.className = 'firepad-tb-insert-image';
    var a = document.createElement('a');
    a.className = 'firepad-btn';
    a.onclick = func;
    a.appendChild(span);
    var div = document.createElement('div');
    div.className = 'firepad-btn-group';
    div.appendChild(a);

    document.getElementsByClassName('firepad-toolbar')[0].appendChild(div);

    userList = FirepadUserList.fromDiv(firepadRef.child('users'),
        document.getElementById('firepad-userlist'), userId);

    window.location = window.location.toString().replace(/#.*/, '') + '#' + room;

    codeMirror.focus();
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
})();
