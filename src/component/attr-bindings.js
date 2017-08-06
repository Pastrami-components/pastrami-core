import { getNearestModel } from '../model';
import CreateObserver from './attr-observer';
import { getElementUid, parseDataType } from '../util';

const elements = {};
const isBindingREGEX = /\[(.*?)\]/;
// const attrREGEX = /\[(.*?)\]="(.*?)"/;

export function createBinding(attr, element) {
  var attrValue = attr.value;
  if (!isBindingREGEX.test(attr.name) || !attrValue) { return; }
  var bindToProperty = isBindingREGEX.exec(attr.name)[1];
  var model = getNearestModel(element);
  var valueObserver;
  var attrObserver;
  if (element.hasAttribute(bindToProperty)) {
    attrObserver = CreateObserver(element);
    valueObserver = attrObserver.observe(bindToProperty, value => {
      model[attrValue] = parseDataType(value);
    });
  }

  var setValue = (value) => {
    if (!attrObserver) return;
    element.setAttribute(bindToProperty, value);
  };

  // observe model
  // TODO may need to create an observer that works off of squash
  var fromObserver = model.$observe(attrValue, value => setValue(value) );
  var self = Object.defineProperties({}, {
    '$$overrideSet': {
      value: fn => setValue = fn,
      enumerable: false, configurable: false, writable: false
    },
    '$$updateModel': {
      value: (value) => { model[attrValue] = value; },
      enumerable: false, configurable: false, writable: false
    },
    '$$destroy': {
      value: destroy,
      enumerable: false, configurable: false, writable: false
    }
  });
  var uid = getElementUid(element);
  elements[uid] = elements[uid] || {};
  elements[uid][attr.name] = self;
  return self;

  function destroy() {
    fromObserver();
    if (valueObserver) { valueObserver(); }
    if (attrObserver) { attrObserver.$destroy(); }
  }
}

export function isBinding(attr) {
  return isBindingREGEX.test(attr.name) && attr.value;
}

export function getAttrBinding(element) {
  return (attrName) => {
    if (elements[element.uid] && elements[element.uid][attrName]) {
      return elements[element.uid][attrName];
    }
  };
}

export function destroyElementsBindings(element) {
  if (!elements[element.uid]) return;
  Object.keys(elements[element.uid]).forEach(function (key) {
    elements[element.uid][key].$$destroy();
  });
  elements[element.uid] = undefined;
}
