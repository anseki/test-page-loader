/* eslint-env jasmine */
/* global loadPage:false */

describe('MyClass', function() {
  'use strict';

  describe('standOut() method', function() {
    var frameBody, myClass;

    beforeEach(function(done) {
      loadPage('spec/my-class/standOut.html', function(window, document, body) {
        frameBody = body;
        myClass = new window.MyClass(document.getElementById('target-standOut'));
        done(); // Make `it()` start when the page was loaded.
      }, 'standOut() method');
    });

    it('should set `light` class to the element when `<body>` has `dark` class', function() {
      frameBody.setAttribute('class', 'dark');
      myClass.standOut();
      expect(myClass.element.getAttribute('class')).toBe('light');
    });

    it('should set `dark` class to the element when `<body>` has `light` class', function() {
      frameBody.setAttribute('class', 'light');
      myClass.standOut();
      expect(myClass.element.getAttribute('class')).toBe('dark');
    });

  });

  // Same test with different pattern
  describe('standOut() method 2', function() {
    it('should set apposite class to the element', function(done) {

      loadPage('spec/my-class/standOut.html', function(window, document, body) {
        var myClass = new window.MyClass(document.getElementById('target-standOut'));
        body.setAttribute('class', 'dark');
        myClass.standOut();
        expect(myClass.element.getAttribute('class')).toBe('light');
      }, '`<body>` has `dark` class');

      loadPage('spec/my-class/standOut.html', function(window, document, body) {
        var myClass = new window.MyClass(document.getElementById('target-standOut'));
        body.setAttribute('class', 'light');
        myClass.standOut();
        expect(myClass.element.getAttribute('class')).toBe('dark');
        done(); // Make `it()` finish.
      }, '`<body>` has `light` class');

    });
  });

  describe('goLeftTop() method', function() {
    var LEN = {
      'document-margin': 4,
      'document-border': 8,
      'document-padding': 16,
      'body-margin': 32,
      'body-border': 64,
      'body-padding': 0 // not affect
    };

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
    ].forEach(function(condition) {
      var title = 'enabled properties: ' + condition.props.join(', '),
        len = condition.props.reduce(function(sum, prop) { return (sum += LEN[prop]); }, 0);
      it(title, function(done) {

        loadPage('spec/my-class/' + condition.file, function(window, document) {
          var myClass = new window.MyClass(document.getElementById('target-goLeftTop')),
            styles = myClass.element.style;
          myClass.goLeftTop();
          expect({left: parseFloat(styles.left), top: parseFloat(styles.top)})
            .toEqual({left: 0 - len, top: 0 - len}); // To aboid `-0`
          done();
        }, title);

      });
    });
  });
});
