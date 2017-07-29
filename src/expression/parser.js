import { getElementUid } from '../util';
import { getElementModel } from '../model';

const tsCompile = window['template-strings-compile'];
const resolveToString = window['template-strings-resolve-to-string'];
const elements = {};

export function compileExpression(str) {
  if (!isExpression(str)) { return returnStr(str); }
  var compiled = tsCompile(str);
  return resolver(compiled);
}

function resolver(compiled) {
  return function (context) {
    return resolveToString(compiled, context)
  };
}

// dummy function that will for strings that are not expression.
// this will allow the pipeline to stay the same
function returnStr(str) {
  return function () {
    return str;
  };
}


export function isExpression(str) {
  return str.indexOf('${') > -1;
}

export function bind(node, bindingNode, rootNode) {
  if (!node || !isExpression(node.textContent)) { return; }
  var uid = getElementUid(node);
  if (bindingNode) { node.elementUID = getElementUid(bindingNode); }
  elements[uid] = compileNode(node, bindingNode, rootNode);
  return elements[uid];
}

export function bindAttribute(attr, bindingNode, rootNode) {
  if (!attr || !isExpression(attr.value)) { return; }
  var uid = getElementUid(attr);
  if (bindingNode) { attr.elementUID = getElementUid(bindingNode); }
  elements[uid] = compileAttribute(attr, bindingNode, rootNode);
  return elements[uid];
}

export function compileNode(node, bindingNode, rootNode) {
  if (!node.uid) { return; }
  if (elements[node.uid]) { return elements[node.uid]; }
  var destroyer;
  var compiledText = tsCompile(node.textContent);
  var createObserver = function () {
    rootNode = rootNode || document.body;
    if (!rootNode.contains(node)) { return; }
    if (destroyer) { return; } // prevent from running ore than once
    var model = getElementModel(bindingNode || node.parentNode);
    if (!model) { return; }
    destroyer = model.$observe(function () {
      if (node.$$doNotParse) { return; }
      // kill observer if node no longer exists
      if (!node) {
        destroy();
        return;
      }
      try {
        node.textContent = resolveToString(compiledText, model.$$squash());
      } catch (e) {
        console.error('failed to parse', node, model);
      }
    });
  };
  createObserver.priority = 1000;
  createObserver.destroy = destroy;
  return createObserver;

  function destroy() {
    if (typeof destroyer === 'function') {
      destroyer();
      destroyer = undefined;
    }
  }
}

export function compileAttribute(attr, bindingNode, rootNode) {
  if (!attr.uid) { return; }
  if (elements[attr.uid]) { return elements[attr.uid]; }
  var destroyer;
  var compiledText = tsCompile(attr.value);
  var createObserver = function () {
    rootNode = rootNode || document.body;
    if (!rootNode.contains(bindingNode) && bindingNode.hasAttribute(attr.nodeName)) { return; }
    if (destroyer) { return; } // prevent from running ore than once
    var model = getElementModel(bindingNode);
    if (!model) { return; }
    destroyer = model.$observe(function () {
      if (attr.$$doNotParse || bindingNode.$$doNotParse) { return; }
      // kill observer if node no longer exists
      if (!attr) {
        destroy();
        return;
      }
      try {
        attr.value = resolveToString(compiledText, model.$$squash());
      } catch (e) {
        console.error('failed to parse', attr, model);
      }
    });
  };
  createObserver.priority = 1000;
  createObserver.destroy = destroy;
  return createObserver;

  function destroy() {
    if (typeof destroyer === 'function') {
      destroyer();
      destroyer = undefined;
    }
  }
}

export function destroy() {

}
