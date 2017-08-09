import './browser-extends';
import { init as initParser, parse, doNotParse, allowParse } from './parser';
import * as component from './component';
import * as util from './util';
import * as constants from './constants';
import * as request from './request';
import * as events from './events';

export { bindModelToElement, Create as CreateModel } from './model';
export { compileExpression } from './expression';
export { add as controller, findController } from './controller';
export { add as addInjectable } from './injector';
export {
  constants,
  component,
  events,
  parse,
  doNotParse,
  allowParse,
  init,
  request,
  util
};


// NOTE this starts all the things
// init that can be called for vanilla
function init() {
  initParser(document.body);
}
