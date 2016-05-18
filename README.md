# Page Loader for Testing

This is a simple helper that is used for unit testing with JavaScript Testing Frameworks (e.g. [Jasmine](http://jasmine.github.io/), [QUnit](https://qunitjs.com/), etc.), and it loads HTML pages as fixtures.  
(If you want more features, other great tools such as [jasmine-jquery](https://github.com/velesin/jasmine-jquery) that has many matchers and jQuery supporting will help you.)

Features:

- Load HTML pages into `<iframe>` instead of an element like `div#qunit-fixture`. This is useful for tests that need running based on document (i.e. window, `<body>`, etc.). For example, various document situations are needed for testing a function that finds something in all of the document or a function does something according to current style of `<body>`. Or the testing for something that affects the document.
- Don't remove the `<iframe>`s that were used for each test and show those on main page, if you want. This is useful for tests that should be checked by looking in addition to the test.
- No dependency library. You need to add just only one file, and this works without depending on anything (even Testing Framework).

## Usage

Add a file `test-page-loader.js` into your main page that is "test runner".

```html
<script src="path/to/test-page-loader.js"></script>
```

A function `loadPage` is provided in global scope (i.e. window).

## `loadPage`

```js
loadPage(url, ready[, title])
```

### `url`

*Type:* string

An URL of the HTML page to load.  
A new `<iframe>` element is added to the main page, and then this URL is loaded.

### `ready`

*Type:* Function

```js
ready(window, document, body[, done])
```

A callback function that is called when the page that was specified by [`url`](#url) was loaded.  
Your test code usually be written in this function, or another function that is called in this function.  
In this function, `window` points a window of `<iframe>` that loaded the [`url`](#url) (i.e. `iframe.contentWindow`). `document` and `body` also are those of `<iframe>` (i.e. these are shortcut to `iframe.contentDocument` and `iframe.contentDocument.body`).  
See [Asynchronous Support](#asynchronous-support) for `done`.

For example, Jasmine:

```js
loadPage('spec/foo-class/bar-method.html', function(window, document, body) {
  body.appendChild(document.createElement('div')); // `body` and `document` in `<iframe>`
  expect(document.getElementsByTagName('div').length).toBeGreaterThan(0);
});
```

QUnit:

```js
loadPage('spec/foo-class/bar-method.html', function(window, document, body) {
  body.appendChild(document.createElement('div')); // `body` and `document` in `<iframe>`
  assert.ok(document.getElementsByTagName('div').length > 0);
});
```

### `title`

*Type:* string

By default, an `<iframe>` element is removed when the testing that used it was finished.  
If the `title` argument is given, the `<iframe>` is kept and shown in the main page for result that should be checked by looking in addition to the test.  
You can pass a string as a heading of the `<iframe>`. If you want to pass the same title to methods of Testing Framework, you can get the title that was specified to it by `document.title` (i.e. a title of the document that is loaded into `<iframe>`). Note that a `document.title` is not changed if it is already set.

For example, Jasmine:

```js
// `fixture.html` has no `<title>`.
loadPage('fixture.html', function(window, document, body) {
  it(document.title, function() { // Jasmine prints "FOO should be BAR" in result list.
    // Do something ...
  });
}, 'FOO should be BAR');
```

QUnit:

```js
// `fixture.html` has no `<title>`.
loadPage('fixture.html', function(window, document, body) {
  // Do something ...
  assert.equal(true, true, document.title); // QUnit prints "FOO should be BAR" in result list.
}, 'FOO should be BAR');
```

## Asynchronous Support

If `loadPage` is called multiple times, each requested page is loaded in turn.  
By default, loading next page starts when current `ready` callback was exited. You can make the next loading wait by making the `ready` callback take `done` argument. `done` is callback function, and loading next page waits until `done` callback is called.

For example:

```js
loadPage('page-1.html', function(window, document, body, done) {
  setTimeout(function() {
    done(); // After 3sec., start loading `page-2.html`.
  }, 3000);
  // `ready` is exited here, but don't start loading `page-2.html` yet.
});

loadPage('page-2.html', function(window, document, body) {
  // Do something ...
});
```

Note that testing functions of some Testing Framework such as Jasmine work inside of each function scope. Therefore, for example, `it()` function that is called in `ready` callback doesn't work.  
If you want to control the sequence of loading pages and testing those, controlling timing to call `loadPage` by Testing Framework (e.g. `done` of Jasmine or `assert.async()` of QUnit) is better than controlling timing to call testing functions by `done` of `ready` callback. (See [Examples](#examples).)

## Examples

You need [Node.js](https://nodejs.org/) (and NPM) installed and available in your `$PATH`.

Run the following commands:

```
cd examples
npm install
node httpd
```

And then, access to the following by web browser:

- http://localhost:8080/test/Jasmine.html
- http://localhost:8080/test/QUnit.html
