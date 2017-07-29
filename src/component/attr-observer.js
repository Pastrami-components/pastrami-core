var observer;
var elements = {};

export default function CreateObserver(element) {
  var internal = {};
  var observers = {};
  var self = Object.defineProperties({}, {
    observe: {
      value: observe,
      enumerable: false, configurable: false, writable: false
    },
    '$$destroy': {
      value: destroy,
      enumerable: false, configurable: false, writable: false
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
}


function observeElement(element, cb) {
  if (!observer) {
    observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.type === 'attributes') { elements[mutation.target.uid](mutation.attributeName); }
      });
    });
  }
  elements[element.uid] = cb;
  observer.observe(element, { attributes: true });
}
