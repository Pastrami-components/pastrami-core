var observer;
var elements = {};
var observers = {};

export default function CreateObserver(element) {
  // console.log('CreateObserver', element)
  if (observers[element.uid]) return observers[element.uid];
  var internal = {};
  var _observers = {};
  var disabled = false;
  var self = Object.defineProperties({}, {
    observe: {
      value: observe,
      enumerable: false, configurable: false, writable: false
    },
    '$$disable': {
      value: () => { disabled = true; },
      enumerable: false, configurable: false, writable: false
    },
    '$$enable': {
      value: () => { disabled = false; },
      enumerable: false, configurable: false, writable: false
    },
    '$$destroy': {
      value: destroy,
      enumerable: false, configurable: false, writable: false
    }
  });
  observeElement(element, function (name) {
    if (disabled) return;
    if (internal[name] !== element.getAttribute(name)) {
      internal[name] = element.getAttribute(name);
      (_observers[name] || []).forEach(function (func) {
        func(internal[name]);
      });
    }
  });
  observers[element.uid] = self;
  return self;

  function observe(name, func) {
    _observers[name] = _observers[name] || [];
    _observers[name].push(func);
    internal[name] = element.getAttribute(name);
    func(internal[name]);
    return function () {
      _observers[name] = _observers[name].filter(function (item) {
        return item !== func;
      });
    }
  }

  function destroy() {
    _observers = {};
    delete observers[element.uid];
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
