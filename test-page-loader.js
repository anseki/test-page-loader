/*
 * test-page-loader
 * https://github.com/anseki/test-page-loader
 *
 * Copyright (c) 2021 anseki
 * Licensed under the MIT license.
 */

/* exported loadPage */

var loadPage = (function() {
  'use strict';

  var
    STATE_STOP = 1,
    STATE_LOADING = 2,
    STATE_RUNNING = 3,
    DEFAULT_ERROR_MSG = 'Couldn\'t load the page: ',
    CSS_TEXT = '.test-page-loader-hide{position:absolute;left:-600px;width:500px}.test-page-loader-static{display:block;margin:0 0 5px;box-sizing:border-box;width:100%;height:0;border:2px solid silver;transition:height 200ms ease 0s}.test-page-loader-static:nth-last-of-type(1){margin-bottom:20px}.test-page-loader-head{margin:0;padding:3px 5px 0;background-color:silver;cursor:pointer;font-size:1em;font-family:Monaco,"Lucida Console",monospace}',

    state = STATE_STOP,

    /** @typedef {{url, ready, title}} PageConf */
    /** @type {PageConf[]} */
    queue = [],

    /** @typedef {{frame, head}} FrameView */
    /** @type {FrameView[]} */
    frames = [],

    body, styleHasAdded, startTimer, frameH, elmA;

  function resolveURL(url) {
    var objUrl;
    try {
      objUrl = new URL(url, location.href);
      if (objUrl.href) { return objUrl.href; }
    } catch (error) { /* ignore */ }
    // TRIDENT has no URL, URL in WEBKIT has no href
    elmA = elmA || document.createElement('a');
    elmA.href = url;
    if (!elmA.href) { throw new Error('Can\'t get URL'); }
    return elmA.href;
  }

  function createFrame(url, cb) {
    var frame, frameView;

    function loaded() {
      var frameWindow = frame.contentWindow;
      if (frameWindow.location.href !== resolveURL(url)) { return; } // for Chrome
      frame.removeEventListener('load', loaded, false);
      cb(frameView, frameWindow);
    }

    frame = document.createElement('iframe');
    frame.className = 'test-page-loader-hide';
    frame.addEventListener('load', loaded, false);
    (function(listener) {
      frame.addEventListener('error', listener, false);
      frame.addEventListener('abort', listener, false);
    })(function() { throw new Error(DEFAULT_ERROR_MSG + url); });

    body.insertBefore(frame,
      frames.length && frames[frames.length - 1].frame.nextSibling || body.firstChild);
    frames.push((frameView = {frame: frame}));
    state = STATE_LOADING;
    frame.src = url;
  }

  function setHeight(height, frame, styles, withAnim) {
    styles.transitionProperty = withAnim ? 'height' : 'none';
    frame.offsetWidth; /* force reflow */ // eslint-disable-line no-unused-expressions
    styles.height = height + 'px';
  }

  function resetFrameH() {
    var head1, rect;
    if (frames.some(function(frameView) {
      head1 = frameView.head;
      return !!frameView.head;
    })) {
      rect = head1.getBoundingClientRect();
      frameH = document.documentElement.clientHeight - (rect.bottom + window.pageYOffset);

      frames.forEach(function(frameView) {
        var frame, styles;
        if (frameView.head && parseFloat((styles = (frame = frameView.frame).style).height) > 1) {
          setHeight(frameH, frame, styles);
        }
      });
    }
  }

  function setStatic(frameView, title) {
    var frame = frameView.frame,
      styles = frame.style,
      head = document.createElement('h2');
    head.className = 'test-page-loader-head';
    head.textContent = title;
    head.addEventListener('click', function() {
      setHeight(parseFloat(styles.height) > 1 ? '0' : frameH, frame, styles, true);
    }, false);

    setHeight(0, frame, styles);
    frame.className = 'test-page-loader-static';
    body.insertBefore(head, frame);
    frameView.head = head;
    resetFrameH();
    head.scrollIntoView();
  }

  function nextPage() {
    var page;

    clearTimeout(startTimer);
    if (state !== STATE_STOP || !queue.length) { return; }

    page = queue.shift();
    createFrame(page.url, function(frameView, frameWindow) {
      var frameDocument = frameView.frame.contentDocument,
        frameBody = frameDocument.body;

      function done() {
        var i;
        state = STATE_STOP;
        if (page.title != null) {
          setStatic(frameView, page.title);
        } else {
          if ((i = frames.indexOf(frameView)) > -1) { frames.splice(i, 1); }
          body.removeChild(frameView.frame);
        }
        startTimer = setTimeout(nextPage, 0);
      }

      if (page.title != null && !frameDocument.title) { frameDocument.title = page.title; }
      frameWindow.setTitle = function(title) {
        page.title = title;
        if (page.title != null && !frameDocument.title) { frameDocument.title = page.title; }
      };

      state = STATE_RUNNING;
      if (page.ready.length >= 4) { // Wait for `done` is called.
        page.ready(frameWindow, frameDocument, frameBody, done);
      } else {
        page.ready(frameWindow, frameDocument, frameBody);
        done();
      }
    });
  }

  function init() {
    var sheet;
    if (!styleHasAdded) { // Add style rules
      body = document.body;
      if (document.createStyleSheet) { // IE
        sheet = document.createStyleSheet();
        sheet.cssText = CSS_TEXT;
      } else {
        sheet = (document.getElementsByTagName('head')[0] || document.documentElement)
          .appendChild(document.createElement('style'));
        sheet.type = 'text/css';
        sheet.textContent = CSS_TEXT;
      }
      styleHasAdded = true;
    }
  }

  /**
   * @callback readyCallback
   * @param {Window} window
   * @param {HTMLDocument} document
   * @param {HTMLBodyElement} body
   * @param {Function} [done]
   */

  /**
   * @param {string} url - The URL to load.
   * @param {readyCallback} ready - Callback function that is called when the
   *    page was loaded.
   * @param {string} [title] - A string that is shown as each header.
   * @returns {void}
   */
  function loadPage(url, ready, title) {
    queue.push({url: url, ready: ready, title: title});
    if (document.readyState === 'complete') {
      init();
      startTimer = setTimeout(nextPage, 0);
    } else {
      document.addEventListener('DOMContentLoaded', function() {
        init();
        startTimer = setTimeout(nextPage, 0);
      }, false);
    }
  }

  window.addEventListener('resize', resetFrameH);

  return loadPage;
})();
