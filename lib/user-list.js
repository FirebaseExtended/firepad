var firepad = firepad || { };

firepad.UserList = (function() {
  var utils = firepad.utils;

  function FirepadUserList(ref, place, userId) {
    if (!(this instanceof FirepadUserList)) { return new FirepadUserList(ref, place, userId); }

    this.ref_ = ref;
    this.userId_ = userId;

    var self = this;
    this.displayName_ = 'Guest ' + Math.floor(Math.random() * 1000);
    ref.root().child('.info/connected').on('value', function(s) {
      if (s.val() === true && self.displayName_) {
        var nameRef = ref.child(self.userId_).child('name');
        nameRef.onDisconnect().remove();
        nameRef.set(self.displayName_);
      }
    });

    place.appendChild(this.makeUserList_());
  }

  // This is the primary "constructor" for symmetry with Firepad.
  FirepadUserList.fromDiv = FirepadUserList;

  FirepadUserList.prototype.makeUserList_ = function() {
    return utils.elt('div', [
      this.makeHeading_(),
      utils.elt('div', [
        this.makeUserEntryForSelf_(),
        this.makeUserEntriesForOthers_()
      ], {'class': 'firepad-userlist-users' })
    ], {'class': 'firepad-userlist' });
  };

  FirepadUserList.prototype.makeHeading_ = function() {
    var counterSpan = utils.elt('span', '0');
    this.ref_.on('value', function(usersSnapshot) {
      utils.setTextContent(counterSpan, "" + usersSnapshot.numChildren());
    });

    return utils.elt('div', [
      utils.elt('span', 'ONLINE ('),
      counterSpan,
      utils.elt('span', ')')
    ], { 'class': 'firepad-userlist-heading' });
  };

  FirepadUserList.prototype.makeUserEntryForSelf_ = function() {
    var myUserRef = this.ref_.child(this.userId_);

    var colorDiv = utils.elt('div', null, { 'class': 'firepad-userlist-color-indicator' });
    myUserRef.child('color').on('value', function(colorSnapshot) {
      colorDiv.style.backgroundColor = colorSnapshot.val();
    });

    var nameInput = utils.elt('input', null, { type: 'text', 'class': 'firepad-userlist-name-input'} );
    nameInput.value = this.displayName_;

    var nameHint = utils.elt('div', 'ENTER YOUR NAME', { 'class': 'firepad-userlist-name-hint'} );

    // Update Firebase when name changes.
    utils.on(nameInput, 'change', function(e) {
      var name = nameInput.value || "Guest " + Math.floor(Math.random() * 1000);
      myUserRef.child('name').onDisconnect().remove();
      myUserRef.child('name').set(name);
      nameHint.style.display = 'none';
      utils.stopEvent(e);
    });

    var nameDiv = utils.elt('div', [nameInput, nameHint]);

    return utils.elt('div', [ colorDiv, nameDiv ], { 'class': 'firepad-userlist-user' });
  };

  FirepadUserList.prototype.makeUserEntriesForOthers_ = function() {
    var self = this;
    var userList = utils.elt('div');
    var userId2Element = { };

    function updateChild(userSnapshot, prevChildName) {
      var userId = userSnapshot.name();
      var div = userId2Element[userId];
      if (div) {
        userList.removeChild(div);
        delete userId2Element[userId];
      }

      var colorDiv = utils.elt('div', null, { 'class': 'firepad-userlist-color-indicator' });
      colorDiv.style.backgroundColor = userSnapshot.child('color').val();

      var nameDiv = utils.elt('div', userSnapshot.child('name').val(), { 'class': 'firepad-userlist-name' });

      var userDiv = utils.elt('div', [ colorDiv, nameDiv ], { 'class': 'firepad-userlist-user' });
      userId2Element[userId] = userDiv;

      if (userId === self.userId_) {
        // HACK: We go ahead and insert ourself in the DOM, so we can easily order other users against it.
        // But don't show it.
        userDiv.style.display = 'none';
      }

      var nextElement =  prevChildName ? userId2Element[prevChildName].nextSibling : userList.firstChild;
      userList.insertBefore(userDiv, nextElement);
    }

    this.ref_.on('child_added', updateChild);
    this.ref_.on('child_changed', updateChild);
    this.ref_.on('child_moved', updateChild);
    this.ref_.on('child_removed', function(removedSnapshot) {
      var userId = removedSnapshot.name();
      var div = userId2Element[userId];
      if (div) {
        userList.removeChild(div);
        delete userId2Element[userId];
      }
    });

    return userList;
  };

  return FirepadUserList;
})();
