---
layout: docs
permalink: index.html
---

<a name="getting_started"> </a>

# 1. Getting Started

Firepad was designed to be embedded inside larger applications. Since it uses [Firebase](https://www.firebase.com/) as a backend it
requires no server-side code and can be added to any web app simply by including the JavaScript files.
Here we'll explain how to do this.

## Prerequisites

Firepad uses [CodeMirror](http://www.codemirror.net/) as the underlying text editor (though we'd love to add
support for other editors in the future), and it uses Firebase for data storage and synchronization.

Before getting started, you'll need to:

- <a href="http://www.firepad.io/firepad.zip">Download Firepad</a>
- <a href="http://codemirror.net/" target="_blank">Download CodeMirror</a>
- <a href="https://www.firebase.com/signup/" target="_blank">Create a Firebase account</a> (it's free)

## Adding Dependencies

Include Firebase, CodeMirror, and Firepad in the &lt;head&gt; section of your page.

{% highlight html %}
    <script src="https://cdn.firebase.com/v0/firebase.js"></script>

    <!-- Download from http://codemirror.net/codemirror.zip -->
    <link rel="stylesheet" href="codemirror.css" />
    <script src="codemirror.js"></script>

    <!-- Download from http://www.firepad.io/firepad.zip -->
    <link rel="stylesheet" href="firepad.css" />
    <script src="firepad.js"></script>
{% endhighlight %}


## Initializing Firepad

To create a Firepad, you must initialize Firebase, CodeMirror, and then Firepad.  Here is a typical setup
for rich-text editing:

{% highlight html %}
    <div id="firepad"></div>
    <script>
      var firepadRef = new Firebase('<FIREBASE URL>');
      var codeMirror = CodeMirror(document.getElementById('firepad'), { lineWrapping: true });
      var firepad = Firepad.fromCodeMirror(firepadRef, codeMirror,
          { richTextShortcuts: true, richTextToolbar: true });
    </script>
{% endhighlight %}

Make sure to replace `<FIREBASE_URL>` with a Firebase location. Note that you can easily store multiple
Firepads in your Firebase by giving them each a unique URL
(e.g. `https://<YOUR FIREBASE>/firepads/<unique id>`).

## Customizing Your Editor

See the API section below for details on `Firepad.fromCodeMirror()` and the methods / events
it provides.  You can check out [codemirror.net](http://codemirror.net/) for details on CodeMirror's API
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

<a name="api"> </a>



# 2. Firepad API

## Constructing a Firepad

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
> Gets the contents of Firepad as a string containing html tags (`<b>` for bold, `<i>` for italic, etc.)

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
Firepad uses [Firebase](https://www.firebase.com/) for its data storage and synchronization. This means
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
[Security features](https://www.firebase.com/docs/security-quickstart.html).  For some example
security rules, see these [example rules on Github](https://github.com/firebase/firepad/tree/master/examples/security).


<a name="extending"> </a>
# 4. Extending Firepad
Firepad is an open source project and is meant to be extended and customized. We'd love for the community
to help add support for more editors, extend the rich text capabilities, etc. If you want to take the plunge,
read on!

## Setting Up Your Environment
Before you get started, you'll need [node.js](http://nodejs.org/) installed, since Firepad uses
[grunt](http://gruntjs.com/) to automate some build tasks (generating firepad.js, minifying it, etc.).
Then you can simply clone the repo, install the necessary node modules, and run grunt:

{% highlight bash %}
    git clone https://github.com/firebase/firepad.git
    cd firepad
    npm install
    npm install -g grunt-cli
    grunt
{% endhighlight %}

## Source Code
To get started, here are some highlights of the directory structure and notable source files:

* `build/` - output directory for all files generated by grunt (firepad.js, firepad-min.js, firepad.zip, etc.).
* `examples` - examples of embedding Firepad.
* `lib/`
    * `firepad.js` - Entry point for Firepad.
    * `text-operation.js`, `client.js` - Heart of the Operation Transformation implementation.  Based on
      [ot.js](https://github.com/Operational-Transformation/ot.js/) but extended to allow arbitrary
      attributes on text (for representing rich-text).
    * `annotation-list.js` - A data model for representing annotations on text (i.e. spans of text with a particular
      set of attributes).
    * `rich-text-codemirror.js` - Uses AnnotationList to track annotations on the text and maintain the appropriate
      set of markers on a CodeMirror instance.
    * `firebase-adapter.js` - handles integration with Firebase (appending operations, triggering retries,
      presence, etc.).
* `test/` - Jasmine tests for Firepad (many of these were borrowed from ot.js).

## Firepad Website
This website is checked into the [gh-pages](https://github.com/firebase/firepad/tree/gh-pages)
branch of the Firepad repository.  Most of it is static HTML, but the docs page is generated from
Markdown using jekyll.

That's it!  Feel free to reach us at [firepad@firebase.com](mailto:firepad@firebase.com) with any questions,
concerns, etc.!