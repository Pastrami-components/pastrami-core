var scopeUid = 1;
var listners = { _global: {} };
var eventHistory = {};

export function on(name, handler, scope) {
  var firstTrigger = false;
  scope = scope || '_global';
  if (!listners[scope]) listners[scope] = {};
  if (!listners[scope][name]) listners[scope][name] = [];
  listners[scope][name].push(handler);
  var offer = () => off(name, handler, scope);

  // allow a listenre to handle previous events
  offer.handlePrevious = () => {
    if (firstTrigger) return;
    firstTrigger = true;
    eventHistory[name].forEach(handler);
    return offer;
  };
  return offer;
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
  // store events so listernes can handle previous items
  if (!eventHistory[name]) eventHistory[name] = [];
  eventHistory[name].push(value);

  Object.keys(listners).forEach(function (scopeKey) {
    if (listners[scopeKey] && listners[scopeKey][name]) {
      listners[scopeKey][name].forEach(fn => fn(value));
    }
  });
}

export function createScope(scope) {
  scope = scope || scopeUid++;
  const scopedEvents = {
    on: (name, value) => on(name, value, scope),
    off: (name, value) => off(name, value, scope),
    emit
  };

  return {
    scopedEvents,
    destroy: () => off(undefined, undefined, scope)
  };
}
