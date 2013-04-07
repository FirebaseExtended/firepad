var FirepadUserList = (function() {
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
    return elt('div', [
      this.makeHeading_(),
      elt('div', [
        this.makeUserEntryForSelf_(),
        this.makeUserEntriesForOthers_()
      ], {'class': 'firepad-userlist-users' })
    ], {'class': 'firepad-userlist' });
  };

  FirepadUserList.prototype.makeHeading_ = function() {
    var counterSpan = elt('span', '0');
    this.ref_.on('value', function(usersSnapshot) {
      setTextContent(counterSpan, "" + usersSnapshot.numChildren());
    });

    return elt('div', [
      elt('span', 'ONLINE ('),
      counterSpan,
      elt('span', ')')
    ], { 'class': 'firepad-userlist-heading' });
  };

  FirepadUserList.prototype.makeUserEntryForSelf_ = function() {
    var myUserRef = this.ref_.child(this.userId_);

    var colorDiv = elt('div', null, { 'class': 'firepad-userlist-color-indicator' });
    myUserRef.child('color').on('value', function(colorSnapshot) {
      colorDiv.style.backgroundColor = colorSnapshot.val();
    });

    var nameInput = elt('input', null, { type: 'text', 'class': 'firepad-userlist-name-input'} );
    nameInput.value = this.displayName_;

    var nameHint = elt('div', 'ENTER YOUR NAME', { 'class': 'firepad-userlist-name-hint'} );

    // Update Firebase when name changes.
    on(nameInput, 'change', function(e) {
      var name = nameInput.value || "Guest " + Math.floor(Math.random() * 1000);
      myUserRef.child('name').onDisconnect().remove();
      myUserRef.child('name').set(name);
      nameHint.style.display = 'none';
      nameInput.blur();
      stopEvent(e);
    });

    var nameDiv = elt('div', [nameInput, nameHint]);

    return elt('div', [ colorDiv, nameDiv ], { 'class': 'firepad-userlist-user' });
  };

  FirepadUserList.prototype.makeUserEntriesForOthers_ = function() {
    var self = this;
    var userList = elt('div');
    var userId2Element = { };

    function updateChild(userSnapshot, prevChildName) {
      var userId = userSnapshot.name();
      var div = userId2Element[userId];
      if (div) {
        userList.removeChild(div);
        delete userId2Element[userId];
      }

      var colorDiv = elt('div', null, { 'class': 'firepad-userlist-color-indicator' });
      colorDiv.style.backgroundColor = userSnapshot.child('color').val();

      var nameDiv = elt('div', userSnapshot.child('name').val(), { 'class': 'firepad-userlist-name' });

      var userDiv = elt('div', [ colorDiv, nameDiv ], { 'class': 'firepad-userlist-user' });
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

  /** DOM helpers */
  function elt(tag, content, attrs) {
    var e = document.createElement(tag);
    if (typeof content === "string") {
      setTextContent(e, content);
    } else if (content) {
      for (var i = 0; i < content.length; ++i) { e.appendChild(content[i]); }
    }
    for(var attr in (attrs || { })) {
      e.setAttribute(attr, attrs[attr]);
    }
    return e;
  }

  function setTextContent(e, str) {
    e.innerHTML = "";
    e.appendChild(document.createTextNode(str));
  }

  function on(emitter, type, f) {
    if (emitter.addEventListener) {
      emitter.addEventListener(type, f, false);
    } else if (emitter.attachEvent) {
      emitter.attachEvent("on" + type, f);
    }
  }

  function off(emitter, type, f) {
    if (emitter.removeEventListener) {
      emitter.removeEventListener(type, f, false);
    } else if (emitter.detachEvent) {
      emitter.detachEvent("on" + type, f);
    }
  }

  function preventDefault(e) {
    if (e.preventDefault) {
      e.preventDefault();
    } else {
      e.returnValue = false;
    }
  }

  function stopPropagation(e) {
    if (e.stopPropagation) {
      e.stopPropagation();
    } else {
      e.cancelBubble = true;
    }
  }

  function stopEvent(e) {
    preventDefault(e);
    stopPropagation(e);
  }

  return FirepadUserList;
})();
