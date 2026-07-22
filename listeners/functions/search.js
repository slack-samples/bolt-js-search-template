import { SlackError } from '@slack/web-api';
import { SampleDataService } from '../sample-data-service.js';

const SearchService = {
  SEARCH_PROCESSING_ERROR_MSG:
    'We encountered an issue processing your search results. Please try again or contact the app owner if the problem persists.',
};

async function searchCallback({ ack, inputs, fail, complete, client, logger }) {
  try {
    const { query, filters, user_context } = inputs;
    logger.debug(`User ${user_context.id} executing search query: "${query}" with filters: ${JSON.stringify(filters)}`);

    const response = await SampleDataService.fetchSampleData({ client, query, filters });

    await complete({
      outputs: {
        search_results: response.samples,
      },
    });
  } catch (error) {
    if (error instanceof SlackError) {
      logger.error(`Slack API call failed with error code ${error.code}. Check error details below:`, error);
    } else {
      logger.error('Unexpected error occurred while processing search request', error);
    }
    await fail({ error: SearchService.SEARCH_PROCESSING_ERROR_MSG });
  } finally {
    await ack();
  }
}

export { SearchService, searchCallback };
