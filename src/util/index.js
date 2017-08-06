export { equal } from './equals';
export { clone, extend, merge } from './clone';
export function nextTock(fn) {
  setTimeout(fn, 0);
}

var _uid = 0;
export function uid() {
  return 'id_'+_uid++;
}

export function getElementUid(node) {
  node.uid = node.uid || uid();
  return node.uid;
}

export function debounce(func, wait) {
  var timer;
  return function debounced() {
    var context = this;
    var args = arguments;
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = undefined;
      func.apply(context, args);
    }, wait || 10);
  };
}


export function everyParent(node, func) {
  if (typeof func !== 'function') { return; }
  var parent = node.parentNode;
  while (parent && parent !== document.documentElement && func(parent)) {
    parent = parent.parentNode;
  }
}


const types = {
  boolean: (value) => {
    return (value === 'true' || value === true || value === 1);
  }
};
export function parseDataType(value, type) {
  if (!type) return autoConvertType(value);
  if (!types[type]) {
    throw Error('could not find type "'+type+'"');
  }
  return types[type](value);
}

function autoConvertType(value) {
  switch (value) {
    case 'true':
    case true:
      return true;
      break;

    case 'false':
    case false:
      return false;
      break;

    case !isNAN(value):
      if (value.indexOf('.') > -1) return parseFloat(value);
      else return parseInt(value);
      break;

    default:
      return value;
  }
}
