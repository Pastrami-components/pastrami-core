import {
    bindAttribute,
    bindElement,
    compileAttribute,
    compileElement,
    destroy as destroyComponent,
    disable as disableComponent
  } from './component';
import {
    compileNode,
    bindAttribute as bindAttributeExpression,
    bind as bindExpression
  } from './expression';
import {
  bind as bindController,
  compile as compileController
} from './controller';
import { NODE_TYPES } from './constants';
import { getElementModel } from './model';
import { isBinding, createBinding } from './component/attr-bindings';

var elements = [];

export function init() {
  parse(document.body);
  observe();
}

export function doNotParse(node) {
  node.$$doNotParse = true;
}

export function allowParse(node) {
  delete node.$$doNotParse;
}

export function parse(node) {
  walk(node, parseNode, 0, node);
  compile();
}

function destroy(node) {
  if (node.destroy === false) {
    walk(node, disableComponent, 0, node);
  } else {
    walk(node, destroyComponent, 0, node);
  }
}

// parse a given node and bind its compoennts and controllers
function parseNode(node, depth, parentingElement, rootNode) {
  if (node.$$doNotParse || (parentingElement && parentingElement.$$doNotParse)) { return; }
  if (node.nodeType === NODE_TYPES.ELEMENT_NODE) { parseElement(node, depth, parentingElement, rootNode); }
  else if (node.nodeType === NODE_TYPES.TEXT_NODE) { parseText(node, depth, parentingElement, rootNode); }
}

function parseElement(node, depth, parentingElement, rootNode) {
  if (node.hasAttribute('controller') && !compileController(node)) {
    register(node, depth, bindController(node));
  }

  var compile = compileElement(node);
  if (compile) {
    compile();
    return;
  }
  register(node, depth, bindElement(node, parentingElement, rootNode));

  var attr;
  var attrs = Array.prototype.slice.call(node.attributes || []);
  while (attr = attrs.pop()) {
    if (attr.name === 'controller') { continue; }
    if (isBinding(attr)) {
      var binding = createBinding(attr, node);
      if (binding) return;
    }
    register(attr, depth, bindAttributeExpression(attr, node, rootNode));
    if (!compileNode(attr, node)) { register(node, depth, bindExpression(attr, node, rootNode)); }
    if (compileAttribute(attr, node)) { continue; }
    register(node, depth, bindAttribute(attr, node, parentingElement, rootNode));
  }
}

// pre compile text and add observer to its model
// TODO wath for new parent models and swap observers. This may not be needed
function parseText(node, depth, parentingElement, rootNode) {
  // if (parentingElement && parentingElement.originalNode) { return; }
  var compile = compileNode(node);
  if (compile) {
    compile();
    return;
  }
  register(parentingElement, depth, bindExpression(node, parentingElement, rootNode));
}


// walk the dome from a given node recursivley
function walk(node, func, depth, rootNode, parentingElement) {
  func(node, depth, parentingElement, rootNode);
  if (node.uid) { parentingElement = node; }
  node = node.firstChild;
  while (node) {
    walk(node, func, depth + 1, rootNode, parentingElement);
    node = node.nextSibling;
  }
}

// register a compiler method to be run
function register(element, depth, func) {
  if (typeof func !== 'function') { return; }
  elements.push({
    depth: depth,
    compile: func,
    priority: func.priority || 0
  });
}

function compile() {
  elements.sort(function (a, b) {
    return a.depth < b.depth ? -1 : a.depth > b.depth ? 1 :
           a.priority > b.priority ? -1 : a.priority < b.priority ? 1 : 0;
  }).forEach(function (item) {
    item.compile();
  });
  elements = [];
}


// TODO add better tracking to elements so we can reduce duplicate checks for parse/compile
var observer;
function observe() {
  if (!observer) {
    observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.removedNodes.length) {
          Array.prototype.slice.call(mutation.removedNodes).forEach(function (element) {
            if (element.uid && !element.originalNode && !element.mcplaceholder) {
              destroy(element);
            }
          });
        }

        if (mutation.addedNodes.length) {
          Array.prototype.slice.call(mutation.addedNodes).forEach(function (element) {
            parse(element);
          });
        }
      });
    });

    observer.observe(document, {
      childList: true,
      subtree:true
    });
  }
}
