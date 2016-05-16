/*
 * Page Loader for Testing
 * https://github.com/anseki/test-page-loader
 *
 * Copyright (c) 2016 anseki
 * Licensed under the MIT license.
 */

/* exported loadPage */

var loadPage = (function() {
  'use strict';

  var
    STAT_STOP = 1, STAT_LOADING = 2, STAT_RUNNING = 3,
    DEFAULT_ERROR_MSG = 'Couldn\'t load the page: ',
    BODY = document.body,
    CSS_TEXT = '.test-page-loader-hide{position:absolute;left:-600px;width:500px}.test-page-loader-static{margin:0 0 10px;box-sizing:border-box;width:100%;height:0;border:2px solid silver;transition:height 200ms ease 0s}.test-page-loader-head{margin:0;padding:3px 5px;background-color:silver;cursor:pointer}',

    stat = STAT_STOP,
    queue = [],
    addedStyle, startTimer, frameH, head1, frames = [], elmA;

  function resolveURL(url) {
    var objUrl;
    try {
      objUrl = new URL(url, location.href);
      return objUrl.href;
    } catch (error) {
      elmA = elmA || document.createElement('a');
      elmA.href = url;
      return elmA.href;
    }
  }

  function createFrame(url, cb) {
    var iframe;

    function loaded() {
      var frameWindow = iframe.contentWindow;
      if (frameWindow.location.href !== resolveURL(url)) { return; } // for Chrome
      iframe.removeEventListener('load', loaded, false);
      cb(iframe, frameWindow);
    }

    iframe = document.createElement('iframe');
    iframe.setAttribute('class', 'test-page-loader-hide');
    iframe.addEventListener('load', loaded, false);
    (function(listener) {
      iframe.addEventListener('error', listener, false);
      iframe.addEventListener('abort', listener, false);
    })(function() { throw new Error(DEFAULT_ERROR_MSG + url); });

    BODY.appendChild(iframe);
    stat = STAT_LOADING;
    iframe.src = url;

    return iframe;
  }

  function setHeight(height, iframe, styles, withAnim) {
    styles.transitionProperty = withAnim ? 'height' : 'none';
    iframe.offsetWidth; /* force reflow */ // eslint-disable-line no-unused-expressions
    styles.height = height + 'px';
  }

  function resetH() {
    var rect;
    if (head1) {
      rect = head1.getBoundingClientRect();
      frameH = document.documentElement.clientHeight - (rect.bottom + window.pageYOffset);

      frames.forEach(function(iframe) {
        var styles = iframe.style;
        if (parseFloat(styles.height) > 1) { setHeight(frameH, iframe, styles); }
      });
    }
  }

  function setStatic(iframe, title) {
    var head = document.createElement('h2'),
      styles = iframe.style;
    head.setAttribute('class', 'test-page-loader-head');
    head.textContent = title;
    head.addEventListener('click', function() {
      setHeight(parseFloat(styles.height) > 1 ? '0' : frameH, iframe, styles, true);
    }, false);

    setHeight(0, iframe, styles);
    iframe.setAttribute('class', 'test-page-loader-static');
    BODY.insertBefore(head, iframe);

    head1 = head1 || head;
    resetH();
    frames.push(iframe);
  }

  function nextPage() {
    var page;

    clearTimeout(startTimer);
    if (stat !== STAT_STOP || !queue.length) { return; }

    page = queue.shift();
    createFrame(page.url, function(iframe, frameWindow) {
      var frameDocument = iframe.contentDocument,
        frameBody = frameDocument.body;

      function finish() {
        stat = STAT_STOP;
        if (page.title != null) { // eslint-disable-line eqeqeq
          setStatic(iframe, page.title);
        } else {
          BODY.removeChild(iframe);
        }
        startTimer = setTimeout(nextPage, 0);
      }

      stat = STAT_RUNNING;
      if (page.cb.length >= 4) { // Wait for `done` is called.
        page.cb(frameWindow, frameDocument, frameBody, finish);
      } else {
        page.cb(frameWindow, frameDocument, frameBody);
        finish();
      }
    });
  }

  function addStyle() { // Add style rules
    var sheet;
    if (!addedStyle) {
      if (document.createStyleSheet) { // IE
        sheet = document.createStyleSheet();
        sheet.cssText = CSS_TEXT;
      } else {
        sheet = (document.getElementsByTagName('head')[0] || document.documentElement)
          .appendChild(document.createElement('style'));
        sheet.type = 'text/css';
        sheet.textContent = CSS_TEXT;
      }
      addedStyle = true;
    }
  }

  /**
   * @param {string} url - The URL to load.
   * @param {Function} cb - Callback function that is called when the page was loaded.
   * @param {string} [title] - A string that is shown as each header.
   * @returns {void}
   */
  function loadPage(url, cb, title) {
    queue.push({url: url, cb: cb, title: title});
    if (document.readyState === 'complete') {
      addStyle();
      startTimer = setTimeout(nextPage, 0);
    } else {
      document.addEventListener('DOMContentLoaded', function() {
        addStyle();
        startTimer = setTimeout(nextPage, 0);
      }, false);
    }
  }

  window.addEventListener('resize', resetH);

  return loadPage;
})();
