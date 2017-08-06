import { everyParent } from './util';

// TODO make a squashed branchway available for the expression to use for its context
var elements = {};

// assign a model to an element
export function bindModelToElement(element, model) {
  // find parent model
  everyParent(element, parent => {
    if (elements[parent.uid]) {
      if (!('$parent' in model)) {
        Object.defineProperty(model, '$parent', {
          value: elements[parent.uid],
          enumerable: false
        });
      }
      return false;
    }
    return true;
  });
  elements[element.uid] = model;
}


// get assigned model for a given element
export function getElementModel(element) {
  if (!element) { return; }
  var parent = element;
  while (parent && parent !== document.docuemntElement) {
    if (elements[parent.uid]) { return elements[parent.uid]; }
    parent = parent.parentNode;
  }
}

export function getNearestModel(el) {
  var uid = el.uid;
  if (!uid || !elements[uid]) {
    everyParent(el, parent => {
      uid = parent.uid;
      return !uid || !elements[uid];
    });
  }
  return elements[uid];
}

export function Create() {
  var uid = 0;
  var siblings = [];
  var internal = {};
  return replicate();

  function replicate() {
    var parasite = Parasite({
      id: uid++,
      siblings: siblings,
      internal: internal,
      observers: {},
      replicate: replicate
    });
    siblings.push(parasite);
    return parasite;
  }
}

export function Parasite(config) {
  var disabled = false;
  var self = new Proxy(config.internal, {
    get: get,
    set: set,
    deleteProperty: deleteProperty
  });
  var core = Object.defineProperties({}, {
    '$$id': {
      value: config.id,
      enumerable: false, configurable: false, writable: false
    },
    '$observe': {
      value: observe,
      enumerable: false, configurable: false, writable: false
    },
    '$isDisabled': {
      value: isDisabled,
      enumerable: false, configurable: false, writable: false
    },
    '$$disable': {
      value: disable,
      enumerable: false, configurable: false, writable: false
    },
    '$$enable': {
      value: enable,
      enumerable: false, configurable: false, writable: false
    },
    '$$forceEnable': {
      value: false,
      enumerable: false, configurable: false, writable: true
    },
    '$$squash': {
      value: squash,
      enumerable: false, configurable: false, writable: false
    },
    '$$trigger': {
      value: trigger,
      enumerable: false, configurable: false, writable: false
    },
    '$$destroy': {
      value: destroy,
      enumerable: false, configurable: false, writable: false
    },
    '$$observers': {
      value: config.observers,
      enumerable: false, configurable: false, writable: false
    },
    '$$replicate': {
      value: config.replicate,
      enumerable: false, configurable: false, writable: false
    },
    '$$self': {
      value: self,
      enumerable: false, configurable: false, writable: false
    }
  });
  return self;

  function get(target, property) {
    if (property.charAt(0) === '$') {
      return core[property];
    }
    return target[property];
  }

  function set(target, property, value) {
    if (property.charAt(0) === '$') {
      if (property in core) {
        core[property] = value;
        return true;
      }
      throw Error('Illegal first charater `$` on model property')
    }
    target[property] = value;
    trigger(property, value);
    return true;
  }

  function deleteProperty(target, property) {
    if (property in target) { delete target[property]; }
  }

  function observe(property) {
    var parent;
    var fn = arguments[arguments.length-1];
    if (typeof fn !== 'function') {
      throw Error('callback function required as last paramater')
    }
    property = property && typeof property !== 'function' ? property : '$$global';
    config.observers[property] = config.observers[property] || [];
    config.observers[property].push(fn);
    if (property === '$$global') {
      parent = core.$parent;
      while (parent) {
        parent.$observe(fn);
        parent = parent.$parent;
      }
      fn();
    } else {
      fn(self[property]);
    }

    return function unobserve() {
      if (property === '$$global') {
        parent = core.$parent;
        while (parent) {
          parent.$$observers[property] = (parent.$$observers[property] || []).filter(item => {
            return item !== fn;
          });
          parent = parent.$parent;
        }
        fn();
      }
      config.observers[property] = config.observers[property].filter(item => {
        return item !== fn;
      });
    };
  }

  function trigger(property, value) {
    config.siblings.forEach(sibling => {
      if (sibling.$isDisabled() && sibling.$$forceEnable !== true) { return; }
      (sibling.$$observers[property] || []).forEach(fn => {
        fn(value);
      });
      (sibling.$$observers['$$global'] || []).forEach(fn => {
        fn();
      });
    });
  }

  function squash() {
    var parent = core;
    var obj = {};
    while (parent) {
      Object.keys(parent.$$self).forEach(key => {
        if (!obj[key]) { obj[key] = parent.$$self[key]; }
      });
      parent = parent.$parent;
    }
    return obj;
  }

  function destroy() {
    config.observers = {};
    config.siblings.splice(config.siblings.indexOf(self), 1);
  }

  function disable() {
    disabled = true;
  }

  function enable() {
    disabled = false;
  }

  function isDisabled() {
    return disabled;
  }
}
