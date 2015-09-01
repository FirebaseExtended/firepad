---
layout: docs
---

<a name="getting_started"> </a>

# 1. Getting Started

Firepad was designed to be embedded inside larger applications. Since it uses [Firebase](https://www.firebase.com/?utm_source=docs&utm_medium=email&utm_campaign=firepad) as a backend it
requires no server-side code and can be added to any web app simply by including the JavaScript files.
Here we'll explain how to do this.

Firepad uses CodeMirror as the underlying text editor. If you'd like to use Ace as your code editor instead, skip to [Getting Started with Ace](#getting_started_with_ace).

<a name="getting_started_with_codemirror"> </a>
## Getting Started with CodeMirror

### Sign Up For Firebase

In order to embed Firepad into your own application, you must first <a href="https://www.firebase.com/signup/?utm_source=docs&utm_medium=email&utm_campaign=firepad" target="_blank">sign up for a free Firebase account</a>. This will automatically create a new Firebase for you whose URL you will use below.


### Adding Dependencies

Include Firebase, CodeMirror, and Firepad in the &lt;head&gt; section of your page.

{% highlight html %}
<!-- Firebase -->
<script src="https://cdn.firebase.com/js/client/2.2.4/firebase.js"></script>

<!-- CodeMirror -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.2.0/codemirror.js"></script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.2.0/codemirror.css" />

<!-- Firepad -->
<link rel="stylesheet" href="https://cdn.firebase.com/libs/firepad/1.1.1/firepad.css" />
<script src="https://cdn.firebase.com/libs/firepad/1.1.1/firepad.min.js"></script>
{% endhighlight %}


### Initializing Firepad

To create a Firepad, you must initialize Firebase, CodeMirror and then Firepad.
Here is a typical setup for rich-text editing:

{% highlight html %}
<div id="firepad"></div>
<script>
  var firepadRef = new Firebase('<FIREBASE URL>');
  var codeMirror = CodeMirror(document.getElementById('firepad'), { lineWrapping: true });
  var firepad = Firepad.fromCodeMirror(firepadRef, codeMirror,
      { richTextShortcuts: true, richTextToolbar: true, defaultText: 'Hello, World!' });
</script>
{% endhighlight %}

Make sure to replace `<FIREBASE_URL>` with your own Firebase URL. Note that you can easily store multiple
Firepads in your Firebase by giving them each a unique URL
(e.g. `https://<YOUR FIREBASE>/firepads/<unique id>`).


### Customizing Your Editor

See the API section below for details on `Firepad.fromCodeMirror()` and the methods / events it provides.
You can check out [codemirror.net](http://codemirror.net/) for details on CodeMirror's API
(for turning on/off line numbers, line wrapping, code syntax highlighting, etc.).

To customize the size / position of the Firepad or customize its look and feel, you can use CSS:

{% highlight css %}
.firepad {
  width: 700px;
  height: 450px;
  background-color: #f62; /* dark orange background */
}

/* Note: CodeMirror applies its own styles which can be customized in the same way.
   To apply a background to the entire editor, we need to also apply it to CodeMirror. */
.CodeMirror {
  background-color: #f62;
}
{% endhighlight %}

The toolbar and other aspects can also be customized.  Take a look at firepad.css for a starting point.

<div class="emphasis-box">Firepad is also great for editing markdown, code, and just about anything else.
Check out the <a href="../examples/">examples page</a> for more embedding examples.</div>



<a name="getting_started_with_ace"> </a>

## Getting Started with Ace

To use <a href="http://ace.c9.io/" target="_blank">Ace</a> as the underlying code editor, follow the steps below.
Note that you cannot use Firepad with Ace for rich-text editing. If you want rich-text editing, go to [Getting Started with CodeMirror](#getting_started_with_codemirror) instead.


### Sign Up For Firebase

In order to embed Firepad into your own application, you must first <a href="https://www.firebase.com/signup/?utm_source=docs&utm_medium=email&utm_campaign=firepad" target="_blank">sign up for a free Firebase account</a>. This will automatically create a new Firebase for you whose URL you will use below.


### Adding Dependencies

Include Firebase, Ace, and Firepad in the &lt;head&gt; section of your page.

{% highlight html %}
<!-- Firebase -->
<script src="https://cdn.firebase.com/js/client/2.2.4/firebase.js"></script>

<!-- ACE -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.1.3/ace.js"></script>

<!-- Firepad -->
<link rel="stylesheet" href="https://cdn.firebase.com/libs/firepad/1.1.1/firepad.css" />
<script src="https://cdn.firebase.com/libs/firepad/1.1.1/firepad.min.js"></script>
{% endhighlight %}


### Initializing Firepad

To create a Firepad, you must initialize Firebase, Ace and then Firepad.
Here is a typical setup for code editing with Ace:

{% highlight html %}
<div id="firepad"></div>
<script>
  var firepadRef = new Firebase('<FIREBASE URL>');
  var editor = ace.edit('firepad');
  var firepad = Firepad.fromACE(firepadRef, editor);
</script>
{% endhighlight %}

Make sure to replace `<FIREBASE_URL>` with your own Firebase URL. Note that you can easily store multiple
Firepads in your Firebase by giving them each a unique URL
(e.g. `https://<YOUR FIREBASE>/firepads/<unique id>`).


### Customizing Your Editor

See the API section below for details on `Firepad.fromACE()` and the methods / events
it  provides.  You can check out [Ace] (http://ace.c9.io/) for details on Ace's API (for setting themes,
line highlighting, etc.)

To customize the size / position of the Firepad or customize its look and feel, you can use CSS:

{% highlight css %}
.firepad {
  width: 700px;
  height: 450px;
  background-color: #f62; /* dark orange background */
}
{% endhighlight %}

<div class="emphasis-box">Firepad is also great for editing markdown, code, and just about anything else.
Check out the <a href="../examples/">examples page</a> for more embedding examples.</div>



<a name="api"> </a>

# 2. Firepad API

## Constructing a Firepad

###From CodeMirror:
`Firepad.fromCodeMirror(firebaseRef, codeMirror, options)`

>Creates a new Firepad from the specified CodeMirror instance using the specified Firebase location to store data. The
>options hash can be used to customize behavior.
>
>Available Options:
>
>* `richTextToolbar` (default: false) - Adds a toolbar with buttons for bold, italic, etc.
>* `richTextShortcuts` (default: false) - Maps Ctrl-B to bold, etc.
>* `userId` (default: random) - The user ID for the person editing.
>* `userColor` (default: generated from userId) - A css color (e.g. "#ccc") for this user's cursor.
>* `defaultText` (default: null) - Text to initialize the Firepad with if history is empty.


###From Ace:
`Firepad.fromACE(firebaseRef, ace, options)`

>Creates a new Firepad from the specified Ace instance using the specified Firebase location to store data. The
>options hash can be used to customize behavior.
>
>Available Options:
>
>* `userId` (default: random) - The user ID for the person editing.
>* `userColor` (default: generated from userId) - A css color (e.g. "#ccc") for this user's cursor.
>* `defaultText` (default: null) - Text to initialize the Firepad with if history is empty.


## Firepad Methods

`firepad.on(eventType, callback);`

> Attaches a callback for the given event type. There are two events available for listening.

> The first, 'ready' fires once Firepad has retrieved the initial editor contents.  You
must wait for this event to fire before calling any other methods.

{% highlight javascript %}
firepad.on('ready', function() {
  // Firepad is ready.
});
{% endhighlight %}

> The second, 'synced', is fired when your local client edits the document and when those
> edits have been successfully written to Firebase.

{% highlight javascript %}
firepad.on('synced', function(isSynced) {
  // isSynced will be false immediately after the user edits the pad,
  // and true when their edit has been saved to Firebase.
});
{% endhighlight %}

`firepad.off(eventType, callback)`

> Removes the specified callback for the specified event type.

`firepad.getText()`
> Returns the current contents of Firepad as a string.

`firepad.setText(text)`
> Sets the contents of Firepad as a string.

`firepad.getHtml()`
> Gets the contents of Firepad as html.

`firepad.setHtml(text)`
> Sets the contents of Firepad as html.

`firepad.isHistoryEmpty()`
> Returns true if the Firepad has never had any content.  Useful for doing first-time initialization if defaultText is not specified.

`firepad.setUserId(userId)`
> Sets the user id to use for writing operations and storing cursor data.

`firepad.setUserColor(color)`
> Sets the color (as a css color, e.g. "#333") to use for this user's cursor.

`firepad.dispose()`
> Cleans everything up (clears presence data, DOM elements, Firebase listeners etc.)
> and returns CodeMirror to its original state.

`firepad.insertEntity(type, attributes, origin)`
> Inserts an entity of the specified type and with the specified attributes dictionary.
> To insert images, type = 'img' and attributes must contain 'src'; other attributes
> that can be provided are 'alt', 'width', 'height', 'style' and 'class'.

<a name="headless"> </a>

# 3. Headless Mode

Firepad also provides a headless mode for interacting with documents without a GUI. It runs in either NodeJS or the browser. In the former case, simply install the `firepad` npm module:

`npm install firepad`

and in your code:

{% highlight javascript %}
var Firepad = require('firepad')
var headless = new Firepad.Headless('<FIREBASE_URL>')
{% endhighlight %}

Alternatively, you can load Headless Firepad with a Firebase ref you create on your own. This is useful if you need to use `.push()` to create a ref or if you need to do any custom authentication.

In NodeJS, you'll also have to `npm install firebase`, and then:

{% highlight javascript %}
var Firepad  = require('firepad')
var Firebase = require('firebase')

var ref      = new Firebase('<FIREBASE_ROOT_URL>').push()
var headless = new Firepad.Headless(ref)
{% endhighlight %}

## Headless Methods

Headless supports a few methods with similar call signatures as regular Firepad, with the notable addition of a callback parameter.

`headless.getText(callback)` and `headless.getHtml(callback)` both function as follows:
{% highlight javascript %}
headless.getText(function(text) {
  console.log("Contents of firepad retrieved: " + text);
});
{% endhighlight %}

`headless.setText(text, callback)` and `headless.setHtml(html, callback)` as well:
{% highlight javascript %}
headless.setHtml('<b>Welcome to Firepad!</b>', function(err, committed) {
  // *err*       will be set if there was a catastrophic failure
  // *committed* will be true on success, or false if there was a history
  //               conflict writing to the pad's history.
});
{% endhighlight %}

When you don't need it any more, you should explicitly destroy it:
{% highlight javascript %}
headless.dispose();
{% endhighlight %}
If you just drop your references to the `Headless` object without calling `dispose()`, it will still listen to any changes in the underlying Firebase data and apply the changes in-memory.  Besides a memory leak you'll have a *bandwidth* and *CPU* leak.

<a name="firebase"> </a>

# 4. Firebase Data
Firepad uses [Firebase](https://www.firebase.com/?utm_source=docs&utm_medium=email&utm_campaign=firepad) for its data storage and synchronization. This means
you don't need to run any server code and you benefit from all the features of Firebase
(first-class data security, data accessibility, automatic scaling, etc.). It also means you own all of
the data and can interact with it in a variety of ways.

## Data Structure
Firepad stores your data at the Firebase location you specify using the following data structure:

* `users/`
    * `<user id>/` - You can specify this when initializing Firepad, else it will be random.
        * `cursor` - The location of the user's cursor (and selection).
        * `color` - The CSS color (e.g. "#2043df") for the user's cursor.
* `history/` - The sequence of revisions that make up the document.
    * `<revision id>/`
        * `a` - userid of the user that made the revision.
        * `o/` - array of operations that make up the revision.  See
          [text-operation.js](https://github.com/firebase/firepad/blob/master/lib/text-operation.js) for details.
* `checkpoint/`
    * `a` - userid of the user that created the checkpoint.
    * `rev` - revision at the time the checkpoint was taken.
    * `op/` - array of operations that made up the document at that revision.

You may find it useful to interact directly with the Firebase data when building related features on your site. For
example, the user list shown in the Firepad examples monitors the user data stored by Firepad and even adds its own
`name` data when you pick a username.
See the code or view the data in Forge (just enter your Firebase URL in a browser) for more details.

## Security
To lock down your Firepad data, you can use Firebase's builtin
[Security features](https://www.firebase.com/docs/security-quickstart.html?utm_source=docs&utm_medium=email&utm_campaign=firepad).  For some example
security rules, see these [example rules on Github](https://github.com/firebase/firepad/tree/master/examples/security).


<a name="extending"> </a>
# 5. Extending Firepad
Firepad is an open source project and is meant to be extended and customized. We'd love for the community
to help add support for more editors, extend the rich text capabilities, etc. If you want to take the plunge,
all of the instructions to check out the code and start modifying it are in the README on the
[Firepad github repo](https://github.com/firebase/firepad).  Check it out!

## Firepad Website
This website is also open source and is checked into the [gh-pages](https://github.com/firebase/firepad/tree/gh-pages)
branch of the Firepad repository.  Most of it is static HTML, but the docs page is generated from
Markdown using jekyll.
