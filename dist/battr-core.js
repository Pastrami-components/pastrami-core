(function (exports) {
'use strict';

String.prototype.toBoolean = function () {
  return this == 'true';
};
String.prototype.isBoolean = function () {
  return this === 'true' || this === 'false';
};

var NODE_TYPES = {
  ELEMENT_NODE: 1,
  ATTRIBUTE_NODE: 2,
  TEXT_NODE: 3,
  PROCESSING_INSTRUCTION_NODE: 7,
  COMMENT_NODE: 8,
  DOCUMENT_NODE: 9,
  DOCUMENT_TYPE_NODE: 10,
  DOCUMENT_FRAGMENT_NODE: 11
};

var ObjProto = Object.prototype;
var toString = ObjProto.toString;
var getKeys = Object.keys;
var hasOwnProperty = Object.hasOwnProperty;
var SymbolProto = typeof Symbol !== 'undefined' ? Symbol.prototype : null;
function equal(a, b, aStack, bStack) {
  if (a === b) { return a !== 0 || 1 / a === 1 / b; }
  if (a == null || b == null) { return false; }
  if (a !== a) { return b !== b; }
  var type = typeof a;
  if (type !== 'function' && type !== 'object' && typeof b != 'object') { return false; }
  return deepEqual(a, b, aStack, bStack);
}
function deepEqual(a, b, aStack, bStack) {
  var className = toString.call(a);
  if (className !== toString.call(b)) { return false; }
  switch (className) {
    case '[object RegExp]':
    case '[object String]':
      return '' + a === '' + b;
    case '[object Number]':
      if (+a !== +a) { return +b !== +b; }
      return +a === 0 ? 1 / +a === 1 / b : +a === +b;
    case '[object Date]':
    case '[object Boolean]':
      return +a === +b;
    case '[object Symbol]':
      return SymbolProto.valueOf.call(a) === SymbolProto.valueOf.call(b);
  }
  var areArrays = className === '[object Array]';
  if (!areArrays) {
    if (typeof a != 'object' || typeof b != 'object') { return false; }
    var aCtor = a.constructor, bCtor = b.constructor;
    if (aCtor !== bCtor && !(typeof aCtor === 'function' && aCtor instanceof aCtor &&
                             typeof bCtor === 'function' && bCtor instanceof bCtor)
                        && ('constructor' in a && 'constructor' in b)) {
      return false;
    }
  }
  aStack = aStack || [];
  bStack = bStack || [];
  var length = aStack.length;
  while (length--) {
    if (aStack[length] === a) { return bStack[length] === b; }
  }
  aStack.push(a);
  bStack.push(b);
  if (areArrays) {
    length = a.length;
    if (length !== b.length) { return false; }
    while (length--) {
      if (!equal(a[length], b[length], aStack, bStack)) { return false; }
    }
  } else {
    var keys = getKeys(a), key;
    length = keys.length;
    if (getKeys(b).length !== length) { return false; }
    while (length--) {
      key = keys[length];
      if (!(has(b, key) && equal(a[key], b[key], aStack, bStack))) { return false; }
    }
  }
  aStack.pop();
  bStack.pop();
  return true;
}
function has(obj, path) {
  if (toString.call(path) !== '[object Array]') {
    return obj != null && hasOwnProperty.call(obj, path);
  }
  var length = path.length;
  for (var i = 0; i < length; i++) {
    var key = path[i];
    if (obj == null || !hasOwnProperty.call(obj, key)) {
      return false;
    }
    obj = obj[key];
  }
  return !!length;
}

function nextTock(fn) {
  setTimeout(fn, 0);
}
var _uid = 0;
function uid$1() {
  return 'id_'+_uid++;
}
function getElementUid(node) {
  node.uid = node.uid || uid$1();
  return node.uid;
}

function everyParent(node, func) {
  if (typeof func !== 'function') { return; }
  var parent = node.parentNode;
  while (parent && parent !== document.documentElement && func(parent)) {
    parent = parent.parentNode;
  }
}

var observer$1;
var elements$2 = {};
var buildAttrs = function (attrs, element) {
  var uid = element.uid;
  var observers = {};
  var internal = {};
  var self = Object.defineProperties({}, {
    getAttribute: {
      value: function (value) {
        return element.getAttribute(value);
      },
      enumerable: false,
      configurable: false,
      writable: false,
    },
    setAttribute: {
      value: function (value) {
        return element.setAttribute(value);
      },
      enumerable: false,
      configurable: false,
      writable: false,
    },
    '$observe': {
      value: observe,
      enumerable: false,
      configurable: false,
      writable: false
    },
    '$$destroy': {
      value: destroy,
      enumerable: false,
      configurable: false,
      writable: false
    }
  });
  observeElement(element, function (attrName) {
    if (internal[attrName] !== element.getAttribute(attrName)) {
      internal[name] = element.getAttribute(attrName);
      (observers[name] || []).forEach(function (func) {
        func(internal[name]);
      });
    }
  });
  return self;
  function observe(name, func) {
    observers[name] = observers[name] || [];
    observers[name].push(func);
    internal[name] = element.getAttribute(name);
    func(internal[name]);
    return function () {
      observers[name] = observers[name].filter(function (item) {
        return item !== func;
      });
    }
  }
  function destroy() {
    observers = {};
  }
};
function observeElement(element, cb) {
  if (!observer$1) {
    observer$1 = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.type === 'attributes') { elements$2[mutation.target.uid](mutation.attributeName); }
      });
    });
  }
  elements$2[element.uid] = cb;
  observer$1.observe(element, { attributes: true });
}

