---
layout: docs
permalink: index.html
---

<a name="embedding"></a>
# Embedding Guide
Firepad uses <a href="https://www.firebase.com/">Firebase</a> for its real-time data synchronization and
<a href="http://www.codemirror.net/">CodeMirror</a> as the underlying text editor (though we'd love to add
support for other editors).  So to get started, you'll need to include Firebase, CodeMirror, and Firepad.

{% highlight html %}
    <script src="https://cdn.firebase.com/v0/firebase.js"></script>

    <!-- Can download from http://codemirror.net/codemirror.zip -->
    <link rel="stylesheet" href="codemirror.css" />
    <script src="codemirror.js"></script>

    <link rel="stylesheet" href="firepad.css" />
    <script src="firepad.js"></script>
{% endhighlight %}

You'll also need a <a href="https://www.firebase.com/">Firebase</a> account, which will be used to store and synchronize your firepad contents:

<a href="https://www.firebase.com/signup/">Create a Free Firebase Account</a>

As mentioned, currently Firepad uses CodeMirror for its text editor, so you'll need to create a CodeMirror instance
first.  Here are a couple typical setups:

### Rich-Text Editing

{% highlight html %}
    <div id="firepad"></div>
    <script>
      var firepadRef = new Firebase('<FIREBASE URL>');
      var codeMirror = CodeMirror(document.getElementById('firepad'), { lineWrapping: true });
      var firepad = Firepad.fromCodeMirror(firepadRef, codeMirror,
          { richTextShortcuts: true, richTextToolbar: true });
    </script>
{% endhighlight %}

### Code Editing

{% highlight html %}
    <div id="firepad"></div>
    <script>
      var firepadRef = new Firebase('<FIREBASE URL>');
      var codeMirror = CodeMirror(document.getElementById('firepad'),
          { lineNumbers: true, mode: 'javascript' });
      var firepad = Firepad.fromCodeMirror(firepadRef, codeMirror);
    </script>
{% endhighlight %}

Replace `&lt;FIREBASE_URL&gt;` with any location in your Firebase.  You can
trivially store multiple firepads in your Firebase by just giving them each a unique URL (e.g.
`https://firebase-account.firebaseio.com/firepads/0`,
`https://firebase-account.firebaseio.com/firepads/1`, etc.)

Check out <a href="http://codemirror.net/">codemirror.net</a> for details on CodeMirror's API.

### Available Options
* *richTextToolbar* (default: false) - Adds a toolbar with buttons for bold, italic, etc.
* *richTextShortcuts* (default: false) - Maps Ctrl-B to bold, etc.
* *userId* (default: random) - The user ID for the person editing.
* *userColor* (default: generated from userId) - A css color (e.g. "#ccc") for this user's cursor.

<div class="docs-separator"> </div>
<a name="api"></a>

# Firepad API
### Events
There is presently only one event, 'ready' which fires once Firepad has retrieved the initial editor contents.  You
must wait for this event to fire before calling any methods.

{% highlight javascript %}
    firepad.on('ready', function() {
      // firepad is ready.
    });
{% endhighlight %}

### Methods
`firepad.getText()` - Returns the current contents of Firepad as a string.<br/>
`firepad.setText(text)` - Sets the contents of Firepad as a string.<br/>
`firepad.getHtml()` - Gets the contents of Firepad as a string containing html tags.<br/>
`firepad.setHtml(html)` - Sets the contents of Firepad as a string containing html tags.<br/>
`firepad.isHistoryEmpty()` - Returns true if the Firepad has never had any content.<br/>

<div class="docs-separator"> </div>
<a name="extending"></a>

# Extending Firepad
Blah blah
