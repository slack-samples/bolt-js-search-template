import { entityDetailsRequestedCallback } from './entity-details-requested.js';

export function register(app) {
  app.event('entity_details_requested', entityDetailsRequestedCallback);
}
