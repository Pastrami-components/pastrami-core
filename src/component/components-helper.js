import { nextTock } from '../util';

export default function Constructor(elements, elementUid, elementSelector) {
  return {
    findParent: findParent,
    findChild: findChild,
    findSibling: findSibling
  };


  function findParent(selector, maxSteps) {
    var callback = arguments[arguments.length-1];

    nextTock(function () {
      var node = elements[elementUid][elementSelector].element;
      maxSteps = maxSteps && (typeof maxSteps !== 'function') ? maxSteps : 1;
      var i = 0;
      var parent = node.parentNode;
      while (parent && i <= maxSteps) {
        i += 1;
        if (elements[parent.uid] && elements[parent.uid][selector]) {
          callback(elements[parent.uid][selector].controller);
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
