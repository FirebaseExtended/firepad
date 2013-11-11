---
layout: docs
permalink: index.html
---

<a name="getting_started"> </a>

# 1. Getting Started

Firepad was designed to be embedded inside larger applications. Since it uses [Firebase](https://www.firebase.com/?utm_source=docs&utm_medium=email&utm_campaign=firepad) as a backend it
requires no server-side code and can be added to any web app simply by including the JavaScript files.
Here we'll explain how to do this.

## Prerequisites

Firepad uses [CodeMirror](http://www.codemirror.net/) as the underlying text editor for rich-text editing and can use either CodeMirror or [Ace](http://ace.c9.io/)
for code editing (we'd love to add support for other editors in the future!). It uses Firebase for data storage and synchronization.

Before getting started, you'll need to:

- <a href="http://www.firepad.io/firepad.zip">Download Firepad</a>
- Download <a href="http://codemirror.net/" target="_blank">CodeMirror</a> or <a href="http://ace.c9.io/">Ace</a>
- <a href="https://www.firebase.com/signup/?utm_source=docs&utm_medium=email&utm_campaign=firepad" target="_blank">Create a Firebase account</a> (it's free)

## Adding Dependencies

Include Firebase, CodeMirror/Ace and Firepad in the &lt;head&gt; section of your page.

{% highlight html %}
    <script src="https://cdn.firebase.com/v0/firebase.js"></script>

    <!-- CODEMIRROR: Download from http://codemirror.net/codemirror.zip -->
    <link rel="stylesheet" href="codemirror.css" />
    <script src="codemirror.js"></script>

    <!-- ACE: Download from https://github.com/ajaxorg/ace-builds/ -->
    <script src="ace.js" type="text/javascript" charset="utf-8"></script>

    <!-- Download from http://www.firepad.io/firepad.zip -->
    <link rel="stylesheet" href="firepad.css" />
    <script src="firepad.js"></script>
{% endhighlight %}


## Initializing Firepad

To create a Firepad, you must initialize Firebase, CodeMirror/Ace and then Firepad.
For rich-text editing, you can only use CodeMirror. Here is a typical setup:

{% highlight html %}
    <div id="firepad"></div>
    <script>
      var firepadRef = new Firebase('<FIREBASE URL>');
      var codeMirror = CodeMirror(document.getElementById('firepad'), { lineWrapping: true });
      var firepad = Firepad.fromCodeMirror(firepadRef, codeMirror,
          { richTextShortcuts: true, richTextToolbar: true });
    </script>
{% endhighlight %}

For code editing, you can use either CodeMirror or Ace. Here is a typical setup for
code editing with Ace:

{% highlight html %}
    <div id="firepad"></div>
    <script>
      var firepadRef = new Firebase('<FIREBASE URL>');
      var editor = ace.edit('firepad');
      editor.setTheme("ace/theme/monokai");
      editor.getSession().setMode("ace/mode/javascript");    
      var firepad = Firepad.fromACE(firepadRef, editor);
    </script>
{% endhighlight %}

Make sure to replace `<FIREBASE_URL>` with a Firebase location. Note that you can easily store multiple
Firepads in your Firebase by giving them each a unique URL
(e.g. `https://<YOUR FIREBASE>/firepads/<unique id>`).

## Customizing Your Editor

See the API section below for details on `Firepad.fromCodeMirror()`/`Firepad.fromACE()` and the methods / events
they provide.  You can check out [codemirror.net](http://codemirror.net/) for details on CodeMirror's API
(for turning on/off line numbers, line wrapping, code syntax highlighting, etc.) and [Ace] (http://ace.c9.io/) for details on Ace's API (for setting themes,
line highlighting, etc.)

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


###From Ace:
`Firepad.fromACE(firebaseRef, ace, options)`

>Creates a new Firepad from the specified Ace instance using the specified Firebase location to store data. The
>options hash can be used to customize behavior.
>
>Available Options:
>
>* `userId` (default: random) - The user ID for the person editing.
>* `userColor` (default: generated from userId) - A css color (e.g. "#ccc") for this user's cursor.


## Firepad Methods

`firepad.on(eventType, callback);`

>Attaches a callback for the given event type. 
>
>There is presently only one event, 'ready' which fires once Firepad has retrieved the initial editor contents.  You
>must wait for this event to fire before calling any other methods. 

{% highlight javascript %}
    firepad.on('ready', function() {
      // Firepad is ready.
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
> Returns true if the Firepad has never had any content.  Useful for doing first-time initialization.

`firepad.setUserId(userId)`
> Sets the user id to use for writing operations and storing cursor data.

`firebase.setUserColor(color)`
> Sets the color (as a css color, e.g. "#333") to use for this user's cursor.

`firepad.dispose()`
> Cleans everything up (clears presence data, DOM elements, etc.) and returns CodeMirror
  to its original state.


<a name="firebase"> </a>

# 3. Firebase Data
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
# 4. Extending Firepad
Firepad is an open source project and is meant to be extended and customized. We'd love for the community
to help add support for more editors, extend the rich text capabilities, etc. If you want to take the plunge,
all of the instructions to check out the code and start modifying it are in the README on the
[Firepad github repo](https://github.com/firebase/firepad).  Check it out!

## Firepad Website
This website is also open source and is checked into the [gh-pages](https://github.com/firebase/firepad/tree/gh-pages)
branch of the Firepad repository.  Most of it is static HTML, but the docs page is generated from
Markdown using jekyll.

