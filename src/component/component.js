import { NODE_TYPES } from '../constants';
import { getElementUid } from '../util';
import AttrsObserver from './attr-observer';
import { destroyElementsBindings } from './attr-bindings';
import ComponentFinder from './components-finder';
import { inject } from '../injector';
import {
  register
} from './registry';
import {
    findController,
    bind as bindController
  } from '../controller';
import {
    Create as CreateModel,
    bindModelToElement,
    getElementModel
  } from '../model';


var components = {};
var elements = {};
var selectorTree = {};

export function define(options) {
  validateOptions(options);
  options.selector.split(',').forEach(sel => {
    var lastObj = sel.trim().split(/(?=\.)|(?=#)|(?=\[)/).reduce((a, b) => {
      a[b] = a[b] || {};
      return a[b];
    }, selectorTree);

    components[sel.trim()] = {
      attrs: options.attrs,
      compile: options.compile,
      controller: options.controller,
      postBind: options.postBind,
      // default model to false if no controller, default it to true if there is a controller
      model: options.model === false || (!options.controller && options.model !== true) ? false : true,
      priority: options.priority || 0,
      replace: options.replace,
      select: function (_sel) { return sel === _sel; },
      selector: sel.trim(),
      selectors: sel.trim().split(/(?=\.)|(?=#)|(?=\[)/),
      template: options.template,
      transfer: options.transfer
    };
    lastObj._component = components[sel.trim()];
  });
}

export function bindElement(element, parentingElement, rootNode) {
  var component = find(element);
  if (!component) { return; }
  var uid = getElementUid(element);
  return compileElement(component, element, parentingElement, rootNode);
}

export function bindAttribute(attr, element, parentingElement, rootNode) {
  var component = find(attr);
  if (!component) { return; }
  var uid = getElementUid(attr);
  attr.uid = uid;
  return compileAttribute(attr, element, component, parentingElement, rootNode);
}

export function compileAttribute(attr, element, component, parentingElement, rootNode) {
  if (attr && !attr.uid) { return; }
  var selector = formatSelector(attr);
  if (elements[attr.uid] && elements[attr.uid][selector]) { return elements[attr.uid][selector].compiler; }
  if (!component) { return; }
  var uid = attr.uid;
  elements[uid] = elements[uid] || {};
  if (component.compile) {
    inject(component.compile, {
      attr: attr,
      element: element
    })();
  }

  elements[uid][selector] = {};
  elements[uid][selector].compiler = () => {
    // if the element that the attr is on is compiled then the element has been replaced. make sure we are using the correct one
    if (elements[element.uid] && elements[element.uid][formatSelector(element)] && elements[element.uid][formatSelector(element)].element !== element) {
      element = elements[element.uid][formatSelector(element)].element;
    }

    if (elements[uid][selector].compiled) {
      getElementModel(element).$$enable();
      return;
    }
    rootNode = rootNode || document.body;
    if (!rootNode.contains(element)) { return; }
    var model;
    var parentModel = getElementModel(parentingElement);
    if (component.model) { model = CreateModel(); }
    else if (parentModel) { model = parentModel.$$replicate(); }
    else { model = CreateModel(); }
    bindModelToElement(element, model);
    var attrsObserver = AttrsObserver(element);
    var finder = ComponentFinder(elements, uid, selector);
    if (component.controller) {
      elements[uid][selector].controller = bindController(attr, component.controller, { model: model, element: element, observeAttr: attrsObserver.observe, find: finder})();
    }

    elements[uid][selector].uid = uid;
    elements[uid][selector].element = element;
    elements[uid][selector].model = model;
    elements[uid][selector].attr = attr;
    elements[uid][selector].compiled = true;

    if (component.postBind) {
      inject(component.postBind, {
        element: element,
        attr: attr,
        model: model,
        attrsObserver: attrsObserver,
        ctrl: findController(element),
        find: finder
      })();
    }
  };
  elements[uid][selector].compiler.priority = component.priority || 0;
  elements[uid][selector].compiler.$element = element;
  return elements[uid][selector].compiler;
}

export function compileElement(component, originalNode, parentingElement, rootNode) {
  if (!originalNode || !originalNode.uid) { return; }
  var selector;
  var node;
  var model;
  var uid = originalNode.uid;

  // if (node && node.nodeType === NODE_TYPES.ELEMENT_NODE) {
  //   selector = formatSelector(options);
  //   if (elements[uid] && elements[uid][selector]) { return elements[uid][selector]; }
  //   return;
  // }
  selector = formatSelector(originalNode);
  if (elements[uid] && elements[uid][selector]) { return elements[uid][selector].compiler; }

  elements[uid] = elements[uid] || {};
  var frag = document.createDocumentFragment(); // component fragment
  originalNode.originalNode = true;
  node = frag;
  if (component.compile) {
    inject(component.compile, {
      element: originalNode
    })();
  }

  elements[uid][selector] = {};
  elements[uid][selector].compiler = () => {
    if (elements[uid][selector].compiled) {
      if (elements[uid][selector].model) { elements[uid][selector].model.$$enable(); }
      return;
    }
    rootNode = rootNode || document.body;
    if (!rootNode.contains(originalNode)) { return; }
    // model
    var model;
    var parentModel = getElementModel(parentingElement);
    if (component.model) { model = CreateModel(); }
    else if (parentModel) { model = parentModel.$$replicate(); }
    else { model = CreateModel(); }
    bindModelToElement(originalNode, model);


    // Tempalte
    if (component.template) {
      if (component.replace) {
        node.appendChild(compileTemplate(originalNode, component));
        var parent = originalNode.parentNode;
        originalNode.parentNode.insertBefore(node, originalNode);
        node = originalNode.previousSibling;
        originalNode.remove();
      } else {
        originalNode.appendChild(compileTemplate(originalNode, component));
        node = originalNode;
      }
    } else {
      node.appendChild(originalNode.cloneNode());
      var child;
      while (child = originalNode.firstChild) {
        node.firstChild.append(child);
      }
      originalNode.parentNode.insertBefore(node, originalNode);
      node = originalNode.previousSibling;
      var nodeCount = node.childNodes.length;
      // if (nodeCount === 1) { node = originalNode; }
      // else { // handle multiple root nodes
      //   node = [];
      //   var lastNode = originalNode;
      //   while (nodeCount) {
      //     lastNode = lastNode.nextSibling;
      //     node.push(lastNode)
      //     nodeCount--;
      //   }
      // }
      originalNode.remove();
    }

    node.uid = uid;

    var nodes = [].concat(node);
    nodes.forEach(sub => {
      // sub.classList.remove('cloak');
      // if selector is the node name then add it as a classname
      if (component.selector === sub.nodeName.toLowerCase()) {
        sub.classList.add(node.nodeName.toLowerCase());
      }
    });

    var attrsObserver = AttrsObserver(node);
    var finder = ComponentFinder(elements, uid, selector);
    if (component.controller) {
      elements[uid][selector].controller = bindController(node, component.controller, { model: model, element: node, observeAttr: attrsObserver.observe, find: finder})();
      elements[uid][selector].attrs = attrsObserver;
    }
    elements[uid][selector].uid = uid;
    elements[uid][selector].element = node;
    elements[uid][selector].model = model;
    elements[uid][selector].compiled = true;
    register(node, elements[uid][selector]);

    if (component.postBind) {
      inject(component.postBind, {
        element: node,
        model: model,
        attrsObserver: attrsObserver,
        ctrl: findController(node),
        find: finder
      })();
    }


    // parse if template used.
    // since the html changes at this point we have not parsed it yet
    // if (component.template) { parse(component.node); }

    // if ((linker.node[0] || linker.node).getAttribute('register')) { register(linker); }
    // pipeline.postCompile(options);
  };
  elements[uid][selector].compiler.priority = component.priority || 0;
  elements[uid][selector].compiler.$element = node;
  return elements[uid][selector].compiler;
}

if (!Element.prototype.matchesSelector) {
    Element.prototype.matchesSelector =
        Element.prototype.matchesSelector ||
        Element.prototype.mozMatchesSelector ||
        Element.prototype.msMatchesSelector ||
        Element.prototype.oMatchesSelector ||
        Element.prototype.webkitMatchesSelector ||
        function (s) {
          var matches = (this.document || this.ownerDocument).querySelectorAll(s);
          var i = matches.length;
          while (--i >= 0 && matches.item(i) !== this) {}
          return i > -1;
        };
}

export function find(node) {
  switch(node.nodeType) {
    case NODE_TYPES.ELEMENT_NODE:
      return findElement(node);
    case NODE_TYPES.ATTRIBUTE_NODE:
      return findAttrbute(node);
    default:
      return components[formatSelector(node)];
  }
}

// TODO optomize lookup
function findElement(node) {
  var component;
  Object.keys(components).every(key => {
    var firstChar = key.charAt(0);
    if (firstChar !== '.' && firstChar !== '[' && node.matchesSelector(key)) {
      component = components[key];
      return false;
    }
    return true;
  });
  return component;
}

function findAttrbute(node) {
 return components[formatSelector(node)];
}

export function disableOnRemove(element) {
  element.destroy = false;
}

export function destroy(node) {
  if (!node.uid) { return; }
  var component = elements[node.uid];
  if (!component) { return; }

  if (node.destroy === false) {
    disable(node);
    return;
  }

  // destroy
  // TODO remove event listeners
  // TODO dispatch destroy event
  var model = getElementModel(node);
  // if (model) { model.$$destroy(); }
  destroyElementsBindings(node);
}

export function disable(node) {
  if (!node.uid) { return; }
  var component = elements[node.uid];
  if (!component) { return; }
  var model = getElementModel(component.element);
  if (model) { model.$$disable(); }
  // TODO disable event listeners
  // TODO dispatch disable event
  delete node.destroy;
}

function compileTemplate(node, component) {
  var componentNode;
  var templateElement = document.createFromMarkup(component.template);
  if (component.replace === true) {
    componentNode = templateElement;
    transfer(component.transfer, node, componentNode);
    transpose(node, templateElement);
  } else {
    componentNode = templateElement;
    transpose(node, templateElement);
    // node.appendChild(templateElement);
    // componentNode = templateElement;
  }
  // transpose(node, templateElement);
  return componentNode;
}

/**
 * options: true
 * or
 * options: {
 *   attributes: true,
 *   classes: true
 * }
 */
function transfer(options, node, template) {
  if (!options || options === null) { return; }

  // transfer sttributes
  if (options === true || options.attributes === true) {
    Array.prototype.slice.call(node.attributes).forEach(attr => {
      if (attr.name === 'class') {
        template.setAttribute(attr.name, template.getAttribute(attr.name)+' '+attr.value);
      } else {
        template.setAttribute(attr.name, attr.value);
      }
    });
  }

  // transfer class names
  if (options === true || options.classes === true) {
    template.classList.add.apply(template.classList, Array.prototype.slice.call(node.classList));
  }
}

/**
 * Transpose HTML
 * you can transpose multiple
 * ```html
 * <br-button>Button</br-button>
 * <br-button>
 *   <transpose>Button</transpose>
 * </br-button>
 * <br-button>
 *   <transpose name="one">Button one</transpose>
 *   <span></span>
 *   <transpose name="two">Button two</transpose>
 * </br-button>
 * ```
 */
function transpose(node, templateElement) {
  var child;
  var componentTransposes = Array.prototype.slice.call(node.querySelectorAll('transpose'));
  var templateTransposes = Array.prototype.slice.call(templateElement.querySelectorAll('transpose'));
  if (!componentTransposes.length) {
    templateTransposes = templateElement.querySelector('transpose');
    if (templateTransposes) {
      while (child = node.firstChild) {
        templateTransposes.parentNode.insertBefore(child, templateTransposes);
      }
      templateTransposes.remove();
    }
  } else {
    componentTransposes.forEach(item => {
      var r = templateElement.querySelector('transpose, [name="'+item.getAttribute('name')+'"]');
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

  // TODO check individual selectors
  if (options.selector && components[options.selector] !== undefined) {
    throw Error('A component with these selectors "'+options.selector+'" already exists');
  }

  if (options.template && (typeof options.template !== 'string' || options.template === '')) {
    throw Error('`options.template must be a valid string`');
  }
}

// export function clone(node) {
//   var component = elements[node.uid];
//   if (!component) { return; }
//
//   var clone = component.element.clone(true);
//   console.log(clone);
//   // elements[uid][selector].uid = uid;
//   // elements[uid][selector].element = node;
//   // elements[uid][selector].model = model;
//   // elements[uid][selector].compiled = true;
//   //
//   // function () {
//   //   if (elements[uid][selector].model) { elements[uid][selector].model.$$enable(); }
//   // }
// }
