import './browser-extends';
import { init as initParser } from './parser';
import * as component from './component';

// NOTE this starts all the things
// init that can be called for vanilla
function init() {
  initParser(document.body);
}


export {
  component,
  init
};