function Constructor(elements, elementUid, elementSelector) {
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
      var i = 0;
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

var components$1 = {};
function register$1(component) {
  if (!component.controller || !component.element.hasAttribute('register')) { return; }
  var id = element.getAttribute('register');
  components$1[id] = components$1[id] || [];
  components$1[id].push(component.controller);
}

var elements$4 = {};
function bindModelToElement(element, model) {
  everyParent(element, function (parent) {
    if (elements$4[parent.uid]) {
      Object.defineProperty(model, '$parent', {
        value: elements$4[parent.uid],
        enumerable: false
      });
      return false;
    }
    return true;
  });
  elements$4[element.uid] = model;
}
function getElementModel(element) {
  if (!element) { return; }
  var parent = element;
  while (parent && parent !== document.docuemntElement) {
    if (elements$4[parent.uid]) { return elements$4[parent.uid]; }
    parent = parent.parentNode;
  }
}
function Create() {
  var leaves = [];
  var internal = {};
  return copy();
  function copy() {
    var par = parasite({
      internal: internal,
      leaves: leaves,
      copy: copy
    });
    Object.keys(internal).forEach(function (key) {
      Object.defineProperty(par, key, Object.getOwnPropertyDescriptor(leaves[0], key));
    });
    leaves.push(par);
    return par;
  }
}
function parasite(root) {
  var self = Object.defineProperties({}, {
    '$assign': {
      value: assign,
      enumerable: false,
      configurable: false,
      writable: false
    },
    '$$copy': {
      value: root.copy,
      enumerable: false,
      configurable: false,
      writable: false
    },
    '$$disable': {
      value: disable,
      enumerable: false,
      configurable: false,
      writable: false
    },
    '$$disabled': {
      value: false,
      enumerable: false,
      configurable: false,
      writable: true
    },
    '$$forceEnable': {
      value: false,
      enumerable: false,
      configurable: false,
      writable: true
    },
    '$$enable': {
      value: enable,
      enumerable: false,
      configurable: false,
      writable: false
    },
    '$observe': {
      value: observe,
      enumerable: false,
      configurable: false,
      writable: false
    },
    '$observers': {
      value: {_global: []},
      enumerable: false,
      configurable: false,
      writable: true
    },
    '$$destroy': {
      value: destroy,
      enumerable: false,
      configurable: false,
      writable: false
    },
    '$$squash': {
      value: squash,
      enumerable: false,
      configurable: false,
      writable: false
    },
    '$$trigger': {
      value: trigger,
      enumerable: false,
      configurable: false,
      writable: false
    }
  });
  return self;
  function assign(name, value) {
    if (!root.leaves[0].hasOwnProperty(name)) {
      root.leaves.forEach(function (leaf) {
        Object.defineProperty(leaf, name, {
          get: function () {
            return root.internal[name];
          },
          set: function () {
            throw Error('Cannot set model property. Use `model.$assign(name: string, value: any)`');
          },
          enumerable: true,
          configurable: false
        });
      });
    }
    root.internal[name] = value;
    trigger(name, value);
  }
  function disable() {
    self.$$disabled = true;
  }
  function enable() {
    self.$$disabled = false;
  }
  function trigger(name, value) {
    root.leaves.forEach(function (leaf) {
      if (leaf.$$disabled && leaf.$$forceEnable !== true) { return; }
      if (leaf.$observers[name]) {
        leaf.$observers[name].forEach(function (func) {
          func(value);
        });
      }
      leaf.$observers._global.forEach(function (func) {
        func();
      });
    });
  }
  function observe(name, func, deep) {
    if (typeof name === 'function') {
      var parent;
      if (func === true) {
        parent = this.$parent;
        while (parent) {
          parent.$observe(name, true);
          parent = parent.$parent;
        }
      }
      self.$observers._global.push(name);
      name();
      return function () {
        if (func === true) {
          parent = this.$parent;
          while (parent) {
            parent.$observers._global = parent.$observers._global.filter(function (item) {
              return item !== name;
            });
            parent = parent.$parent;
          }
        }
        self.$observers._global = self.$observers._global.filter(function (item) {
          return item !== name;
        });
      }
    }
    self.$observers[name] = self.$observers[name] || [];
    self.$observers[name].push(func);
    if (root.internal.hasOwnProperty(name)) { func(root.internal[name]); }
    return function () {
      self.$observers[name] = self.$observers[name].filter(function (item) {
        return item !== func;
      });
    }
  }
  function destroy() {
    self.$observers = {};
    root.leaves.splice(root.leaves.indexOf(self), 1);
  }
  function squash() {
    var parent = this;
    var obj = {};
    while (parent) {
      Object.keys(parent).forEach(function (key) {
        if (!obj[key]) { obj[key] = parent[key]; }
      });
      parent = parent.$parent;
    }
    return obj;
  }
}

var controllers = {};
var elements$3 = {};

function bind(element, ctrl, inject) {
  var uid$$1 = getElementUid(element);
  elements$3[uid$$1] = compile$1(element, ctrl, inject);
  return elements$3[uid$$1];
}
function compile$1(element, ctrl, inject) {
  if (!element.uid) { return; }
  if (elements$3[element.uid]) { return elements$3[element.uid]; }
  var controller = find$1(ctrl || element.getAttribute('controller'));
  if (!controller) { return; }
  inject = inject || {};
  if (!inject.model) { inject.model = Create(); }
  bindModelToElement(element, inject.model);
  var compiled = false;
  var linker = injectCtrl(controller, inject);
  var createController = function () {
    if (compiled) { return; }
    var newCtrl = new linker();
    Object.defineProperty(newCtrl, '$model', {
      value: inject.model,
      enumerable: false,
      configurable: false,
      writable: false
    });
    elements$3[element.uid] = newCtrl;
    compiled = true;
    return newCtrl;
  };
  return createController;
}

function find$1(ctrl) {
  if (typeof ctrl === 'function') { return ctrl; }
  if (!controllers[ctrl]) {
    return;
  }
  return controllers[ctrl];
}
function injectCtrl(func, inject) {
  var args = [];
  var deps;
  if (func instanceof Array) {
    deps = func;
    func = deps.pop();
  } else {
    deps = func.toString().match(/^function\s*[^\(]*\(\s*([^\)]*)\)/m)[1].replace(/ /g, '').split(',');
  }
  return function () {
    var arr = Array.prototype.slice.call(arguments, 0);
    deps.forEach(function (item, pos) {
      if (func.$inject) { args.push(func.$inject[pos]); }
      else { args.push(inject[item]); }
    });
    func.apply(this, args);
  };
}

var components = {};
var elements$1 = {};
function define(options) {
  validateOptions(options);
  options.selector.split(',').forEach(function (sel) {
    components[sel] = {
      attrs: options.attrs,
      compile: options.compile,
      controller: options.controller,
      model: options.model === false || (!options.controller && options.model !== true) ? false : true,
      priority: options.priority || 0,
      replace: options.replace,
      select: function (_sel) { return sel === _sel; },
      selector: sel,
      template: options.template,
      transfer: options.transfer
    };
  });
}
function bindElement(element, parentingElement, rootNode) {
  var component = find(element);
  if (!component) { return; }
  var uid$$1 = getElementUid(element);
  return compileElement(component, element, parentingElement, rootNode);
}
function bindAttribute(attr, element, parentingElement, rootNode) {
  var component = find(attr);
  if (!component) { return; }
  var uid$$1 = getElementUid(element);
  attr.uid = uid$$1;
  return compileAttribute(attr, element, component, parentingElement, rootNode);
}
function compileAttribute(attr, element, component, parentingElement, rootNode) {
  if (element && !element.uid) { return; }
  var selector = formatSelector(attr);
  if (elements$1[attr.uid] && elements$1[attr.uid][selector]) { return elements$1[attr.uid][selector].compiler; }
  if (!component) { return; }
  var uid$$1 = element.uid;
  elements$1[uid$$1] = elements$1[uid$$1] || {};
  if (component.compile) {
    component.compile(element);
  }
  elements$1[uid$$1][selector] = {};
  elements$1[uid$$1][selector].compiler = function () {
    if (elements$1[uid$$1][selector].compiled) {
      getElementModel(element).$$enable();
      return;
    }
    rootNode = rootNode || document.body;
    if (!rootNode.contains(element)) { return; }
    var model;
    var parentModel = getElementModel(parentingElement);
    if (component.model) { model = Create(); }
    else if (parentModel) { model = parentModel.$$copy(); }
    else { model = Create(); }
    bindModelToElement(element, model);
    if (component.controller) {
      elements$1[uid$$1][selector].controller = bind(element, component.controller, { model: model, element: element, attrs: buildAttrs(component.attrs, element)})();
    }
    elements$1[uid$$1][selector].uid = uid$$1;
    elements$1[uid$$1][selector].element = element;
    elements$1[uid$$1][selector].model = model;
    elements$1[uid$$1][selector].attr = attr;
    elements$1[uid$$1][selector].compiled = true;
  };
  elements$1[uid$$1][selector].compiler.priority = component.priority || 0;
  elements$1[uid$$1][selector].compiler.$element = element;
  return elements$1[uid$$1][selector].compiler;
}
function compileElement(component, originalNode, parentingElement, rootNode) {
  if (!originalNode || !originalNode.uid) { return; }
  var selector;
  var node;
  var model;
  var uid$$1 = originalNode.uid;
  selector = formatSelector(originalNode);
  if (elements$1[uid$$1] && elements$1[uid$$1][selector]) { return elements$1[uid$$1][selector].compiler; }
  elements$1[uid$$1] = elements$1[uid$$1] || {};
  var frag = document.createDocumentFragment();
  originalNode.originalNode = true;
  node = frag;
  if (component.compile) {
    component.compile(originalNode);
  }
  elements$1[uid$$1][selector] = {};
  elements$1[uid$$1][selector].compiler = function () {
    if (elements$1[uid$$1][selector].compiled) {
      if (elements$1[uid$$1][selector].model) { elements$1[uid$$1][selector].model.$$enable(); }
      return;
    }
    rootNode = rootNode || document.body;
    if (!rootNode.contains(originalNode)) { return; }
    var model;
    var parentModel = getElementModel(parentingElement);
    if (component.model) { model = Create(); }
    else if (parentModel) { model = parentModel.$$copy(); }
    else { model = Create(); }
    bindModelToElement(originalNode, model);
    if (component.template) {
      node.appendChild(compileTemplate(originalNode, component));
      var parent = originalNode.parentNode;
      originalNode.parentNode.insertBefore(node, originalNode);
      node = originalNode.previousSibling;
    } else {
      node.appendChild(originalNode.cloneNode());
      var child;
      while (child = originalNode.firstChild) {
        node.firstChild.append(child);
      }
      originalNode.parentNode.insertBefore(node, originalNode);
      node = originalNode.previousSibling;
      var nodeCount = node.childNodes.length;
    }
    originalNode.remove();
    node.uid = uid$$1;
    var nodes = [].concat(node);
    nodes.forEach(function (sub) {
      if (component.selector === sub.nodeName.toLowerCase()) {
        sub.classList.add(node.nodeName.toLowerCase());
      }
    });
    if (component.controller) {
      var attrs = buildAttrs(component.attrs, node);
      elements$1[uid$$1][selector].controller = bind(node, component.controller, { model: model, element: node, attrs: attrs, helper: Constructor(elements$1, uid$$1, selector)})();
      elements$1[uid$$1][selector].attrs = attrs;
    }
    elements$1[uid$$1][selector].uid = uid$$1;
    elements$1[uid$$1][selector].element = node;
    elements$1[uid$$1][selector].model = model;
    elements$1[uid$$1][selector].compiled = true;
    register$1(node, elements$1[uid$$1][selector]);
  };
  elements$1[uid$$1][selector].compiler.priority = component.priority || 0;
  elements$1[uid$$1][selector].compiler.$element = node;
  return elements$1[uid$$1][selector].compiler;
}
function find(node) {
  return components[formatSelector(node)];
}
function disableOnRemove(element) {
  element.destroy = false;
}
function destroy$1(node) {
  if (!node.uid) { return; }
  var component = elements$1[node.uid];
  if (!component) { return; }
  if (node.destroy === false) {
    disable(node);
    return;
  }
  var model = getElementModel(node);
}
function disable(node) {
  if (!node.uid) { return; }
  var component = elements$1[node.uid];
  if (!component) { return; }
  var model = getElementModel(component.element);
  if (model) { model.$$disable(); }
  delete node.destroy;
}
function compileTemplate(node, component) {
  var componentNode;
  var templateElement = createFromMarkup(component.template);
  if (component.replace === true) {
    componentNode = templateElement;
    transfer(component.transfer, node, componentNode);
  } else {
    componentNode.appendChild(templateElement);
  }
  transpose(node, templateElement);
  return componentNode;
}
function transfer(options, node, template) {
  if (!options || options === null) { return; }
  if (options === true || options.attributes === true) {
    Array.prototype.slice.call(node.attributes).forEach(function (attr) {
      if (attr.name === 'class') {
        template.setAttribute(attr.name, template.getAttribute(attr.name)+' '+attr.value);
      } else {
        template.setAttribute(attr.name, attr.value);
      }
    });
  }
  if (options === true || options.classes === true) {
    template.classList.add.apply(template.classList, Array.prototype.slice.call(node.classList));
  }
}
function transpose(node, templateElement) {
  var child;
  var componentTransposes = Array.prototype.slice.call(node.querySelectorAll('mc-transpose'));
  var templateTransposes = Array.prototype.slice.call(templateElement.querySelectorAll('mc-transpose'));
  if (!componentTransposes.length) {
    templateTransposes = templateElement.querySelector('mc-transpose');
    if (templateTransposes) {
      while (child = node.firstChild) {
        templateTransposes.parentNode.insertBefore(child, templateTransposes);
      }
      templateTransposes.remove();
    }
  } else {
    componentTransposes.forEach(function (item) {
      var r = templateElement.querySelector('mc-transpose, [name="'+item.getAttribute('name')+'"]');
      if (r) {
        while (child = node.firstChild) {
          r.parentNode.insertBefore(child, r);
        }
        r.remove();
      }
    });
  }
}
function formatSelector(node) {
  switch(node.nodeType) {
    case NODE_TYPES.ELEMENT_NODE:
      return node.nodeName.toLowerCase();
    case NODE_TYPES.ATTRIBUTE_NODE:
      return '\['+node.name+'\]';
  }
  return '';
}
function validateOptions(options) {
  if (typeof options !== 'object' || options === null) {
    throw Error('`Component` is expecting a object param');
  }
  if (typeof options.selector !== 'string' || options.selector === '') {
    throw Error('`options.selector must be a valid string`');
  }
  if (options.selector && components[options.selector] !== undefined) {
    throw Error('A component with these selectors "'+options.selector+'" already exists');
  }
  if (options.template && (typeof options.template !== 'string' || options.template === '')) {
    throw Error('`options.template must be a valid string`');
  }
}
function createFromMarkup(markup) {
  var parser = document.createElement('div');
  parser.innerHTML = markup;
  return parser.firstChild;
}



var index = Object.freeze({
	define: define,
	bindElement: bindElement,
	bindAttribute: bindAttribute,
	compileAttribute: compileAttribute,
	compileElement: compileElement,
	find: find,
	disableOnRemove: disableOnRemove,
	destroy: destroy$1,
	disable: disable
});

var tsCompile = window['template-strings-compile'];
var resolveToString = window['template-strings-resolve-to-string'];
var elements$5 = {};

function isExpression(str) {
  return str.indexOf('${') > -1;
}
function bind$1(node, bindingNode, rootNode) {
  if (!node || !isExpression(node.textContent)) { return; }
  var uid$$1 = getElementUid(node);
  if (bindingNode) { node.elementUID = getElementUid(bindingNode); }
  elements$5[uid$$1] = compileNode(node, bindingNode, rootNode);
  return elements$5[uid$$1];
}
function compileNode(node, bindingNode, rootNode) {
  if (!node.uid) { return; }
  if (elements$5[node.uid]) { return elements$5[node.uid]; }
  var destroyer;
  var compiledText = tsCompile(node.textContent);
  var createObserver = function () {
    rootNode = rootNode || document.body;
    if (!rootNode.contains(node)) { return; }
    if (destroyer) { return; }
    var model = getElementModel(bindingNode || node.parentNode);
    if (!model) { return; }
    destroyer = model.$observe(function () {
      if (!node) {
        destroy();
        return;
      }
      try {
        node.textContent = resolveToString(compiledText, model.$$squash());
      } catch (e) {
      }
    }, true);
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

var elements = [];
function init$1() {
  parse(document.body);
  observe();
}


function parse(node) {
  walk(node, parseNode, 0, node);
  compile$$1();
}
function destroy$$1(node) {
  if (node.destroy === false) {
    walk(node, disable, 0, node);
  } else {
    walk(node, destroy$1, 0, node);
  }
}
function parseNode(node, depth, parentingElement, rootNode) {
  if (node.$$doNotParse || (parentingElement && parentingElement.$$doNotParse)) { return; }
  if (node.nodeType === NODE_TYPES.ELEMENT_NODE) { parseElement(node, depth, parentingElement, rootNode); }
  else if (node.nodeType === NODE_TYPES.TEXT_NODE) { parseText(node, depth, parentingElement, rootNode); }
}
function parseElement(node, depth, parentingElement, rootNode) {
  if (node.hasAttribute('controller') && !compile$1(node)) {
    register(node, depth, bind(node));
  }
  var compile$$1 = compileElement(node);
  if (compile$$1) {
    compile$$1();
    return;
  }
  register(node, depth, bindElement(node, parentingElement, rootNode));
  var attr;
  var attrs = Array.prototype.slice.call(node.attributes || []);
  while (attr = attrs.pop()) {
    if (attr.name === 'controller') { continue; }
    if (!compileNode(attr, node)) { register(node, depth, bind$1(attr, node, rootNode)); }
    if (compileAttribute(attr, node)) { continue; }
    register(node, depth, bindAttribute(attr, node, parentingElement, rootNode));
  }
}
function parseText(node, depth, parentingElement, rootNode) {
  var compile$$1 = compileNode(node);
  if (compile$$1) {
    compile$$1();
    return;
  }
  register(parentingElement, depth, bind$1(node, parentingElement, rootNode));
}
function walk(node, func, depth, rootNode, parentingElement) {
  func(node, depth, parentingElement, rootNode);
  if (node.uid) { parentingElement = node; }
  node = node.firstChild;
  while (node) {
    walk(node, func, depth + 1, rootNode, parentingElement);
    node = node.nextSibling;
  }
}
function register(element, depth, func) {
  if (typeof func !== 'function') { return; }
  elements.push({
    depth: depth,
    compile: func,
    priority: func.priority || 0
  });
}
function compile$$1() {
  elements.sort(function (a, b) {
    return a.depth < b.depth ? -1 : a.depth > b.depth ? 1 :
           a.priority > b.priority ? -1 : a.priority < b.priority ? 1 : 0;
  }).forEach(function (item) {
    item.compile();
  });
  elements = [];
}
var observer;
function observe() {
  if (!observer) {
    observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.removedNodes.length) {
          Array.prototype.slice.call(mutation.removedNodes).forEach(function (element) {
            if (element.uid && !element.originalNode && !element.mcplaceholder) {
              destroy$$1(element);
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

function init$$1() {
  init$1(document.body);
}

exports.component = index;
exports.init = init$$1;

}((this['battr-core'] = this['battr-core'] || {})));
