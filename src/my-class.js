/* exported MyClass */

var MyClass = (function() {
  'use strict';

  function MyClass(element) {
    this.element = element;
  }

  MyClass.prototype.standOut = function() {
    this.element.setAttribute('class',
      document.body.getAttribute('class') === 'dark' ? 'light' : 'dark');
  };

  MyClass.prototype.goLeftTop = function() {
    var docStyles = getComputedStyle(document.documentElement),
      bodyStyles = getComputedStyle(document.body),
      myStyles = this.element.style;

    myStyles.left = -parseFloat(bodyStyles.borderLeftWidth) -
      parseFloat(bodyStyles.marginLeft) -
      parseFloat(docStyles.paddingLeft) -
      parseFloat(docStyles.borderLeftWidth) -
      parseFloat(docStyles.marginLeft) + 'px';
    myStyles.top = -parseFloat(bodyStyles.borderTopWidth) -
      parseFloat(bodyStyles.marginTop) -
      parseFloat(docStyles.paddingTop) -
      parseFloat(docStyles.borderTopWidth) -
      parseFloat(docStyles.marginTop) + 'px';
    // In actuality, `getBoundingClientRect` should be used.
  };

  return MyClass;
})();
