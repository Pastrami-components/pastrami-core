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
    timer = setTimeout(function () {
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
