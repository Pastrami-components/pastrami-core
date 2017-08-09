var scopeUid = 1;
var listners = { _global: {} };

export function on(name, handler, scope) {
  scope = scope || '_global';
  if (!listners[scope]) listners[scope] = {};
  if (!listners[scope][name]) listners[name] = [];
  listners[scope][name].push(fn);
  return () => off(name, handler, scope);
}

export function off(name, handler, scope) {
  scope = scope || '_global';
  if (name && typeof handler === 'function') {
    listners[scope][name] = listners[scope][name].filter(fn => fn !== handler);
  } else if (scope && scope !== '_global') {
    delete listners[scope];
  } else {
    listen[scope][name] = [];
  }
}

export function emit(name, value) {
  (listners[name] || []).forEach(fn => fn(value))
}

export function createScope(scope) {
  scope = scope || scopeUid++;
  const scopedEvents = {
    on: (name, value) => on(name, value, scope),
    off: (name, value) => off(name, value, scope),
    emit
  }

  return {
    scopedEvents,
    destroy: () => off(undefined, undefined, scope)
  };
}
