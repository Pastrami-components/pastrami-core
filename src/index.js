import './browser-extends';
import parse from './parser';
// import * as pipeline from './pipeline';
import * as component from './component';
export { component };

// NOTE this starts all the things
// init that can be called for vanilla
export function init() {
  parse(document.body);
}
