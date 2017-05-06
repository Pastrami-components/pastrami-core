import { nextTock } from '../util';
import { inject } from '../injector';

export default function Constructor(elements, elementUid, elementSelector) {
  return {
    findParent: findParent,
    findChild: findChild,
    findSibling: findSibling
  };


  function findParent(selector) {
    var callback = arguments[arguments.length-1];

    nextTock(function () {
      var node = elements[elementUid][elementSelector].element;
      var i = 0;
      var parent = node.parentNode;
      while (parent && parent !== document.documentElement) {
        i += 1;
        if (parent.uid && elements[parent.uid] && elements[parent.uid][selector]) {
          inject(callback, {
            element: elements[parent.uid][selector].element,
            ctrl: elements[parent.uid][selector].controller,
            model: elements[parent.uid][selector].model
          })();
          return;
        }
        parent = parent.parentNode;
      }
    });
  }

  function findChild(selector, callback) {
    nextTock(function () {
      var node = elements[elementUid][elementSelector].element;
      var child;
      var i = 0
      var children = node.childNodes;
      var length = children.length;
      while (i < length) {
        child = children[i];
        i += 1;
        if (elements[child.uid] && elements[child.uid][selector]) {
           callback(elements[child.uid][selector].controller);
           return;
        }
      }
    });
  }

  function findSibling(selector, callback) {
    nextTock(function () {
      var node = elements[elementUid][elementSelector].element;
      var sibling = node.parentNode.firstChild;
      while (sibling) {
        uid = sibling.uid;
        if (elements[sibling.uid] && elements[sibling.uid][selector]) {
          callback(elements[sibling.uid][selector].controller);
          return;
        }
        sibling = sibling.nextSibling;
      }
    });
  }
}
