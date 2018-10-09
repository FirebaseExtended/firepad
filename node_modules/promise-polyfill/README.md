# Promise Polyfill

[![travis][travis-image]][travis-url]

[travis-image]: https://img.shields.io/travis/taylorhakes/promise-polyfill.svg?style=flat
[travis-url]: https://travis-ci.org/taylorhakes/promise-polyfill

Lightweight ES6 Promise polyfill for the browser and node. Adheres closely to
the spec. It is a perfect polyfill IE, Firefox or any other browser that does
not support native promises.

For API information about Promises, please check out this article
[HTML5Rocks article](http://www.html5rocks.com/en/tutorials/es6/promises/).

It is extremely lightweight. **_< 1kb Gzipped_**

## Browser Support

IE8+, Chrome, Firefox, IOS 4+, Safari 5+, Opera

### NPM Use

```
npm install promise-polyfill --save-exact
```

### Bower Use

```
bower install promise-polyfill
```

### CDN Polyfill Use

```html
<script src="https://cdn.jsdelivr.net/npm/promise-polyfill@7/dist/polyfill.min.js"></script>
```

## Downloads

* [Promise](https://raw.github.com/taylorhakes/promise-polyfill/master/dist/promise.js)
* [Promise-min](https://raw.github.com/taylorhakes/promise-polyfill/master/dist/promise.min.js)

## Simple use

```js
import Promise from 'promise-polyfill';
```

then you can use like normal Promises

```js
var prom = new Promise(function(resolve, reject) {
  // do a thing, possibly async, then…

  if (/* everything turned out fine */) {
    resolve("Stuff worked!");
  }  else {
    reject(new Error("It broke"));
  }
});

prom.then(function(result) {
  // Do something when async done
});
```

If you would like to just polyfill, only if native doesn't exist.

```js
import 'promise-polyfill/src/polyfill';
```

## Performance

By default promise-polyfill uses `setImmediate`, but falls back to `setTimeout`
for executing asynchronously. If a browser does not support `setImmediate`
(IE/Edge are the only browsers with setImmediate), you may see performance
issues. Use a `setImmediate` polyfill to fix this issue.
[setAsap](https://github.com/taylorhakes/setAsap) or
[setImmediate](https://github.com/YuzuJS/setImmediate) work well.

If you polyfill `window.setImmediate` or use `Promise._immediateFn = yourImmediateFn` it will be used instead of `window.setTimeout`

```
npm install setasap --save
```

```js
import Promise from 'promise-polyfill/src/polyfill';
import setAsap from 'setasap';
Promise._immediateFn = setAsap;
```

## Unhandled Rejections

promise-polyfill will warn you about possibly unhandled rejections. It will show
a console warning if a Promise is rejected, but no `.catch` is used. You can
change this behavior by doing.

```js
Promise._unhandledRejectionFn = <your reject error handler>;
```

If you would like to disable unhandled rejection messages. Use a noop like
below.

```js
Promise._unhandledRejectionFn = function(rejectError) {};
```

## Testing

```
npm install
npm test
```

## License

MIT
