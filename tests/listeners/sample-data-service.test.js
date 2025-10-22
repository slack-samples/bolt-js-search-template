import assert from 'node:assert';
import { beforeEach, describe, it } from 'node:test';
import { LANGUAGES_FILTER, SAMPLES_FILTER, TEMPLATES_FILTER } from '../../listeners/functions/filters.js';
import { SampleDataService } from '../../listeners/sample-data-service.js';
import { fakeClient, fakeLogger, fakeSlackResponse } from '../helpers.js';

describe('SampleDataService', () => {
  beforeEach(() => {
    fakeClient.apiCall.mock.resetCalls();
    fakeLogger.resetCalls();
    fakeClient.apiCall.mock.mockImplementation(() => Promise.resolve(fakeSlackResponse));
  });

  describe('fetchSampleData', () => {
    it('should successfully fetch data with query', async () => {
      await SampleDataService.fetchSampleData({
        client: fakeClient,
        query: 'test javascript',
        logger: fakeLogger,
      });

      assert(fakeClient.apiCall.mock.callCount() === 1);
      assert.deepStrictEqual(fakeClient.apiCall.mock.calls[0].arguments, [
        SampleDataService.API_METHOD,
        { query: 'test javascript' },
      ]);
    });

    it('should successfully fetch data without query', async () => {
      await SampleDataService.fetchSampleData({
        client: fakeClient,
        logger: fakeLogger,
      });

      assert(fakeClient.apiCall.mock.callCount() === 1);
      assert.deepStrictEqual(fakeClient.apiCall.mock.calls[0].arguments, [SampleDataService.API_METHOD, {}]);
    });

    it('should fetch data with language filters', async () => {
      const filters = {
        [LANGUAGES_FILTER.name]: ['javascript', 'python'],
      };

      await SampleDataService.fetchSampleData({
        client: fakeClient,
        query: 'test',
        filters,
        logger: fakeLogger,
      });

      assert(fakeClient.apiCall.mock.callCount() === 1);
      assert.deepStrictEqual(fakeClient.apiCall.mock.calls[0].arguments, [
        SampleDataService.API_METHOD,
        {
          query: 'test',
          filters: {
            languages: ['javascript', 'python'],
          },
        },
      ]);
    });

    it('should fetch data with templates filter only', async () => {
      const filters = {
        [TEMPLATES_FILTER.name]: true,
        [SAMPLES_FILTER.name]: false,
      };

      await SampleDataService.fetchSampleData({
        client: fakeClient,
        query: 'test',
        filters,
        logger: fakeLogger,
      });

      assert(fakeClient.apiCall.mock.callCount() === 1);
      assert.deepStrictEqual(fakeClient.apiCall.mock.calls[0].arguments, [
        SampleDataService.API_METHOD,
        {
          query: 'test',
          filters: {
            type: TEMPLATES_FILTER.name,
          },
        },
      ]);
    });

    it('should fetch data with samples filter only', async () => {
      const filters = {
        [TEMPLATES_FILTER.name]: false,
        [SAMPLES_FILTER.name]: true,
      };

      await SampleDataService.fetchSampleData({
        client: fakeClient,
        query: 'test',
        filters,
        logger: fakeLogger,
      });

      assert(fakeClient.apiCall.mock.callCount() === 1);
      assert.deepStrictEqual(fakeClient.apiCall.mock.calls[0].arguments, [
        SampleDataService.API_METHOD,
        {
          query: 'test',
          filters: {
            type: SAMPLES_FILTER.name,
          },
        },
      ]);
    });

    it('should fetch data with both language and type filters', async () => {
      const filters = {
        [LANGUAGES_FILTER.name]: ['typescript'],
        [TEMPLATES_FILTER.name]: true,
        [SAMPLES_FILTER.name]: false,
      };

      await SampleDataService.fetchSampleData({
        client: fakeClient,
        query: 'slack app',
        filters,
        logger: fakeLogger,
      });

      assert(fakeClient.apiCall.mock.callCount() === 1);
      assert.deepStrictEqual(fakeClient.apiCall.mock.calls[0].arguments, [
        SampleDataService.API_METHOD,
        {
          query: 'slack app',
          filters: {
            languages: ['typescript'],
            type: TEMPLATES_FILTER.name,
          },
        },
      ]);
    });

    it('should not include type filter when both templates and samples are true (XOR)', async () => {
      const filters = {
        [TEMPLATES_FILTER.name]: true,
        [SAMPLES_FILTER.name]: true,
      };

      await SampleDataService.fetchSampleData({
        client: fakeClient,
        query: 'test',
        filters,
        logger: fakeLogger,
      });

      assert(fakeClient.apiCall.mock.callCount() === 1);
      assert.deepStrictEqual(fakeClient.apiCall.mock.calls[0].arguments, [
        SampleDataService.API_METHOD,
        {
          query: 'test',
        },
      ]);
    });

    it('should not include type filter when both templates and samples are false (XOR)', async () => {
      const filters = {
        [TEMPLATES_FILTER.name]: false,
        [SAMPLES_FILTER.name]: false,
      };

      await SampleDataService.fetchSampleData({
        client: fakeClient,
        query: 'test',
        filters,
        logger: fakeLogger,
      });

      assert(fakeClient.apiCall.mock.callCount() === 1);
      assert.deepStrictEqual(fakeClient.apiCall.mock.calls[0].arguments, [
        SampleDataService.API_METHOD,
        {
          query: 'test',
        },
      ]);
    });

    it('should ignore empty language filters array', async () => {
      const filters = {
        [LANGUAGES_FILTER.name]: [],
      };

      await SampleDataService.fetchSampleData({
        client: fakeClient,
        query: 'test',
        filters,
        logger: fakeLogger,
      });

      assert(fakeClient.apiCall.mock.callCount() === 1);
      assert.deepStrictEqual(fakeClient.apiCall.mock.calls[0].arguments, [
        SampleDataService.API_METHOD,
        {
          query: 'test',
        },
      ]);
    });

    it('should handle undefined filters gracefully', async () => {
      await SampleDataService.fetchSampleData({
        client: fakeClient,
        query: 'test',
        filters: undefined,
        logger: fakeLogger,
      });

      assert(fakeClient.apiCall.mock.callCount() === 1);
      assert.deepStrictEqual(fakeClient.apiCall.mock.calls[0].arguments, [
        SampleDataService.API_METHOD,
        {
          query: 'test',
        },
      ]);
    });

    it('should throw SlackResponseError when API returns ok: false', async () => {
      const errorResponse = {
        ok: false,
        error: 'invalid_auth',
      };
      fakeClient.apiCall.mock.mockImplementation(() => Promise.resolve(errorResponse));

      await assert.rejects(
        async () => {
          await SampleDataService.fetchSampleData({
            client: fakeClient,
            logger: fakeLogger,
          });
        },
        {
          name: 'SlackResponseError',
          message: 'Failed to fetch sample data from Slack API',
        },
      );

      assert(fakeLogger.error.mock.callCount() === 1);
      assert(
        fakeLogger.error.mock.calls[0].arguments[0].includes('Search API request failed with error: invalid_auth'),
      );
    });
  });
});
