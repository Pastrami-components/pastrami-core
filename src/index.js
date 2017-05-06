import './browser-extends';
import { init as initParser, parse, doNotParse, allowParse } from './parser';
import * as component from './component';
import * as util from './util';
import * as constants from './constants';

export { bindModelToElement, Create as CreateModel } from './model';
export { compileExpression } from './expression';
export { add as controller, findController } from './controller';
export { add as addInjectable } from './injector';
export {
  constants,
  component,
  parse,
  doNotParse,
  allowParse,
  init,
  util
};


// NOTE this starts all the things
// init that can be called for vanilla
function init() {
  initParser(document.body);
}
