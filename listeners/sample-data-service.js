import { LANGUAGES_FILTER, SAMPLES_FILTER, TEMPLATES_FILTER } from './functions/filters.js';

export const SampleDataService = {
  API_METHOD: 'developer.sampleData.get',

  fetchSampleData: async ({ client, query = null, filters = null }) => {
    const options = {
      ...(query && { query }),
    };
    if (filters) {
      const selectedFilters = {};
      const languages = filters[LANGUAGES_FILTER.name];
      const templates = filters[TEMPLATES_FILTER.name] ?? false;
      const samples = filters[SAMPLES_FILTER.name] ?? false;

      if (languages && Array.isArray(languages) && languages.length > 0) {
        selectedFilters.languages = languages;
      }

      if (xor(templates, samples)) {
        if (templates) {
          selectedFilters.type = TEMPLATES_FILTER.name;
        } else if (samples) {
          selectedFilters.type = SAMPLES_FILTER.name;
        }
      }

      if (Object.entries(selectedFilters).length > 0) {
        options.filters = selectedFilters;
      }
    }

    const response = await client.apiCall(SampleDataService.API_METHOD, options);

    return response;
  },
};

const xor = (a, b) => {
  return (a || b) && !(a && b);
};
