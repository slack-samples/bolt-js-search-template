import * as events from './events/index.js';
import * as functions from './functions/index.js';

export function registerListeners(app) {
  functions.register(app);
  events.register(app);
}
