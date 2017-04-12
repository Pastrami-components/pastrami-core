import './browser-extends';
import { init as initParser, parse, doNotParse, allowParse } from './parser';
import * as component from './component';
import * as util from './util';

export { bindModelToElement, Create as CreateModel } from './model';
export { compileExpression } from './expression';
export { add as controller } from './controller';
export {
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
