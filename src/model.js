import { everyParent } from './util';

// TODO make a squashed branchway available for the expression to use for its context
var elements = {};

// assign a model to an element
export function bindModelToElement(element, model) {
  // find parent model
  everyParent(element, function (parent) {
    if (elements[parent.uid]) {
      Object.defineProperty(model, '$parent', {
        value: elements[parent.uid],
        enumerable: false
      });
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


export function Create() {
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

  // observe a property. This will invoke a given funtion with the porperty value
  // return a function that will remove the created observer
  function observe(name, func, deep) {
    // TODO validate
    // global listner
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

    // Property listener
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
