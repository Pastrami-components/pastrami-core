var components = {};

export function register(component) {
  if (!component.controller || !component.element.hasAttribute('register')) { return; }
  var id = element.getAttribute('register');
  components[id] = components[id] || [];
  components[id].push(component.controller);
}

export function unregister(component) {
  delete components[component.element.getAttribute('register')];
}

export function get(id) {
  return components[id];
}

export function waitFor(id, callback) {
  var killed = false;
  // TODO register with mutation and wait/check for add
  setTimeout(() => {
    if (!killed) { callback(components[id]); }
  }, 100);

  return function kill() {
    killed = true;
  };
}
