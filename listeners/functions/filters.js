const FilterService = {
  FILTER_PROCESSING_ERROR_MSG:
    'We encountered an issue processing filter results. Please try again or contact the app owner if the problem persists.',
};

export const LANGUAGES_FILTER = {
  name: 'languages',
  display_name: 'Languages',
  type: 'multi_select',
  options: [
    { name: 'Python', value: 'python' },
    { name: 'Java', value: 'java' },
    { name: 'JavaScript', value: 'javascript' },
    { name: 'TypeScript', value: 'typescript' },
  ],
};

export const TEMPLATES_FILTER = {
  name: 'template',
  display_name: 'Templates',
  type: 'toggle',
};

export const SAMPLES_FILTER = {
  name: 'sample',
  display_name: 'Samples',
  type: 'toggle',
};

async function filtersCallback({ ack, inputs, fail, complete, logger }) {
  try {
    const { user_context } = inputs;
    logger.debug(`User ${user_context.id} executing filter request`);

    await complete({ outputs: { filters: [LANGUAGES_FILTER, TEMPLATES_FILTER, SAMPLES_FILTER] } });
  } catch (error) {
    logger.error('Unexpected error occurred while processing filters request', error);

    await fail({ error: FilterService.FILTER_PROCESSING_ERROR_MSG });
  } finally {
    await ack();
  }
}

export { filtersCallback, FilterService };
