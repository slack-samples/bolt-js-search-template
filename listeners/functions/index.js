import { filtersCallback } from './filters.js';
import { searchCallback } from './search.js';

export function register(app) {
  app.function('search', { autoAcknowledge: false }, searchCallback);
  app.function('filters', { autoAcknowledge: false }, filtersCallback);
}
