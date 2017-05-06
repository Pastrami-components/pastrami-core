var injectables = {};

export function add(name, injectable) {
  if (typeof name !== 'string') {
    throw Error('`name: string` required');
  }
  if (!injectable) {
    throw Error('`injectable` required');
  }
  if (injectables[name]) {
    throw Error('`injectable` with the name "'+name+'" exists');
  }
  injectables[name] = injectable;
}

export function get(name) {
  if (!name) {
    throw Error('`name: string` required');
  }
  if (!injectables[name]) {
    throw Error('could not find injactable by the name "'+name+'"');
  }
  return injectables[name];
}


// make inectables available as function arguments
export function inject(func, inject) {
  var args = [];
  var deps;
  // inject.vm = {};
  // convert array to deps and func. asosume func is last item in array
  if (func instanceof Array) {
    deps = func;
    func = deps.pop();
  } else if (func.$inject && func.$inject instanceof Array) {
    deps = func.$inject;
  } else {
    // parse function as string into deps arr
    deps = func.toString().match(/^function\s*[^\(]*\(\s*([^\)]*)\)/m)[1].replace(/ /g, '').split(',');
  }

  // return functional that will applay an arrya or args from the inject obj, based on the strings int deps arr
  return function () {
    var arr = Array.prototype.slice.call(arguments, 0);
    deps.forEach(function (item, pos) {
      args.push(inject[item] || get(item));
    });
    func.apply(this, args);
  };
}
