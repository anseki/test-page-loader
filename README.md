# Page Loader for Testing

This is a simple helper that is used with JavaScript Testing Frameworks (e.g. [Jasmine](http://jasmine.github.io/), [QUnit](https://qunitjs.com/), etc.), and it loads HTML pages as fixtures.  
If you want more features, other great tool such as [jasmine-jquery](https://github.com/velesin/jasmine-jquery) that has many matchers and jQuery supporting will help you.

Features of Page Loader for Testing:

- Load HTML pages into `<iframe>`. This is useful for tests that need running based on document (i.e. window, `<body>`, etc.). For example, various document situations are needed for testing a function that finds something in all of the document or a function does something according to current style of `<body>`.
- Don't remove the `<iframe>`s that were used for each test and show those on main page, if you want. This is useful for tests that should be checked by looking in addition to the test.
- No dependency library. You need to add just only one file, and this works without depending on anything (even Testing Framework).
