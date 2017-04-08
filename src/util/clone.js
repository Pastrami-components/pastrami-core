var toString = Object.prototype.toString;
var isArray = Array.isArray;
var getPrototypeOf = Object.getPrototypeOf;
var getKeys = Object.keys;




export function clone(src, checkForCircular) {
  checkForCircular = checkForCircular === false ? false : true;

  var allParents = [];
  var allChildren = [];

  function cloner(parent) {
    if (parent === null) { return null; }
    if (typeof parent !== 'object') { return parent; }

    var child;
    var proto;
    if (isArray(parent)) {
      child = [];
    } else if (isRegExp(parent)) {
      child = new RegExp(parent.source, getRegExpFlags(parent));
      if (parent.lastIndex) { parent.lastIndex = parent.lastIndex; }
    } else if (isDate(parent)) {
      child = new Date(parent.getTime());
    } else {
      proto = getPrototypeOf(parent);
      child = Object.create(proto);
    }


    if (checkForCircular) {
      var index = allParents.indexOf(parent);
      if (index !== -1) { return allChildren[index]; }
      allParents.push(parent);
      allChildren.push(child);
    }


    var keys = getKeys(parent);
    var key = keys.pop();
    while (key !== undefined) {
      child[key] = cloner(parent[key]);
      key = keys.pop();
    }

    return child;
  }

  return cloner(src);
}


// export function extend(dest, ...srcs) {
//   srcs.forEach(function (src) {
//     baseMerge(dest, src, false);
//   });
//   return dest;
// }
//
// export function merge(dest, ...srcs) {
//   srcs.forEach(function (src) {
//     baseMerge(dest, src, true);
//   });
//   return dest;
// }
//
// function baseMerge(dest, src, deep) {
//   if (dest === src) { return; }
//
//   var srcValue;
//   var keys = getKeys(src);
//   var key = keys.pop();
//   while (key !== undefined) {
//     srcValue = src[key];
//
//     if (deep && isObject(srcValue)) {
//       if (isDate(srcValue)) {
//         dest[key] = new Date(src.getTime());
//       } else if (isRegExp(src)) {
//         dest[key] = new RegExp(srcValue);
//       } else if (src.nodeName) {
//         dest[key] = src.cloneNode(true);
//       } else {
//         if (!isObject(dest[key])) { dest[key] = isArray(src) ? [] : {}; }
//         merge(dest[key], srcValue, deep);
//       }
//     } else {
//       dest[key] = srcValue;
//     }
//
//     key = keys.pop();
//   }
//
//   return dest;
// }




function isRegExp(value) {
  return toString.call(value) === '[object RegExp]';
}

function isDate(value) {
  return toString.call(value) === '[object Date]';
}

function getRegExpFlags(regex) {
  var flags = '';
  if (regex.global) { flags += 'g'; }
  if (regex.ignoreCase) { flags += 'i'; }
  if (regex.multiline) { flags += 'm'; }
  return flags;
}

function isObject(value) {
  return value !== null && typeof value === 'object';
}
