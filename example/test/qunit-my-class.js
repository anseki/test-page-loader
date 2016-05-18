/* eslint-env qunit */
/* global loadPage:false */

(function() {
  'use strict';

  QUnit.module('MyClass');

  QUnit.test('standOut() method 2', function(assert) {
    var done = assert.async();

    loadPage('spec/my-class/standOut.html', function(window, document, body) {
      var myClass = new window.MyClass(document.getElementById('target-standOut'));
      body.setAttribute('class', 'dark');
      myClass.standOut();
      assert.strictEqual(myClass.element.getAttribute('class'), 'light', document.title);
    }, 'should set `light` class to the element when `<body>` has `dark` class');

    loadPage('spec/my-class/standOut.html', function(window, document, body) {
      var myClass = new window.MyClass(document.getElementById('target-standOut'));
      body.setAttribute('class', 'light');
      myClass.standOut();
      assert.strictEqual(myClass.element.getAttribute('class'), 'dark', document.title);
      done(); // Make `QUnit.test()` finish.
    }, 'should set `dark` class to the element when `<body>` has `light` class');
  });

  QUnit.test('goLeftTop() method', function(assert) {
    var LEN = {
        'document-margin': 4,
        'document-border': 8,
        'document-padding': 16,
        'body-margin': 32,
        'body-border': 64,
        'body-padding': 0 // not affect
      },
      done = assert.async();

    [
      {
        file: 'goLeftTop-1.html',
        props: ['document-margin', 'document-border', 'document-padding']
      },
      {
        file: 'goLeftTop-2.html',
        props: ['body-margin', 'body-border', 'body-padding']
      },
      {
        file: 'goLeftTop-3.html',
        props: ['document-padding', 'body-margin', 'body-border']
      },
      {
        file: 'goLeftTop-4.html',
        props: ['document-margin', 'body-padding']
      },
      {
        file: 'goLeftTop-5.html',
        props: ['document-margin', 'document-border', 'document-padding', 'body-margin', 'body-border', 'body-padding']
      },
      {
        file: 'goLeftTop-6.html',
        props: []
      }
    ].forEach(function(condition, i, array) {
      var title = 'enabled properties: ' + condition.props.join(', '),
        len = condition.props.reduce(function(sum, prop) { return (sum += LEN[prop]); }, 0);

      loadPage('spec/my-class/' + condition.file, function(window, document) {
        var myClass = new window.MyClass(document.getElementById('target-goLeftTop')),
          styles = myClass.element.style;
        myClass.goLeftTop();
        assert.deepEqual({left: parseFloat(styles.left), top: parseFloat(styles.top)},
          {left: 0 - len, top: 0 - len}, document.title);
        if (i >= array.length - 1) { done(); }
      }, title);

    });
  });

})();
